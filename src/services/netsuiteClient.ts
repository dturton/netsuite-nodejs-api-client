import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import addOAuthInterceptor, { OAuthInterceptorConfig } from "axios-oauth-1.0a";
import {
  ACCOUNT_ID,
  CONSUMER_KEY,
  CONSUMER_SECRET,
  TOKEN_ID,
  TOKEN_SECRET,
} from "../config/environment";
import { NetsuiteRequestOptions, NSBaseRestResponse, OpenAPIMetadataOptions } from "../types";
import { NetsuiteError } from "../utils/errorHandler";
import * as fs from "fs";
import * as path from "path";

export default class NSClient {
  client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `https://${ACCOUNT_ID}.suitetalk.api.netsuite.com/services/rest/`,
      headers: {
        "Content-Type": "application/json",
        prefer: "transient",
      },
    });

    const options: OAuthInterceptorConfig = {
      key: CONSUMER_KEY,
      secret: CONSUMER_SECRET,
      realm: ACCOUNT_ID,
      token: TOKEN_ID,
      tokenSecret: TOKEN_SECRET,
      algorithm: "HMAC-SHA256",
    };

    addOAuthInterceptor(this.client, options);
  }

  // Fetch a single page of SuiteQL data
  async fetchSuiteQL(
    query: string,
    offset = 10,
    limit = 100
  ): Promise<AxiosResponse<NSBaseRestResponse>> {
    try {
      const response = await this.client.post(
        "query/v1/suiteql",
        { q: query },
        { params: { offset, limit } }
      );
      return response;
    } catch (error) {
      const err = error as AxiosError;
      throw new NetsuiteError(err);
    }
  }

  async getRestlet<T>(
    scriptId: number,
    deployId: number = 1,
    params: Record<string, string>
  ): Promise<AxiosResponse<T>> {
    // Construct the RESTlet URL based on the accountId
    const baseUrl = `https://${ACCOUNT_ID}.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    // Construct the query parameters including the scriptId and deployment
    const queryParams = {
      script: scriptId,
      deploy: deployId,
      ...params,
    };

    try {
      // Make the GET request using Axios
      const response = await this.client.get<T>(baseUrl, {
        params: queryParams,
      });
      return response;
    } catch (error) {
      const err = error as AxiosError;
      throw new NetsuiteError(err);
    }
  }

  async request<T>(options: NetsuiteRequestOptions): Promise<AxiosResponse<T>> {
    const { path = "*", method = "GET", body = "" } = options;

    try {
      const response = await this.client.request<T>({
        url: path,
        method,
        data: body,
      });
      return response;
    } catch (error) {
      const err = error as AxiosError;
      throw new NetsuiteError(err);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const data = await this.client.request({
        url: "*",
        method: "options",
      });
      console.log("OPTIONS Response:", data);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getOpenAPIMetadata(options: OpenAPIMetadataOptions = {}): Promise<any> {
    const { 
      recordTypes = [], 
      saveToFile = false, 
      fileName = 'netsuite-openapi-metadata.json' 
    } = options;

    try {
      // Build the URL with optional record type selection
      let url = 'record/v1/metadata-catalog';
      const params: any = {};
      
      if (recordTypes.length > 0) {
        params.select = recordTypes.join(',');
      }

      // Make the request with proper OpenAPI 3.0 header
      const response = await this.client.get(url, {
        headers: {
          'Accept': 'application/swagger+json'
        },
        params
      });

      const metadata = response.data;

      // Save to file if requested
      if (saveToFile) {
        const filePath = path.resolve(process.cwd(), fileName);
        fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), 'utf-8');
        console.log(`OpenAPI metadata saved to: ${filePath}`);
      }

      return metadata;
    } catch (error) {
      const err = error as AxiosError;
      throw new NetsuiteError(err);
    }
  }
}
