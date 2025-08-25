
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('permissions')
      .eq('user_id', user.id)
      .single()

    if (profile?.permissions !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { filters } = await req.json()

    // Build query for document_reports with filters
    let query = supabaseClient
      .from('document_reports')
      .select('id, file_path, county, situs_address')

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value && value !== '__all__') {
          if (field === 'county') {
            query = query.eq('county', value)
          } else if (field === 'generated_at') {
            query = query.gte('generated_at', value)
          } else if (field === 'status') {
            query = query.eq('status', value)
          }
        }
      })
    }

    const { data: documents, error: queryError } = await query

    if (queryError) {
      return new Response(
        JSON.stringify({ error: `Query failed: ${queryError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No documents found matching filters' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Download files from storage and create zip
    const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default
    const zip = new JSZip()

    let successCount = 0
    let errorCount = 0

    for (const doc of documents) {
      try {
        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabaseClient.storage
          .from('customer-documents')
          .download(doc.file_path)

        if (downloadError || !fileData) {
          console.error(`Failed to download ${doc.file_path}:`, downloadError)
          errorCount++
          continue
        }

        // Create a safe filename
        const fileName = `${doc.county || 'Unknown'}_${doc.situs_address?.replace(/[^a-zA-Z0-9]/g, '_') || doc.id}_form50162.pdf`
        
        // Add file to zip
        zip.file(fileName, fileData)
        successCount++
      } catch (error) {
        console.error(`Error processing document ${doc.id}:`, error)
        errorCount++
      }
    }

    if (successCount === 0) {
      return new Response(
        JSON.stringify({ error: 'No documents could be processed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'uint8array' })

    // Upload ZIP to storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const zipFileName = `exports/documents_${timestamp}.zip`

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('customer-documents')
      .upload(zipFileName, zipBuffer, {
        contentType: 'application/zip'
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
      .from('customer-documents')
      .createSignedUrl(zipFileName, 3600)

    if (signedUrlError || !signedUrlData) {
      return new Response(
        JSON.stringify({ error: `Failed to create download URL: ${signedUrlError?.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        downloadUrl: signedUrlData.signedUrl,
        fileCount: successCount,
        errorCount: errorCount,
        fileName: zipFileName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
