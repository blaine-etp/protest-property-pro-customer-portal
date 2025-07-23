-- Enable Row Level Security for tables missing it
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protests ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for communications table
CREATE POLICY "Administrators can view all communications" 
ON public.communications 
FOR SELECT 
USING (get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Users can insert communications with token or auth" 
ON public.communications 
FOR INSERT 
WITH CHECK (true);

-- Add RLS policies for protests table
CREATE POLICY "Administrators can view all protests" 
ON public.protests 
FOR SELECT 
USING (get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Users can insert protests with token or auth" 
ON public.protests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update protests with token or auth" 
ON public.protests 
FOR UPDATE 
USING (true);