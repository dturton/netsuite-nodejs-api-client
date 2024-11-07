
# NSClient - NetSuite API Client

NSClient is a Node.js client library for interacting with NetSuite's SuiteTalk REST API and RESTlets using OAuth 1.0a authentication. It provides helper functions for executing SuiteQL queries, making RESTlet calls, and performing other general-purpose API requests to the NetSuite platform.

## Features

- **SuiteQL Execution**: Run SuiteQL queries to retrieve data from NetSuite.
- **RESTlet Calls**: Call custom RESTlets in NetSuite with script and deployment IDs.
- **General API Requests**: Make authenticated requests to any NetSuite REST endpoint.
- **OAuth 1.0a Authentication**: Automatically signs requests using OAuth 1.0a for secure NetSuite API access.

## Prerequisites

- **Node.js**: Ensure Node.js is installed.
- **NetSuite OAuth 1.0a Credentials**: To use this client, you need a NetSuite Account ID, Consumer Key, Consumer Secret, Token ID, and Token Secret. These can be obtained by setting up an integration in NetSuite and generating tokens.

## Installation

To install the dependencies required for this client, use:

```bash
npm install axios axios-oauth-1.0a
```

## Environment Configuration

Create an environment configuration file to store your NetSuite credentials:

```plaintext
ACCOUNT_ID=your_account_id
CONSUMER_KEY=your_consumer_key
CONSUMER_SECRET=your_consumer_secret
TOKEN_ID=your_token_id
TOKEN_SECRET=your_token_secret
```

## Usage

### 1. Initialization

Import and instantiate the `NSClient`:

```typescript
import NSClient from './path/to/NSClient';

const client = new NSClient();
```

### 2. Methods

#### `fetchSuiteQL`

Executes a SuiteQL query against NetSuite.

```typescript
const query = "SELECT id, companyname FROM customer WHERE isinactive = 'F'";
const offset = 0;
const limit = 10;

try {
  const response = await client.fetchSuiteQL(query, offset, limit);
  console.log('SuiteQL Response:', response.data);
} catch (error) {
  console.error('Error executing SuiteQL:', error);
}
```

- **Parameters**:
  - `query` (string): The SuiteQL query to execute.
  - `offset` (number, optional): Pagination offset. Defaults to 0.
  - `limit` (number, optional): Number of records to retrieve per page. Defaults to 10.
- **Returns**: `Promise<AxiosResponse<NSBaseRestResponse>>`

#### `getRestlet`

Calls a NetSuite RESTlet using the specified script and deployment IDs.

```typescript
const scriptId = 1234;
const deployId = 1;
const params = { param1: 'value1', param2: 'value2' };

try {
  const response = await client.getRestlet(scriptId, deployId, params);
  console.log('RESTlet Response:', response.data);
} catch (error) {
  console.error('Error calling RESTlet:', error);
}
```

- **Parameters**:
  - `scriptId` (number): The ID of the RESTlet script to call.
  - `deployId` (number, optional): The deployment ID of the RESTlet. Defaults to 1.
  - `params` (Record<string, string>): Query parameters to pass to the RESTlet.
- **Returns**: `Promise<AxiosResponse<T>>`

#### `request`

Makes a generic API request to any NetSuite endpoint.

```typescript
const options = {
  path: '/record/v1/customer',
  method: 'GET',
  body: {},  // For POST/PUT requests, include data here
};

try {
  const response = await client.request(options);
  console.log('API Response:', response.data);
} catch (error) {
  console.error('Error making API request:', error);
}
```

- **Parameters**:
  - `options` (NetsuiteRequestOptions): Object with the following properties:
    - `path` (string): The API endpoint path.
    - `method` (string): HTTP method (GET, POST, PUT, DELETE).
    - `body` (any, optional): Data to send with the request.
- **Returns**: `Promise<AxiosResponse<T>>`

### Error Handling

All methods throw `NetsuiteError` when errors occur during the API call. Be sure to handle errors appropriately, as shown in the examples.

## Example

```typescript
(async () => {
  const client = new NSClient();

  // SuiteQL Example
  const suiteql = "SELECT id, companyname FROM customer WHERE isinactive = 'F'";
  const suiteqlResponse = await client.fetchSuiteQL(suiteql);
  console.log('SuiteQL Data:', suiteqlResponse.data);

  // RESTlet Example
  const restletResponse = await client.getRestlet(1234, 1, { custparam: '123' });
  console.log('RESTlet Data:', restletResponse.data);
})();
```

## License

MIT License

## Support

For any issues or questions, feel free to reach out or open an issue in the repository.
