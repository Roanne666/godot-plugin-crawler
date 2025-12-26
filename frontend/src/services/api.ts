import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Asset {
  title: string;
  url: string;
  author: string;
  authorUrl: string;
  version: string;
  lastUpdated: string;
  category: string;
  godotVersion: string;
  supportLevel: string;
  license: string;
  iconUrl: string;
  repoUrl: string;
  repoContent: string;
  summary: string;
  stars: number;
  lastCommit: string;
  crawledAt?: string;
  createdAt?: string;
  favorite?: boolean;
}

export const assetApi = {
  getAll: async (): Promise<Asset[]> => {
    const response = await api.get("/assets");
    return response.data;
  },

  toggleFavorite: async (url: string, favorite: boolean): Promise<void> => {
    await api.post("/assets/favorite", { url, favorite });
  },

  refreshPlugin: async (url: string): Promise<Asset> => {
    const response = await api.post("/assets/refresh", { url });
    return response.data;
  },
};
