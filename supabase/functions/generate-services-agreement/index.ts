import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, PDFForm, PDFTextField, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting services agreement generation...')
    
    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { userId, propertyId } = await req.json()
    console.log('📋 Request data:', { userId, propertyId })

    if (!userId || !propertyId) {
      throw new Error('Missing required parameters: userId and propertyId')
    }

    // Step 1: Fetch customer data
    console.log('Step 1: Fetching customer data...')
    const { data: customerData, error: customerError } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, role')
      .eq('user_id', userId)
      .single()

    if (customerError || !customerData) {
      console.error('❌ Customer fetch error:', customerError)
      throw new Error(`Failed to fetch customer data: ${customerError?.message}`)
    }
    
    console.log('✓ Customer data:', customerData)

    // Step 2: Fetch property address (from the first/signup property)
    console.log('Step 2: Fetching property address...')
    const { data: propertyData, error: propertyError } = await supabaseClient
      .from('properties')
      .select('address')
      .eq('id', propertyId)
      .single()

    if (propertyError || !propertyData) {
      console.error('❌ Property fetch error:', propertyError)
      throw new Error(`Failed to fetch property data: ${propertyError?.message}`)
    }
    
    console.log('✓ Property data:', propertyData)

    // Step 3: Fetch signature from applications
    console.log('Step 3: Fetching signature...')
    const { data: applicationData, error: applicationError } = await supabaseClient
      .from('applications')
      .select('signature')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single()

    if (applicationError || !applicationData?.signature) {
      console.error('❌ Application fetch error:', applicationError)
      throw new Error(`Failed to fetch signature: ${applicationError?.message}`)
    }
    
    console.log('✓ Signature found')

    // Step 4: Download the services agreement template
    console.log('Step 4: Downloading services agreement template...')
    const { data: templateFile, error: downloadError } = await supabaseClient.storage
      .from('pdf-templates')
      .download('ETPservicesagreement_final.pdf')

    if (downloadError || !templateFile) {
      console.error('❌ Template download error:', downloadError)
      throw new Error(`Failed to download template: ${downloadError?.message}`)
    }
    
    console.log('✓ Template downloaded')

    // Step 5: Process the PDF
    console.log('Step 5: Processing PDF...')
    const templateBytes = await templateFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(templateBytes)
    const form = pdfDoc.getForm()

    // Get current date in MM/DD/YYYY format
    const currentDate = new Date().toLocaleDateString('en-US')
    console.log('✓ Current date:', currentDate)

    // Map role to title
    const roleToTitle = {
      'homeowner': 'Home Owner',
      'property_manager': 'Property Manager', 
      'authorized_person': 'Person Authorized by Home Owner'
    }
    const title = roleToTitle[customerData.role as keyof typeof roleToTitle] || 'Home Owner'

    // Fill form fields
    console.log('Step 6: Filling form fields...')
    
    // Debug: Log all available form field names
    const formFields = form.getFields()
    console.log('🔍 Available form fields:', formFields.map(field => field.getName()))
    
    const fieldsToFill = {
      'Date_1': currentDate,
      'Date_2': currentDate,
      'Date_3': currentDate,
      'property owner': `${customerData.first_name} ${customerData.last_name}`,
      'customer address': propertyData.address,
      'Title': title
    }

    console.log('✓ Fields to fill:', fieldsToFill)

    // Helper function to try field variations
    const tryFillField = (fieldName: string, value: string): boolean => {
      const variations = [
        fieldName,
        fieldName.toLowerCase(),
        fieldName.toUpperCase(),
        fieldName.replace('_', ''),
        fieldName.replace('_', ' ')
      ]
      
      for (const variation of variations) {
        try {
          const field = form.getTextField(variation)
          if (field) {
            field.setText(value)
            console.log(`✓ Filled field "${variation}" (tried as "${fieldName}"): ${value}`)
            return true
          }
        } catch (error) {
          // Continue to next variation
        }
      }
      return false
    }

    // Fill each field with better error handling
    Object.entries(fieldsToFill).forEach(([fieldName, value]) => {
      const success = tryFillField(fieldName, value)
      if (!success) {
        console.warn(`⚠️ Could not fill field "${fieldName}" with any variation. Available fields:`, 
          formFields.map(field => field.getName()).join(', '))
      }
    })

    // Step 7: Add signature to page 4
    console.log('Step 7: Adding signature...')
    const pages = pdfDoc.getPages()
    if (pages.length >= 4) {
      const page4 = pages[3] // 0-indexed, so page 4 is index 3
      
      // Remove data:image/png;base64, prefix if present
      const signatureBase64 = applicationData.signature.replace(/^data:image\/[a-z]+;base64,/, '')
      const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0))
      
      // Embed the signature image
      const signatureImage = await pdfDoc.embedPng(signatureBytes)
      
      // Place signature at specified coordinates
      page4.drawImage(signatureImage, {
        x: 90,           // left
        y: 594,          // bottom  
        width: 216,      // width
        height: 29,      // height
      })
      
      console.log('✓ Signature added to page 4')
    } else {
      console.warn('⚠️ PDF has fewer than 4 pages, signature not added')
    }

    // Step 8: Generate final PDF
    console.log('Step 8: Generating final PDF...')
    const finalPdfBytes = await pdfDoc.save()
    console.log('✓ PDF generated, size:', finalPdfBytes.length, 'bytes')

    // Step 9: Upload to storage
    console.log('Step 9: Uploading to storage...')
    
    // Helper function to sanitize names for file paths
    const sanitizeName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }
    
    // Create customer-level prefix and document filename
    const sanitizedFirstName = sanitizeName(customerData.first_name || 'unknown')
    const sanitizedLastName = sanitizeName(customerData.last_name || 'unknown')
    const customerPrefix = `${sanitizedFirstName}-${sanitizedLastName}-${userId}`
    const documentName = `services-agreement-${sanitizedFirstName}-${sanitizedLastName}-${userId}-${Date.now()}.pdf`
    const filename = `${customerPrefix}/${documentName}`
    
    console.log('✓ Generated filename:', filename)
    
    const { error: uploadError } = await supabaseClient.storage
      .from('customer-documents')
      .upload(filename, finalPdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      throw new Error(`Failed to upload PDF: ${uploadError.message}`)
    }
    
    console.log('✓ PDF uploaded successfully')

    // Step 10: Record in database
    console.log('Step 10: Recording in database...')
    const { error: dbError } = await supabaseClient
      .from('customer_documents')
      .insert({
        user_id: userId,
        property_id: propertyId,
        document_type: 'services-agreement',
        file_path: filename,
        status: 'generated'
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
      throw new Error(`Failed to record document: ${dbError.message}`)
    }
    
    console.log('✓ Document recorded in database')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Services agreement generated successfully',
        filename 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Error generating services agreement:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})