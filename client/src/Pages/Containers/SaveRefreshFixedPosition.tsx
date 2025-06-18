import React from "react";
import { Tooltip } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { isMobile } from "react-device-detect";
import * as ReactDOM from "react-dom";
import Button from "../../components/CustomButtons/Button";
import styled from "styled-components";
import { useTranslation } from "../Fabric/translationUtils";
import ButtonsContainer from "../../components/CustomButtons/ButtonsContainer";

const ContainerNonMobile = styled.div<{ $top?: boolean }>`
  position: absolute;
  right: 48px;
  top: ${({ $top }) => ($top ? "75px" : "141px")};
`;

const ContainerMobile = styled.div<{ $top?: boolean }>`
  position: absolute;
  display: flex;
  width: 100%;
  justify-content: center;
  left: 0;
  bottom: 0px;
  background: #282a2f;
  height: 74px;
`;

const ContainerCustomStyle = styled.div<{ $top?: boolean }>`
  right: ${({ style }) => (style?.position === "absolute" ? "50px" : "")};
`;

type SaveRefreshFixedPositionProps = {
  onRefresh?: () => void;
  onRefreshTxt?: string;
  onSave?: () => void;
  onSaveTxt?: string;
  disableSave?: boolean;
  disableRefresh?: boolean;
  top?: boolean;
  /** if type == minimized refresh button will appear as iconButton */
  type?: string;
  /** if onDefaultSettings exist, Default Settings Button will apprear too */
  onDefaultSettings?: () => void;
  onDefaultSettingsTxt?: string;
  style?: React.CSSProperties;
};

const SaveRefreshFixedPositionFunc = ({
  onRefresh,
  onRefreshTxt,
  onSave,
  onSaveTxt,
  disableSave,
  disableRefresh,
  top,
  type,
  onDefaultSettings,
  onDefaultSettingsTxt,
  style,
}: SaveRefreshFixedPositionProps) => {
  const { t } = useTranslation();
  let classNames = {};
  if (onRefresh && type === "minimized")
    classNames = { ...classNames, refresh: "RefreshMinimized" };
  if (onRefresh && type !== "minimized")
    classNames = { ...classNames, refresh: "Refresh" };
  if (onDefaultSettings)
    classNames = { ...classNames, defaultSet: "DefaultSettings" };
  if (onSave) classNames = { ...classNames, save: "Save" };

  const Container = isMobile
    ? ContainerMobile
    : style
    ? ContainerCustomStyle
    : ContainerNonMobile;

  return (
    <Container $top={top} style={!isMobile && style ? style : undefined}>
      <ButtonsContainer classNames={classNames}>
        {type === "minimized" && onRefresh && (
          <Tooltip title={t("ManagementPage.t.RevertChanges")}>
            <Button data-cy="btn-refresh" onClick={onRefresh} variant="rounded">
              <HistoryIcon />
            </Button>
          </Tooltip>
        )}
        {type === "minimized" && onDefaultSettings && (
          <Button onClick={onDefaultSettings} variant="outlined">
            {onDefaultSettingsTxt || t("ManagementPage.t.DefaultSettings")}
          </Button>
        )}
        {type !== "minimized" && onRefresh && (
          <Button
            data-cy="btn-refresh"
            onClick={disableRefresh ? null : onRefresh}
            variant="outlined"
          >
            {onRefreshTxt || t("GeneralTranslations.t.refresh")}
          </Button>
        )}
        {onSave && (
          <Button
            data-cy="btn-save"
            onClick={disableSave ? null : onSave}
            variant="contained"
            disabled={disableSave}
          >
            {onSaveTxt || t("GeneralTranslations.t.save")}
          </Button>
        )}
      </ButtonsContainer>
    </Container>
  );
};

const SaveRefreshFixedPosition = ({
  node,
  ...props
}: SaveRefreshFixedPositionProps & { node?: Element }) => {
  if (node)
    return ReactDOM.createPortal(
      <SaveRefreshFixedPositionFunc {...props} />,
      node
    );
  else return <SaveRefreshFixedPositionFunc {...props} />;
};

export default SaveRefreshFixedPosition;
