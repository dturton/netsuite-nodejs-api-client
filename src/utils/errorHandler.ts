import { AxiosError } from "axios";
import { NetsuiteBodyError } from "../types";

export class NetsuiteError extends Error {
  constructor(httpError: AxiosError) {
    try {
      const body = httpError?.response?.data;
      console.log("httpError", body);
      const data = JSON.parse(body as string) as NetsuiteBodyError;
      const text = data["o:errorDetails"][0].detail;
      super(text || httpError.message);
    } catch (e) {
      super(httpError.message);
    }
  }
}

export function handleError(error: any) {
  if (error instanceof AxiosError) {
    console.error("Error in Axios request:", error.message);
    console.error("Response data:", error.response?.data);
  } else {
    console.error("Unexpected error occurred:", error);
  }
}
