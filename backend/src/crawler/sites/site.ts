import * as cheerio from "cheerio";
import { fetchWithRetry } from "../httpClient";

export interface Site {
  fetchPage(repoUrl: string): Promise<cheerio.CheerioAPI>;
  getContent($: cheerio.CheerioAPI): string;
  getStars($: cheerio.CheerioAPI): number;
  getLastCommit($: cheerio.CheerioAPI): string;
}

export const fetchCheerio = async (repoUrl: string): Promise<cheerio.CheerioAPI> => {
  const response = await fetchWithRetry(repoUrl);
  if (!response) {
    throw new Error(`Failed to fetch page: ${repoUrl}`);
  }
  
  // Convert response to string
  const html = typeof response === 'string' ? response : String(response);
  
  return cheerio.load(html);
};
