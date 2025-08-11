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
    if (!formData?.email || !formData?.firstName || !formData?.lastName || !formData?.address) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment not configured");
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const email: string = formData.email;
    const firstName: string = formData.firstName;
    const lastName: string = formData.lastName;

    // 1) Get or create auth user
    let userId: string | null = null;

    // Try to resolve via existing profile first (fast path)
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();
    if (existingProfile?.user_id) {
      userId = existingProfile.user_id as string;
    } else {
      // Create user (idempotent-ish): if already exists, we'll look it up via listUsers
      const { data: createUserRes, error: createUserErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName },
      });
      if (createUserRes?.user?.id) {
        userId = createUserRes.user.id;
      } else {
        // If user exists, fallback to listing and finding by email
        const { data: usersList, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listErr) throw new Error(createUserErr?.message || listErr.message || "Failed to resolve user");
        const found = usersList.users?.find((u: any) => (u.email || "").toLowerCase() === email.toLowerCase());
        if (!found) throw new Error(createUserErr?.message || "User exists but could not be retrieved");
        userId = found.id;
      }
    }

    if (!userId) throw new Error("User id not found");

    // 2) Upsert profile
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
          is_authenticated: true,
        },
        { onConflict: "user_id" }
      );
    if (profileErr) throw new Error(`Profile upsert failed: ${profileErr.message}`);

    // 3) Create contact
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

    // 4) Create owner
    let ownerName = formData.isTrustEntity && formData.entityName
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

    // 5) Create property
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

    // 6) Create application
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

    // 7) Create protest (optional but useful for portal)
    const { error: protestErr } = await admin
      .from("protests")
      .insert({
        property_id: property.id,
        appeal_status: "pending",
        exemption_status: "pending",
        savings_amount: formData.estimatedSavings || 0,
      });
    if (protestErr) console.log("Protest creation warning:", protestErr.message);

    // 8) Handle referral code (non-blocking)
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
        console.log("Referral handling warning:", e?.message || e);
      }
    }

    // 9) Generate magic link to sign the user in immediately
    const redirectTo = `${origin || ""}/customer-portal`;
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });
    if (linkErr) throw new Error(`Failed to generate magic link: ${linkErr.message}`);

    const magicLink = (linkData as any)?.action_link || (linkData as any)?.properties?.action_link || null;

    return new Response(
      JSON.stringify({ success: true, magicLink, userId, propertyId: property.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("submit-application error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
