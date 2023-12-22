export type SuccessfulFetchResult<T> = {
  data: T;
  ok: true;
  status: number;
  problem: null;
  errorData: null;
};

export type UnsuccessfulFetchResult = {
  data: null;
  ok: false;
} & FetchErrorResponse;

export type FetchErrorResponse = {
  status: number;
  problem: string;
  errorData: unknown;
};

export type FetchResult<T> = SuccessfulFetchResult<T> | UnsuccessfulFetchResult;

export default async function safeFetch<T = any>(
  url: RequestInfo,
  options?: RequestInit
): Promise<FetchResult<T>> {
  let response: Response | undefined;
  try {
    response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }
    const data: T = await response.json();
    return {
      data,
      ok: true,
      status: response.status,
      problem: null,
      errorData: null,
    };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(errorMessage);
    return {
      data: null,
      ok: false,
      status: response?.status ?? 500,
      problem: errorMessage,
      errorData: response ? await response.json() : null,
    };
  }
}
