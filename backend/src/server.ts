import express from "express";
import cors from "cors";
import path from "path";
import { exec } from "child_process";
import { SERVER_PORT, HAS_FRONTEND_DIST, FRONTEND_DIST_PATH } from "./config";
import { getAllAssets, updateFavoriteStatus, initDatabase, getAssetByUrl, insertOrUpdateAsset } from "./database";
import { fetchAndProcessAssetDetails } from "./crawler";

const app = express();

const refreshQueue = new Set<string>();

app.use(cors());
app.use(express.json());

if (HAS_FRONTEND_DIST) {
  app.use(express.static(FRONTEND_DIST_PATH));
  console.log("Frontend dist folder detected, enabling static file service");
}

app.get("/api/assets", async (req, res) => {
  try {
    const assets = await getAllAssets();
    res.json(assets);
  } catch (error) {
    console.error("Error reading assets:", error);
    res.status(500).json({ error: "Failed to read assets" });
  }
});

app.post("/api/assets/favorite", async (req, res) => {
  try {
    const { url, favorite } = req.body;

    if (!url || typeof favorite !== "boolean") {
      return res.status(400).json({ error: "Invalid request: url and favorite are required" });
    }

    const updatedAsset = await updateFavoriteStatus(url, favorite);

    if (!updatedAsset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error("Error updating favorite:", error);
    res.status(500).json({ error: "Failed to update favorite status" });
  }
});

app.post("/api/assets/refresh", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Invalid request: url is required" });
    }

    // Check if already in queue
    if (refreshQueue.has(url)) {
      return res.status(429).json({ error: "Plugin is already being refreshed" });
    }

    // Get existing asset
    const existingAsset = await getAssetByUrl(url);

    if (!existingAsset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    // Add to queue
    refreshQueue.add(url);
    console.log(`Force refreshing plugin: ${existingAsset.title}`);

    try {
      // Re-crawl plugin details (force update summary)
      const refreshedAsset = await fetchAndProcessAssetDetails(existingAsset);
      refreshedAsset.crawledAt = new Date().toISOString(); // Update crawl time
      refreshedAsset.favorite = existingAsset.favorite; // Keep favorite status

      // Save to database
      await insertOrUpdateAsset(refreshedAsset);

      console.log(`Plugin refresh completed: ${refreshedAsset.title}`);
      res.json(refreshedAsset);
    } finally {
      // Remove from queue regardless of success or failure
      refreshQueue.delete(url);
    }
  } catch (error) {
    console.error("Error refreshing plugin:", error);
    res.status(500).json({ error: "Failed to refresh plugin" });
  }
});

export async function startServer() {
  await initDatabase();
  console.log("Database initialization completed");

  if (HAS_FRONTEND_DIST) {
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(FRONTEND_DIST_PATH, "index.html"));
    });
  }

  app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
    
    const url = `http://localhost:${SERVER_PORT}`;
    const start = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    
    exec(`${start} ${url}`, (error) => {
      if (error) {
        console.log(`Failed to open browser automatically: ${error.message}`);
        console.log(`Please open manually: ${url}`);
      } else {
        console.log(`Opened browser at: ${url}`);
      }
    });
  });
}

if (require.main === module) {
  startServer();
}
