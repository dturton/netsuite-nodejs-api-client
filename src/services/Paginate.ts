import { AxiosResponse } from "axios";
import url from "url";
import { NSBaseRestResponse } from "../types";

export interface PaginateOptions {
  limit?: number;
  apiCall: (
    offset: number,
    limit: number
  ) => Promise<AxiosResponse<NSBaseRestResponse>>;
}

export default class Paginate<Item, Response> {
  private offset = 0;
  private limit: number;
  private done = false;
  private apiCall: (
    offset: number,
    limit: number
  ) => Promise<AxiosResponse<NSBaseRestResponse>>;

  constructor({ apiCall, limit = 1000 }: PaginateOptions) {
    this.apiCall = apiCall;
    this.limit = limit;
  }

  private updatePagination(response: AxiosResponse<NSBaseRestResponse>): void {
    const nextLink = response.data.links?.find((link) => link.rel === "next");
    if (nextLink) {
      const parsedUrl = url.parse(nextLink.href, true);
      this.offset = Number(parsedUrl.query.offset) || 0;
      this.limit = Number(parsedUrl.query.limit) || this.limit;
    } else {
      this.done = true; // No more pages
    }
  }

  // Async generator to fetch paginated results
  async *run(): AsyncGenerator<AxiosResponse<NSBaseRestResponse>> {
    while (!this.done) {
      const response = await this.apiCall(this.offset, this.limit);
      this.updatePagination(response);
      yield response; // Yield the current page
    }
  }
}
