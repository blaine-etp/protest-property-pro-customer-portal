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

    // Fill form fields based on the requirements
    try {
      // 1. Phone number - try to find telephone field
      if (customerData.phone) {
        try {
          const phoneField = form.getTextField('telephone')
          phoneField.setText(customerData.phone)
        } catch (e) {
          console.log('Telephone field not found as text field, trying checkbox approach')
          // If no form field, we'll add text directly to the page
          firstPage.drawText(customerData.phone, {
            x: 400, // Adjust coordinates based on your template
            y: 720,
            size: 10,
            color: rgb(0, 0, 0),
          })
        }
      }

      // 2. Property checkboxes
      if (propertyData.include_all_properties) {
        try {
          const allPropertiesField = form.getCheckBox('all_properties')
          allPropertiesField.check()
        } catch (e) {
          console.log('All properties checkbox not found')
        }
      } else {
        try {
          const listedPropertiesField = form.getCheckBox('listed_properties')
          listedPropertiesField.check()
        } catch (e) {
          console.log('Listed properties checkbox not found')
        }
      }

      // 3. Date field
      const currentDate = new Date().toLocaleDateString('en-US')
      try {
        const dateField = form.getTextField('date')
        dateField.setText(currentDate)
      } catch (e) {
        console.log('Date field not found as text field')
        // Add date directly to page
        firstPage.drawText(currentDate, {
          x: 450, // Adjust coordinates
          y: 200,
          size: 10,
          color: rgb(0, 0, 0),
        })
      }

      // 4. Print name field
      const fullName = `${customerData.first_name} ${customerData.last_name}`
      try {
        const printNameField = form.getTextField('print_name')
        printNameField.setText(fullName)
      } catch (e) {
        console.log('Print name field not found as text field')
        // Add name directly to page
        firstPage.drawText(fullName, {
          x: 300, // Adjust coordinates
          y: 180,
          size: 10,
          color: rgb(0, 0, 0),
        })
      }

      // 5. Relationship checkboxes
      if (customerData.role) {
        const roleMapping: { [key: string]: string } = {
          'homeowner': 'owner',
          'owner': 'owner',
          'agent': 'agent',
          'attorney': 'attorney',
          'trustee': 'trustee'
        }
        
        const mappedRole = roleMapping[customerData.role.toLowerCase()] || 'owner'
        try {
          const relationshipField = form.getCheckBox(mappedRole)
          relationshipField.check()
        } catch (e) {
          console.log(`Relationship checkbox for ${mappedRole} not found`)
        }
      }

      // 6. Signature - embed as image if provided
      if (applicationData.signature) {
        try {
          // Convert base64 signature to image
          const signatureBase64 = applicationData.signature.split(',')[1] // Remove data:image/png;base64, prefix
          const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0))
          
          const signatureImage = await pdfDoc.embedPng(signatureBytes)
          const signatureDims = signatureImage.scale(0.3) // Scale down the signature
          
          // Add signature to the "Sign Here" area
          firstPage.drawImage(signatureImage, {
            x: 200, // Adjust coordinates based on your template
            y: 220,
            width: signatureDims.width,
            height: signatureDims.height,
          })
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