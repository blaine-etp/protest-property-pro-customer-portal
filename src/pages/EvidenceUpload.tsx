import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { EvidenceUploadModal } from '@/components/evidence/EvidenceUploadModal';
import { EvidenceSection } from '@/components/evidence/EvidenceSection';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  situs_address: string;
  county: string;
}

const EvidenceUpload = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [searchParams] = useSearchParams();
  const taxYear = searchParams.get('year') || new Date().getFullYear().toString();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('id, situs_address, county')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error: any) {
      console.error('Error fetching property:', error);
      toast({
        title: "Error",
        description: "Failed to load property information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    toast({
      title: "Success",
      description: "Evidence uploaded successfully",
    });
    // Refresh the evidence section by re-rendering
    setUploadModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-48 mb-2"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Property Not Found</h2>
              <p className="text-muted-foreground">
                The property you're looking for could not be found.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Upload Evidence</h1>
              <p className="text-muted-foreground">
                {property.situs_address} • Tax Year {taxYear}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence Upload Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  Upload photos that show issues with your property that may reduce its value. 
                  This evidence will be used to support your property tax appeal.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Take clear, well-lit photos that clearly show the issue</li>
                  <li>Include multiple angles when possible</li>
                  <li>Add descriptions to help explain what the photo shows</li>
                  <li>Organize photos by category (damage, maintenance issues, etc.)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Upload Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Upload New Evidence</h3>
                <p className="text-muted-foreground">
                  Click below to start uploading photos for this property
                </p>
                <Button 
                  onClick={() => setUploadModalOpen(true)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  Upload Photos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Current Evidence</h3>
            <EvidenceSection 
              propertyId={propertyId!} 
              taxYear={parseInt(taxYear)} 
            />
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <EvidenceUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        propertyId={propertyId!}
        taxYear={parseInt(taxYear)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default EvidenceUpload;