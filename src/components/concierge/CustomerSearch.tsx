
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, User, Phone, Mail, Home } from 'lucide-react';

const searchSchema = z.object({
  searchTerm: z.string().min(1, 'Please enter an email or phone number'),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface Customer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  property_count: number;
}

interface CustomerSearchProps {
  onCustomerSelected: (customer: Customer) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({ 
  onCustomerSelected, 
  onCreateNew, 
  onBack 
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchTerm: '',
    },
  });

  const onSearch = async (values: SearchFormData) => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchTerm = values.searchTerm.trim();
      
      // Search for customers by email or phone
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          email,
          phone
        `)
        .or(`email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);

      if (profilesError) {
        throw new Error(`Search error: ${profilesError.message}`);
      }

      if (!profiles || profiles.length === 0) {
        setSearchResults([]);
        return;
      }

      // Get property counts for each customer
      const customersWithCounts = await Promise.all(
        profiles.map(async (profile) => {
          const { count, error: countError } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);

          if (countError) {
            console.error('Error counting properties:', countError);
          }

          return {
            ...profile,
            property_count: count || 0,
          };
        })
      );

      setSearchResults(customersWithCounts);

    } catch (error: any) {
      console.error('Customer search error:', error);
      toast({
        title: "Search Failed",
        description: error.message || "An error occurred while searching for customers.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Find Existing Customer</h2>
          <p className="text-slate-600 mt-1">
            Search by email address or phone number to add a new property.
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Selection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Customer Search
          </CardTitle>
          <CardDescription>
            Enter the customer's email address or phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSearch)} className="space-y-4">
              <FormField
                control={form.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="customer@email.com or (555) 123-4567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSearching} className="w-full">
                {isSearching ? 'Searching...' : 'Search Customer'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          {searchResults.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-slate-900">
                Search Results ({searchResults.length})
              </h3>
              <div className="space-y-3">
                {searchResults.map((customer) => (
                  <Card key={customer.user_id} className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {customer.first_name} {customer.last_name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {customer.email}
                              </span>
                              {customer.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {customer.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Home className="h-4 w-4" />
                                {customer.property_count} properties
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => onCustomerSelected(customer)}
                          variant="outline"
                        >
                          Select Customer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Customer Found</h3>
                <p className="text-slate-600 mb-4">
                  We couldn't find a customer with that email or phone number.
                </p>
                <Button onClick={onCreateNew} variant="outline">
                  Create New Customer Instead
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
