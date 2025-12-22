import { initDatabase } from "../database";
import { CrawlerOrchestrator } from "./crawlerOrchestrator";

export { fetchAndProcessAssetDetails } from "./assetService";

export async function startCrawler() {
  try {
    await initDatabase();
    console.log("Database initialization completed");

    const orchestrator = new CrawlerOrchestrator();
    const stats = await orchestrator.run();

    console.log("Crawler task completed, final statistics:", stats);
    return stats;
  } catch (error) {
    console.error("Crawler runtime error:", error);
    throw error;
  }
}

if (require.main === module) {
  startCrawler();
}
