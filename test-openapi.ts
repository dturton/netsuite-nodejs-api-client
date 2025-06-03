import NSClient from './src/services/netsuiteClient';

async function testOpenAPIMetadata() {
  try {
    console.log('Initializing NetSuite client...');
    const client = new NSClient();
    
    // Test connection first
    console.log('Testing connection...');
    const isConnected = await client.testConnection();
    console.log('Connection test result:', isConnected);
    
    if (!isConnected) {
      console.error('Failed to connect to NetSuite. Please check your credentials.');
      return;
    }
    
    console.log('\nFetching OpenAPI metadata...');
    
    // Option 1: Get metadata for specific record types (recommended for faster response)
    const metadata = await client.getOpenAPIMetadata({
      recordTypes: ['customer', 'salesorder', 'item', 'invoice'],
      saveToFile: true,
      fileName: 'netsuite-openapi-specific-records.json'
    });
    
    console.log('\nMetadata fetched successfully!');
    console.log('Available paths:', Object.keys(metadata.paths || {}).slice(0, 10), '...');
    console.log('Total paths:', Object.keys(metadata.paths || {}).length);
    
    // Option 2: Get metadata for ALL records (this can be slow and large)
    // Uncomment the following to fetch all metadata:
    /*
    console.log('\nFetching metadata for ALL records (this may take a while)...');
    const allMetadata = await client.getOpenAPIMetadata({
      saveToFile: true,
      fileName: 'netsuite-openapi-all-records.json'
    });
    console.log('All metadata fetched successfully!');
    console.log('File size will be large - check the saved JSON file.');
    */
    
  } catch (error) {
    console.error('Error fetching OpenAPI metadata:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testOpenAPIMetadata();