import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { PROXY, GITHUB_USER_AGENT, GITHUB_TOKEN, GITLAB_USER_AGENT, GITLAB_TOKEN, MAX_RETRIES, RETRY_DELAY_BASE } from "../config";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const client = axios.create({
  httpsAgent: PROXY ? new HttpsProxyAgent(PROXY) : null,
  headers: {
    "User-Agent": GITHUB_USER_AGENT,
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "X-Github-Api-Version": "2022-11-28",
  },
});

interface FetchOptions {
  isGithubApi?: boolean;
  isGitlabApi?: boolean;
  skipOn404?: boolean;
  userAgent?: string;
}

export async function fetchWithRetry<T>(url: string, options?: FetchOptions): Promise<T | undefined> {
  let lastError: any;

  // Determine headers based on API type
  let headers: Record<string, string> = {
    "User-Agent": options?.userAgent || GITHUB_USER_AGENT,
  };

  if (options?.isGithubApi) {
    headers = {
      ...headers,
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-Github-Api-Version": "2022-11-28",
    };
  } else if (options?.isGitlabApi) {
    headers = {
      ...headers,
      Authorization: `Bearer ${GITLAB_TOKEN}`,
    };
  }

  const requestClient = axios.create({
    httpsAgent: PROXY ? new HttpsProxyAgent(PROXY) : null,
    headers,
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await requestClient.get(url);
      return response.data as T;
    } catch (error: any) {
      lastError = error;

      // If it's 404 or 403, decide whether to return directly based on configuration
      if (error.response?.status === 404) {
        if (options?.skipOn404) return undefined;
        return error.response?.status || error.status;
      }

      if (error.response?.status === 403) {
        return error.response?.status || error.status;
      }

      const isLastAttempt = attempt === MAX_RETRIES;
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1); // Exponential backoff

      if (!isLastAttempt) {
        console.warn(`Attempt ${attempt} failed for ${url}. Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        console.error(`All ${MAX_RETRIES} attempts failed for ${url}.`);
      }
    }
  }

  console.error(`Error fetching ${url}:`, lastError);
  return undefined;
}

export { client as httpClient };
