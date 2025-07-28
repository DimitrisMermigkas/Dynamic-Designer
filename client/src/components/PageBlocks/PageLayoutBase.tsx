import { Theme, useTheme } from "@mui/material";
import React from "react";
import styled from "styled-components";

const titleHeight = 72;

const PageContentDiv = styled.div<{
  $hasPaddingTop?: boolean;
  $theme: Theme;
}>`
  height: ${({ $hasPaddingTop }) =>
    $hasPaddingTop ? "100%" : `calc(100% - ${titleHeight}px)`};
  padding: 40px;
  padding-top: ${({ $hasPaddingTop }) => ($hasPaddingTop ? "40px" : "0")};
  overflow: auto;
  display: flex;
  box-sizing: border-box;
  background: ${({ $theme }) => $theme.palette.background.defaultDarkest};
`;

type PageLayoutBaseProps = {
  title?: string;
  toolbarContent?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const PageLayoutBase = ({
  title,
  toolbarContent,
  children,
  style,
}: PageLayoutBaseProps) => {
  const theme = useTheme();
  return (
    <>
      <PageContentDiv
        style={style}
        $hasPaddingTop={!(title || toolbarContent)}
        $theme={theme}
      >
        {children}
      </PageContentDiv>
    </>
  );
};

export default PageLayoutBase;
