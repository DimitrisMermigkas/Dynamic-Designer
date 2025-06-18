import useFetch from "../../hooks/useFetch";
import { RSSFeed as RSSFeedConfig } from "@hella_project/common/validation/schemaDesigner";

// const link = "https://feeds.bbci.co.uk/news/world/rss.xml";
// const link = "https://www.theguardian.com/uk/rss";

export default function useRSSFeedHandler(config: RSSFeedConfig) {
  const { json } = useFetch<{ result: any[] }>(
    process.env.REACT_APP_API_URL + "/api/v1/clients/rss/getRssFeed",
    {
      method: "POST",
      body: JSON.stringify({ url: config.settings.link }),
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!json || !Array.isArray(json?.result)) return null;
  // TODO max items from config
  const data = json.result.map((item) => item.title).slice(0, 20);
  return data;
}
