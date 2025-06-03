// Mock the environment module
jest.mock("../config/environment", () => ({
  ACCOUNT_ID: "123456",
  CONSUMER_KEY: "test_consumer_key",
  CONSUMER_SECRET: "test_consumer_secret",
  TOKEN_ID: "test_token_id",
  TOKEN_SECRET: "test_token_secret"
}));

import NSClient from "./netsuiteClient";
import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { NetsuiteError } from "../utils/errorHandler";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("NSClient", () => {
  let client: NSClient;
  let consoleLogSpy: jest.SpyInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.log to suppress output during tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Create axios instance mock
    const axiosInstanceMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };
    
    mockedAxios.create.mockReturnValue(axiosInstanceMock as any);
    
    client = new NSClient();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("testConnection", () => {
    it("should successfully test connection", async () => {
      const mockResponse: AxiosResponse = {
        data: ["GET", "POST", "PUT", "DELETE"],
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await client.testConnection();

      expect(result).toBe(true);
      expect(axiosInstance.request).toHaveBeenCalledWith({
        method: "options",
        url: "*",
      });
    });

    it("should return false when connection fails", async () => {
      const axiosInstance = mockedAxios.create();
      (axiosInstance.request as jest.Mock).mockRejectedValueOnce(new Error("Connection failed"));

      const result = await client.testConnection();

      expect(result).toBe(false);
    });
  });

  describe("fetchSuiteQL", () => {
    it("should fetch SuiteQL query results", async () => {
      const mockResponse: AxiosResponse = {
        data: {
          items: [{ id: "1", name: "Test" }],
          count: 1,
          hasMore: false,
          totalResults: 1,
          offset: 0,
          links: []
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await client.fetchSuiteQL("SELECT * FROM customer", 0, 10);

      expect(result.data.items).toHaveLength(1);
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "query/v1/suiteql",
        { q: "SELECT * FROM customer" },
        { params: { limit: 10, offset: 0 } }
      );
    });

    it("should handle NetSuite errors", async () => {
      const errorResponse = {
        response: {
          data: {
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid SuiteQL query"
            }
          },
          status: 400
        }
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.post as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(client.fetchSuiteQL("INVALID SQL")).rejects.toThrow(NetsuiteError);
    });
  });

  describe("getRestlet", () => {
    it("should call RESTlet successfully", async () => {
      const mockResponse: AxiosResponse = {
        data: { result: "success" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await client.getRestlet(123, 1, { param1: "value1" });

      expect(result.data).toEqual({ result: "success" });
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "https://123456.restlets.api.netsuite.com/app/site/hosting/restlet.nl",
        {
          params: {
            script: 123,
            deploy: 1,
            param1: "value1"
          }
        }
      );
    });
  });

  describe("request", () => {
    it("should make generic GET request", async () => {
      const mockResponse: AxiosResponse = {
        data: { id: "1", name: "Test" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await client.request({
        path: "/services/rest/record/v1/customer/1",
        method: "get"
      });

      expect(result.data).toEqual({ id: "1", name: "Test" });
      expect(axiosInstance.request).toHaveBeenCalledWith({
        method: "get",
        url: "/services/rest/record/v1/customer/1",
        data: ""
      });
    });

    it("should make POST request with data", async () => {
      const mockResponse: AxiosResponse = {
        data: { id: "2", name: "New Customer" },
        status: 201,
        statusText: "Created",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await client.request({
        path: "/services/rest/record/v1/customer",
        method: "post",
        body: { name: "New Customer" }
      });

      expect(result.data).toEqual({ id: "2", name: "New Customer" });
      expect(axiosInstance.request).toHaveBeenCalledWith({
        method: "post",
        url: "/services/rest/record/v1/customer",
        data: { name: "New Customer" }
      });
    });
  });

});