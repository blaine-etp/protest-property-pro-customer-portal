
-- Insert mock protest data
INSERT INTO public.protests (
  id,
  property_id,
  situs_address,
  owner_name,
  county,
  appeal_status,
  hearing_date,
  assessed_value,
  market_value,
  protest_amount,
  savings_amount,
  tax_year,
  protest_date,
  recommendation,
  documents_generated,
  evidence_packet_url,
  offer_received_date
) VALUES 
(
  gen_random_uuid(),
  gen_random_uuid(),
  '123 Main Street, Austin, TX 78701',
  'John Smith',
  'Travis County',
  'offer_received',
  '2024-03-15 10:00:00-05',
  450000,
  420000,
  30000,
  2100,
  2024,
  '2024-01-15 09:00:00-06',
  'Accept - Fair market adjustment based on comparable sales',
  true,
  '/documents/evidence-packet-001.pdf',
  '2024-02-20 14:30:00-06'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  '456 Oak Avenue, Austin, TX 78702',
  'Sarah Johnson',
  'Travis County',
  'waiting_for_offer',
  '2024-04-10 14:00:00-05',
  325000,
  305000,
  20000,
  1400,
  2024,
  '2024-01-20 11:00:00-06',
  NULL,
  false,
  NULL,
  NULL
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  '789 Pine Street, Austin, TX 78703',
  'Michael Brown',
  'Travis County',
  'needs_review',
  '2024-02-28 09:30:00-06',
  675000,
  640000,
  35000,
  2450,
  2024,
  '2024-01-10 08:00:00-06',
  'Reject - Offer too low, request higher reduction',
  true,
  '/documents/evidence-packet-002.pdf',
  '2024-02-15 16:45:00-06'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  '321 Elm Drive, Round Rock, TX 78664',
  'Emily Davis',
  'Williamson County',
  'accepted',
  '2024-03-05 11:00:00-06',
  280000,
  260000,
  20000,
  1400,
  2024,
  '2024-01-05 10:00:00-06',
  'Accept - Good settlement offer',
  true,
  '/documents/evidence-packet-003.pdf',
  '2024-02-10 13:20:00-06'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  '567 Cedar Lane, Pflugerville, TX 78660',
  'Robert Wilson',
  'Travis County',
  'email_reply_required',
  '2024-04-20 15:30:00-05',
  380000,
  350000,
  30000,
  2100,
  2024,
  '2024-01-25 14:00:00-06',
  'Follow up needed - Awaiting additional documentation',
  false,
  NULL,
  '2024-02-25 10:15:00-06'
);

-- Create protest_comments table for internal notes and status changes
CREATE TABLE public.protest_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protest_id UUID NOT NULL REFERENCES public.protests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'note', -- 'note', 'status_change', 'system'
  content TEXT NOT NULL,
  old_status TEXT NULL,
  new_status TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for protest_comments
ALTER TABLE public.protest_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrators can view all protest comments" 
  ON public.protest_comments 
  FOR SELECT 
  USING (get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Administrators can insert protest comments" 
  ON public.protest_comments 
  FOR INSERT 
  WITH CHECK (get_user_permissions(auth.uid()) = 'administrator');

CREATE POLICY "Administrators can update protest comments" 
  ON public.protest_comments 
  FOR UPDATE 
  USING (get_user_permissions(auth.uid()) = 'administrator');

-- Create protest_documents table for tracking document generation
CREATE TABLE public.protest_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protest_id UUID NOT NULL REFERENCES public.protests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'evidence_packet', 'form_50_162', 'hearing_notice', etc.
  file_path TEXT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'generated', 'delivered', 'error'
  generated_by UUID NULL,
  generated_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for protest_documents
ALTER TABLE public.protest_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrators can manage all protest documents" 
  ON public.protest_documents 
  FOR ALL 
  USING (get_user_permissions(auth.uid()) = 'administrator');

-- Create protest_chat_messages table for AI chat integration
CREATE TABLE public.protest_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protest_id UUID NOT NULL REFERENCES public.protests(id) ON DELETE CASCADE,
  user_id UUID NULL,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'function_call', 'system'
  metadata JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for protest_chat_messages
ALTER TABLE public.protest_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administrators can manage protest chat messages" 
  ON public.protest_chat_messages 
  FOR ALL 
  USING (get_user_permissions(auth.uid()) = 'administrator');

-- Add updated_at trigger for protest_comments
CREATE TRIGGER update_protest_comments_updated_at
  BEFORE UPDATE ON public.protest_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for protest_documents
CREATE TRIGGER update_protest_documents_updated_at
  BEFORE UPDATE ON public.protest_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
