# NetSuite Node.js API Client

<div align="center">

[![npm version](https://img.shields.io/npm/v/netsuite-nodejs-api-client.svg?style=flat-square)](https://www.npmjs.com/package/netsuite-nodejs-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/node/v/netsuite-nodejs-api-client.svg?style=flat-square)](https://nodejs.org)

A robust TypeScript-based Node.js client library for NetSuite's SuiteTalk REST API and RESTlets with OAuth 1.0a authentication.

</div>

## 🚀 Features

- **🔐 OAuth 1.0a Authentication** - Secure authentication with automatic request signing
- **📊 SuiteQL Support** - Execute SuiteQL queries with built-in pagination
- **🔧 RESTlet Integration** - Easy RESTlet invocation with typed responses
- **🎯 TypeScript First** - Full TypeScript support with comprehensive type definitions
- **⚡ Promise-based API** - Modern async/await syntax for all operations
- **🛡️ Error Handling** - Detailed error parsing with custom NetSuite error types
- **📄 Automatic Pagination** - Built-in pagination utilities for large data sets
- **🧪 Well Tested** - Comprehensive test coverage with Jest

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 📦 Prerequisites

- Node.js >= 14.0.0
- NetSuite account with REST Web Services enabled
- OAuth 1.0a credentials (Integration Record in NetSuite)

## 🔧 Installation

```bash
npm install netsuite-nodejs-api-client
```

or using yarn:

```bash
yarn add netsuite-nodejs-api-client
```

## 🏃 Quick Start

```typescript
import { NSClient } from 'netsuite-nodejs-api-client';

// Initialize the client
const client = new NSClient();

// Test the connection
const isConnected = await client.testConnection();
console.log('Connected to NetSuite:', isConnected);

// Execute a SuiteQL query
const customers = await client.fetchSuiteQL(
  "SELECT id, companyname FROM customer WHERE isinactive = 'F'",
  { offset: 0, limit: 100 }
);
console.log('Active customers:', customers.data);
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# NetSuite OAuth 1.0a Credentials
ACCOUNT_ID=123456_SB1
CONSUMER_KEY=your_consumer_key_here
CONSUMER_SECRET=your_consumer_secret_here
TOKEN_ID=your_token_id_here
TOKEN_SECRET=your_token_secret_here
```

### Manual Configuration

You can also pass credentials directly:

```typescript
const client = new NSClient({
  accountId: '123456_SB1',
  consumerKey: 'your_consumer_key',
  consumerSecret: 'your_consumer_secret',
  tokenId: 'your_token_id',
  tokenSecret: 'your_token_secret'
});
```

## 📚 API Reference

### NSClient

The main client class for interacting with NetSuite APIs.

#### `testConnection()`

Validates OAuth credentials and connection to NetSuite.

```typescript
const isConnected = await client.testConnection();
// Returns: true if connection successful, false otherwise
```

#### `fetchSuiteQL(query, options?)`

Executes a SuiteQL query with optional pagination.

```typescript
const response = await client.fetchSuiteQL(
  "SELECT * FROM transaction WHERE trandate >= '2024-01-01'",
  { 
    offset: 0, 
    limit: 1000,
    headers: { 'prefer': 'transient' }
  }
);

// Response includes:
// - data.items: Array of query results
// - data.count: Total number of records
// - data.hasMore: Boolean indicating more pages available
// - data.offset: Current offset
// - data.totalResults: Total results across all pages
```

**Parameters:**
- `query` (string): The SuiteQL query to execute
- `options` (optional):
  - `offset` (number): Starting position for results (default: 0)
  - `limit` (number): Maximum records per page (default: 10, max: 1000)
  - `headers` (object): Additional HTTP headers

#### `getRestlet(scriptId, deploymentId, params)`

Invokes a NetSuite RESTlet script.

```typescript
const result = await client.getRestlet<MyCustomResponse>(
  1234,  // Script ID
  1,     // Deployment ID
  {      // URL parameters
    action: 'getCustomerData',
    customerId: '12345'
  }
);
```

**Parameters:**
- `scriptId` (number): Internal ID of the RESTlet script
- `deploymentId` (number): Deployment ID (default: 1)
- `params` (object): URL parameters to pass to the RESTlet

#### `request(path, method, options?)`

Makes a generic authenticated request to any NetSuite REST API endpoint.

```typescript
// GET request
const customers = await client.request(
  '/record/v1/customer',
  'GET',
  { params: { limit: 50 } }
);

// POST request
const newCustomer = await client.request(
  '/record/v1/customer',
  'POST',
  { 
    data: {
      companyname: 'New Company Inc.',
      email: 'contact@newcompany.com'
    }
  }
);
```

**Parameters:**
- `path` (string): API endpoint path
- `method` (string): HTTP method (GET, POST, PUT, DELETE, PATCH)
- `options` (optional):
  - `data` (any): Request body for POST/PUT/PATCH
  - `params` (object): URL query parameters
  - `headers` (object): Additional HTTP headers

#### `getOpenAPIMetadata(options?)`

Fetches OpenAPI 3.0 metadata for NetSuite records and optionally saves it to a file.

```typescript
// Fetch metadata for all records
const allMetadata = await client.getOpenAPIMetadata();

// Fetch metadata for specific record types only
const customerMetadata = await client.getOpenAPIMetadata({
  recordTypes: ['customer', 'salesorder'],
  saveToFile: true,
  fileName: 'customer-salesorder-metadata.json'
});

// Use the metadata with tools like Swagger Editor
console.log('Available paths:', Object.keys(customerMetadata.paths));
```

**Parameters:**
- `options` (optional):
  - `recordTypes` (string[]): Array of record types to fetch metadata for (e.g., ['customer', 'salesorder'])
  - `saveToFile` (boolean): Whether to save metadata to a file (default: false)
  - `fileName` (string): File name for saved metadata (default: 'netsuite-openapi-metadata.json')

### Paginate

Utility class for handling paginated SuiteQL results.

```typescript
import { Paginate } from 'netsuite-nodejs-api-client';

const paginator = new Paginate(client);

// Fetch all results with automatic pagination
const allCustomers = await paginator.fetchAllSuiteQL(
  "SELECT * FROM customer WHERE isinactive = 'F'"
);

// Process results in batches
await paginator.fetchSuiteQLInBatches(
  "SELECT * FROM transaction",
  async (batch) => {
    console.log(`Processing ${batch.length} records`);
    // Process each batch
  },
  { batchSize: 500 }
);
```

## 🎯 Advanced Usage

### Working with Custom Records

```typescript
// Fetch custom records
const customRecords = await client.request(
  '/record/v1/customrecord_mycustomrecord',
  'GET',
  { params: { limit: 100 } }
);

// Update a custom record
await client.request(
  '/record/v1/customrecord_mycustomrecord/123',
  'PATCH',
  { 
    data: {
      custrecord_field1: 'Updated Value',
      custrecord_field2: 123
    }
  }
);
```

### Complex SuiteQL Queries

```typescript
const complexQuery = `
  SELECT 
    t.tranid,
    t.trandate,
    tl.item,
    i.displayname as itemname,
    tl.quantity,
    tl.rate
  FROM 
    transaction t
    INNER JOIN transactionline tl ON tl.transaction = t.id
    INNER JOIN item i ON i.id = tl.item
  WHERE 
    t.type = 'SalesOrd'
    AND t.trandate >= '2024-01-01'
    AND t.status = 'Billed'
  ORDER BY 
    t.trandate DESC
`;

const salesData = await client.fetchSuiteQL(complexQuery, { limit: 1000 });
```

### RESTlet with Error Handling

```typescript
try {
  const result = await client.getRestlet(
    SCRIPT_ID,
    DEPLOY_ID,
    { 
      action: 'processOrder',
      orderId: '12345'
    }
  );
  
  if (result.data.success) {
    console.log('Order processed:', result.data.orderId);
  }
} catch (error) {
  if (error instanceof NetsuiteError) {
    console.error('NetSuite Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('Details:', error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Working with OpenAPI Metadata

```typescript
// Generate OpenAPI metadata for integration with tools
const metadata = await client.getOpenAPIMetadata({
  recordTypes: ['customer', 'salesorder', 'item'],
  saveToFile: true,
  fileName: 'netsuite-api-spec.json'
});

// Use the metadata to explore available operations
console.log('Customer endpoints:', metadata.paths['/customer']);

// The saved JSON file can be imported into:
// - Swagger Editor (https://editor.swagger.io)
// - Postman for API testing
// - Code generation tools for client SDKs
// - API documentation generators
```

## 🛡️ Error Handling

The client provides detailed error information through the `NetsuiteError` class:

```typescript
import { NetsuiteError } from 'netsuite-nodejs-api-client';

try {
  await client.fetchSuiteQL('INVALID SQL');
} catch (error) {
  if (error instanceof NetsuiteError) {
    console.error('Error Type:', error.type);        // e.g., 'INVALID_PARAMETER'
    console.error('Error Code:', error.code);        // e.g., 'INVALID_QUERY'
    console.error('Error Message:', error.message);  // Human-readable message
    console.error('Error Details:', error.details);  // Additional context
    
    // NetSuite's raw error response
    console.error('Raw Error:', error.rawError);
  }
}
```

### Common Error Types

- `INVALID_PARAMETER` - Invalid query parameters or request data
- `INVALID_CREDENTIALS` - OAuth authentication failed
- `PERMISSION_VIOLATION` - Insufficient permissions
- `RECORD_NOT_FOUND` - Requested record doesn't exist
- `RATE_LIMIT_EXCEEDED` - API rate limit hit

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

```typescript
import { NSClient } from 'netsuite-nodejs-api-client';
import { mockNetSuiteResponse } from './test-utils';

describe('Customer Operations', () => {
  let client: NSClient;
  
  beforeEach(() => {
    client = new NSClient();
  });
  
  it('should fetch active customers', async () => {
    const customers = await client.fetchSuiteQL(
      "SELECT * FROM customer WHERE isinactive = 'F'"
    );
    
    expect(customers.data.items).toBeArray();
    expect(customers.data.count).toBeGreaterThan(0);
  });
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NetSuite for providing the REST API
- The TypeScript community for excellent type definitions
- All contributors who help improve this library

## 📞 Support

- 📧 Email: support@example.com
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/netsuite-nodejs-api-client/issues)
- 📖 Docs: [Full Documentation](https://docs.example.com)

---

<div align="center">
Made with ❤️ by the NetSuite developer community
</div>