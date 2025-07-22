import { CountyBasicsTemplate } from "@/components/CountyBasicsTemplate";

const CountyTemplate = () => {
  // Sample county data for the template preview
  const sampleCounty = {
    id: "sample-id",
    name: "Sample County",
    state: "Texas",
    slug: "sample-county-texas",
    status: "published",
    featured: false,
    current_tax_year: 2024,
    protest_deadline: "2024-05-15",
    hearing_period_start: "2024-06-01",
    hearing_period_end: "2024-08-31",
    appraisal_district_name: "Sample County Appraisal District",
    appraisal_district_address: "123 Main Street",
    appraisal_district_city: "Sampletown",
    appraisal_district_zip: "12345",
    appraisal_district_phone: "(555) 123-4567",
    appraisal_district_website: "https://samplecountyad.org",
    county_info_content: "This is sample content for the county information section. It would typically contain important details about the county's tax assessment process.",
    how_to_content: "This is sample content for the how-to section. It would provide step-by-step instructions for property tax protests in this county.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meta_title: "Sample County Property Tax Information",
    meta_description: "Learn about property tax protests in Sample County, Texas",
    meta_keywords: "sample county, property tax, protest, texas",
    county_code: "SAM"
  };

  // Sample page data for the template preview
  const samplePage = {
    id: "sample-page-id",
    title: "Property Tax Basics for Sample County",
    content: "This is sample content for the county page. It would typically contain detailed information about property tax processes, deadlines, and procedures specific to this county.",
    meta_description: "Learn about property tax basics in Sample County, Texas"
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">County Template Preview</h1>
          <p className="text-muted-foreground">
            This is a preview of how county pages will look when published
          </p>
        </div>
        
        <CountyBasicsTemplate county={sampleCounty} />
      </div>
    </div>
  );
};

export default CountyTemplate;