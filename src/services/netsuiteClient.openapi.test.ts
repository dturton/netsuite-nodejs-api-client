// Mock the environment module
jest.mock("../config/environment", () => ({
  ACCOUNT_ID: "123456",
  CONSUMER_KEY: "test_consumer_key",
  CONSUMER_SECRET: "test_consumer_secret",
  TOKEN_ID: "test_token_id",
  TOKEN_SECRET: "test_token_secret"
}));

import NSClient from "./netsuiteClient";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { NetsuiteError } from "../utils/errorHandler";
import * as fs from "fs";
import * as path from "path";

jest.mock("axios");
jest.mock("fs");
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("NSClient - OpenAPI Metadata", () => {
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

  describe("getOpenAPIMetadata", () => {
    const mockOpenAPIResponse = {
      openapi: "3.0.0",
      info: {
        title: "NetSuite REST Record API",
        version: "1.0"
      },
      paths: {
        "/customer": {
          get: {
            summary: "Get customers",
            parameters: []
          }
        },
        "/salesorder": {
          get: {
            summary: "Get sales orders",
            parameters: []
          }
        }
      },
      components: {
        schemas: {
          customer: {
            type: "object",
            properties: {}
          }
        }
      }
    };

    beforeEach(() => {
      mockedFs.writeFileSync.mockClear();
    });

    it("should fetch OpenAPI metadata for all records", async () => {
      const mockResponse: AxiosResponse = {
        data: mockOpenAPIResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await client.getOpenAPIMetadata();

      expect(result).toEqual(mockOpenAPIResponse);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "record/v1/metadata-catalog",
        {
          headers: {
            'Accept': 'application/swagger+json'
          },
          params: {}
        }
      );
    });

    it("should fetch OpenAPI metadata for specific record types", async () => {
      const mockResponse: AxiosResponse = {
        data: mockOpenAPIResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await client.getOpenAPIMetadata({
        recordTypes: ['customer', 'salesorder']
      });

      expect(result).toEqual(mockOpenAPIResponse);
      expect(axiosInstance.get).toHaveBeenCalledWith(
        "record/v1/metadata-catalog",
        {
          headers: {
            'Accept': 'application/swagger+json'
          },
          params: {
            select: 'customer,salesorder'
          }
        }
      );
    });

    it("should save metadata to file when saveToFile is true", async () => {
      const mockResponse: AxiosResponse = {
        data: mockOpenAPIResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await client.getOpenAPIMetadata({
        saveToFile: true,
        fileName: 'test-metadata.json'
      });

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        path.resolve(process.cwd(), 'test-metadata.json'),
        JSON.stringify(mockOpenAPIResponse, null, 2),
        'utf-8'
      );
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('OpenAPI metadata saved to:')
      );
    });

    it("should use default filename when saveToFile is true but no filename provided", async () => {
      const mockResponse: AxiosResponse = {
        data: mockOpenAPIResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await client.getOpenAPIMetadata({
        saveToFile: true
      });

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        path.resolve(process.cwd(), 'netsuite-openapi-metadata.json'),
        JSON.stringify(mockOpenAPIResponse, null, 2),
        'utf-8'
      );
    });

    it("should handle errors when fetching metadata", async () => {
      const errorResponse = {
        response: {
          data: {
            type: "INVALID_REQUEST",
            title: "Invalid Request",
            status: 400,
            "o:errorDetails": [
              {
                detail: "Invalid record type",
                "o:errorCode": "INVALID_RECORD_TYPE"
              }
            ]
          },
          status: 400
        }
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.get as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(
        client.getOpenAPIMetadata({ recordTypes: ['invalid_type'] })
      ).rejects.toThrow(NetsuiteError);
    });

    it("should handle file write errors", async () => {
      const mockResponse: AxiosResponse = {
        data: mockOpenAPIResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const axiosInstance = mockedAxios.create();
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      mockedFs.writeFileSync.mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });

      // The method should throw the file system error
      await expect(
        client.getOpenAPIMetadata({
          saveToFile: true,
          fileName: 'test.json'
        })
      ).rejects.toThrow('Permission denied');
    });
  });
});