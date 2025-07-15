import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  Building,
  Gavel,
  FileCheck,
  FileX,
  Clock,
  Settings,
} from "lucide-react";

export function DocumentsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("documents");

  const documents = [
    {
      id: "1",
      name: "Form 50-162 - Property Tax Protest",
      type: "form-50-162",
      property: "123 Main Street, Austin, TX",
      owner: "John Smith",
      protest: "PRT-001",
      status: "Generated",
      createdDate: "2024-01-15",
      size: "2.3 MB",
      downloadCount: 3,
    },
    {
      id: "2",
      name: "Evidence Package - Market Analysis",
      type: "evidence-package",
      property: "456 Oak Avenue, Austin, TX",
      owner: "Sarah Johnson",
      protest: "PRT-002",
      status: "Draft",
      createdDate: "2024-01-14",
      size: "5.7 MB",
      downloadCount: 1,
    },
    {
      id: "3",
      name: "Hearing Notice - County Appeal",
      type: "hearing-notice",
      property: "789 Pine Street, Austin, TX",
      owner: "Michael Brown",
      protest: "PRT-003",
      status: "Delivered",
      createdDate: "2024-01-12",
      size: "1.2 MB",
      downloadCount: 5,
    },
    {
      id: "4",
      name: "Settlement Agreement",
      type: "settlement",
      property: "321 Elm Drive, Austin, TX",
      owner: "Emily Davis",
      protest: "PRT-004",
      status: "Signed",
      createdDate: "2024-01-10",
      size: "800 KB",
      downloadCount: 2,
    },
  ];

  const templates = [
    {
      id: "1",
      name: "Form 50-162 Template",
      description: "Standard property tax protest form",
      category: "Legal Forms",
      lastUpdated: "2024-01-01",
      usage: 45,
    },
    {
      id: "2",
      name: "Evidence Package Template",
      description: "Market analysis and comparable properties",
      category: "Evidence",
      lastUpdated: "2023-12-15",
      usage: 32,
    },
    {
      id: "3",
      name: "Hearing Notice Template",
      description: "County appeal board hearing notification",
      category: "Notifications",
      lastUpdated: "2023-12-10",
      usage: 28,
    },
    {
      id: "4",
      name: "Settlement Agreement Template",
      description: "Standard settlement terms and conditions",
      category: "Legal Forms",
      lastUpdated: "2023-11-20",
      usage: 15,
    },
  ];

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Generated": return "green";
      case "Draft": return "yellow";
      case "Delivered": return "blue";
      case "Signed": return "purple";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Generated": return <FileCheck className="h-4 w-4" />;
      case "Draft": return <Clock className="h-4 w-4" />;
      case "Delivered": return <FileText className="h-4 w-4" />;
      case "Signed": return <FileCheck className="h-4 w-4" />;
      default: return <FileX className="h-4 w-4" />;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "form-50-162": return <FileText className="h-4 w-4" />;
      case "evidence-package": return <Building className="h-4 w-4" />;
      case "hearing-notice": return <Gavel className="h-4 w-4" />;
      case "settlement": return <FileCheck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Management</h2>
          <p className="text-slate-600">Generate, manage, and track legal documents</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Document
        </Button>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Documents</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Generated Today</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <FileCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Templates Available</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Downloads This Month</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <Download className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Document Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="generator">Document Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search documents by name, owner, or property..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getDocumentTypeIcon(document.type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{document.name}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                          Protest: {document.protest}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Regenerate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusColor(document.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(document.status)}
                      {document.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600">Property</p>
                      <p className="font-medium">{document.property}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Owner</p>
                      <p className="font-medium">{document.owner}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {document.createdDate}
                    </div>
                    <div>{document.size}</div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded text-sm">
                    <span className="text-slate-600">Downloaded {document.downloadCount} times</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Documents Table</CardTitle>
              <CardDescription>Detailed table view of all documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDocumentTypeIcon(document.type)}
                          <div>
                            <p className="font-medium">{document.name}</p>
                            <p className="text-sm text-slate-500">{document.protest}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{document.property}</TableCell>
                      <TableCell>{document.owner}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(document.status) as any}>
                          {document.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{document.createdDate}</TableCell>
                      <TableCell>{document.size}</TableCell>
                      <TableCell>{document.downloadCount}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
              <CardDescription>Manage and configure document templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Last Updated:</span>
                          <span>{template.lastUpdated}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Usage Count:</span>
                          <span>{template.usage} documents</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle>Document Generator</CardTitle>
              <CardDescription>Create new documents from templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Document generation interface would be rendered here</p>
                  <p className="text-sm">Step-by-step form to create documents from templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}