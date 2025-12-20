import * as cheerio from "cheerio";
import { fetchWithRetry } from "./httpClient";
import { extractRepoUrlFromAssetPage } from "./assetParser";

export async function fetchAssetPage(url: string): Promise<string | undefined> {
  const response = await fetchWithRetry(url, { skipOn404: true });
  if (!response) return undefined;

  return extractRepoUrlFromAssetPage(response as string);
}

export async function fetchGithubPage(url: string): Promise<cheerio.CheerioAPI | undefined> {
  const response = await fetchWithRetry(url, { skipOn404: true });
  if (!response) return undefined;

  return cheerio.load(response as string);
}

export async function fetchGithubApi(url: string): Promise<any | undefined> {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!match) return undefined;

  const [, user, repo] = match;
  const apiUrl = `https://api.github.com/repos/${user}/${repo}`;

  return await fetchWithRetry(apiUrl, { isGithubApi: true });
}

export function getGithubContent($: cheerio.CheerioAPI): string {
  try {
    return $("article.markdown-body.entry-content.container-lg").text() || "";
  } catch (error) {
    console.error("Error getting page content:", error);
    return "";
  }
}

export function getGithubStars(apiData: any): number {
  try {
    return apiData.stargazers_count || 0;
  } catch (error) {
    console.error("Error getting github stars:", error);
    return 0;
  }
}

export function getGithubLastCommit(apiData: any): string {
  try {
    return apiData.updated_at || "";
  } catch (error) {
    console.error("Error getting github last commit:", error);
    return "";
  }
}
