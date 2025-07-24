
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
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
import MultiPropertyContact from "./pages/MultiPropertyContact";
import { AdminLayout } from "./components/AdminLayout";
import Admin from "./pages/Admin";
import AdminCustomers from "./pages/AdminCustomers";
import AdminBlog from "./pages/AdminBlog";
import AdminSiteContent from "./pages/AdminSiteContent";
import AdminEvidence from "./pages/AdminEvidence";
import AdminBulkUpload from "./pages/AdminBulkUpload";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminCRM from "./pages/AdminCRM";
import AdminContactDetail from "./pages/AdminContactDetail";
import AdminProtestDetail from "./pages/AdminProtestDetail";
import Resources from "./pages/Resources";
import { CountyPage } from "./pages/CountyPage";
import { BlogPost } from "./pages/BlogPost";
import CountyTemplate from "./pages/CountyTemplate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/customer-portal" element={<CustomerPortal />} />
          <Route path="/property/:propertyId" element={<PropertyDetail />} />
          <Route path="/setup-account" element={<SetupAccount />} />
          <Route path="/account" element={<Account />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/refer-friend" element={<ReferFriend />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/multi-property-contact" element={<MultiPropertyContact />} />
          <Route path="/protest/:protestId" element={<ProtestDetail />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="customers" element={<AdminCRM />} />
            <Route path="customers/:contactId" element={<AdminContactDetail />} />
            <Route path="protest/:protestId" element={<AdminProtestDetail />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="site-content" element={<AdminSiteContent />} />
            <Route path="evidence" element={<AdminEvidence />} />
            <Route path="bulk-upload" element={<AdminBulkUpload />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          {/* County Template Preview */}
          <Route path="/county-template" element={<CountyTemplate />} />
          {/* Blog Post Pages Route */}
          <Route path="/blog/:slug" element={<BlogPost />} />
          {/* County Pages Route */}
          <Route path="/county/:slug" element={<CountyPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
