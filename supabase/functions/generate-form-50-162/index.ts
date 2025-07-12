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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { propertyId, userId } = await req.json()

    if (!propertyId || !userId) {
      throw new Error('Property ID and User ID are required')
    }

    console.log(`Generating Form 50-162 for property ${propertyId}, user ${userId}`)

    // Fetch customer data
    const { data: customerData, error: customerError } = await supabaseClient
      .from('profiles')
      .select(`
        first_name,
        last_name,
        phone,
        role
      `)
      .eq('user_id', userId)
      .single()

    if (customerError) {
      throw new Error(`Failed to fetch customer data: ${customerError.message}`)
    }

    // Fetch property data
    const { data: propertyData, error: propertyError } = await supabaseClient
      .from('properties')
      .select(`
        address,
        include_all_properties
      `)
      .eq('id', propertyId)
      .single()

    if (propertyError) {
      throw new Error(`Failed to fetch property data: ${propertyError.message}`)
    }

    // Fetch application data for signature
    const { data: applicationData, error: applicationError } = await supabaseClient
      .from('applications')
      .select(`
        signature
      `)
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .single()

    if (applicationError) {
      throw new Error(`Failed to fetch application data: ${applicationError.message}`)
    }

    console.log('Customer data fetched successfully')

    // Download the PDF template
    const { data: templateFile, error: downloadError } = await supabaseClient.storage
      .from('pdf-templates')
      .download('form-50-162-template.pdf')

    if (downloadError) {
      throw new Error(`Failed to download template: ${downloadError.message}`)
    }

    console.log('Template downloaded successfully')

    // Load and modify the PDF
    const templateBytes = await templateFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(templateBytes)
    const form = pdfDoc.getForm()

    // Get the first page for positioning
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    // DIAGNOSTIC: Log all available form fields
    console.log('=== DIAGNOSTIC: PDF Form Field Analysis ===')
    const fields = form.getFields()
    console.log(`Total form fields found: ${fields.length}`)
    
    fields.forEach((field, index) => {
      const fieldName = field.getName()
      const fieldType = field.constructor.name
      console.log(`Field ${index + 1}: "${fieldName}" (${fieldType})`)
    })

    // Try to get text fields specifically
    const textFields = form.getTextFields()
    console.log(`\nText fields found: ${textFields.length}`)
    textFields.forEach((field, index) => {
      console.log(`Text Field ${index + 1}: "${field.getName()}"`)
    })

    // Try to get checkbox fields specifically
    const checkBoxes = form.getCheckBoxes()
    console.log(`\nCheckbox fields found: ${checkBoxes.length}`)
    checkBoxes.forEach((field, index) => {
      console.log(`Checkbox Field ${index + 1}: "${field.getName()}"`)
    })

    console.log('=== END DIAGNOSTIC ===\n')

    // Helper function to safely fill text field
    const fillTextField = (fieldNameOptions: string[], value: string, fallbackCoords?: { x: number, y: number }) => {
      for (const fieldName of fieldNameOptions) {
        try {
          const field = form.getTextField(fieldName)
          field.setText(value)
          console.log(`Successfully filled text field "${fieldName}" with value: ${value}`)
          return true
        } catch (e) {
          console.log(`Text field "${fieldName}" not found`)
        }
      }
      
      // If no form field found and fallback coordinates provided, draw text directly
      if (fallbackCoords) {
        firstPage.drawText(value, {
          x: fallbackCoords.x,
          y: fallbackCoords.y,
          size: 10,
          color: rgb(0, 0, 0),
        })
        console.log(`Drew text "${value}" directly at coordinates (${fallbackCoords.x}, ${fallbackCoords.y})`)
        return true
      }
      
      return false
    }

    // Helper function to safely check checkbox
    const checkBoxField = (fieldNameOptions: string[]) => {
      for (const fieldName of fieldNameOptions) {
        try {
          const field = form.getCheckBox(fieldName)
          field.check()
          console.log(`Successfully checked checkbox "${fieldName}"`)
          return true
        } catch (e) {
          console.log(`Checkbox field "${fieldName}" not found`)
        }
      }
      return false
    }

    // Fill form fields with comprehensive field name attempts
    try {
      // 1. Phone number
      if (customerData.phone) {
        const phoneFieldNames = ['telephone', 'phone', 'Phone', 'Telephone', 'TELEPHONE', 'PHONE', 'tel', 'Tel']
        fillTextField(phoneFieldNames, customerData.phone, { x: 400, y: 720 })
      }

      // 2. Property checkboxes
      if (propertyData.include_all_properties) {
        const allPropertiesFieldNames = [
          'all_properties', 'all properties', 'All Properties', 'ALL PROPERTIES',
          'allproperties', 'AllProperties', 'all_prop', 'all-properties',
          'checkbox_all', 'chk_all', 'includeAll', 'include_all'
        ]
        checkBoxField(allPropertiesFieldNames)
      } else {
        const listedPropertiesFieldNames = [
          'listed_properties', 'listed properties', 'Listed Properties', 'LISTED PROPERTIES',
          'listedproperties', 'ListedProperties', 'listed_prop', 'listed-properties',
          'checkbox_listed', 'chk_listed', 'specificProperties', 'specific_properties'
        ]
        checkBoxField(listedPropertiesFieldNames)
      }

      // 3. Date field
      const currentDate = new Date().toLocaleDateString('en-US')
      const dateFieldNames = [
        'date', 'Date', 'DATE', 'date_signed', 'dateField', 'signDate',
        'signature_date', 'current_date', 'today', 'Today'
      ]
      fillTextField(dateFieldNames, currentDate, { x: 450, y: 200 })

      // 4. Print name field
      const fullName = `${customerData.first_name} ${customerData.last_name}`
      const printNameFieldNames = [
        'print_name', 'print name', 'Print Name', 'PRINT NAME',
        'printname', 'PrintName', 'name', 'Name', 'NAME',
        'full_name', 'fullname', 'FullName', 'signer_name',
        'applicant_name', 'customer_name'
      ]
      fillTextField(printNameFieldNames, fullName, { x: 300, y: 180 })

      // 5. Relationship checkboxes
      if (customerData.role) {
        const roleMapping: { [key: string]: string[] } = {
          'homeowner': ['owner', 'Owner', 'OWNER', 'homeowner', 'Homeowner', 'HOMEOWNER', 'property_owner'],
          'owner': ['owner', 'Owner', 'OWNER', 'property_owner', 'PropertyOwner'],
          'agent': ['agent', 'Agent', 'AGENT', 'real_estate_agent', 'realtor', 'Realtor'],
          'attorney': ['attorney', 'Attorney', 'ATTORNEY', 'lawyer', 'Lawyer', 'legal_rep'],
          'trustee': ['trustee', 'Trustee', 'TRUSTEE', 'trust_representative']
        }
        
        const role = customerData.role.toLowerCase()
        const fieldNames = roleMapping[role] || roleMapping['owner']
        checkBoxField(fieldNames)
      }

      // 6. Signature - embed as image if provided
      if (applicationData.signature) {
        try {
          // Convert base64 signature to image
          const signatureBase64 = applicationData.signature.includes(',') 
            ? applicationData.signature.split(',')[1] 
            : applicationData.signature
          
          const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0))
          
          const signatureImage = await pdfDoc.embedPng(signatureBytes)
          const signatureDims = signatureImage.scale(0.25) // Scale down the signature
          
          // Add signature to the "Sign Here" area
          firstPage.drawImage(signatureImage, {
            x: 200, // Adjust coordinates based on your template
            y: 220,
            width: signatureDims.width,
            height: signatureDims.height,
          })
          console.log('Successfully embedded signature image')
        } catch (e) {
          console.log('Failed to embed signature:', e)
        }
      }

    } catch (e) {
      console.log('Error filling form fields:', e)
    }

    // Generate the completed PDF
    const pdfBytes = await pdfDoc.save()

    // Create filename
    const filename = `${userId}/form-50-162-${propertyId}-${Date.now()}.pdf`

    // Upload the completed PDF to customer-documents bucket
    const { error: uploadError } = await supabaseClient.storage
      .from('customer-documents')
      .upload(filename, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`)
    }

    // Record the document in the database
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
      throw new Error(`Failed to record document: ${recordError.message}`)
    }

    console.log(`Form 50-162 generated successfully: ${filename}`)

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