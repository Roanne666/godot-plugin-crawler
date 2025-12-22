import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const MAX_PAGE = parseInt(process.env.MAX_PAGE || "0");
export const MAX_ASSETS = parseInt(process.env.MAX_ASSETS || "0");

export const ASSET_URL = "https://godotengine.org/asset-library/asset";

export const OUTPUT_FILE = process.env.OUTPUT_FILE || path.resolve(__dirname, "../output/assets.json");
export const DATABASE_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, "../data/plugins.db");

export const SERVER_PORT = parseInt(process.env.SERVER_PORT || "3001");
export const PROXY = process.env.PROXY || "";

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
export const GITHUB_USER_AGENT = process.env.GITHUB_USER_AGENT || "";

export const GITLAB_TOKEN = process.env.GITLAB_TOKEN || "";
export const GITLAB_USER_AGENT = process.env.GITLAB_USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

export const USE_AI = (process.env.USE_AI || "0") === "1";
export const AI_BASE_URL = process.env.AI_BASE_URL || "";
export const AI_API_KEY = process.env.AI_API_KEY || "";
export const AI_MODEL = process.env.AI_MODEL || "";
export const SUMMARIZE_PROMPT = process.env.SUMMARIZE_PROMPT || "";

export const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "3");
export const RETRY_DELAY_BASE = parseInt(process.env.RETRY_DELAY_BASE || "1000");

export const FRONTEND_DIST_PATH = path.resolve(__dirname, "../../frontend/dist");
export const HAS_FRONTEND_DIST = fs.existsSync(FRONTEND_DIST_PATH);
