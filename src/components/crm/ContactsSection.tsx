import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FilterPanel } from "@/components/crm/filters/FilterPanel";
import { MultiSelectFilter } from "@/components/crm/filters/MultiSelectFilter";
import { DateRangeFilter } from "@/components/crm/filters/DateRangeFilter";
import { NumericRangeFilter } from "@/components/crm/filters/NumericRangeFilter";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  Phone,
  Mail,
  Building,
  Calendar,
  MessageSquare,
  UserCheck,
  Clock,
  X,
} from "lucide-react";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  properties: number;
  protests: number;
  lastContact: string;
  totalSavings: string;
  avatar: string;
}

export function ContactsSection() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [lastContactStart, setLastContactStart] = useState<Date | undefined>();
  const [lastContactEnd, setLastContactEnd] = useState<Date | undefined>();
  const [minProperties, setMinProperties] = useState<number | undefined>();
  const [maxProperties, setMaxProperties] = useState<number | undefined>();
  const [minSavings, setMinSavings] = useState<number | undefined>();
  const [maxSavings, setMaxSavings] = useState<number | undefined>();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      // Get contacts with property counts and protest counts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          status,
          created_at,
          properties:properties!fk_properties_contact_id(id, protests:protests(id))
        `);

      if (contactsError) throw contactsError;

      // Transform the data to match our interface
      const transformedContacts: Contact[] = (contactsData || []).map(contact => {
        const propertyCount = contact.properties?.length || 0;
        const protestCount = contact.properties?.reduce((total: number, prop: any) => 
          total + (prop.protests?.length || 0), 0) || 0;
        
        return {
          id: contact.id,
          firstName: contact.first_name,
          lastName: contact.last_name,
          email: contact.email,
          phone: contact.phone || undefined,
          status: contact.status || 'active',
          properties: propertyCount,
          protests: protestCount,
          lastContact: new Date(contact.created_at).toLocaleDateString(),
          totalSavings: "$0", // TODO: Calculate from protests/bills
          avatar: (contact.first_name.charAt(0) + contact.last_name.charAt(0)).toUpperCase()
        };
      });

      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    // Text search
    const matchesSearch = `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(contact.status);
    
    // Property count filter
    const matchesProperties = (minProperties === undefined || contact.properties >= minProperties) &&
      (maxProperties === undefined || contact.properties <= maxProperties);
    
    // Savings amount filter (convert $X,XXX to number)
    const savingsValue = parseFloat(contact.totalSavings.replace(/[$,]/g, ''));
    const matchesSavings = (minSavings === undefined || savingsValue >= minSavings) &&
      (maxSavings === undefined || savingsValue <= maxSavings);
    
    // Date filter (basic check for now)
    const matchesDate = true; // Would need proper date parsing for real implementation
    
    return matchesSearch && matchesStatus && matchesProperties && matchesSavings && matchesDate;
  });

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(contacts.map(c => c.status)));

  // Count active filters
  const activeFiltersCount = 
    selectedStatuses.length +
    (lastContactStart || lastContactEnd ? 1 : 0) +
    (minProperties !== undefined || maxProperties !== undefined ? 1 : 0) +
    (minSavings !== undefined || maxSavings !== undefined ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setLastContactStart(undefined);
    setLastContactEnd(undefined);
    setMinProperties(undefined);
    setMaxProperties(undefined);
    setMinSavings(undefined);
    setMaxSavings(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "green";
      case "Lead": return "blue";
      case "Inactive": return "gray";
      default: return "gray";
    }
  };

  const handleContactClick = (contactId: string) => {
    navigate(`/admin/customers/${contactId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contacts Management</h2>
          <p className="text-slate-600">Manage customer contacts and relationships</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search contacts by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <FilterPanel
        title="Advanced Filters"
        activeFiltersCount={activeFiltersCount}
        onClearAll={clearAllFilters}
      >
        <MultiSelectFilter
          label="Status"
          options={uniqueStatuses}
          selectedValues={selectedStatuses}
          onSelectionChange={setSelectedStatuses}
          placeholder="All statuses"
        />
        
        <DateRangeFilter
          label="Last Contact Date"
          startDate={lastContactStart}
          endDate={lastContactEnd}
          onDateChange={setLastContactStart}
          placeholder="Any date"
        />
        
        <NumericRangeFilter
          label="Properties Count"
          min={minProperties}
          max={maxProperties}
          onRangeChange={(min, max) => {
            setMinProperties(min);
            setMaxProperties(max);
          }}
          placeholder="Any count"
        />
        
        <NumericRangeFilter
          label="Total Savings"
          min={minSavings}
          max={maxSavings}
          onRangeChange={(min, max) => {
            setMinSavings(min);
            setMaxSavings(max);
          }}
          placeholder="Any amount"
          formatValue={(value) => `$${value.toLocaleString()}`}
        />
      </FilterPanel>

      {/* Contacts Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <Card 
            key={contact.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleContactClick(contact.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{contact.avatar}</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">{contact.firstName} {contact.lastName}</CardTitle>
                    <p className="text-sm text-slate-500">{contact.email}</p>
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusColor(contact.status) as any}>
                  {contact.status}
                </Badge>
                <span className="text-sm font-semibold text-green-600">{contact.totalSavings}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span>{contact.properties} Properties</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  <span>{contact.protests} Protests</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>Last contact: {contact.lastContact}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contacts Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts Table View</CardTitle>
          <CardDescription>Detailed table view of all contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Total Savings</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow 
                  key={contact.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleContactClick(contact.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xs">{contact.avatar}</span>
                      </div>
                      <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(contact.status) as any}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{contact.properties}</TableCell>
                  <TableCell className="font-semibold text-green-600">{contact.totalSavings}</TableCell>
                  <TableCell>{contact.lastContact}</TableCell>
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Contact
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

      {/* Contact Relationship Map */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Relationships</CardTitle>
          <CardDescription>Visual representation of contact connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
            <div className="text-center text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Interactive relationship map would be rendered here</p>
              <p className="text-sm">Showing connections between contacts, properties, and protests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}