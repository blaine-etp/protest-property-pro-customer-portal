import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmitApplicationRequest {
  formData: any;
  origin?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, origin }: SubmitApplicationRequest = await req.json();

    // Basic validations
    if (!formData?.email || !formData?.firstName || !formData?.lastName || !formData?.address) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate Place ID and formatted address
    if (!formData?.placeId || !formData?.formattedAddress || formData.formattedAddress.length < 10) {
      return new Response(JSON.stringify({
        success: false,
        error: "Place ID is required to continue. Please contact support.",
        code: "MISSING_PLACE_ID"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment not configured");
    }

    // Admin client only for database operations (NOT user creation)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Anonymous client for user signup
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const email: string = formData.email;
    const firstName: string = formData.firstName;
    const lastName: string = formData.lastName;

    // Set up redirect URL for email confirmation
    const isDevelopment = origin?.includes('localhost');
    const baseUrl = isDevelopment ? 'http://localhost:3002' : origin;
    const redirectTo = `${baseUrl}/set-password?redirect=customer-portal`;

    console.log(`Processing customer signup for:`, email);

    // 1) PURE CLIENT-SIDE USER SIGNUP (No admin involvement)
    let userId: string | null = null;

    // Check if user already exists first
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();
    
    if (existingProfile?.user_id) {
      userId = existingProfile.user_id as string;
      console.log("✅ User already exists:", userId);
      
      // For existing users, don't trigger email verification again
      // Just create the new property and redirect appropriately
      console.log("✅ Existing user - skipping email verification");
    } else {
      // Use anonymous client for proper self-signup
      const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
        email,
        password: `temp-${Date.now()}-${Math.random()}`, // Temporary password - user will set their own
        options: {
          emailRedirectTo: redirectTo,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (signUpError) {
        // If signup fails for any reason, throw error - no admin fallback
        throw new Error(`Signup failed: ${signUpError.message}. Please contact support if you believe this is an error.`);
      } else {
        userId = signUpData.user?.id;
        console.log("✅ New user created via client signup:", userId);
      }
    }

    if (!userId) throw new Error("User id not found");

    // 2) Create all database records using admin client (for permissions only)
    
    // Upsert profile
    const { error: profileErr } = await admin
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          email,
          phone: formData.phone ?? null,
          is_trust_entity: !!formData.isTrustEntity,
          role: formData.role ?? "homeowner",
          agree_to_updates: !!formData.agreeToUpdates,
          is_authenticated: false, // Will be set to true after password setup
        },
        { onConflict: "user_id" }
      );
    if (profileErr) throw new Error(`Profile upsert failed: ${profileErr.message}`);

    // Create contact
    const { data: contact, error: contactErr } = await admin
      .from("contacts")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: formData.phone ?? null,
        company: formData.isTrustEntity ? formData.entityName : null,
        source: "property_signup",
        status: "active",
        notes: `Primary contact for property at ${formData.address}`,
      })
      .select()
      .single();
    if (contactErr) throw new Error(`Contact creation failed: ${contactErr.message}`);

    // Create owner
    const ownerName = formData.isTrustEntity && formData.entityName
      ? formData.entityName
      : `${firstName} ${lastName}`;

    const ownerType = formData.isTrustEntity
      ? (formData.entityType?.toLowerCase() || "entity")
      : "individual";

    const { data: owner, error: ownerErr } = await admin
      .from("owners")
      .insert({
        name: ownerName,
        owner_type: ownerType,
        created_by_user_id: userId,
        entity_relationship: formData.relationshipToEntity ?? null,
        form_entity_name: formData.entityName ?? null,
        form_entity_type: formData.entityType ?? null,
        notes: `Relationship to property: ${formData.role || "homeowner"}`,
        mailing_address: formData.address,
        mailing_city: formData.county ? `${String(formData.county).replace(" County", "")}, TX` : null,
        mailing_state: "TX",
        mailing_zip: null,
      })
      .select()
      .single();
    if (ownerErr) throw new Error(`Owner creation failed: ${ownerErr.message}`);

    // Create property
    const { data: property, error: propertyErr } = await admin
      .from("properties")
      .insert({
        user_id: userId,
        owner_id: owner.id,
        contact_id: contact.id,
        situs_address: formData.address,
        parcel_number: formData.parcelNumber ?? null,
        estimated_savings: formData.estimatedSavings ?? null,
        include_all_properties: !!formData.includeAllProperties,
        place_id: formData.placeId ?? null,
        formatted_address: formData.formattedAddress ?? formData.address,
        google_address_components: formData.addressComponents ?? null,
        latitude: formData.latitude ?? null,
        longitude: formData.longitude ?? null,
        county: formData.county ?? null,
      })
      .select()
      .single();
    if (propertyErr) throw new Error(`Property creation failed: ${propertyErr.message}`);

    // Create application
    const { error: applicationErr } = await admin
      .from("applications")
      .insert({
        user_id: userId,
        property_id: property.id,
        signature: formData.signature ?? null,
        is_owner_verified: true,
        status: "submitted",
        signup_pid: formData.signupPid ?? null,
      });
    if (applicationErr) throw new Error(`Application creation failed: ${applicationErr.message}`);

    // Create protest
    const { error: protestErr } = await admin
      .from("protests")
      .insert({
        property_id: property.id,
        appeal_status: "pending",
        exemption_status: "pending",
        savings_amount: formData.estimatedSavings || 0,
      });
    if (protestErr) console.log("Protest creation warning:", protestErr.message);

    // Generate Form 50-162 (non-blocking)
    try {
      const { error: documentError } = await admin.functions.invoke("generate-form-50-162", {
        body: { propertyId: property.id, userId },
      });
      if (documentError) {
        console.log("Document generation warning:", documentError.message);
      } else {
        console.log("Form 50-162 generated successfully for property:", property.id);
      }
    } catch (e: any) {
      console.log("Document generation error:", e?.message || e);
    }

    // Handle referral code (non-blocking)
    if (formData.referralCode) {
      try {
        const { data: referrerProfile } = await admin
          .from("profiles")
          .select("user_id, email, first_name, last_name")
          .eq("referral_code", formData.referralCode)
          .single();

        if (referrerProfile && referrerProfile.email !== email) {
          await admin.from("referral_relationships").insert({
            referrer_id: referrerProfile.user_id,
            referee_id: userId,
            referral_code: formData.referralCode,
            referee_email: email,
            referee_first_name: firstName,
            referee_last_name: lastName,
            status: "completed",
          });
        }
      } catch (e) {
        console.log("Referral handling warning:", (e as any)?.message || e);
      }
    }

    // Determine response based on user type
    const isNewUser = !existingProfile?.user_id;
    
    if (isNewUser) {
      // New users need email confirmation
      console.log("✅ New user - email confirmation required");
      return new Response(
        JSON.stringify({
          success: true,
          userId,
          propertyId: property.id,
          requiresEmailConfirmation: true,
          message: "Account created! Please check your email and click the confirmation link to verify your email and set your password."
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      // Existing users go straight to portal
      console.log("✅ Existing user - redirecting to portal");
      return new Response(
        JSON.stringify({
          success: true,
          userId,
          propertyId: property.id,
          requiresEmailConfirmation: false,
          redirectTo: `${baseUrl}/customer-portal`,
          message: "Property added successfully! Redirecting to your dashboard."
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
  } catch (error: any) {
    console.error("submit-application error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
