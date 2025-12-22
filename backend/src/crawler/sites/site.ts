import * as cheerio from "cheerio";
import { fetchWithRetry } from "../httpClient";

export interface Site {
  fetchData(repoUrl: string): Promise<{
    content: string;
    stars: number;
    lastCommit: string;
  }>;
  userAgent?: string;
}

export const fetchCheerio = async (repoUrl: string, userAgent?: string): Promise<cheerio.CheerioAPI> => {
  const response = await fetchWithRetry(repoUrl, { userAgent });
  if (!response) {
    throw new Error(`Failed to fetch page: ${repoUrl}`);
  }

  // Convert response to string
  const html = typeof response === "string" ? response : String(response);

  return cheerio.load(html);
};
