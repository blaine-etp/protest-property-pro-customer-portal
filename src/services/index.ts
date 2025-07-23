
// Complete Service Factory and Configuration
// Controls all backend integrations: data, auth, forms, and storage

import { DataService } from './dataService';
import { MockDataService } from './mockDataService';
import { AWSDataService } from './awsDataService';
import { mockAuthService } from './mockAuthService';
import { mockFormService } from './mockFormService';
import { mockStorageService } from './mockStorageService';

// Master configuration flags - set to true when real integrations are ready
const USE_AWS_DATA = false;
const USE_SUPABASE_AUTH = false;
const USE_SUPABASE_FORMS = false;
const USE_SUPABASE_STORAGE = false;
const USE_GOOGLE_PLACES = true; // Google Places API is now integrated

// AWS Configuration (to be set when ready)
const AWS_API_URL = 'https://your-aws-api-url.com/api';
const AWS_API_KEY = 'your-aws-api-key';

// Google Places API is configured via environment variable
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

// Data service factory
function createDataService(): DataService {
  if (USE_AWS_DATA) {
    console.log('🔗 Using AWS Data Service');
    return new AWSDataService(AWS_API_URL, AWS_API_KEY);
  } else {
    console.log('🎭 Using Mock Data Service');
    return new MockDataService();
  }
}

// Export the configured service instances
export const dataService = createDataService();

// Auth service factory
function createAuthService() {
  if (USE_SUPABASE_AUTH) {
    console.log('🔗 Using Supabase Auth Service');
    // Return supabase auth when ready
    throw new Error('Supabase auth not yet configured');
  } else {
    console.log('🎭 Using Mock Auth Service');
    return mockAuthService;
  }
}

// Form service factory
function createFormService() {
  if (USE_SUPABASE_FORMS) {
    console.log('🔗 Using Supabase Form Service');
    // Return supabase form service when ready
    throw new Error('Supabase forms not yet configured');
  } else {
    console.log('🎭 Using Mock Form Service');
    return mockFormService;
  }
}

// Storage service factory
function createStorageService() {
  if (USE_SUPABASE_STORAGE) {
    console.log('🔗 Using Supabase Storage Service');
    // Return supabase storage when ready
    throw new Error('Supabase storage not yet configured');
  } else {
    console.log('🎭 Using Mock Storage Service');
    return mockStorageService;
  }
}

export const authService = createAuthService();
export const formService = createFormService();
export const storageService = createStorageService();

// Export types and classes for advanced usage
export { DataService } from './dataService';
export { MockDataService } from './mockDataService';
export { AWSDataService } from './awsDataService';
export { mockAuthService } from './mockAuthService';
export { mockFormService } from './mockFormService';
export { mockStorageService } from './mockStorageService';
export * from './types';

// Configuration information
export const getServiceInfo = () => ({
  data: {
    isUsingAWS: USE_AWS_DATA,
    source: USE_AWS_DATA ? 'AWS Database' : 'Mock Data',
    apiUrl: USE_AWS_DATA ? AWS_API_URL : 'N/A'
  },
  auth: {
    isUsingSupabase: USE_SUPABASE_AUTH,
    source: USE_SUPABASE_AUTH ? 'Supabase Auth' : 'Mock Auth'
  },
  forms: {
    isUsingSupabase: USE_SUPABASE_FORMS,
    source: USE_SUPABASE_FORMS ? 'Supabase Forms' : 'Mock Forms'
  },
  storage: {
    isUsingSupabase: USE_SUPABASE_STORAGE,
    source: USE_SUPABASE_STORAGE ? 'Supabase Storage' : 'Mock Storage'
  },
  googlePlaces: {
    isEnabled: USE_GOOGLE_PLACES,
    source: USE_GOOGLE_PLACES ? 'Google Places API' : 'Disabled',
    configured: !!GOOGLE_PLACES_API_KEY
  }
});

// ============================================
// DEVELOPER MIGRATION GUIDE
// ============================================
//
// CURRENT STATUS: 
// - Google Places API: INTEGRATED ✅
// - All other services: MOCKED
// 
// The website now uses Google Places API for address autocomplete and validation.
// AWS integration is stubbed and ready for implementation.
//
// TO ENABLE REAL BACKEND SERVICES:
//
// 1. DATA SERVICE (AWS):
//    - Set USE_AWS_DATA = true
//    - Configure AWS_API_URL and AWS_API_KEY
//    - Implement actual AWS API calls in edge functions:
//      * supabase/functions/lookup-property/index.ts
//      * supabase/functions/lookup-all-properties/index.ts
//      * supabase/functions/normalize-address/index.ts
//
// 2. AWS INTEGRATION POINTS:
//    - Address normalization (fuzzy matching Google Places → AWS formats)
//    - Single property lookup by situs_address
//    - Multi-property lookup (situs_address → mailing_address → all properties)
//    - County-specific address formatting rules
//
// 3. AUTHENTICATION (Supabase):
//    - Set USE_SUPABASE_AUTH = true
//    - Replace mockAuthService calls with supabase.auth calls
//    - Update Auth.tsx, useAuthenticatedCustomerData.ts, etc.
//
// 4. FORM SUBMISSIONS (Supabase):
//    - Set USE_SUPABASE_FORMS = true
//    - Replace mockFormService calls with supabase database calls
//    - Update useFormSubmission.ts, useAddPropertySubmission.ts, etc.
//
// 5. FILE STORAGE (Supabase):
//    - Set USE_SUPABASE_STORAGE = true
//    - Replace mockStorageService calls with supabase.storage calls
//    - Update DocumentsSection.tsx and related components
//
// MIGRATION STEPS:
// 1. Enable one service at a time
// 2. Test thoroughly before enabling the next service
// 3. Each service can be enabled independently
// 4. Mock services provide exact same interface as real services
//
// MOCK DATA LOCATIONS:
// - Auth data: localStorage 'mock_auth_*' keys
// - Form data: localStorage 'mock_form_*' keys  
// - Storage data: localStorage 'mock_storage_*' keys
// - CRM data: src/services/mockData.ts
//
// GOOGLE PLACES API:
// - Integrated with address autocomplete
// - Provides structured address data
// - Includes place_id for consistent address references
// - Handles address validation and normalization
//
// AWS API INTERFACE REQUIREMENTS:
// AWS Data Service should implement REST endpoints for:
// - Property lookup by normalized address
// - Multi-property lookup by mailing address
// - County data retrieval
// - Address fuzzy matching
// - Standard CRUD operations for all entities
// 
// EDGE FUNCTIONS READY FOR AWS INTEGRATION:
// - normalize-address: Convert Google Places data to AWS format
// - lookup-property: Single property lookup
// - lookup-all-properties: Multi-property lookup with mailing address logic
