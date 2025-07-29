import React from "react";
import RssFeedIcon from "../../assets/images/material/rss_feed.svg";
import LanguageIcon from "../../assets/images/material/language.svg";
import RadioIcon from "../../assets/images/material/radio.svg";
import { css, keyframes } from "@emotion/css";
import { RSSFeed as RSSFeedConfig } from "@client/schemas/schemaDesigner";

// import rainy from "../../assets/images/rainy-5.svg";
// const RssFeedIcon = ({ ...props }) => <img src={rainy} />,
//   LanguageIcon = ({ ...props }) => <img src={rainy} />,
//   RadioIcon = ({ ...props }) => <img src={rainy} />;

export const NewsTickerSettings = {
  animationType: "scrollLeft",
  tickerColor: "#e51a29",
  tickerTextColor: "#1C1D21",
  tickerIcon: "rss",
  newsColor: "#1C1D21",
  newsTextColor: "#e51a29",
  currentWidth: "100%",
  currentHeight: "100px",
  animationDuration: 20,
  fontSize: 32,
  fontFamily: "Poppins, sans-serif",
  tickerText: "Latest News",
  link: "",
  newsArray: [
    ".OVERSEE Oversee your stores at your fingertips",
    ".CREATE Create fascinating customer experiences",
    ".LAUNCH Launch successful campaigns and trigger multimedia",
  ],
};

const ScrollingAnimationLeft = keyframes`
  0% {
    transform: translateX(1000px);
  }
  100% {
    transform: translateX(-100%);
  }
`;
const ScrollingAnimationRight = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0%);
  }
