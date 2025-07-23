
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminSiteContent } from "@/pages/AdminSiteContent";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div>Admin Dashboard</div>} />
            <Route path="customers" element={<div>Customer Management</div>} />
            <Route path="site-content" element={<AdminSiteContent />} />
            <Route path="blog" element={<div>Blog Management</div>} />
            <Route path="evidence" element={<div>Property Tax Tools</div>} />
            <Route path="bulk-upload" element={<div>Concierge Onboarding</div>} />
            <Route path="analytics" element={<div>Analytics</div>} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
