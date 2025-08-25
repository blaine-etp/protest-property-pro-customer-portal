
-- Create or replace a focused reporting view for 50-162 documents
create or replace view public.document_reports as
select
  cd.id,
  cd.document_type,
  cd.status,
  cd.generated_at,
  cd.generation_date,
  cd.file_path,
  cd.user_id,
  cd.property_id,
  p.county,
  p.situs_address
from public.customer_documents cd
left join public.properties p
  on p.id = cd.property_id
where cd.document_type = 'form-50-162';
