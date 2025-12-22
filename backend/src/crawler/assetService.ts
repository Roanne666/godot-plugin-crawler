import * as cheerio from "cheerio";
import { Asset } from "../types";
import { USE_AI, ASSET_URL } from "../config";
import { summarize } from "../summarizer";
import { fetchWithRetry } from "./httpClient";

// Asset parsing functions
function getSupportLevel($element: cheerio.Cheerio<any>): string {
  const successLabel = $element.find(".asset-tags .label-success").text().trim();
  const dangerLabel = $element.find(".asset-tags .label-danger").text().trim();
  const defaultLabel = $element.find(".asset-tags .label-default").text().trim();

  if (dangerLabel) return "Featured";
  if (successLabel) return "Community";
  if (defaultLabel) return "Testing";

  return "";
}

function parseAssetsFromPage(html: string): Asset[] {
  const $ = cheerio.load(html);
  const assets: Asset[] = [];
  $(".asset-item").each((_, element) => {
    const asset: Asset = {
      title: $(element).find(".asset-title h4").text().trim(),
      url: `https://godotengine.org${$(element).find(".asset-header").attr("href")}`,
      author: $(element).find(".asset-footer a").text().trim(),
      authorUrl: `https://godotengine.org/asset-library/asset${$(element).find(".asset-footer a").attr("href")}`,
      version: $(element).find(".asset-footer span").text().split("|")[0].trim(),
      lastUpdated: $(element).find(".asset-footer span").text().split("|")[1].trim(),
      category: $(element).find(".asset-tags .label-primary").text().trim(),
      godotVersion: $(element).find(".asset-tags .label-info").text().trim(),
      supportLevel: getSupportLevel($(element)),
      license: $(element).find(".asset-tags .label-default").text().trim(),
      iconUrl: $(element).find(".media-object").attr("src") || "",
      repoUrl: "",
      repoContent: "",
      summary: "",
      stars: 0,
      lastCommit: "",
    };
    assets.push(asset);
  });
  return assets;
}

function extractRepoUrlFromAssetPage(html: string): string | undefined {
  const $ = cheerio.load(html);
  return $("a.btn.btn-default").attr("href");
}

// Asset page fetching functions
async function fetchAssetPage(url: string): Promise<string | undefined> {
  const response = await fetchWithRetry(url, { skipOn404: true });
  if (!response) return undefined;

  return extractRepoUrlFromAssetPage(response as string);
}

async function fetchGithubPage(url: string): Promise<cheerio.CheerioAPI | undefined> {
  const response = await fetchWithRetry(url, { skipOn404: true });
  if (!response) return undefined;

  return cheerio.load(response as string);
}

async function fetchGithubApi(url: string): Promise<any | undefined> {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!match) return undefined;

  const [, user, repo] = match;
  const apiUrl = `https://api.github.com/repos/${user}/${repo}`;

  return await fetchWithRetry(apiUrl, { isGithubApi: true });
}

function getGithubContent($: cheerio.CheerioAPI): string {
  try {
    return $("article.markdown-body.entry-content.container-lg").text() || "";
  } catch (error) {
    console.error("Error getting page content:", error);
    return "";
  }
}

function getGithubStars(apiData: any): number {
  try {
    return apiData.stargazers_count || 0;
  } catch (error) {
    console.error("Error getting github stars:", error);
    return 0;
  }
}

function getGithubLastCommit(apiData: any): string {
  try {
    return apiData.updated_at || "";
  } catch (error) {
    console.error("Error getting github last commit:", error);
    return "";
  }
}

// Main service functions
export async function fetchAssetsForPage(page: number): Promise<Asset[]> {
  const url = `${ASSET_URL}?sort=updated&page=${page}`;
  const response = await fetchWithRetry(url);

  if (!response) {
    console.error(`Failed to fetch page ${page}`);
    return [];
  }

  return parseAssetsFromPage(response as string);
}

export async function fetchAndProcessAssetDetails(asset: Asset, existingAsset?: Asset): Promise<Asset> {
  const repoUrl = await fetchAssetPage(asset.url);
  if (!repoUrl) return asset;

  asset.repoUrl = repoUrl;
  if (repoUrl.includes("github.com")) {
    const apiData = await fetchGithubApi(repoUrl);
    if (apiData === 404) {
      asset.repoContent = "error";
      return asset;
    } else if (apiData === 403) {
      return asset;
    }

    const $ = await fetchGithubPage(repoUrl);
    if ($) {
      asset.repoContent = getGithubContent($);
    } else {
      asset.repoContent = "error";
      return asset;
    }

    asset.stars = getGithubStars(apiData);
    asset.lastCommit = getGithubLastCommit(apiData);

    const contentChanged = existingAsset?.repoContent !== asset.repoContent;

    if (!USE_AI) return asset;

    if (existingAsset && !contentChanged) {
      asset.summary = existingAsset.summary;
    } else {
      asset.summary = await summarize(asset);
    }
  }
  return asset;
}