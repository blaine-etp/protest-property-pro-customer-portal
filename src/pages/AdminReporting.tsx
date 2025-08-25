
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, Filter, Archive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface DatasetConfig {
  id: string;
  name: string;
  description: string;
  table: string;
  fields: string[];
  filters?: { field: string; label: string; type: 'text' | 'date' | 'select'; options?: string[] }[];
}

const datasets: DatasetConfig[] = [
  {
    id: 'contacts',
    name: 'Contacts',
    description: 'Contact information and customer data',
    table: 'contacts',
    fields: ['id', 'first_name', 'last_name', 'email', 'phone', 'company', 'status', 'source', 'created_at'],
    filters: [
      { field: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'lead', 'prospect'] },
      { field: 'source', label: 'Source', type: 'text' },
    ]
  },
  {
    id: 'properties',
    name: 'Properties',
    description: 'Property records and assessments',
    table: 'properties',
    fields: ['id', 'situs_address', 'parcel_number', 'county', 'assessed_value', 'created_at'],
    filters: [
      { field: 'county', label: 'County', type: 'text' },
      { field: 'created_at', label: 'Created After', type: 'date' },
    ]
  },
  {
    id: 'protests',
    name: 'Protests',
    description: 'Protest filings and status tracking',
    table: 'protests',
    fields: ['id', 'situs_address', 'owner_name', 'county', 'appeal_status', 'assessed_value', 'protest_amount', 'tax_year'],
    filters: [
      { field: 'appeal_status', label: 'Status', type: 'select', options: ['pending', 'filed', 'settled', 'rejected'] },
      { field: 'tax_year', label: 'Tax Year', type: 'text' },
    ]
  },
  {
    id: 'bills',
    name: 'Bills',
    description: 'Billing and invoice information',
    table: 'bills',
    fields: ['id', 'bill_number', 'tax_year', 'status', 'total_assessed_value', 'due_date', 'created_at'],
    filters: [
      { field: 'status', label: 'Status', type: 'select', options: ['draft', 'pending', 'paid'] },
      { field: 'tax_year', label: 'Tax Year', type: 'text' },
    ]
  },
  {
    id: 'documents',
    name: 'Documents (50-162)',
    description: 'Form 50-162 documents by county',
    table: 'document_reports',
    fields: ['id', 'county', 'situs_address', 'generation_date', 'status', 'file_path'],
    filters: [
      { field: 'county', label: 'County', type: 'select', options: [] }, // Will be populated dynamically
      { field: 'generated_at', label: 'Generated After', type: 'date' },
      { field: 'status', label: 'Status', type: 'select', options: ['generated'] },
    ]
  }
];

