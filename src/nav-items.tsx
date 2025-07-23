import Index from "@/pages/Index";
import Account from "@/pages/Account";
import AddProperty from "@/pages/AddProperty";
import Admin from "@/pages/Admin";
import AdminAnalytics from "@/pages/AdminAnalytics";
import AdminBlog from "@/pages/AdminBlog";
import AdminBulkUpload from "@/pages/AdminBulkUpload";
import AdminCRM from "@/pages/AdminCRM";
import AdminContactDetail from "@/pages/AdminContactDetail";
import AdminCustomers from "@/pages/AdminCustomers";
import AdminEvidence from "@/pages/AdminEvidence";
import AdminProtestDetail from "@/pages/AdminProtestDetail";
import AdminSettings from "@/pages/AdminSettings";
import Auth from "@/pages/Auth";
import Billing from "@/pages/Billing";
import { BlogPost } from "@/pages/BlogPost";
import { CountyPage } from "@/pages/CountyPage";
import CountyTemplate from "@/pages/CountyTemplate";
import CustomerPortal from "@/pages/CustomerPortal";
import Documents from "@/pages/Documents";
import EmailVerification from "@/pages/EmailVerification";
import MultiPropertyContact from "@/pages/MultiPropertyContact";
import NotFound from "@/pages/NotFound";
import PropertyDetail from "@/pages/PropertyDetail";
import ProtestDetail from "@/pages/ProtestDetail";
import ReferFriend from "@/pages/ReferFriend";
import Resources from "@/pages/Resources";
import SetPassword from "@/pages/SetPassword";
import SetupAccount from "@/pages/SetupAccount";

export const navItems = [
  { to: "/", page: <Index /> },
  { to: "/account", page: <Account /> },
  { to: "/add-property", page: <AddProperty /> },
  { to: "/auth", page: <Auth /> },
  { to: "/billing", page: <Billing /> },
  { to: "/blog/:slug", page: <BlogPost /> },
  { to: "/county/:slug", page: <CountyPage /> },
  { to: "/county-template", page: <CountyTemplate /> },
  { to: "/customer-portal", page: <CustomerPortal /> },
  { to: "/documents", page: <Documents /> },
  { to: "/email-verification", page: <EmailVerification /> },
  { to: "/multi-property-contact", page: <MultiPropertyContact /> },
  { to: "/property/:id", page: <PropertyDetail /> },
  { to: "/protest/:id", page: <ProtestDetail /> },
  { to: "/refer-friend", page: <ReferFriend /> },
  { to: "/resources", page: <Resources /> },
  { to: "/set-password", page: <SetPassword /> },
  { to: "/setup-account", page: <SetupAccount /> },
  { to: "*", page: <NotFound /> },
];