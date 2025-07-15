// Data Service Factory and Configuration

import { DataService } from './dataService';
import { MockDataService } from './mockDataService';
import { AWSDataService } from './awsDataService';

// Configuration flag - set to true when AWS integration is ready
const USE_AWS_DATA = false;

// AWS Configuration (to be set when ready)
const AWS_API_URL = 'https://your-aws-api-url.com/api';
const AWS_API_KEY = 'your-aws-api-key';

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

// Export the configured data service instance
export const dataService = createDataService();

// Export types and classes for advanced usage
export { DataService } from './dataService';
export { MockDataService } from './mockDataService';
export { AWSDataService } from './awsDataService';
export * from './types';

// Configuration information
export const getDataSourceInfo = () => ({
  isUsingAWS: USE_AWS_DATA,
  source: USE_AWS_DATA ? 'AWS Database' : 'Mock Data',
  apiUrl: USE_AWS_DATA ? AWS_API_URL : 'N/A'
});

// Developer Notes:
// 
// TO ENABLE AWS DATA SERVICE:
// 1. Set USE_AWS_DATA = true
// 2. Configure AWS_API_URL and AWS_API_KEY
// 3. Ensure your AWS API endpoints match the expected interface
// 4. Test thoroughly before switching to production
//
// AWS API REQUIREMENTS:
// The AWS service should implement REST endpoints for:
// - GET/POST/PUT/DELETE /contacts
// - GET/POST/PUT/DELETE /properties  
// - GET/POST/PUT/DELETE /protests
// - GET/POST/PUT/DELETE /bills
// - GET/POST/PUT/DELETE /invoices
// - GET/POST/PUT/DELETE /documents
// - GET/POST/PUT/DELETE /document-templates
// - GET/POST/PUT/DELETE /communications
// - GET/POST/PUT/DELETE /owners
//
// ENVIRONMENT VARIABLES:
// Consider using environment variables for production:
// - VITE_USE_AWS_DATA=true/false
// - VITE_AWS_API_URL=your-api-url
// - VITE_AWS_API_KEY=your-api-key