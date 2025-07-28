import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import ColorPicker from "../../../../components/ColorPicker/ColorPicker";
import SelectOutlined from "../../../../components/Select/SelectOutlined";
import CustomTextField from "../../../../components/TextFields/CustomTextField";
import React from "react";
import { makeStyles, withStyles } from "tss-react/mui";
import useObjectCustomizationHandlers from "../FabricHandlers/ObjectCustomization.handlers";
import useOptionsHandlers from "../FabricHandlers/Options.handlers";
import OnIdleEditor from "./OnIdleEditor";
import { useTranslation } from "../../translationUtils";

const Accordion = withStyles(MuiAccordion, (_theme, _params, classes) => ({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    width: "100%",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    [`&.${classes.expanded}`]: {
      margin: 0,
    },
  },
  expanded: {},
}));

const AccordionSummary = withStyles(
  MuiAccordionSummary,
  (_theme, _params, classes) => ({
    root: {
      backgroundColor: "rgba(0, 0, 0, .03)",
      borderBottom: "1px solid rgba(0, 0, 0, .125)",
      marginBottom: -1,
      [`&.${classes.expanded}`]: { minHeight: "unset" },
    },
    content: {
      margin: "0",
      [`&.${classes.expanded}`]: {
        margin: "0",
      },
    },
    expanded: {},
  })
);

const AccordionDetails = withStyles(MuiAccordionDetails, (theme) => ({
  root: {
    // padding: "unset",
  },
}));

const useStyles = makeStyles()((theme) => ({
  root: {
    width: 45,
    height: 26,
    padding: 0,
  },
  switchBase: {
    padding: 1,
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: theme.palette.primary.main,
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.background.defaultDark,
        opacity: 1,
        border: "none",
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: theme.palette.background.defaultLight,
      border: `6px solid ${theme.palette.background.defaultDark}`,
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.background.defaultDark}`,
    backgroundColor: theme.palette.background.defaultDark,
    opacity: 1,
  },
}));

const CustomSwitch = (props: React.ComponentProps<typeof Switch>) => {
  const { classes } = useStyles();

  return (
    <Switch
      focusVisibleClassName={classes.root}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
      }}
      {...props}
    />
  );
};

/**
 * Screen options
 */
const CanvasAccordion = ({
  canvas,
  selectedDesign,
  setSelectedDesign,
  screenIndex,
}) => {
  const theme = useTheme();

  const {
    canvasName,
    width,
    height,
    isCustom,
    selectedResolution,
    resolutions,
    handleCanvasNameChange,
    handleResolutionChange,
    handleDebounceDimensionChange,
    handleMakeDefaultScreen,
  } = useOptionsHandlers({
    canvas: canvas,
    selectedDesign: selectedDesign,
    setSelectedDesign: setSelectedDesign,
    screenIndex: screenIndex,
  });

  const { t } = useTranslation();
  const { canvasBgColor, handleCanvasColor } = useObjectCustomizationHandlers({
    canvas,
    selectedDesign,
    setSelectedDesign,
    screenIndex,
    setSelectedObject: undefined,
    selectedObject: undefined,
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        rowGap: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          rowGap: "16px",
        }}
      >
        <div style={{ display: "flex" }}>
          <CustomTextField
            label={t("DesignerTranslations.t.name")}
            value={canvasName}
            hasBorder={true}
            onChange={(e) =>
              handleCanvasNameChange(
                e.target.value,
                selectedDesign,
                setSelectedDesign,
                screenIndex
              )
            }
          />
        </div>
        <FormControl
          variant="standard"
          style={{ display: "flex", flexDirection: "row" }}
        >
          <CustomSwitch
            onChange={handleMakeDefaultScreen}
            checked={selectedDesign.Configuration.screens[screenIndex].default}
          />
          <Typography
            style={{
              marginInlineStart: "16px",
              fontSize: "12px",
              color: theme.palette.text.secondary,
              display: "flex",
              alignItems: "center",
            }}
          >
            {t("DesignerTranslations.t.defaultScreen")}
          </Typography>
        </FormControl>
        <FormControl variant="standard">
          <InputLabel id="resolution-label">
            {t("DesignerTranslations.t.resolutions")}
          </InputLabel>
          <SelectOutlined
            onChange={handleResolutionChange}
            value={selectedResolution}
          >
            {resolutions[
              selectedDesign.Configuration.screens[screenIndex].orientation
            ].map((res) => (
              <MenuItem
                key={`${res.width}x${res.height}`}
                value={`${res.width}x${res.height}`}
              >
                {`${res.width}x${res.height}`}
              </MenuItem>
            ))}
            {isCustom && (
              <MenuItem value="custom">
                {t("DesignerTranslations.t.custom")}
              </MenuItem>
            )}
          </SelectOutlined>
        </FormControl>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div style={{ width: "80%", display: "flex", columnGap: "16px" }}>
            <CustomTextField
              hasBorder={true}
              label={t("DesignerTranslations.t.width")}
              type="number"
              value={width}
              onChange={handleDebounceDimensionChange("width")}
            />
            <CustomTextField
              hasBorder={true}
              label={t("DesignerTranslations.t.height")}
              type="number"
              value={height}
              onChange={handleDebounceDimensionChange("height")}
            />
          </div>
        </div>

        <ColorPicker
          hasBorder={true}
          value={canvasBgColor}
          onChange={handleCanvasColor}
        />
      </div>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography style={{ fontSize: "1.2rem" }}>
            {t("DesignerTranslations.t.idle")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          style={{ display: "flex", flexDirection: "column", rowGap: "16px" }}
        >
          <OnIdleEditor
            selectedDesign={selectedDesign}
            screenIndex={screenIndex}
            setSelectedDesign={setSelectedDesign}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default CanvasAccordion;
