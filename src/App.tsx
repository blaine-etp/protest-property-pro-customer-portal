import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import EvidenceUpload from "./pages/EvidenceUpload";
import AuthCallback from "./pages/AuthCallback";
import Start from './components/Start';

const queryClient = new QueryClient();

const AppWithSessionHandler = () => {
  const [isSettingSession, setIsSettingSession] = useState(false);

  useEffect(() => {
    console.log('🚀 App.tsx: useEffect running');
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    console.log('🚀 App.tsx: accessToken:', !!accessToken);
    console.log('🚀 App.tsx: refreshToken:', !!refreshToken);
    
    if (accessToken && refreshToken) {
      console.log('🚀 App.tsx: FOUND TOKENS - Setting session...');
      setIsSettingSession(true);
      
      supabase.auth.setSession({ 
        access_token: accessToken, 
        refresh_token: refreshToken 
      }).then((result) => {
        console.log('🚀 App.tsx: setSession result:', result);
        console.log('✅ Session set successfully');
        setTimeout(() => {
          window.history.replaceState(null, '', window.location.pathname);
          setIsSettingSession(false);
        }, 1000);
      }).catch((error) => {
        console.error('❌ Failed to set session:', error);
        setIsSettingSession(false);
      });
    } else {
      console.log('🚀 App.tsx: NO TOKENS FOUND');
    }
  }, []);

  // Show loading while setting session
  if (isSettingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Navigate to={`/customer-portal${window.location.search}`} replace />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppWithSessionHandler />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
