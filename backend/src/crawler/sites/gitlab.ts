import * as cheerio from "cheerio";
import { fetchWithRetry } from "../httpClient";
import { Site } from "./site";
import { GITLAB_USER_AGENT } from "../../config";

class GitlabSite implements Site {
  userAgent = GITLAB_USER_AGENT;

  async fetchData(repoUrl: string): Promise<{
    content: string;
    stars: number;
    lastCommit: string;
  }> {
    // Extract user and repo path from URL (support nested groups/projects)
    const match = repoUrl.match(/gitlab\.com\/(.+?)(?:\?|#|$)/);
    if (!match) {
      throw new Error(`Invalid GitLab URL: ${repoUrl}`);
    }

    const [, repoPath] = match; // This could be "user/repo" or "group/subgroup/project"

    // Fetch API data to get project info
    const apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(repoPath)}`;
    const apiData: any = await fetchWithRetry(apiUrl, { isGitlabApi: true });

    // Try to fetch README from raw URL
    let content = "";
    if (apiData?.default_branch) {
      const branch = apiData.default_branch || "main";
      const readmeNames = ["README.md", "readme.md", "README", "readme"];

      for (const readmeName of readmeNames) {
        const rawUrl = `https://gitlab.com/${repoPath}/-/raw/${branch}/${readmeName}`;

        try {
          const readmeContent = await fetchWithRetry<string>(rawUrl, { skipOn404: true });
          if (
            readmeContent &&
            typeof readmeContent === "string" &&
            readmeContent !== "404" &&
            readmeContent !== "403"
          ) {
            content = readmeContent;
            break;
          }
        } catch (error) {
          // Continue to next README file
        }
      }
    }

    // Fallback to HTML parsing if README fetch failed
    if (!content) {
      const response = await fetchWithRetry(repoUrl, { userAgent: this.userAgent });
      if (response) {
        const html = typeof response === "string" ? response : String(response);
        const $ = cheerio.load(html);
        content = $(".file-content.js-markup-content.md").text().trim();
      }
    }

    // Extract data from API
    const stars = apiData?.star_count || 0;
    const lastCommit = apiData?.last_activity_at || "";

    return {
      content,
      stars,
      lastCommit,
    };
  }
}

export default new GitlabSite();
