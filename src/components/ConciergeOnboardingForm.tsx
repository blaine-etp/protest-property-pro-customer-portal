
import React, { useState } from 'react';
import { CustomerTypeSelection } from './concierge/CustomerTypeSelection';
import { CustomerSearch } from './concierge/CustomerSearch';
import { NewCustomerForm } from './concierge/NewCustomerForm';
import { AddPropertyForm } from './concierge/AddPropertyForm';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

type CustomerType = 'new' | 'existing';

interface Customer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  property_count: number;
}

type WizardStep = 
  | 'selection'
  | 'new-customer'
  | 'customer-search'
  | 'add-property'
  | 'success';

export const ConciergeOnboardingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('selection');
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleCustomerTypeSelection = (type: CustomerType) => {
    setCustomerType(type);
    if (type === 'new') {
      setCurrentStep('new-customer');
    } else {
      setCurrentStep('customer-search');
    }
  };

  const handleCustomerSelected = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentStep('add-property');
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
    setCustomerType(null);
    setSelectedCustomer(null);
  };

  const handleBackToSearch = () => {
    setCurrentStep('customer-search');
    setSelectedCustomer(null);
  };

  const handleCreateNewFromSearch = () => {
    setCustomerType('new');
    setCurrentStep('new-customer');
  };

  const handleSuccess = () => {
    setCurrentStep('success');
  };

  const handleStartOver = () => {
    setCurrentStep('selection');
    setCustomerType(null);
    setSelectedCustomer(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'selection':
        return (
          <CustomerTypeSelection onSelectType={handleCustomerTypeSelection} />
        );

      case 'new-customer':
        return (
          <NewCustomerForm 
            onBack={handleBackToSelection}
            onSuccess={handleSuccess}
          />
        );

      case 'customer-search':
        return (
          <CustomerSearch
            onCustomerSelected={handleCustomerSelected}
            onCreateNew={handleCreateNewFromSearch}
            onBack={handleBackToSelection}
          />
        );

      case 'add-property':
        return selectedCustomer ? (
          <AddPropertyForm
            customer={selectedCustomer}
            onBack={handleBackToSearch}
            onSuccess={handleSuccess}
          />
        ) : null;

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Customer Successfully Processed
              </h2>
              <p className="text-slate-600 text-lg">
                {customerType === 'new' 
                  ? 'New customer has been onboarded and documents have been generated.'
                  : 'Property has been added to existing customer account and documents have been generated.'
                }
              </p>
            </div>
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Next Steps:</h3>
                <ul className="text-left text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    Documents have been automatically generated
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    Customer will receive an email with documents for signature
                  </li>
                  {customerType === 'new' && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      Customer will receive a password setup email to access their account
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    You can track the application status in the CRM system
                  </li>
                </ul>
              </CardContent>
            </Card>
            <button
              onClick={handleStartOver}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Process Another Customer
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderStep()}
    </div>
  );
};
