-- Phase 1: Disable All RLS Policies and Make Everything Public
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Administrators can view all applications" ON public.applications;

DROP POLICY IF EXISTS "Administrators can view all bills" ON public.bills;
DROP POLICY IF EXISTS "Users can insert bills with token or auth" ON public.bills;

DROP POLICY IF EXISTS "Administrators can view all communications" ON public.communications;
DROP POLICY IF EXISTS "Users can insert communications with token or auth" ON public.communications;

DROP POLICY IF EXISTS "Users can insert communication properties with token or auth" ON public.communication_properties;

DROP POLICY IF EXISTS "System can create credit transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can view their credit transactions" ON public.credit_transactions;

DROP POLICY IF EXISTS "Users can view their own documents" ON public.customer_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.customer_documents;

DROP POLICY IF EXISTS "Users can insert document properties with token or auth" ON public.document_properties;

DROP POLICY IF EXISTS "Users can view their owners" ON public.owners;
DROP POLICY IF EXISTS "Users can insert owners" ON public.owners;
DROP POLICY IF EXISTS "Users can update their owners" ON public.owners;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Administrators can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can insert their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Administrators can view all properties" ON public.properties;

DROP POLICY IF EXISTS "Allow public read access to protests" ON public.protests;
DROP POLICY IF EXISTS "Administrators can manage all protests" ON public.protests;
DROP POLICY IF EXISTS "Authenticated users can insert protests" ON public.protests;
DROP POLICY IF EXISTS "Anyone can update protests (temporary)" ON public.protests;

DROP POLICY IF EXISTS "Users can create referral relationships" ON public.referral_relationships;
DROP POLICY IF EXISTS "Users can view their referral relationships" ON public.referral_relationships;
DROP POLICY IF EXISTS "System can update referral relationships" ON public.referral_relationships;

DROP POLICY IF EXISTS "Users can view their own verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Users can create their own verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Users can update their own verification codes" ON public.verification_codes;

-- Create public access policies for all tables
CREATE POLICY "Public access to all data" ON public.applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.blog_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.blog_post_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.communications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.communication_properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.counties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.county_pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.credit_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.customer_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.document_properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.owners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.protests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.referral_relationships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all data" ON public.verification_codes FOR ALL USING (true) WITH CHECK (true);

-- Phase 2: Fix Properties-Protests Relationship
-- First, let's see what protests don't have property_id values
DO $$
DECLARE
    protest_record RECORD;
    property_id_val UUID;
    default_user_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID; -- Use a consistent test user ID
BEGIN
    -- Loop through protests that don't have property_id
    FOR protest_record IN 
        SELECT id, situs_address 
        FROM protests 
        WHERE property_id IS NULL AND situs_address IS NOT NULL
    LOOP
        -- Check if a property already exists for this address
        SELECT id INTO property_id_val 
        FROM properties 
        WHERE LOWER(TRIM(situs_address)) = LOWER(TRIM(protest_record.situs_address))
        LIMIT 1;
        
        -- If no property exists, create one
        IF property_id_val IS NULL THEN
            INSERT INTO properties (
                situs_address,
                user_id,
                created_at,
                updated_at
            ) VALUES (
                protest_record.situs_address,
                default_user_id,
                NOW(),
                NOW()
            ) RETURNING id INTO property_id_val;
            
            RAISE NOTICE 'Created property % for address: %', property_id_val, protest_record.situs_address;
        END IF;
        
        -- Update the protest with the property_id
        UPDATE protests 
        SET property_id = property_id_val 
        WHERE id = protest_record.id;
        
        RAISE NOTICE 'Updated protest % with property_id: %', protest_record.id, property_id_val;
    END LOOP;
END $$;

-- Phase 3: Implement One-Active-Protest-Per-Property Constraint
-- First, handle existing conflicts by marking older protests as completed
DO $$
DECLARE
    property_record RECORD;
    protest_record RECORD;
    keep_protest_id UUID;
BEGIN
    -- For each property that has multiple active protests
    FOR property_record IN 
        SELECT property_id, COUNT(*) as protest_count
        FROM protests 
        WHERE property_id IS NOT NULL 
        AND (appeal_status IS NULL OR appeal_status != 'completed')
        GROUP BY property_id 
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the most recent protest active, mark others as completed
        SELECT id INTO keep_protest_id
        FROM protests 
        WHERE property_id = property_record.property_id 
        AND (appeal_status IS NULL OR appeal_status != 'completed')
        ORDER BY created_at DESC 
        LIMIT 1;
        
        -- Mark all other protests for this property as completed
        UPDATE protests 
        SET appeal_status = 'completed'
        WHERE property_id = property_record.property_id 
        AND id != keep_protest_id
        AND (appeal_status IS NULL OR appeal_status != 'completed');
        
        RAISE NOTICE 'Property % had % active protests. Kept % active, marked others as completed.', 
                     property_record.property_id, property_record.protest_count, keep_protest_id;
    END LOOP;
END $$;

-- Create the unique partial index to enforce one active protest per property
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS protests_one_active_per_property 
ON protests(property_id) 
WHERE (appeal_status IS NULL OR appeal_status != 'completed');

-- Phase 4: Data Validation
-- Add a comment with statistics
DO $$
DECLARE
    total_properties INTEGER;
    total_protests INTEGER;
    active_protests INTEGER;
    completed_protests INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_properties FROM properties;
    SELECT COUNT(*) INTO total_protests FROM protests;
    SELECT COUNT(*) INTO active_protests FROM protests WHERE (appeal_status IS NULL OR appeal_status != 'completed');
    SELECT COUNT(*) INTO completed_protests FROM protests WHERE appeal_status = 'completed';
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Total properties: %', total_properties;
    RAISE NOTICE 'Total protests: %', total_protests;
    RAISE NOTICE 'Active protests: %', active_protests;
    RAISE NOTICE 'Completed protests: %', completed_protests;
END $$;