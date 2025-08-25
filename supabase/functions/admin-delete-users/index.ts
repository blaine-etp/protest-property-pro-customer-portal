import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  userIds: string[]
}

interface UserDeleteResult {
  userId: string
  success: boolean
  error?: string
  deletedCounts: {
    storageFiles: number
    properties: number
    protests: number
    contacts: number
    owners: number
    documents: number
    evidence: number
    bills: number
    communications: number
    applications: number
    creditTransactions: number
    referralRelationships: number
    pendingSignups: number
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Admin delete users function called')
    
    // Get Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Verify authentication and admin status
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    supabase.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    console.log('Checking admin status for user:', user.id)
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin', { _user_id: user.id })
    if (adminError || !isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    const { userIds }: DeleteUserRequest = await req.json()
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('Invalid userIds array')
    }

    console.log(`Processing deletion for ${userIds.length} users`)
    const results: UserDeleteResult[] = []

    for (const userId of userIds) {
      console.log(`Starting deletion for user: ${userId}`)
      const result: UserDeleteResult = {
        userId,
        success: false,
        deletedCounts: {
          storageFiles: 0,
          properties: 0,
          protests: 0,
          contacts: 0,
          owners: 0,
          documents: 0,
          evidence: 0,
          bills: 0,
          communications: 0,
          applications: 0,
          creditTransactions: 0,
          referralRelationships: 0,
          pendingSignups: 0
        }
      }

      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (profileError || !profile) {
          throw new Error(`Profile not found for user ${userId}`)
        }

        console.log(`Processing deletion for: ${profile.email}`)

        // Gather related data
        const { data: properties } = await supabaseAdmin
          .from('properties')
          .select('id, contact_id, owner_id')
          .eq('user_id', userId)

        const propertyIds = properties?.map(p => p.id) || []
        const contactIds = [...new Set(properties?.map(p => p.contact_id).filter(Boolean) || [])]
        const ownerIds = [...new Set(properties?.map(p => p.owner_id).filter(Boolean) || [])]

        // Get protests for properties
        const { data: protests } = await supabaseAdmin
          .from('protests')
          .select('id, evidence_packet_url')
          .in('property_id', propertyIds)

        const protestIds = protests?.map(p => p.id) || []

        // Get evidence uploads
        const { data: evidenceUploads } = await supabaseAdmin
          .from('evidence_uploads')
          .select('id, file_path')
          .in('property_id', propertyIds)

        // Get customer documents
        const { data: customerDocs } = await supabaseAdmin
          .from('customer_documents')
          .select('id, file_path')
          .eq('user_id', userId)

        // Delete storage files first
        let storageFilesDeleted = 0

        // Delete customer document files
        if (customerDocs?.length) {
          for (const doc of customerDocs) {
            if (doc.file_path) {
              try {
                await supabaseAdmin.storage
                  .from('customer-documents')
                  .remove([doc.file_path])
                storageFilesDeleted++
              } catch (error) {
                console.warn(`Failed to delete file ${doc.file_path}:`, error)
              }
            }
          }
        }

        // Delete evidence files
        if (evidenceUploads?.length) {
          for (const evidence of evidenceUploads) {
            if (evidence.file_path) {
              try {
                await supabaseAdmin.storage
                  .from('property-evidence')
                  .remove([evidence.file_path])
                storageFilesDeleted++
              } catch (error) {
                console.warn(`Failed to delete evidence file ${evidence.file_path}:`, error)
              }
            }
          }
        }

        // Delete evidence packet URLs from protests
        if (protests?.length) {
          for (const protest of protests) {
            if (protest.evidence_packet_url && protest.evidence_packet_url.includes('supabase')) {
              try {
                const url = new URL(protest.evidence_packet_url)
                const pathParts = url.pathname.split('/')
                const bucketIndex = pathParts.findIndex(part => part === 'storage')
                if (bucketIndex >= 0 && pathParts[bucketIndex + 2]) {
                  const bucket = pathParts[bucketIndex + 2]
                  const filePath = pathParts.slice(bucketIndex + 3).join('/')
                  await supabaseAdmin.storage.from(bucket).remove([filePath])
                  storageFilesDeleted++
                }
              } catch (error) {
                console.warn(`Failed to delete evidence packet file:`, error)
              }
            }
          }
        }

        result.deletedCounts.storageFiles = storageFilesDeleted

        // Delete database records in FK-safe order

        // Bills
        if (protestIds.length > 0) {
          const { error } = await supabaseAdmin.from('bills').delete().in('protest_id', protestIds)
          if (error) console.warn('Error deleting bills by protest_id:', error)
        }
        if (contactIds.length > 0) {
          const { error } = await supabaseAdmin.from('bills').delete().in('contact_id', contactIds)
          if (error) console.warn('Error deleting bills by contact_id:', error)
        }
        const { count: billsCount } = await supabaseAdmin.from('bills').delete().eq('user_id', userId).select('*', { count: 'exact', head: true })
        result.deletedCounts.bills = billsCount || 0

        // Communication properties
        if (propertyIds.length > 0) {
          await supabaseAdmin.from('communication_properties').delete().in('property_id', propertyIds)
        }

        // Communications
        if (contactIds.length > 0) {
          const { count: commCount } = await supabaseAdmin.from('communications').delete().in('contact_id', contactIds).select('*', { count: 'exact', head: true })
          result.deletedCounts.communications = commCount || 0
        }

        // Evidence uploads
        if (propertyIds.length > 0) {
          const { count: evidenceCount } = await supabaseAdmin.from('evidence_uploads').delete().in('property_id', propertyIds).select('*', { count: 'exact', head: true })
          result.deletedCounts.evidence = evidenceCount || 0
        }

        // Property agent status events
        if (propertyIds.length > 0) {
          await supabaseAdmin.from('property_agent_status_events').delete().in('property_id', propertyIds)
        }

        // Document reports (if it exists as a table, not just a view)
        try {
          await supabaseAdmin.from('document_reports').delete().eq('user_id', userId)
          if (propertyIds.length > 0) {
            await supabaseAdmin.from('document_reports').delete().in('property_id', propertyIds)
          }
        } catch (error) {
          // Ignore if document_reports is just a view
        }

        // Protests
        if (protestIds.length > 0) {
          const { count: protestCount } = await supabaseAdmin.from('protests').delete().in('id', protestIds).select('*', { count: 'exact', head: true })
          result.deletedCounts.protests = protestCount || 0
        }

        // Applications
        const { count: appCount } = await supabaseAdmin.from('applications').delete().eq('user_id', userId).select('*', { count: 'exact', head: true })
        result.deletedCounts.applications = appCount || 0

        // Customer documents
        const { count: docCount } = await supabaseAdmin.from('customer_documents').delete().eq('user_id', userId).select('*', { count: 'exact', head: true })
        result.deletedCounts.documents = docCount || 0

        // Properties
        if (propertyIds.length > 0) {
          const { count: propCount } = await supabaseAdmin.from('properties').delete().in('id', propertyIds).select('*', { count: 'exact', head: true })
          result.deletedCounts.properties = propCount || 0
        }

        // Contacts
        if (contactIds.length > 0) {
          const { count: contactCount } = await supabaseAdmin.from('contacts').delete().in('id', contactIds).select('*', { count: 'exact', head: true })
          result.deletedCounts.contacts = contactCount || 0
        }

        // Owners
        if (ownerIds.length > 0) {
          const { count: ownerCount } = await supabaseAdmin.from('owners').delete().in('id', ownerIds).select('*', { count: 'exact', head: true })
          result.deletedCounts.owners = ownerCount || 0
        }

        // Credit transactions
        const { count: creditCount } = await supabaseAdmin.from('credit_transactions').delete().eq('user_id', userId).select('*', { count: 'exact', head: true })
        result.deletedCounts.creditTransactions = creditCount || 0

        // Verification codes
        await supabaseAdmin.from('verification_codes').delete().eq('user_id', userId)

        // Referral relationships
        const { count: referralCount1 } = await supabaseAdmin.from('referral_relationships').delete().eq('referrer_id', userId).select('*', { count: 'exact', head: true })
        const { count: referralCount2 } = await supabaseAdmin.from('referral_relationships').delete().eq('referee_id', userId).select('*', { count: 'exact', head: true })
        const { count: referralCount3 } = await supabaseAdmin.from('referral_relationships').delete().eq('referee_email', profile.email).select('*', { count: 'exact', head: true })
        result.deletedCounts.referralRelationships = (referralCount1 || 0) + (referralCount2 || 0) + (referralCount3 || 0)

        // Pending signups
        const { count: pendingCount } = await supabaseAdmin.from('pending_signups').delete().eq('email', profile.email).select('*', { count: 'exact', head: true })
        result.deletedCounts.pendingSignups = pendingCount || 0

        // Profile
        await supabaseAdmin.from('profiles').delete().eq('user_id', userId)

        // Delete auth user
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (authDeleteError) {
          throw new Error(`Failed to delete auth user: ${authDeleteError.message}`)
        }

        result.success = true
        console.log(`Successfully deleted user ${userId}`)

      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error)
        result.error = error instanceof Error ? error.message : 'Unknown error'
      }

      results.push(result)
    }

    const successCount = results.filter(r => r.success).length
    console.log(`Deletion complete: ${successCount}/${userIds.length} successful`)

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        total: userIds.length,
        successful: successCount,
        failed: userIds.length - successCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Admin delete users error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})