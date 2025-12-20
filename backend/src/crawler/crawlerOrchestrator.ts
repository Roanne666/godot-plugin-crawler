import { MAX_PAGE, MAX_ASSETS } from "../config";
import { Asset, ProcessingStats } from "../types";
import { getAssetByUrl, insertOrUpdateAsset } from "../database";
import { fetchAssetsForPage } from "./assetPageService";
import { fetchAndProcessAssetDetails } from "./assetProcessor";

export class CrawlerOrchestrator {
  private stats: ProcessingStats = {
    totalProcessed: 0,
    currentPage: 0,
    totalPages: MAX_PAGE + 1,
    skipped: 0,
    errors: 0,
  };

  async run(): Promise<ProcessingStats> {
    const today = new Date().toISOString().split("T")[0];

    console.log("Starting to crawl Godot plugins...");
    console.log(`Max pages: ${MAX_PAGE + 1}, Max assets: ${MAX_ASSETS}`);

    for (let page = 0; page <= MAX_PAGE && this.stats.totalProcessed < MAX_ASSETS; page++) {
      this.stats.currentPage = page;

      console.log(`Fetching page ${page + 1}/${this.stats.totalPages} resources...`);

      const assetsOnPage = await fetchAssetsForPage(page);

      if (assetsOnPage.length === 0) {
        console.log(`Page ${page + 1} has no resources, ending crawl`);
        break;
      }

      console.log(`Page ${page + 1} found ${assetsOnPage.length} resources`);

      await this.processAssetsOnPage(assetsOnPage, today);

      console.log(`Page ${page + 1} processing completed, current stats:`, this.getProgressString());
    }

    console.log(`Crawler completed! Final statistics:`, this.getProgressString());
    return this.stats;
  }

  private async processAssetsOnPage(assets: Asset[], today: string): Promise<void> {
    for (const asset of assets) {
      try {
        if (this.stats.totalProcessed >= MAX_ASSETS) {
          console.log(`Reached maximum processing count ${MAX_ASSETS}, stopping crawl`);
          break;
        }

        const existingAsset = await getAssetByUrl(asset.url);

        if (existingAsset && existingAsset.crawledAt && existingAsset.crawledAt.startsWith(today)) {
          console.log(`Skipping ${asset.title}`);
          this.stats.skipped++;
          continue;
        }

        console.log(`Processing: ${asset.title}`);
        const processedAsset = await fetchAndProcessAssetDetails(asset, existingAsset);
        processedAsset.crawledAt = new Date().toISOString();

        await insertOrUpdateAsset(processedAsset);
        console.log(`Saved to database: ${asset.title}`);

        this.stats.totalProcessed++;

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing asset ${asset.title}:`, error);
        this.stats.errors++;
      }
    }
  }

  private getProgressString(): string {
    return `Processed: ${this.stats.totalProcessed}, Skipped: ${this.stats.skipped}, Errors: ${this.stats.errors}`;
  }

  getStats(): ProcessingStats {
    return { ...this.stats };
  }
}
