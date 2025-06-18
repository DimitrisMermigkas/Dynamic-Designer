import React from "react";
import RSSFeed from "./RSSFeed";
import { RSSFeed as RSSFeedConfig } from "@hella_project/common/validation/schemaDesigner";
import useRSSFeedHandler from "./RSSFeed.handler";

const RSSFeedWrapper = ({ config }: { config: RSSFeedConfig }) => {
  const data = useRSSFeedHandler(config);

  if (!data) return null;
  return <RSSFeed config={config} data={data} position="absolute" />;
};

export default RSSFeedWrapper;
