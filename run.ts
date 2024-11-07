import { AxiosError } from "axios";
import NSClient from "./src/services/netsuiteClient";
// import Paginator from "./src/services/paginate";

(async () => {
  // Instantiate the NSClient
  const client = new NSClient();

  // Define the SuiteQL query
  // const suiteQLQuery = `select distinct(superitem)  from ItemPresentationItem WHERE presitemid IS NOT NULL`;
  // const first = await client.fetchSuiteQL(suiteQLQuery, 0, 10);
  // console.log("First page:", first.data.items);

  // const paginator = new Paginator({
  //   apiCall: (offset: number, limit: number) =>
  //     client.fetchSuiteQL(suiteQLQuery, offset, limit),
  //   limit: 1000, // Set the limit per page (optional, defaults to 1000)
  // });

  // // Collect all paginated results
  // const allItems: any[] = [];

  // // Use async iteration to go through each page
  // for await (const response of paginator.run()) {
  //   allItems.push(...response.data.items);
  // }

  // // Process the accumulated items
  // console.log("All items:", allItems);

  // try {
  //   const response = await client.getRestlet(953, 1, { sku: "38505" });
  //   console.log("RESTlet Response:", response.data);
  // } catch (error) {
  //   const err = error as AxiosError;
  //   console.error("Error fetching RESTlet:", err.response?.data);
  // }

  try {
    const data = await client.testConnection();
    console.log("OPTIONS Response:", data);
  } catch (error) {
    const err = error as AxiosError;
    console.error("Error fetching OPTIONS:", err);
  }
})();
