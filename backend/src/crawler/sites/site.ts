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
