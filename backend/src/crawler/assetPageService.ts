import { ASSET_URL } from "../config";
import { Asset } from "../types";
import { fetchWithRetry } from "./httpClient";
import { parseAssetsFromPage } from "./assetParser";

export async function fetchAssetsForPage(page: number): Promise<Asset[]> {
  const url = `${ASSET_URL}?sort=updated&page=${page}`;
  const response = await fetchWithRetry(url);

  if (!response) {
    console.error(`Failed to fetch page ${page}`);
    return [];
  }

  return parseAssetsFromPage(response as string);
}
