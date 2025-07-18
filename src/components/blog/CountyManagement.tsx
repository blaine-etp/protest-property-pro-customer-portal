import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CountyForm } from "./CountyForm";
import { CountyPageForm } from "./CountyPageForm";
import { Search, Plus, Edit, Trash2, Eye, Globe, MapPin, FileText, Info, Video, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
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
  contentType?: string;
}

interface CountyPage {
  id: string;
  county_id: string;
  page_type: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function CountyManagement() {
  const [counties, setCounties] = useState<County[]>([]);
  const [countyPages, setCountyPages] = useState<CountyPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCounty, setEditingCounty] = useState<County | null>(null);
  const [editingCountyPage, setEditingCountyPage] = useState<CountyPage | null>(null);
  const [selectedCountyForPage, setSelectedCountyForPage] = useState<County | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCounties();
    fetchCountyPages();
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

  const fetchCountyPages = async () => {
    try {
      const { data, error } = await supabase
        .from('county_pages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCountyPages(data || []);
    } catch (error) {
      console.error('Error fetching county pages:', error);
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

  const handleTogglePageStatus = async (page: CountyPage) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';

    try {
      const { error } = await supabase
        .from('county_pages')
        .update({ status: newStatus })
        .eq('id', page.id);

      if (error) throw error;

      setCountyPages(countyPages.map(p => p.id === page.id ? { ...p, status: newStatus } : p));
      toast({
        title: "Success",
        description: `Page ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      console.error('Error updating page status:', error);
      toast({
        title: "Error",
        description: "Failed to update page status",
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

  const getCountyPages = (countyId: string) => {
    return countyPages.filter(page => page.county_id === countyId);
  };

  const handleEditPage = (county: County, page?: CountyPage) => {
    setSelectedCountyForPage(county);
    setEditingCountyPage(page || null);
    setShowPageForm(true);
  };

  if (showPageForm && selectedCountyForPage) {
    return (
      <CountyPageForm
        county={selectedCountyForPage}
        countyPage={editingCountyPage}
        onSuccess={() => {
          setShowPageForm(false);
          setSelectedCountyForPage(null);
          setEditingCountyPage(null);
          fetchCountyPages();
        }}
        onCancel={() => {
          setShowPageForm(false);
          setSelectedCountyForPage(null);
          setEditingCountyPage(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">County Pages Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage county-specific tax protest information and SEO content.
          </p>
        </div>
        
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
            Manage county-specific pages for SEO and user information
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
                      <Badge variant={county.status === 'published' ? 'default' : 'secondary'}>
                        {county.status}
                      </Badge>
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
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">County Pages</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPage(county)}
                          className="text-xs h-7"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Page
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {getCountyPages(county.id).length === 0 ? (
                          <p className="text-xs text-muted-foreground">No pages created yet</p>
                        ) : (
                          getCountyPages(county.id).map((page) => (
                            <div key={page.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded text-xs">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Badge variant="outline" className="text-xs">
                                  {page.page_type}
                                </Badge>
                                <span className="truncate text-xs">{page.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">
                                    {page.status === 'published' ? 'Live' : 'Draft'}
                                  </span>
                                  <Switch
                                    checked={page.status === 'published'}
                                    onCheckedChange={() => handleTogglePageStatus(page)}
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPage(county, page)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/county/${page.slug}`, '_blank')}
                                  className="h-6 w-6 p-0"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCounty(county)}
                            className="text-xs w-full"
                          >
                            <Edit className="mr-1 h-3 w-3" />
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
                          onClick={() => handleToggleStatus(county)}
                          className="text-xs flex-1"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {county.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCounty(county.id)}
                          className="text-xs"
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