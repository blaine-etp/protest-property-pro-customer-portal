-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_trust_entity BOOLEAN DEFAULT false,
  role TEXT CHECK (role IN ('homeowner', 'property_manager', 'authorized_person')) DEFAULT 'homeowner',
  agree_to_updates BOOLEAN DEFAULT true,
  lifetime_savings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table for property information
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  parcel_number TEXT,
  estimated_savings DECIMAL(10,2),
  include_all_properties BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table for form submissions
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  signature TEXT,
  is_owner_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'approved', 'rejected', 'completed')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appeal_status table for tracking appeals
CREATE TABLE public.appeal_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  appeal_status TEXT DEFAULT 'pending' CHECK (appeal_status IN ('pending', 'filed', 'in_progress', 'settled', 'closed')),
  exemption_status TEXT DEFAULT 'pending' CHECK (exemption_status IN ('pending', 'approved', 'denied', 'expired')),
  auto_appeal_enabled BOOLEAN DEFAULT false,
  contingency_fee_percent DECIMAL(5,2) DEFAULT 25.00,
  savings_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeal_status ENABLE ROW LEVEL SECURITY;

-- Create foreign key relationships
ALTER TABLE public.properties ADD CONSTRAINT fk_properties_user FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.applications ADD CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.applications ADD CONSTRAINT fk_applications_property FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
ALTER TABLE public.appeal_status ADD CONSTRAINT fk_appeal_status_property FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for properties
CREATE POLICY "Users can view their own properties" ON public.properties
  FOR SELECT USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own properties" ON public.properties
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own properties" ON public.properties
  FOR UPDATE USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for applications
CREATE POLICY "Users can view their own applications" ON public.applications
  FOR SELECT USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own applications" ON public.applications
  FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own applications" ON public.applications
  FOR UPDATE USING (user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for appeal_status
CREATE POLICY "Users can view appeal status for their properties" ON public.appeal_status
  FOR SELECT USING (property_id IN (
    SELECT id FROM public.properties WHERE user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "Users can insert appeal status for their properties" ON public.appeal_status
  FOR INSERT WITH CHECK (property_id IN (
    SELECT id FROM public.properties WHERE user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "Users can update appeal status for their properties" ON public.appeal_status
  FOR UPDATE USING (property_id IN (
    SELECT id FROM public.properties WHERE user_id = (SELECT user_id FROM public.profiles WHERE user_id = auth.uid())
  ));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appeal_status_updated_at
  BEFORE UPDATE ON public.appeal_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();