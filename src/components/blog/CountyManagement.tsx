
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CountyForm } from "./CountyForm";
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  MapPin,
  Calendar,
  Globe
} from "lucide-react";

interface County {
  id: string;
  name: string;
  slug: string;
  state: string;
  status: string;
  featured: boolean;
  current_tax_year?: number;
  protest_deadline?: string;
  appraisal_district_name?: string;
  appraisal_district_website?: string;
  created_at: string;
  updated_at: string;
}

export function CountyManagement() {
  const [counties, setCounties] = useState<County[]>([]);
  const [filteredCounties, setFilteredCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCounties();
  }, []);

  useEffect(() => {
    const filtered = counties.filter(county =>
      county.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      county.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCounties(filtered);
  }, [counties, searchTerm]);

  const fetchCounties = async () => {
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('*')
        .order('name');

      if (error) throw error;

      setCounties(data || []);
    } catch (error) {
      console.error('Error fetching counties:', error);
      toast({
        title: "Error",
        description: "Failed to load counties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCounty = () => {
    setSelectedCounty(null);
    setShowForm(true);
  };

  const handleEditCounty = (county: County) => {
    setSelectedCounty(county);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedCounty(null);
    fetchCounties();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedCounty(null);
  };

  const handleToggleStatus = async (county: County) => {
    const newStatus = county.status === 'published' ? 'draft' : 'published';
    
    try {
      const { error } = await supabase
        .from('counties')
        .update({ status: newStatus })
        .eq('id', county.id);

      if (error) throw error;

      setCounties(counties.map(c => c.id === county.id ? { ...c, status: newStatus } : c));
      toast({
        title: "Success",
        description: `County ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      console.error('Error updating county status:', error);
      toast({
        title: "Error",
        description: "Failed to update county status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (showForm) {
    return (
      <CountyForm
        county={selectedCounty}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">County Management</h2>
          <p className="text-muted-foreground">
            Manage county information and property tax protest content
          </p>
        </div>
        <Button onClick={handleCreateCounty}>
          <Plus className="w-4 h-4 mr-2" />
          Add County
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search counties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCounties.map((county) => (
          <Card key={county.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{county.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {county.state}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge variant={county.status === 'published' ? 'default' : 'secondary'}>
                    {county.status}
                  </Badge>
                  {county.featured && (
                    <Badge variant="outline">Featured</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                {county.current_tax_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Tax Year: {county.current_tax_year}</span>
                  </div>
                )}
                
                {county.protest_deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Deadline: {formatDate(county.protest_deadline)}</span>
                  </div>
                )}

                {county.appraisal_district_website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    <a 
                      href={county.appraisal_district_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Appraisal District
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCounty(county)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <a href={`/county/${county.slug}`} target="_blank">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </a>
                  </Button>
                </div>
                
                <Button
                  variant={county.status === 'published' ? 'secondary' : 'default'}
                  size="sm"
                  onClick={() => handleToggleStatus(county)}
                  className="w-full"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {county.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                <div>Created: {formatDate(county.created_at)}</div>
                <div>Updated: {formatDate(county.updated_at)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCounties.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No counties found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? "No counties match your search criteria."
                : "Get started by creating your first county."
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateCounty}>
                <Plus className="w-4 h-4 mr-2" />
                Add County
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
