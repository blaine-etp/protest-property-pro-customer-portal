
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('🔄 Starting address normalization...')
    
    const { googlePlacesData, address } = await req.json()
    console.log('📍 Input data:', { address, placeId: googlePlacesData?.place_id })

    if (!googlePlacesData || !address) {
      throw new Error('Missing required parameters: googlePlacesData and address')
    }

    // Extract address components from Google Places
    const addressComponents = googlePlacesData.address_components || []
    
    // Parse address components
    const parseComponent = (types: string[]) => {
      const component = addressComponents.find((comp: any) => 
        types.some(type => comp.types.includes(type))
      )
      return component ? component.long_name : null
    }

    const streetNumber = parseComponent(['street_number'])
    const streetName = parseComponent(['route'])
    const city = parseComponent(['locality', 'sublocality'])
    const county = parseComponent(['administrative_area_level_2'])
    const state = parseComponent(['administrative_area_level_1'])
    const zipCode = parseComponent(['postal_code'])

    // Create normalized address object
    const normalizedAddress = {
      street_number: streetNumber,
      street_name: streetName,
      city: city,
      county: county,
      state: state,
      zip_code: zipCode,
      formatted_address: googlePlacesData.formatted_address,
      place_id: googlePlacesData.place_id,
      
      // TODO: DEVELOPER INTEGRATION POINT
      // This is where you'll need to implement county-specific address normalization
      // Each county may have different address formats in their AWS database
      // You'll need to:
      // 1. Identify the county from the Google Places data
      // 2. Apply county-specific formatting rules
      // 3. Handle common address variations (St vs Street, Ave vs Avenue, etc.)
      aws_formatted_address: googlePlacesData.formatted_address, // Placeholder
      
      // Additional fields that might be needed for AWS lookup
      full_street_address: streetNumber && streetName ? `${streetNumber} ${streetName}` : null,
      county_code: null, // TODO: Map county name to county code if needed
    }

    console.log('✅ Address normalized:', normalizedAddress)

    return new Response(
      JSON.stringify({ 
        success: true, 
        normalizedAddress,
        message: 'Address normalized successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Address normalization error:', error)
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
