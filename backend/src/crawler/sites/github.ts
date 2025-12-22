import * as cheerio from "cheerio";
import { fetchWithRetry } from "../httpClient";
import { Site, fetchCheerio } from "./site";

class GithubSite implements Site {
  fetchPage = fetchCheerio;

  async fetchApi(repoUrl: string): Promise<any | undefined> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!match) return undefined;

    const [, user, repo] = match;
    const apiUrl = `https://api.github.com/repos/${user}/${repo}`;

    return await fetchWithRetry(apiUrl, { isGithubApi: true });
  }

  getContent($: cheerio.CheerioAPI): string {
    const content = $("article.markdown-body.entry-content.container-lg").text();

    if (!content) {
      return "";
    }

    return content.trim();
  }

  getStars(apiData: any): number {
    return apiData.stargazers_count || 0;
  }

  getLastCommit(apiData: any): string {
    return apiData.pushed_at || "";
  }
}

export default new GithubSite();
