import React from "react";
import styled from "styled-components";

const titleHeight = 72;

const PageContentDiv = styled.div<{ $hasPaddingTop?: boolean }>`
  height: ${({ $hasPaddingTop }) =>
    $hasPaddingTop ? "100%" : `calc(100% - ${titleHeight}px)`};
  padding: 40px;
  padding-top: ${({ $hasPaddingTop }) => ($hasPaddingTop ? "40px" : "0")};
  overflow: auto;
  display: flex;
  box-sizing: border-box;
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
  return (
    <>
      <PageContentDiv style={style} $hasPaddingTop={!(title || toolbarContent)}>
        {children}
      </PageContentDiv>
    </>
  );
};

export default PageLayoutBase;
