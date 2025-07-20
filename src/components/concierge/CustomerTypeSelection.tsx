
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';

interface CustomerTypeSelectionProps {
  onSelectType: (type: 'new' | 'existing') => void;
}

export const CustomerTypeSelection: React.FC<CustomerTypeSelectionProps> = ({ onSelectType }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer Type</h2>
        <p className="text-slate-600">
          Choose whether this is a new customer or you're adding a property to an existing account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-blue-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">New Customer</CardTitle>
            <CardDescription className="text-base">
              First-time customer signing up for property tax services
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-slate-600 mb-6 space-y-2">
              <li>• Complete customer onboarding</li>
              <li>• Collect all contact information</li>
              <li>• Generate and send documents</li>
              <li>• Send password setup email</li>
            </ul>
            <Button 
              onClick={() => onSelectType('new')} 
              className="w-full"
              size="lg"
            >
              Create New Customer
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-green-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Existing Customer</CardTitle>
            <CardDescription className="text-base">
              Adding a new property to an existing customer account
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-slate-600 mb-6 space-y-2">
              <li>• Search for existing customer</li>
              <li>• Add new property details</li>
              <li>• Generate property documents</li>
              <li>• Update existing account</li>
            </ul>
            <Button 
              onClick={() => onSelectType('existing')} 
              className="w-full"
              size="lg"
              variant="outline"
            >
              Add to Existing Customer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
