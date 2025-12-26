export interface Asset {
  id?: number;
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

export interface ProcessingStats {
  totalProcessed: number;
  currentPage: number;
  totalPages: number;
  skipped: number;
  errors: number;
}
