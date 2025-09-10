
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import EmailVerification from "./pages/EmailVerification";
import CustomerPortal from "./pages/CustomerPortal";
import PropertyDetail from "./pages/PropertyDetail";
import SetupAccount from "./pages/SetupAccount";
import Account from "./pages/Account";
import AddProperty from "./pages/AddProperty";
import Billing from "./pages/Billing";
import Documents from "./pages/Documents";
import ReferFriend from "./pages/ReferFriend";
import ProtestDetail from "./pages/ProtestDetail";
import SetPassword from "./pages/SetPassword";
import NotFound from "./pages/NotFound";


import EvidenceUpload from "./pages/EvidenceUpload";
import AuthCallback from "./pages/AuthCallback";
import Start from './components/Start';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/property/:propertyId" element={<PropertyDetail />} />
          <Route path="/setup-account" element={<SetupAccount />} />
          <Route path="/account" element={<Account />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/refer-friend" element={<ReferFriend />} />

          <Route path="/customer-portal" element={<CustomerPortal />} />
          
          <Route path="/property/:propertyId/evidence" element={<EvidenceUpload />} />
          <Route path="/protest/:protestId" element={<ProtestDetail />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/start" element={<Start />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
