
import { Database } from "@/integrations/supabase/types";

type County = Database['public']['Tables']['counties']['Row'];

interface CountyBasicsTemplateProps {
  county: County;
}

export const CountyBasicsTemplate = ({ county }: CountyBasicsTemplateProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary/5 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Property Tax Protest in {county.name}, {county.state}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Learn how to protest your property taxes in {county.name} and save money on your tax bill.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {county.county_info_content && (
            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: county.county_info_content }}
            />
          )}

          {/* Appraisal District Information */}
          {(county.appraisal_district_name || county.appraisal_district_address) && (
            <div className="bg-card rounded-lg p-6 border mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                {county.appraisal_district_name || `${county.name} Appraisal District`}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {county.appraisal_district_address && (
                  <div>
                    <h3 className="font-semibold mb-2">Address</h3>
                    <p className="text-muted-foreground">
                      {county.appraisal_district_address}
                      {county.appraisal_district_city && (
                        <>
                          <br />
                          {county.appraisal_district_city}
                          {county.appraisal_district_zip && `, ${county.appraisal_district_zip}`}
                        </>
                      )}
                    </p>
                  </div>
                )}
                
                <div>
                  {county.appraisal_district_phone && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Phone</h3>
                      <p className="text-muted-foreground">{county.appraisal_district_phone}</p>
                    </div>
                  )}
                  
                  {county.appraisal_district_website && (
                    <div>
                      <h3 className="font-semibold mb-2">Website</h3>
                      <a 
                        href={county.appraisal_district_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {county.appraisal_district_website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Important Dates */}
          {(county.protest_deadline || county.hearing_period_start || county.hearing_period_end) && (
            <div className="bg-card rounded-lg p-6 border mb-8">
              <h2 className="text-2xl font-semibold mb-4">Important Dates for {county.current_tax_year}</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {county.protest_deadline && (
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold text-primary mb-2">Protest Deadline</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(county.protest_deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {county.hearing_period_start && (
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold text-primary mb-2">Hearings Start</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(county.hearing_period_start).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {county.hearing_period_end && (
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold text-primary mb-2">Hearings End</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(county.hearing_period_end).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help with Your Property Tax Protest?</h2>
            <p className="mb-6">
              Let our experts handle your {county.name} property tax protest. We only get paid if we save you money.
            </p>
            <a 
              href="/signup"
              className="inline-block bg-background text-primary px-8 py-3 rounded-lg font-semibold hover:bg-background/90 transition-colors"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
