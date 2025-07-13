import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

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
    console.log('=== PDF Generation Starting ===')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log('✓ Supabase client created')

    const { propertyId, userId } = await req.json()
    console.log(`✓ Request parsed - PropertyID: ${propertyId}, UserID: ${userId}`)

    if (!propertyId || !userId) {
      throw new Error('Property ID and User ID are required')
    }

    // Step 1: Fetch customer data
    console.log('Step 1: Fetching customer data...')
    const { data: customerData, error: customerError } = await supabaseClient
      .from('profiles')
      .select(`
        first_name,
        last_name,
        phone,
        role
      `)
      .eq('user_id', userId)
      .maybeSingle()

    if (customerError) {
      console.error('❌ Customer data fetch error:', customerError)
      throw new Error(`Failed to fetch customer data: ${customerError.message}`)
    }

    if (!customerData) {
      throw new Error('No customer profile found')
    }
    console.log('✓ Customer data:', customerData)

    // Step 2: Fetch property data
    console.log('Step 2: Fetching property data...')
    const { data: propertyData, error: propertyError } = await supabaseClient
      .from('properties')
      .select(`
        address,
        include_all_properties
      `)
      .eq('id', propertyId)
      .maybeSingle()

    if (propertyError) {
      console.error('❌ Property data fetch error:', propertyError)
      throw new Error(`Failed to fetch property data: ${propertyError.message}`)
    }

    if (!propertyData) {
      throw new Error('No property found')
    }
    console.log('✓ Property data:', propertyData)

    // Step 3: Fetch application data (optional signature)
    console.log('Step 3: Fetching application data...')
    const { data: applicationData, error: applicationError } = await supabaseClient
      .from('applications')
      .select(`
        signature
      `)
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .maybeSingle()

    if (applicationError) {
      console.warn('⚠️ Application data fetch warning:', applicationError.message)
    }
    console.log('✓ Application data:', applicationData?.signature ? 'Signature found' : 'No signature')

    // Step 4: Download PDF template
    console.log('Step 4: Downloading PDF template...')
    const { data: templateFile, error: downloadError } = await supabaseClient.storage
      .from('pdf-templates')
      .download('form-50-162-template.pdf')

    if (downloadError) {
      console.error('❌ Template download error:', downloadError)
      throw new Error(`Failed to download template: ${downloadError.message}`)
    }
    console.log('✓ Template downloaded, size:', templateFile.size, 'bytes')

    // Step 5: Load PDF and analyze form fields (without signature for now)
    console.log('Step 5: Loading and analyzing PDF...')
    try {
      const templateBytes = await templateFile.arrayBuffer()
      console.log('✓ Template converted to array buffer')
      
      const pdfDoc = await PDFDocument.load(templateBytes)
      console.log('✓ PDF document loaded')
      
      const form = pdfDoc.getForm()
      console.log('✓ PDF form extracted')

      // DIAGNOSTIC: Log all available form fields
      console.log('=== DIAGNOSTIC: PDF Form Field Analysis ===')
      const fields = form.getFields()
      console.log(`Total form fields found: ${fields.length}`)
      
      fields.forEach((field, index) => {
        try {
          const fieldName = field.getName()
          const fieldType = field.constructor.name
          console.log(`Field ${index + 1}: "${fieldName}" (${fieldType})`)
        } catch (e) {
          console.log(`Field ${index + 1}: Error reading field - ${e.message}`)
        }
      })

      console.log('=== END DIAGNOSTIC ===\n')

      // Step 6: Fill form fields with actual data
      console.log('Step 6: Filling form fields with data...')
      
      let fieldsFilledCount = 0
      
      // Helper function to try multiple field name variations
      const tryFillField = (fieldNames: string[], value: string | boolean, isCheckbox = false) => {
        for (const fieldName of fieldNames) {
          try {
            const field = form.getFieldMaybe(fieldName)
            if (field) {
              if (isCheckbox && typeof value === 'boolean') {
                const checkbox = form.getCheckBox(fieldName)
                if (value) {
                  checkbox.check()
                } else {
                  checkbox.uncheck()
                }
                console.log(`✓ Checkbox field "${fieldName}" set to: ${value}`)
              } else if (!isCheckbox && typeof value === 'string' && value.trim()) {
                const textField = form.getTextField(fieldName)
                textField.setText(value)
                console.log(`✓ Text field "${fieldName}" filled with: "${value}"`)
              }
              fieldsFilledCount++
              return true
            }
          } catch (e) {
            console.log(`⚠️ Failed to fill field "${fieldName}": ${e.message}`)
          }
        }
        return false
      }

      // Fill telephone number using exact field name with proper case
      const phone = customerData.phone || ''
      if (phone) {
        tryFillField(['Telephone Number include area code'], phone)
      }

      // Fill current date
      const currentDate = new Date().toLocaleDateString('en-US')
      tryFillField(['date', 'Date', 'today', 'current_date', 'Date_af_date'], currentDate)

      // Fill name at bottom (name of property owner) - leave top name field blank
      const fullName = `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim()
      if (fullName) {
        tryFillField(['Name of Property Owner'], fullName)
      }

      // Fill property checkboxes using exact field names
      const includeAllProperties = propertyData.include_all_properties || false
      
      if (includeAllProperties) {
        // Check the exact field name for all properties
        tryFillField(['all property listed for me at the above address'], true, true)
      } else {
        // Check the exact field name for specific properties
        tryFillField(['the property(ies) listed below:'], true, true)
      }

      // Fill role/relationship with 3 specific checkboxes based on role
      const role = customerData.role || ''
      if (role === 'homeowner') {
        tryFillField(['the property owner'], true, true)
      } else if (role === 'property_manager') {
        tryFillField(['a property manager authorized to designate agents for the owner'], true, true)
      } else if (role === 'authorized_person') {
        tryFillField(['other person authorized to act on behalf of the owner other than the person being designated as agent.'], true, true)
      }

      // Handle signature using exact field name "Signature1"
      if (applicationData?.signature) {
        console.log('Processing signature...')
        try {
          // Try to use the signature field first with exact case
          const signatureFieldExists = tryFillField(['Signature1'], applicationData.signature)
          
          if (!signatureFieldExists) {
            // Fallback to image embedding if signature field doesn't work
            const base64Data = applicationData.signature.replace(/^data:image\/[a-z]+;base64,/, '')
            const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
            
            const signatureImage = await pdfDoc.embedPng(signatureBytes)
            const pages = pdfDoc.getPages()
            const firstPage = pages[0]
            
            // Place signature in approximate location
            firstPage.drawImage(signatureImage, {
              x: 400,
              y: 100,
              width: 150,
              height: 50,
            })
            console.log('✓ Signature embedded as image')
            fieldsFilledCount++
          }
        } catch (sigError) {
          console.log(`⚠️ Could not process signature: ${sigError.message}`)
        }
      }

      console.log(`✓ Form filling complete. ${fieldsFilledCount} fields/elements processed.`)
      
      const pdfBytes = await pdfDoc.save()
      console.log('✓ PDF generated successfully, size:', pdfBytes.length, 'bytes')

      // Step 7: Upload to storage
      console.log('Step 7: Uploading to storage...')
      const filename = `${userId}/form-50-162-${propertyId}-${Date.now()}.pdf`
      
      const { error: uploadError } = await supabaseClient.storage
        .from('customer-documents')
        .upload(filename, pdfBytes, {
          contentType: 'application/pdf',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        throw new Error(`Failed to upload PDF: ${uploadError.message}`)
      }
      console.log('✓ PDF uploaded successfully:', filename)

      // Step 8: Record in database
      console.log('Step 8: Recording in database...')
      const { error: recordError } = await supabaseClient
        .from('customer_documents')
        .insert({
          user_id: userId,
          property_id: propertyId,
          document_type: 'form-50-162',
          file_path: filename,
          status: 'generated'
        })

      if (recordError) {
        console.error('❌ Database record error:', recordError)
        throw new Error(`Failed to record document: ${recordError.message}`)
      }
      console.log('✓ Document recorded in database')

      console.log('=== PDF Generation Complete ===')
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
      )

    } catch (pdfError) {
      console.error('❌ PDF processing error:', pdfError)
      throw new Error(`PDF processing failed: ${pdfError.message}`)
    }

  } catch (error) {
    console.error('Error generating Form 50-162:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})