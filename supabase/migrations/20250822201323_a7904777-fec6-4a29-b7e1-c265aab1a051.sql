-- Add agent status tracking columns to properties table
ALTER TABLE public.properties 
ADD COLUMN is_active_agent boolean NULL,
ADD COLUMN agent_status_source text NOT NULL DEFAULT 'unknown',
ADD COLUMN agent_status_tax_year integer DEFAULT EXTRACT(year FROM CURRENT_DATE),
ADD COLUMN agent_status_updated_at timestamp with time zone DEFAULT now();

-- Add check constraint for agent_status_source
ALTER TABLE public.properties 
ADD CONSTRAINT properties_agent_status_source_check 
CHECK (agent_status_source IN ('aws', 'county_portal_upload', 'manual', 'unknown'));

-- Create property agent status events table for history tracking
CREATE TABLE public.property_agent_status_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL,
  previous_is_active_agent boolean NULL,
  new_is_active_agent boolean NULL,
  previous_agent_status_source text NULL,
  new_agent_status_source text NOT NULL,
  tax_year integer NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  changed_by_user_id uuid NULL,
  external_reference text NULL,
  external_payload jsonb NULL,
  notes text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on property_agent_status_events
ALTER TABLE public.property_agent_status_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for property_agent_status_events
CREATE POLICY "Admins can manage all agent status events" 
ON public.property_agent_status_events 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view agent status events for their properties" 
ON public.property_agent_status_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM properties p 
  WHERE p.id = property_agent_status_events.property_id 
  AND p.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_properties_agent_status ON public.properties(is_active_agent, agent_status_source, agent_status_tax_year);
CREATE INDEX idx_property_agent_status_events_property_id ON public.property_agent_status_events(property_id);
CREATE INDEX idx_property_agent_status_events_tax_year ON public.property_agent_status_events(tax_year);