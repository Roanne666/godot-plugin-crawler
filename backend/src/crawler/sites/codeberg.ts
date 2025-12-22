import { Site, fetchCheerio } from "./site";
import * as cheerio from "cheerio";

class CodebergSite implements Site {
  fetchPage = fetchCheerio;

  getContent($: cheerio.CheerioAPI): string {
    const content = $("#readme .markup.markdown").text();

    if (!content) {
      return "";
    }

    return content.trim();
  }

  getStars($: cheerio.CheerioAPI): number {
    const stars = $('a[href*="/stars"]').first().text();

    if (!stars) {
      return 0;
    }

    const starCount = parseInt(stars.trim());
    return isNaN(starCount) ? 0 : starCount;
  }

  getLastCommit($: cheerio.CheerioAPI): string {
    const lastCommit = $(".commit-list .age relative-time").attr("datetime");

    if (!lastCommit) {
      return "";
    }

    return lastCommit;
  }
}

export default new CodebergSite();