`;
const SlideshowBottomToTop = keyframes`
  0% {
    opacity: 0;
    transform: translateY(100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;
const SlideshowTopToBottom = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;
const pickAnimation = (value: string) => {
  if (value === "scrollLeft") return ScrollingAnimationLeft;
  else if (value === "scrollRight") return ScrollingAnimationRight;
  else if (value === "slideTop") return SlideshowTopToBottom;
  else if (value === "slideBottom") return SlideshowBottomToTop;
};

const generateClasses = ({
  position,
  left,
  top,
  currentHeight,
  currentWidth,
  fontSize,
  tickerColor,
  newsTextColor,
  newsColor,
  fontFamily,
  currentAnimation,
  newsArray,
  animationDuration,
}: any) => ({
  app: css`
    position: ${position || "relative"};
    left: ${left}px;
    top: ${top}px;
    height: ${currentHeight === "100%" ? "100%" : currentHeight + "px"};
    width: ${currentWidth === "100%" || currentWidth > 1150
      ? "100%"
      : currentWidth + "px"};
    text-align: center;
    display: flex;
    box-sizing: border-box;
    background-color: ${tickerColor};
  `,
  container: css`
    display: flex;
    width: calc(100% - 1px);
    height: 100%;
    overflow: hidden;
  `,
  heading: css`
    margin: 8px;
    display: flex;
    flex: 0 0 20%;
    align-items: center;
    justify-content: space-evenly;
  `,
  newsTicker: css`
    flex: 0 0 81%;
    overflow: hidden;
    margin: 1px;
    border-radius: 6px;
    background: ${newsColor};
    border-radius: 0px 6px 6px 0px;
    margin-left: 0;
    transform: skewX(-20deg);
    display: flex;
    align-items: center;
    width: 120%;
    :before, :after: {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      width: 7%;
      z-index: 2;
    }
    :before: {
      left: 0;
      background: linear-gradient(
        to left,
        rgba(255, 255, 255, 0),
        ${newsColor}
      );
    }
    :after: {
      right: 16%;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0),
        ${newsColor}
      );
      transform: skewX(20deg);
    }
  `,
  tickerText: css`
    color: ${newsTextColor};
    font-size: ${fontSize}px;
    font-family: ${fontFamily};
    transform: skewX(20deg);
    padding: 10px;
    margin-left: 100px;
  `,
  tickerContainer: css`
    display: flex;
    white-space: nowrap;
    animation: ${currentAnimation}
      ${(100 * (newsArray?.length || 1)) / animationDuration}s linear infinite;
  `,
});

const NewsTickerSettingsHandling = (
  props: RSSFeedConfig & { data: RSSFeedProps["data"] }
) => {
  const left = props.left ?? 0;
  const top = props.top ?? 0;
  const animationType =
    props.settings.animationType ?? NewsTickerSettings.animationType;
  const tickerColor =
    props.settings.tickerColor ?? NewsTickerSettings.tickerColor;
  const newsColor = props.settings.newsColor ?? NewsTickerSettings.newsColor;
  const currentWidth = props?.width ?? "100%";
  const currentHeight = props?.height ?? "100%";
  const currentAnimation = pickAnimation(animationType);
  const animationDuration =
    props.settings.animationDuration ?? NewsTickerSettings.animationDuration;
  const fontSize = props.settings.fontSize ?? NewsTickerSettings.fontSize;
  const fontFamily = props.settings.fontFamily ?? NewsTickerSettings.fontFamily;

  const tickerTextColor =
    props.settings.tickerTextColor ?? NewsTickerSettings.tickerTextColor;
  const newsTextColor =
    props.settings.newsTextColor ?? NewsTickerSettings.newsTextColor;

  const tickerText = props.settings.tickerText ?? NewsTickerSettings.tickerText;
  const newsArray = props.data ?? NewsTickerSettings.newsArray;

  let tickerIcon = (
    <img src={RssFeedIcon} alt="" style={{ color: tickerTextColor }} />
  );
  if (props.settings.tickerIcon) {
    if (props.settings.tickerIcon === "rss") {
      tickerIcon = (
        <img src={RssFeedIcon} alt="" style={{ color: tickerTextColor }} />
      );
    } else if (props.settings.tickerIcon === "globe") {
      tickerIcon = (
        <img src={LanguageIcon} alt="" style={{ color: tickerTextColor }} />
      );
    } else
      tickerIcon = (
        <img src={RadioIcon} alt="" style={{ color: tickerTextColor }} />
      );
  }
  return {
    left,
    top,
    tickerColor,
    newsColor,
    currentWidth,
    currentHeight,
    currentAnimation,
    fontSize,
    animationDuration,
    fontFamily,
    tickerIcon,
    tickerTextColor,
    newsTextColor,
    tickerText,
    newsArray,
  };
};

type RSSFeedProps = {
  config: RSSFeedConfig;
  data?: string[] | null;
  preview?: boolean;
  position?: string;
};

export const RSSFeed = ({ config, preview, data, position }: RSSFeedProps) => {
  const {
    left,
    top,
    tickerColor,
    newsColor,
    currentWidth,
    currentHeight,
    currentAnimation,
    fontSize,
    animationDuration,
    fontFamily,
    tickerIcon,
    tickerTextColor,
    newsTextColor,
    tickerText,
    newsArray,
  } = NewsTickerSettingsHandling({ ...config, data });

  const classes = generateClasses({
    position,
    left,
    top,
    currentHeight: currentHeight,
    currentWidth: currentWidth,
    fontSize: fontSize,
    tickerColor: tickerColor,
    newsTextColor: newsTextColor,
    newsColor: newsColor,
    fontFamily: fontFamily,
    currentAnimation,
    animationDuration,
    newsArray,
  });

  return (
    <div
      className={classes.app}
      style={preview ? { maxWidth: "1150px" } : undefined}
    >
      <div className={classes.container}>
        <div className={classes.heading}>
          {tickerIcon}
          <span
            style={{
              color: tickerTextColor,
              fontSize: fontSize,
              fontFamily: fontFamily,
            }}
          >
            {tickerText}
          </span>
        </div>
        <div className={classes.newsTicker}>
          <div className={classes.tickerContainer}>
            {newsArray.map((news) => (
              <span className={classes.tickerText}>{news}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSSFeed;
