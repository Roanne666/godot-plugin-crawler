import OpenAI from "openai";
import { Asset } from "./types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AI_API_KEY, AI_BASE_URL, AI_MODEL, SUMMARIZE_PROMPT } from "./config";

const openai = new OpenAI({
  baseURL: AI_BASE_URL,
  apiKey: AI_API_KEY,
});

export async function summarize(asset: Asset): Promise<string> {
  if (asset.repoContent.trim().length === 0) return "";

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SUMMARIZE_PROMPT,
    },
    {
      role: "user",
      content: asset.repoContent,
    },
  ];

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages,
  });

  return response.choices[0].message.content ?? "";
}
