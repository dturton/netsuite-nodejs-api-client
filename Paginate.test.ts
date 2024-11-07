import Paginate from "./src/services/paginate"; // Adjust based on your directory structure
import {
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { NSBaseRestResponse } from "./src/types"; // Adjust based on your directory structure

describe("Paginate class with real-world data", () => {
  const mockApiCall = jest.fn<
    Promise<AxiosResponse<NSBaseRestResponse>>,
    [number, number]
  >();

  // Mock configuration that conforms to InternalAxiosRequestConfig
  const mockConfig: Partial<InternalAxiosRequestConfig> = {
    method: "get",
    url: "",
    baseURL: "",
    params: {},
    data: {},
    timeout: 0,
    withCredentials: false,
    adapter: undefined,
    auth: undefined,
    responseType: "json",
    responseEncoding: "utf8",
    xsrfCookieName: "",
    xsrfHeaderName: "",
    maxContentLength: -1,
    maxBodyLength: -1,
    maxRedirects: 5,
    socketPath: null,
    transitional: {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false,
    },

    onUploadProgress: undefined,
    onDownloadProgress: undefined,
    decompress: true,
    insecureHTTPParser: undefined,
  };

  const firstPageResponse: AxiosResponse<NSBaseRestResponse> = {
    data: {
      items: [
        { id: "1", companyname: "Company 1" },
        { id: "2", companyname: "Company 2" },
      ],
      links: [
        {
          rel: "next",
          href: "https://3609571.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql?limit=1000&offset=1000",
        },
      ],
      count: 2,
      hasMore: true,
      offset: 0,
      totalResults: 242514,
    },
    status: 200,
    statusText: "OK",
    headers: {}, // Provide default empty object for headers
    config: mockConfig, // Use the mocked config
  };

  const secondPageResponse: AxiosResponse<NSBaseRestResponse> = {
    data: {
      items: [
        { id: "3", companyname: "Company 3" },
        { id: "4", companyname: "Company 4" },
      ],
      links: [], // No next link here, indicating the end of pagination
      count: 2,
      hasMore: false,
      offset: 1000,
      totalResults: 242514,
    },
    status: 200,
    statusText: "OK",
    headers: {}, // Provide default empty object for headers
    config: mockConfig, // Use the mocked config
  };

  beforeEach(() => {
    mockApiCall.mockClear(); // Clear any previous mock calls before each test
  });

  it("should paginate correctly through multiple pages", async () => {
    // Simulate two pages: first page with next link, second page without
    mockApiCall
      .mockResolvedValueOnce(firstPageResponse) // First page response
      .mockResolvedValueOnce(secondPageResponse); // Second page response

    const paginator = new Paginate({
      apiCall: mockApiCall,
      limit: 1000,
    });

    const allItems: any[] = [];

    // Use async iteration to collect all paginated results
    for await (const response of paginator.run()) {
      allItems.push(...response.data.items); // Accumulate items from each page
    }

    // Check that the API call was made with correct pagination parameters
    expect(mockApiCall).toHaveBeenCalledWith(0, 1000); // First call
    expect(mockApiCall).toHaveBeenCalledWith(1000, 1000); // Second call with updated offset

    // Check that all items across both pages are returned
    expect(allItems).toEqual([
      { id: "1", companyname: "Company 1" },
      { id: "2", companyname: "Company 2" },
      { id: "3", companyname: "Company 3" },
      { id: "4", companyname: "Company 4" },
    ]);

    // Ensure the API was called twice, once for each page
    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });

  it("should stop paginating when there is no next link", async () => {
    // Simulate only one page, without any next link
    mockApiCall.mockResolvedValueOnce(secondPageResponse);

    const paginator = new Paginate({
      apiCall: mockApiCall,
      limit: 1000,
    });

    const items: any[] = [];

    // Use async iteration to collect results
    for await (const response of paginator.run()) {
      items.push(...response.data.items);
    }

    // Check that only one API call was made
    expect(mockApiCall).toHaveBeenCalledTimes(1);

    // Check that the items from the single page are returned
    expect(items).toEqual([
      { id: "3", companyname: "Company 3" },
      { id: "4", companyname: "Company 4" },
    ]);
  });
});
