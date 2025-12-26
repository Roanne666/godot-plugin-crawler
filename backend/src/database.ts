import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import { Asset } from "./types";

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const dbPath = path.resolve(__dirname, "../data/plugins.db");

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      author TEXT,
      authorUrl TEXT,
      version TEXT,
      lastUpdated TEXT,
      category TEXT,
      godotVersion TEXT,
      supportLevel TEXT,
      license TEXT,
      iconUrl TEXT,
      repoUrl TEXT,
      repoContent TEXT,
      summary TEXT,
      stars INTEGER DEFAULT 0,
      lastCommit TEXT,
      crawledAt TEXT,
      favorite INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_url ON assets(url);
    CREATE INDEX IF NOT EXISTS idx_category ON assets(category);
    CREATE INDEX IF NOT EXISTS idx_stars ON assets(stars);
    CREATE INDEX IF NOT EXISTS idx_favorite ON assets(favorite);
    CREATE INDEX IF NOT EXISTS idx_crawled_at ON assets(crawledAt);
  `);

  return db;
}

export async function getAllAssets(): Promise<Asset[]> {
  const database = await initDatabase();
  const assets = await database.all("SELECT * FROM assets ORDER BY stars DESC");
  return assets.map(mapRowToAsset);
}

export async function getAssetByUrl(url: string): Promise<Asset | undefined> {
  const database = await initDatabase();
  const row = await database.get("SELECT * FROM assets WHERE url = ?", url);
  return row ? mapRowToAsset(row) : undefined;
}

export async function insertOrUpdateAsset(asset: Asset): Promise<void> {
  const database = await initDatabase();

  const existing = await getAssetByUrl(asset.url);

  if (existing) {
    await database.run(
      `
      UPDATE assets SET
        title = ?, author = ?, authorUrl = ?, version = ?, lastUpdated = ?,
        category = ?, godotVersion = ?, supportLevel = ?, license = ?,
        iconUrl = ?, repoUrl = ?, repoContent = ?, summary = ?,
        stars = ?, lastCommit = ?, crawledAt = ?, updated_at = CURRENT_TIMESTAMP
      WHERE url = ?
    `,
      [
        asset.title,
        asset.author,
        asset.authorUrl,
        asset.version,
        asset.lastUpdated,
        asset.category,
        asset.godotVersion,
        asset.supportLevel,
        asset.license,
        asset.iconUrl,
        asset.repoUrl,
        asset.repoContent,
        asset.summary,
        asset.stars,
        asset.lastCommit,
        asset.crawledAt,
        asset.url,
      ]
    );
  } else {
    await database.run(
      `
      INSERT INTO assets (
        title, url, author, authorUrl, version, lastUpdated,
        category, godotVersion, supportLevel, license,
        iconUrl, repoUrl, repoContent, summary,
        stars, lastCommit, crawledAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        asset.title,
        asset.url,
        asset.author,
        asset.authorUrl,
        asset.version,
        asset.lastUpdated,
        asset.category,
        asset.godotVersion,
        asset.supportLevel,
        asset.license,
        asset.iconUrl,
        asset.repoUrl,
        asset.repoContent,
        asset.summary,
        asset.stars,
        asset.lastCommit,
        asset.crawledAt,
      ]
    );
  }
}

export async function updateFavoriteStatus(url: string, favorite: boolean): Promise<Asset | undefined> {
  const database = await initDatabase();

  await database.run(
    "UPDATE assets SET favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE url = ?",
    favorite ? 1 : 0,
    url
  );

  return await getAssetByUrl(url);
}

function mapRowToAsset(row: any): Asset {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    author: row.author,
    authorUrl: row.authorUrl,
    version: row.version,
    lastUpdated: row.lastUpdated,
    category: row.category,
    godotVersion: row.godotVersion,
    supportLevel: row.supportLevel,
    license: row.license,
    iconUrl: row.iconUrl,
    repoUrl: row.repoUrl,
    repoContent: row.repoContent,
    summary: row.summary,
    stars: row.stars,
    lastCommit: row.lastCommit,
    crawledAt: row.crawledAt,
    createdAt: row.created_at,
    favorite: Boolean(row.favorite),
  };
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
