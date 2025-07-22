import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CountyForm } from "./CountyForm";
import { Search, Plus, Edit, Trash2, Eye, Globe, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface County {
  id: string;
  name: string;
  slug: string;
  state: string;
  county_code?: string;
  current_tax_year?: number;
  protest_deadline?: string;
  hearing_period_start?: string;
  hearing_period_end?: string;
  appraisal_district_name?: string;
  appraisal_district_phone?: string;
  appraisal_district_website?: string;
  appraisal_district_address?: string;
  appraisal_district_city?: string;
  appraisal_district_zip?: string;
  how_to_content?: string;
  county_info_content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export function CountyManagement() {
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCounty, setEditingCounty] = useState<County | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCounties();
  }, []);

  const fetchCounties = async () => {
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCounties(data || []);
    } catch (error) {
      console.error('Error fetching counties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch counties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCounty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this county? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('counties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCounties(counties.filter(county => county.id !== id));
      toast({
        title: "Success",
        description: "County deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting county:', error);
      toast({
        title: "Error",
        description: "Failed to delete county",
        variant: "destructive",
      });
    }
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

  const handleBulkStatusUpdate = async (status: string) => {
    if (!confirm(`Are you sure you want to ${status} all filtered counties?`)) return;

    try {
      const countyIds = filteredCounties.map(c => c.id);
      const { error } = await supabase
        .from('counties')
        .update({ status })
        .in('id', countyIds);

      if (error) throw error;

      setCounties(counties.map(c => 
        countyIds.includes(c.id) ? { ...c, status } : c
      ));
      
      toast({
        title: "Success",
        description: `${filteredCounties.length} counties updated to ${status}`,
      });
    } catch (error) {
      console.error('Error bulk updating counties:', error);
      toast({
        title: "Error",
        description: "Failed to bulk update counties",
        variant: "destructive",
      });
    }
  };

  const filteredCounties = counties.filter(county => {
    const matchesSearch = county.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         county.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || county.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: counties.length,
    published: counties.filter(c => c.status === 'published').length,
    drafts: counties.filter(c => c.status === 'draft').length,
    featured: counties.filter(c => c.featured).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">County Pages Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage county-specific tax protest information and page content.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/county-template" target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-2" />
              Preview Template
            </a>
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New County
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <CountyForm
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  fetchCounties();
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Counties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Counties</CardTitle>
          <CardDescription>
            Manage county information and page content. Each county has one editable page accessible through "Edit County Settings".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search counties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkStatusUpdate('published')}
                disabled={filteredCounties.length === 0}
              >
                Bulk Publish
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkStatusUpdate('draft')}
                disabled={filteredCounties.length === 0}
              >
                Bulk Draft
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading counties...</div>
          ) : filteredCounties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No counties found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCounties.map((county) => (
                <Card key={county.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{county.name}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {county.state}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={county.status === 'published' ? 'default' : 'secondary'}>
                          {county.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(county)}
                          className="h-6 px-2 text-xs"
                        >
                          {county.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Globe className="w-3 h-3" />
                        <span>/county/{county.slug}</span>
                      </div>
                      {county.current_tax_year && (
                        <p><span className="font-medium">Tax Year:</span> {county.current_tax_year}</p>
                      )}
                      {county.protest_deadline && (
                        <p><span className="font-medium">Deadline:</span> {new Date(county.protest_deadline).toLocaleDateString()}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Updated: {new Date(county.updated_at).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setEditingCounty(county)}
                            className="w-full"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit County Settings
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                          <CountyForm
                            county={editingCounty}
                            onSuccess={() => {
                              setEditingCounty(null);
                              fetchCounties();
                            }}
                            onCancel={() => setEditingCounty(null)}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/county/${county.slug}`, '_blank')}
                          className="flex-1"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Page
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCounty(county.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}