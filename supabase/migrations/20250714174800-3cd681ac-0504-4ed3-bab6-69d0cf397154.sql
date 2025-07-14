-- Add referral_credit_balance to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referral_credit_balance numeric DEFAULT 0;

-- Create referral_relationships table to track who referred whom
CREATE TABLE public.referral_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referee_id uuid NOT NULL,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, completed, failed
  referee_email text NOT NULL,
  referee_first_name text,
  referee_last_name text,
  signup_date timestamp with time zone NOT NULL DEFAULT now(),
  completion_date timestamp with time zone,
  credit_awarded_amount numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(referee_email),
  FOREIGN KEY (referrer_id) REFERENCES public.profiles(user_id),
  FOREIGN KEY (referee_id) REFERENCES public.profiles(user_id)
);

-- Create credit_transactions table for audit trail
CREATE TABLE public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  transaction_type text NOT NULL, -- earned_referral, earned_signup_bonus, applied_to_invoice, expired
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  description text,
  referral_relationship_id uuid,
  invoice_id text, -- External invoice ID from accounting system
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  FOREIGN KEY (referral_relationship_id) REFERENCES public.referral_relationships(id)
);

-- Add referral_code to profiles table for unique codes
ALTER TABLE public.profiles 
ADD COLUMN referral_code text UNIQUE DEFAULT CONCAT('REF-', UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)));

-- Enable RLS on new tables
ALTER TABLE public.referral_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_relationships
CREATE POLICY "Users can view their referral relationships by token or auth" 
ON public.referral_relationships 
FOR SELECT 
USING (
  referrer_id IN (
    SELECT p.user_id FROM profiles p 
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR 
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  ) OR 
  referee_id IN (
    SELECT p.user_id FROM profiles p 
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR 
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

CREATE POLICY "Users can create referral relationships with token or auth" 
ON public.referral_relationships 
FOR INSERT 
WITH CHECK (
  referrer_id IN (
    SELECT p.user_id FROM profiles p 
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR 
      p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "System can update referral relationships" 
ON public.referral_relationships 
FOR UPDATE 
USING (true);

-- RLS policies for credit_transactions
CREATE POLICY "Users can view their credit transactions by token or auth" 
ON public.credit_transactions 
FOR SELECT 
USING (
  user_id IN (
    SELECT p.user_id FROM profiles p 
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) OR 
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  )
);

CREATE POLICY "System can create credit transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_referral_relationships_updated_at
BEFORE UPDATE ON public.referral_relationships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to award referral credits when appeal succeeds
CREATE OR REPLACE FUNCTION public.award_referral_credits()
RETURNS TRIGGER AS $$
DECLARE
  referrer_profile profiles%ROWTYPE;
  referee_profile profiles%ROWTYPE;
  referral_rel referral_relationships%ROWTYPE;
  referrer_credit_amount numeric := 25.00;
  referee_credit_amount numeric := 50.00;
BEGIN
  -- Only process if appeal succeeded with savings
  IF NEW.appeal_status = 'approved' AND NEW.savings_amount > 0 AND 
     (OLD.appeal_status != 'approved' OR OLD.savings_amount <= 0) THEN
    
    -- Get the property owner's profile
    SELECT p.* INTO referee_profile
    FROM profiles p
    JOIN properties pr ON pr.user_id = p.user_id
    WHERE pr.id = NEW.property_id;
    
    -- Check if this user was referred by someone
    SELECT rr.* INTO referral_rel
    FROM referral_relationships rr
    WHERE rr.referee_id = referee_profile.user_id
    AND rr.status = 'pending';
    
    IF FOUND THEN
      -- Get referrer profile
      SELECT p.* INTO referrer_profile
      FROM profiles p
      WHERE p.user_id = referral_rel.referrer_id;
      
      -- Award credit to referrer ($25)
      UPDATE profiles 
      SET referral_credit_balance = referral_credit_balance + referrer_credit_amount
      WHERE user_id = referrer_profile.user_id;
      
      -- Award credit to referee ($50)
      UPDATE profiles 
      SET referral_credit_balance = referral_credit_balance + referee_credit_amount
      WHERE user_id = referee_profile.user_id;
      
      -- Update referral relationship status
      UPDATE referral_relationships 
      SET status = 'completed',
          completion_date = now(),
          credit_awarded_amount = referrer_credit_amount + referee_credit_amount
      WHERE id = referral_rel.id;
      
      -- Create credit transaction records
      INSERT INTO credit_transactions (
        user_id, transaction_type, amount, balance_after, description, referral_relationship_id
      ) VALUES (
        referrer_profile.user_id, 
        'earned_referral', 
        referrer_credit_amount, 
        referrer_profile.referral_credit_balance + referrer_credit_amount,
        'Referral credit for successful appeal by ' || referee_profile.first_name || ' ' || referee_profile.last_name,
        referral_rel.id
      );
      
      INSERT INTO credit_transactions (
        user_id, transaction_type, amount, balance_after, description, referral_relationship_id
      ) VALUES (
        referee_profile.user_id, 
        'earned_signup_bonus', 
        referee_credit_amount, 
        referee_profile.referral_credit_balance + referee_credit_amount,
        'Sign-up bonus for successful appeal',
        referral_rel.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to award credits when appeal succeeds
CREATE TRIGGER award_referral_credits_trigger
AFTER UPDATE ON public.appeal_status
FOR EACH ROW
EXECUTE FUNCTION public.award_referral_credits();