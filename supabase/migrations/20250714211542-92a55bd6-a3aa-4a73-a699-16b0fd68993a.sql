-- Update the referral credit function with new amounts and trigger logic
CREATE OR REPLACE FUNCTION public.award_immediate_referral_credits()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  referrer_profile profiles%ROWTYPE;
  referee_profile profiles%ROWTYPE;
  referrer_credit_amount numeric := 20.00;
  referee_credit_amount numeric := 20.00;
BEGIN
  -- Handle both INSERT and UPDATE scenarios for completed referrals
  -- For INSERT: Check if status is 'completed'
  -- For UPDATE: Check if status changes to 'completed' and wasn't completed before
  IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR 
     (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed')) THEN
    
    -- Get referrer profile
    SELECT p.* INTO referrer_profile
    FROM profiles p
    WHERE p.user_id = NEW.referrer_id;
    
    -- Get referee profile  
    SELECT p.* INTO referee_profile
    FROM profiles p
    WHERE p.user_id = NEW.referee_id;
    
    IF FOUND THEN
      -- Award credit to referrer ($20)
      UPDATE profiles 
      SET referral_credit_balance = referral_credit_balance + referrer_credit_amount
      WHERE user_id = referrer_profile.user_id;
      
      -- Award credit to referee ($20)
      UPDATE profiles 
      SET referral_credit_balance = referral_credit_balance + referee_credit_amount
      WHERE user_id = referee_profile.user_id;
      
      -- Update referral relationship with credit amount
      UPDATE referral_relationships 
      SET credit_awarded_amount = referrer_credit_amount + referee_credit_amount,
          completion_date = now()
      WHERE id = NEW.id;
      
      -- Create credit transaction records
      INSERT INTO credit_transactions (
        user_id, transaction_type, amount, balance_after, description, referral_relationship_id
      ) VALUES (
        referrer_profile.user_id, 
        'referral_signup_bonus', 
        referrer_credit_amount, 
        referrer_profile.referral_credit_balance + referrer_credit_amount,
        'Referral signup bonus for ' || referee_profile.first_name || ' ' || referee_profile.last_name || ' completing signup',
        NEW.id
      );
      
      INSERT INTO credit_transactions (
        user_id, transaction_type, amount, balance_after, description, referral_relationship_id
      ) VALUES (
        referee_profile.user_id, 
        'signup_bonus', 
        referee_credit_amount, 
        referee_profile.referral_credit_balance + referee_credit_amount,
        'Signup bonus for completing registration via referral',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop the existing trigger that only fires on UPDATE
DROP TRIGGER IF EXISTS award_immediate_referral_credits_trigger ON public.referral_relationships;

-- Create new trigger that fires on both INSERT and UPDATE
CREATE TRIGGER award_immediate_referral_credits_trigger
  AFTER INSERT OR UPDATE ON public.referral_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.award_immediate_referral_credits();