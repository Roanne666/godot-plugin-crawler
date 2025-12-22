import * as cheerio from "cheerio";
import { fetchWithRetry } from "../httpClient";
import { Site } from "./site";

class CodebergSite implements Site {
  userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

  async fetchData(repoUrl: string): Promise<{
    content: string;
    stars: number;
    lastCommit: string;
  }> {
    // Fetch HTML page
    const response = await fetchWithRetry(repoUrl, { userAgent: this.userAgent });
    if (!response) {
      throw new Error(`Failed to fetch page: ${repoUrl}`);
    }

    // Convert response to string and load cheerio
    const html = typeof response === "string" ? response : String(response);
    const $ = cheerio.load(html);

    // Extract content from README
    const content = $("#readme .markup.markdown").text().trim();

    // Extract stars
    const starsText = $('a[href*="/stars"]').first().text().trim();
    const stars = starsText ? parseInt(starsText) : 0;
    const finalStars = isNaN(stars) ? 0 : stars;

    // Extract last commit date
    const lastCommit = $(".commit-list .age relative-time").attr("datetime") || "";

    return {
      content,
      stars: finalStars,
      lastCommit,
    };
  }
}

export default new CodebergSite();
