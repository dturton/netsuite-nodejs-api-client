import NSClient from "./src/services/netsuiteClient";
import Paginate from "./src/services/Paginate";
import { AxiosError } from "axios";

// Test configuration
const TEST_CONFIG = {
  // SuiteQL test query - adjust this to match your NetSuite data
  suiteqlQuery: "select id from item",

  // RESTlet test parameters - replace with your script/deployment IDs
  restletScriptId: 953,
  restletDeploymentId: 1,
  restletParams: { sku: "34234" },

  // Generic API test path - corrected path
  apiPath: "record/v1/customer",
};

async function testConnection(client: NSClient) {
  console.log("\n🔌 Testing Connection...");
  try {
    const isConnected = await client.testConnection();
    if (isConnected) {
      console.log("✅ Connection successful!");
    } else {
      console.log("❌ Connection failed!");
    }
  } catch (error) {
    const err = error as AxiosError;
    console.error("❌ Connection failed:", err.response?.data || err.message);
    throw error;
  }
}

async function testSuiteQL(client: NSClient) {
  console.log("\n📊 Testing SuiteQL Query...");
  try {
    const response = await client.fetchSuiteQL(TEST_CONFIG.suiteqlQuery, 0, 10);
    console.log("✅ SuiteQL query successful!");
    console.log(`Found ${response.data.count} items:`, response.data.items);
    console.log(`Total results: ${response.data.totalResults}`);
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      "❌ SuiteQL query failed:",
      err.response?.data || err.message
    );
  }
}

async function testPagination(client: NSClient) {
  console.log("\n📄 Testing Pagination...");
  try {
    const paginator = new Paginate({
      apiCall: (offset: number, limit: number) =>
        client.fetchSuiteQL(TEST_CONFIG.suiteqlQuery, offset, limit),
      limit: 5, // Small limit to test pagination
    });

    const allItems: any[] = [];
    let pageCount = 0;

    for await (const response of paginator.run()) {
      pageCount++;
      allItems.push(...response.data.items);
      console.log(`Page ${pageCount}: ${response.data.items.length} items`);
    }

    console.log("✅ Pagination successful!");
    console.log(`Total items across ${pageCount} pages: ${allItems.length}`);
  } catch (error) {
    const err = error as AxiosError;
    console.error("❌ Pagination failed:", err.response?.data || err.message);
  }
}

async function testRESTlet(client: NSClient) {
  console.log("\n🔧 Testing RESTlet...");
  try {
    const response = await client.getRestlet(
      TEST_CONFIG.restletScriptId,
      TEST_CONFIG.restletDeploymentId,
      TEST_CONFIG.restletParams
    );
    console.log("✅ RESTlet call successful!");
    console.log("Response:", response.data);
  } catch (error) {
    const err = error as AxiosError;
    console.error("❌ RESTlet call failed:", err.response?.data || err.message);
  }
}

async function testGenericRequest(client: NSClient) {
  console.log("\n🌐 Testing Generic API Request...");
  try {
    const response = await client.request({
      path: TEST_CONFIG.apiPath,
      method: "get",
    });
    console.log("✅ Generic API request successful!");
    console.log("Response:", response.data);
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      "❌ Generic API request failed:",
      err.response?.data || err.message
    );
  }
}

async function runAllTests() {
  console.log("🚀 NetSuite Client Test Suite");
  console.log("============================");

  // Check for environment variables
  const requiredEnvVars = [
    "ACCOUNT_ID",
    "CONSUMER_KEY",
    "CONSUMER_SECRET",
    "TOKEN_ID",
    "TOKEN_SECRET",
  ];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      "\n❌ Missing required environment variables:",
      missingVars.join(", ")
    );
    console.log("\n📝 Please create a .env file with the following variables:");
    requiredEnvVars.forEach((varName) =>
      console.log(`${varName}=your_value_here`)
    );
    process.exit(1);
  }

  const client = new NSClient();

  try {
    // Test connection first
    //await testConnection(client);

    // Run other tests
    await testSuiteQL(client);
    // await testPagination(client);
    // await testRESTlet(client);
    // await testGenericRequest(client);

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("\n❌ Test suite failed early due to connection error");
  }
}

// Run tests
runAllTests().catch(console.error);
