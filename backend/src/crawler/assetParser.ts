import * as cheerio from "cheerio";
import { Asset } from "../types";

function getSupportLevel($element: cheerio.Cheerio<any>): string {
  const successLabel = $element.find(".asset-tags .label-success").text().trim();
  const dangerLabel = $element.find(".asset-tags .label-danger").text().trim();
  const defaultLabel = $element.find(".asset-tags .label-default").text().trim();

  if (dangerLabel) return "Featured";
  if (successLabel) return "Community";
  if (defaultLabel) return "Testing";

  return "";
}

export function parseAssetsFromPage(html: string): Asset[] {
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

export function extractRepoUrlFromAssetPage(html: string): string | undefined {
  const $ = cheerio.load(html);
  return $("a.btn.btn-default").attr("href");
}
