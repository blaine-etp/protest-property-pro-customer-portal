-- Add SignupPID to applications table
ALTER TABLE public.applications 
ADD COLUMN signup_pid TEXT;

-- Add ETPPID and CountyPID to properties table  
ALTER TABLE public.properties 
ADD COLUMN etp_pid TEXT,
ADD COLUMN county_pid TEXT;

-- Add indexes for better performance on these identifier lookups
CREATE INDEX idx_applications_signup_pid ON public.applications(signup_pid);
CREATE INDEX idx_properties_etp_pid ON public.properties(etp_pid);
CREATE INDEX idx_properties_county_pid ON public.properties(county_pid);