import * as cheerio from "cheerio";
import { Asset } from "../types";
import { USE_AI, ASSET_URL } from "../config";
import { summarize } from "../summarizer";
import { fetchWithRetry } from "./httpClient";
import { Site } from "./sites/site";
import GithubSite from "./sites/github";
import CodebergSite from "./sites/codeberg";

const siteMppings: { [key: string]: Site } = {
  "github.com": GithubSite,
  "codeberg.org": CodebergSite,
};

const getSite = (repoUrl: string): Site | undefined => {
  for (const domain in siteMppings) {
    if (repoUrl.includes(domain)) {
      return siteMppings[domain];
    }
  }
  return undefined;
};

export const crawlAsset = async (asset: Asset): Promise<Asset> => {
  const repoUrl = await fetchAssetPage(asset.url);

  if (!repoUrl) {
    return asset;
  }

  const site = getSite(repoUrl);

  if (!site) {
    return asset;
  }

  const $ = await site.fetchPage(repoUrl);
  const apiData = await (site as any).fetchApi?.(repoUrl);

  const content = site.getContent($);
  const stars = site.getStars(apiData || $);
  const lastCommit = site.getLastCommit(apiData || $);

  return {
    ...asset,
    repoUrl,
    repoContent: content,
    stars,
    lastCommit,
  };
};

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

  const site = getSite(repoUrl);
  if (!site) {
    return asset;
  }

  try {
    const $ = await site.fetchPage(repoUrl);
    const apiData = await (site as any).fetchApi?.(repoUrl);

    if (apiData === 404 || apiData === 403) {
      asset.repoContent = "error";
      return asset;
    }

    if ($) {
      asset.repoContent = site.getContent($);
    } else {
      asset.repoContent = "error";
      return asset;
    }

    // Use API data if available, otherwise use page data
    const dataSource = apiData || $;
    asset.stars = site.getStars(dataSource);
    asset.lastCommit = site.getLastCommit(dataSource);

    const contentChanged = existingAsset?.repoContent !== asset.repoContent;

    if (!USE_AI) return asset;

    if (existingAsset && !contentChanged) {
      asset.summary = existingAsset.summary;
    } else {
      asset.summary = await summarize(asset);
    }
  } catch (error) {
    console.error(`Error processing ${repoUrl}:`, error);
    asset.repoContent = "error";
    return asset;
  }

  return asset;
}
