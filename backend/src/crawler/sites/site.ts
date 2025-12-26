export interface Site {
  fetchData(repoUrl: string): Promise<{
    content: string;
    stars: number;
    lastCommit: string;
  }>;
  userAgent?: string;
}