export default function AdminReporting() {
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [countyOptions, setCountyOptions] = useState<string[]>([]);
  const { toast } = useToast();

  const currentDataset = datasets.find(d => d.id === selectedDataset);

  // Reset state when dataset changes
  useEffect(() => {
    if (selectedDataset) {
      setFilters({});
      setPreviewData([]);
      setTotalRecords(0);
      
      // Load county options for documents dataset
      if (selectedDataset === 'documents') {
        loadCountyOptions();
      }
    }
  }, [selectedDataset]);

  const loadCountyOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('document_reports')
        .select('county')
        .not('county', 'is', null)
        .order('county');
      
      if (error) throw error;
      
      const uniqueCounties = Array.from(new Set(data?.map(row => row.county) || []));
      setCountyOptions(uniqueCounties);
      
      // Update the dataset config with the loaded options
      const docDataset = datasets.find(d => d.id === 'documents');
      if (docDataset) {
        const countyFilter = docDataset.filters?.find(f => f.field === 'county');
        if (countyFilter) {
          countyFilter.options = uniqueCounties;
        }
      }
    } catch (error) {
      console.error('Error loading county options:', error);
    }
  };

  const fetchPreview = async () => {
    if (!currentDataset) return;

    setLoading(true);
    try {
      let query = supabase.from(currentDataset.table as any).select(currentDataset.fields.join(','));
      let countQuery = supabase.from(currentDataset.table as any).select('*', { count: 'exact', head: true });
      
      // Apply type-aware filters
      Object.entries(filters).forEach(([field, value]) => {
        if (value && value !== '__all__') {
          const filterConfig = currentDataset.filters?.find(f => f.field === field);
          
          if (filterConfig?.type === 'select') {
            query = query.eq(field, value);
            countQuery = countQuery.eq(field, value);
          } else if (filterConfig?.type === 'date') {
            query = query.gte(field, value);
            countQuery = countQuery.gte(field, value);
          } else if (field === 'tax_year') {
            const yearValue = parseInt(value);
            if (!isNaN(yearValue)) {
              query = query.eq(field, yearValue);
              countQuery = countQuery.eq(field, yearValue);
            }
          } else {
            query = query.ilike(field, `%${value}%`);
            countQuery = countQuery.ilike(field, `%${value}%`);
          }
        }
      });

      // Get count first
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalRecords(count || 0);

      // Get preview data (first 100 records)
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      setPreviewData(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No Results",
          description: "No records found matching the current filters.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch preview data: ${error.message}`,
        variant: "destructive",
      });
      setPreviewData([]);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  const exportToExcel = async () => {
    if (!currentDataset) return;

    setLoading(true);
    try {
      // Fetch all data for export with same filters as preview
      let query = supabase.from(currentDataset.table as any).select(currentDataset.fields.join(','));
      
      // Apply same type-aware filters as fetchPreview
      Object.entries(filters).forEach(([field, value]) => {
        if (value && value !== '__all__') {
          const filterConfig = currentDataset.filters?.find(f => f.field === field);
          
          if (filterConfig?.type === 'select') {
            query = query.eq(field, value);
          } else if (filterConfig?.type === 'date') {
            query = query.gte(field, value);
          } else if (field === 'tax_year') {
            const yearValue = parseInt(value);
            if (!isNaN(yearValue)) {
              query = query.eq(field, yearValue);
            }
          } else {
            query = query.ilike(field, `%${value}%`);
          }
        }
      });

      const { data, error } = await query;
      
      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No Data to Export",
          description: "No records found matching the current filters.",
          variant: "destructive",
        });
        return;
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, currentDataset.name);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${currentDataset.name}_Export_${timestamp}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      toast({
        title: "Export Complete",
        description: `${data.length} records exported to ${filename}`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: `Export failed: ${error.message}`,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const downloadDocumentsZip = async () => {
    if (!currentDataset || currentDataset.id !== 'documents') return;

    setZipLoading(true);
    try {
      // Call the zip-documents edge function with current filters
      const { data, error } = await supabase.functions.invoke('zip-documents', {
        body: { filters }
      });

      if (error) throw error;

      if (data?.downloadUrl) {
        // Trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `documents_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "ZIP Download Started",
          description: `Downloading ${data.fileCount} documents as ZIP file.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "ZIP Export Failed",
        description: `Failed to create ZIP: ${error.message}`,
        variant: "destructive",
      });
    }
    setZipLoading(false);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setPreviewData([]);
    setTotalRecords(0);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reporting</h1>
        <p className="text-slate-600 mt-2">
          Export data from your database tables to Excel files.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Select a dataset, apply filters, preview data, and export to Excel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dataset Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700">Select Dataset</label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose a dataset to export" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map(dataset => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    <div>
                      <div className="font-medium">{dataset.name}</div>
                      <div className="text-xs text-slate-500">{dataset.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          {currentDataset?.filters && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </label>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentDataset.filters.map(filter => (
                  <div key={filter.field}>
                    <label className="text-xs text-slate-600 uppercase tracking-wide">
                      {filter.label}
                    </label>
                    {filter.type === 'select' ? (
                      <Select 
                        value={filters[filter.field] || ""} 
                        onValueChange={(value) => handleFilterChange(filter.field, value)}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder={`Filter by ${filter.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All</SelectItem>
                          {(filter.field === 'county' && selectedDataset === 'documents' ? countyOptions : filter.options || []).map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <input
                        type={filter.type}
                        placeholder={`Filter by ${filter.label}`}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                        value={filters[filter.field] || ""}
                        onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {currentDataset && (
            <div className="flex gap-3">
              <Button onClick={fetchPreview} disabled={loading}>
                Preview Data
              </Button>
              <Button onClick={exportToExcel} disabled={loading || totalRecords === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
              {selectedDataset === 'documents' && (
                <Button 
                  onClick={downloadDocumentsZip} 
                  disabled={zipLoading || totalRecords === 0}
                  variant="outline"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {zipLoading ? 'Creating ZIP...' : 'Download ZIP'}
                </Button>
              )}
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-900">Data Preview</h3>
                <Badge variant="secondary">
                  Showing {previewData.length} of {totalRecords} records
                </Badge>
              </div>
              <div className="border rounded-lg overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {currentDataset?.fields.map(field => (
                        <TableHead key={field} className="whitespace-nowrap">
                          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 10).map((row, index) => (
                      <TableRow key={index}>
                        {currentDataset?.fields.map(field => (
                          <TableCell key={field} className="max-w-xs truncate">
                            {typeof row[field] === 'object' ? JSON.stringify(row[field]) : String(row[field] || '-')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {previewData.length > 10 && (
                <p className="text-sm text-slate-500 mt-2 text-center">
                  ... and {previewData.length - 10} more rows in preview
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </ErrorBoundary>
  );
}
