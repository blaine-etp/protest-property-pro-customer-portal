-- Update existing footer content to new structure
UPDATE site_content 
SET content_value = jsonb_set(
  jsonb_set(
    jsonb_set(
      content_value,
      '{services}',
      jsonb_build_array(
        jsonb_build_object('name', 'Property Tax Protest', 'url', '/services/property-tax-protest'),
        jsonb_build_object('name', 'Tax Assessment Review', 'url', '/services/tax-assessment-review'),
        jsonb_build_object('name', 'Commercial Properties', 'url', '/services/commercial-properties'),
        jsonb_build_object('name', 'Residential Properties', 'url', '/services/residential-properties'),
        jsonb_build_object('name', 'Consultation Services', 'url', '/services/consultation')
      )
    ),
    '{legal,privacyUrl}',
    '"/privacy-policy"'
  ),
  '{legal}',
  jsonb_set(
    jsonb_set(
      content_value->'legal',
      '{termsUrl}',
      '"/terms-of-service"'
    ),
    '{licenseUrl}',
    '"/license"'
  )
)
WHERE content_key = 'footer' AND content_type = 'footer';