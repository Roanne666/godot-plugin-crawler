import * as cheerio from "cheerio";
import { fetchWithRetry } from "../httpClient";
import { Site } from "./site";
import { GITHUB_USER_AGENT } from "../../config";

class GithubSite implements Site {
  userAgent = GITHUB_USER_AGENT;

  async fetchData(repoUrl: string): Promise<{
    content: string;
    stars: number;
    lastCommit: string;
  }> {
    // Fetch API data
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    let apiData: any;
    if (match) {
      const [, user, repo] = match;
      const apiUrl = `https://api.github.com/repos/${user}/${repo}`;
      apiData = await fetchWithRetry(apiUrl, { isGithubApi: true });
    }

    // Fetch HTML page
    const response = await fetchWithRetry(repoUrl, { userAgent: this.userAgent });
    if (!response) {
      throw new Error(`Failed to fetch page: ${repoUrl}`);
    }
    const html = typeof response === "string" ? response : String(response);
    const $ = cheerio.load(html);

    // Extract content from HTML
    const content = $("article.markdown-body.entry-content.container-lg").text().trim();

    // Extract data from API
    const stars = apiData?.stargazers_count || 0;
    const lastCommit = apiData?.pushed_at || "";

    return {
      content,
      stars,
      lastCommit,
    };
  }
}

export default new GithubSite();
