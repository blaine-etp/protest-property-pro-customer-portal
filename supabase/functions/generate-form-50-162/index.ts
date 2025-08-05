import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Edge Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    // Health check endpoint
    if (req.url.includes('/health')) {
      console.log('Health check requested');
      return new Response(
        JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          message: 'Function is running' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Initialize clients
    console.log('Initializing Supabase client...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('✓ Supabase client initialized');

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('✓ Request parsed:', requestBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request:', parseError);
      throw new Error(`Invalid request body: ${parseError.message}`);
    }

    const { propertyId, userId } = requestBody;
    console.log(`✓ Request data - PropertyID: ${propertyId}, UserID: ${userId}`);

    if (!propertyId || !userId) {
      throw new Error('Property ID and User ID are required');
    }

    // Get current date for generation tracking
    const generationDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log(`📅 Generation date: ${generationDate}`);
    
    // Check for existing form generated today for this property
    console.log('🔍 Checking for existing Form 50-162 generated today...');
    const { data: existingDocument, error: checkError } = await supabaseClient
      .from('customer_documents')
      .select('id, file_path')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .eq('document_type', 'form-50-162')
      .eq('generation_date', generationDate)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking for existing document:', checkError);
      throw new Error(`Failed to check for existing documents: ${checkError.message}`);
    }
    
    if (existingDocument) {
      console.log('📄 Form 50-162 already generated today for this property:', existingDocument.file_path);
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Form 50-162 already generated today for this property',
        filename: existingDocument.file_path,
        documentId: existingDocument.id,
        isExisting: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    console.log('=== PDF Generation Starting ===');

    // Step 1: Fetch customer data
    console.log('Step 1: Fetching customer data...');
    const { data: customerData, error: customerError } = await supabaseClient
      .from('profiles')
      .select(`
        first_name,
        last_name,
        phone,
        role
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (customerError) {
      console.error('❌ Customer data fetch error:', customerError);
      throw new Error(`Failed to fetch customer data: ${customerError.message}`);
    }

    if (!customerData) {
      throw new Error('No customer profile found');
    }
    console.log('✓ Customer data:', customerData);

    // Step 2: Fetch property data
    console.log('Step 2: Fetching property data...');
    const { data: propertyData, error: propertyError } = await supabaseClient
      .from('properties')
      .select(`
        situs_address,
        include_all_properties,
        owner_id,
        contact_id,
        county
      `)
      .eq('id', propertyId)
      .maybeSingle();

    if (propertyError) {
      console.error('❌ Property data fetch error:', propertyError);
      throw new Error(`Failed to fetch property data: ${propertyError.message}`);
    }

    if (!propertyData) {
      throw new Error('No property found');
    }
    console.log('✓ Property data:', propertyData);

    // Step 2b: Fetch owner data if owner_id exists
    let ownerData = null;
    if (propertyData.owner_id) {
      console.log('Step 2b: Fetching owner data...');
      const { data: owner, error: ownerError } = await supabaseClient
        .from('owners')
        .select(`
          name,
          owner_type,
          entity_relationship,
          form_entity_name,
          form_entity_type
        `)
        .eq('id', propertyData.owner_id)
        .maybeSingle();

      if (ownerError) {
        console.warn('⚠️ Owner data fetch warning:', ownerError.message);
      } else {
        ownerData = owner;
        console.log('✓ Owner data:', ownerData);
      }
    }

    // Step 3: Fetch application data (optional signature)
    console.log('Step 3: Fetching application data...');
    const { data: applicationData, error: applicationError } = await supabaseClient
      .from('applications')
      .select(`signature`)
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (applicationError) {
      console.warn('⚠️ Application data fetch warning:', applicationError.message);
    }
    console.log('✓ Application data:', applicationData?.signature ? 'Signature found' : 'No signature');

    // Step 4: Download PDF template
    console.log('Step 4: Downloading PDF template...');
    const { data: templateFile, error: downloadError } = await supabaseClient.storage
      .from('pdf-templates')
      .download('form-50-162-template.pdf');

    if (downloadError) {
      console.error('❌ Template download error:', downloadError);
      throw new Error(`Failed to download template: ${downloadError.message}`);
    }
    console.log('✓ Template downloaded, size:', templateFile.size, 'bytes');

    // Step 5: Load PDF and analyze form fields
    console.log('Step 5: Loading and analyzing PDF...');
    
    const templateBytes = await templateFile.arrayBuffer();
    console.log('✓ Template converted to array buffer');
    
    const pdfDoc = await PDFDocument.load(templateBytes);
    console.log('✓ PDF document loaded');
    
    const form = pdfDoc.getForm();
    console.log('✓ PDF form extracted');

    // DIAGNOSTIC: Log all available form fields
    console.log('=== DIAGNOSTIC: PDF Form Field Analysis ===');
    const fields = form.getFields();
    console.log(`Total form fields found: ${fields.length}`);
    
    fields.forEach((field, index) => {
      try {
        const fieldName = field.getName();
        const fieldType = field.constructor.name;
        console.log(`Field ${index + 1}: "${fieldName}" (${fieldType})`);
      } catch (e) {
        console.log(`Field ${index + 1}: Error reading field - ${e.message}`);
      }
    });

    console.log('=== END DIAGNOSTIC ===\n');

    // Step 6: Fill form fields with actual data
    console.log('Step 6: Filling form fields with data...');
    
    let fieldsFilledCount = 0;
    
    // Helper function to try multiple field name variations
    const tryFillField = (fieldNames: string[], value: string | boolean, isCheckbox = false) => {
      for (const fieldName of fieldNames) {
        try {
          const field = form.getFieldMaybe(fieldName);
          if (field) {
            if (isCheckbox && typeof value === 'boolean') {
              const checkbox = form.getCheckBox(fieldName);
              if (value) {
                checkbox.check();
              } else {
                checkbox.uncheck();
              }
              console.log(`✓ Checkbox field "${fieldName}" set to: ${value}`);
            } else if (!isCheckbox && typeof value === 'string' && value.trim()) {
              const textField = form.getTextField(fieldName);
              textField.setText(value);
              console.log(`✓ Text field "${fieldName}" filled with: "${value}"`);
            }
            fieldsFilledCount++;
            return true;
          }
        } catch (e) {
          console.log(`⚠️ Failed to fill field "${fieldName}": ${e.message}`);
        }
      }
      return false;
    };

    // Fill telephone number using exact field name with proper case
    const phone = customerData.phone || '';
    if (phone) {
      tryFillField(['Telephone Number include area code'], phone);
    }

    // Fill current date
    const currentDate = new Date().toLocaleDateString('en-US');
    tryFillField(['date', 'Date', 'today', 'current_date', 'Date_af_date'], currentDate);

    // Fill Appraisal District Name with county
    const county = propertyData.county || '';
    if (county) {
      tryFillField(['Appraisal District Name'], county);
    }

    // Determine ownership type and fill appropriate fields
    const isEntityOwner = ownerData && ownerData.owner_type && ownerData.owner_type !== 'individual';
    
    console.log('✓ Ownership determination:', {
      hasOwnerData: !!ownerData,
      ownerType: ownerData?.owner_type,
      isEntityOwner
    });
    
    if (isEntityOwner && ownerData) {
      // Entity ownership - use entity data
      console.log('Processing entity ownership...');
      
      // Fill "Name" field with entity name and type (unless type is "other")
      let entityName = ownerData.form_entity_name || ownerData.name;
      if (entityName && ownerData.form_entity_type && ownerData.form_entity_type !== 'other') {
        entityName = `${entityName} ${ownerData.form_entity_type}`;
      }
      if (entityName) {
        tryFillField(['Name'], entityName);
      }
      
      // Fill "Name of Property Owner" field with customer name
      const customerName = `${customerData.first_name} ${customerData.last_name}`;
      if (customerName.trim()) {
        tryFillField(['Name of Property Owner'], customerName);
      }
      
      // Fill "Title" field with relationship to entity
      if (ownerData.entity_relationship) {
        tryFillField(['Title'], ownerData.entity_relationship);
      }
      
      console.log('✓ Entity ownership fields filled:', {
        entityName,
        relationship: ownerData.entity_relationship
      });
    } else {
      // Individual ownership - use customer data
      console.log('Processing individual ownership...');
      const fullName = `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim();
      if (fullName) {
        // Fill both "Name" and "Name of Property Owner" fields for individual ownership
        tryFillField(['Name'], fullName);
        tryFillField(['Name of Property Owner'], fullName);
      }
      console.log('✓ Individual ownership fields filled:', { fullName });
    }

    // Fill property checkboxes using exact field names
    const includeAllProperties = propertyData.include_all_properties || false;
    
    if (includeAllProperties) {
      // Check the exact field name for all properties
      tryFillField(['all property listed for me at the above address'], true, true);
    } else {
      // Check the exact field name for specific properties
      tryFillField(['the property(ies) listed below:'], true, true);
    }

    // Fill role/relationship with 3 specific checkboxes based on role
    const role = customerData.role || '';
    if (role === 'homeowner') {
      tryFillField(['the property owner'], true, true);
    } else if (role === 'property_manager') {
      tryFillField(['a property manager authorized to designate agents for the owner'], true, true);
    } else if (role === 'authorized_person') {
      tryFillField(['other person authorized to act on behalf of the owner other than the person being designated as agent.'], true, true);
    }

    // Handle signature using exact field name "Signature1"
    if (applicationData?.signature) {
      console.log('Processing signature...');
      try {
        // Try to use the signature field first with exact case
        const signatureFieldExists = tryFillField(['Signature1'], applicationData.signature);
        
        if (!signatureFieldExists) {
          // Fallback to image embedding if signature field doesn't work
          const base64Data = applicationData.signature.replace(/^data:image\/[a-z]+;base64,/, '');
          const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          const signatureImage = await pdfDoc.embedPng(signatureBytes);
          const pages = pdfDoc.getPages();
          
          // Validate that second page exists (Signature1 field is on page 2)
          if (pages.length < 2) {
            console.log('⚠️ Second page not found for signature placement');
          } else {
            const secondPage = pages[1];
            console.log(`Placing signature on page 2 at coordinates: x: 68.1542, y: 242.502, width: 295.5988, height: 32`);
            
            // Place signature using exact field coordinates
            secondPage.drawImage(signatureImage, {
              x: 68.1542,
              y: 242.502,
              width: 295.5988,
              height: 32,
            });
            console.log('✓ Signature embedded as image on page 2 with exact field coordinates');
            fieldsFilledCount++;
          }
        }
      } catch (sigError) {
        console.log(`⚠️ Could not process signature: ${sigError.message}`);
      }
    }

    console.log(`✓ Form filling complete. ${fieldsFilledCount} fields/elements processed.`);
    
    const pdfBytes = await pdfDoc.save();
    console.log('✓ PDF generated successfully, size:', pdfBytes.length, 'bytes');

    // Step 7: Upload to storage
    console.log('Step 7: Uploading to storage...');
    
    // Helper function to sanitize names for file paths
    const sanitizeName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };
    
    // Create property-specific file organization with date-based naming
    const sanitizedFirstName = sanitizeName(customerData.first_name || 'unknown');
    const sanitizedLastName = sanitizeName(customerData.last_name || 'unknown');
    const customerPrefix = `${sanitizedFirstName}-${sanitizedLastName}-${userId}`;
    const propertyPrefix = `property-${propertyId}`;
    const dateFormatted = generationDate; // Already in YYYY-MM-DD format
    const documentName = `50-162-${sanitizedFirstName}-${sanitizedLastName}-${userId}-${propertyId}-${dateFormatted}.pdf`;
    const filename = `${customerPrefix}/${propertyPrefix}/${documentName}`;
    
    console.log('✓ Generated filename:', filename);
    
    const { error: uploadError } = await supabaseClient.storage
      .from('customer-documents')
      .upload(filename, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }
    console.log('✓ PDF uploaded successfully:', filename);

    // Step 8: Record in database
    console.log('Step 8: Recording in database...');
    const { error: recordError } = await supabaseClient
      .from('customer_documents')
      .insert({
        user_id: userId,
        property_id: propertyId,
        owner_id: propertyData.owner_id,
        contact_id: propertyData.contact_id,
        document_type: 'form-50-162',
        file_path: filename,
        status: 'generated',
        generation_date: generationDate
      });

    if (recordError) {
      console.error('❌ Database record error:', recordError);
      throw new Error(`Failed to record document: ${recordError.message}`);
    }
    console.log('✓ Document recorded in database');

    console.log('=== PDF Generation Complete ===');
    return new Response(
      JSON.stringify({ 
        success: true, 
        filename,
        message: 'Form 50-162 generated successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating Form 50-162:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});