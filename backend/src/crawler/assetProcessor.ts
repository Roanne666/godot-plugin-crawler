import { Asset } from "../types";
import { USE_AI } from "../config";
import { summarize } from "../summarizer";
import {
  fetchAssetPage,
  fetchGithubApi,
  fetchGithubPage,
  getGithubStars,
  getGithubLastCommit,
  getGithubContent,
} from "./githubService";

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
