import {
  Typography,
  useTheme,
  Button,
  TextField,
  IconButton,
  Switch,
  FormControl,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState, useRef, useEffect } from "react";
import useToolbarHandlers from "../FabricHandlers/Toolbar.handlers";
import SaveRefreshFixedPosition from "../../../Containers/SaveRefreshFixedPosition";
import { useTranslation } from "../../translationUtils";
import DesignsDialog from "./DesignsDialog";
import { useDispatch, useSelector } from "react-redux";
import HelpIcon from "@mui/icons-material/Help";
import { fabricPageActions } from "../../FabricPageRedAct";
import { generalActions } from "../../../GeneralRedAct";
import "flag-icons/css/flag-icons.min.css";

// Material UI Switch with custom styling
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 58,
  height: 32,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#e51a29"
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#aab4be",
        ...theme.applyStyles?.("dark", {
          backgroundColor: "#F2F4F8",
        }),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#F2F4F8",
    border: "1px solid #e51a29",
    width: 28,
    height: 28,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
    },
    ...theme.applyStyles?.("dark", {
      backgroundColor: "#e51a29",
    }),
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 20 / 2,
    ...theme.applyStyles?.("dark", {
      backgroundColor: "#8796A5",
    }),
  },
}));

const CanvasToolbar = ({
  canvas,
  setSelectedObject,
  handleStartDrawing,
  selectedDesign,
  setSelectedDesign,
  screenIndex,
  setScreenIndex,
}) => {
  const theme = useTheme();
  const [openDesignsDialog, setOpenDesignsDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const { handleSaveDesign, handleReturn, handleUpdateDesignName } =
    useToolbarHandlers({
      canvas,
      selectedDesign,
      screenIndex,
      handleStartDrawing,
      setSelectedObject,
    });

  const { t, language } = useTranslation();

  // Get theme and language from Redux state
  const selectedTheme = useSelector(
    (state: any) => state.generalReducer.selectedTheme
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(selectedDesign?.Name || "");
  }, [selectedDesign]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(selectedDesign?.Name || "");
  };

  const handleBlur = () => {
    setIsEditing(false);
    handleUpdateDesignName(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      handleUpdateDesignName(editValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(selectedDesign?.Name || "");
    }
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.checked ? "light" : "dark";
    dispatch(generalActions.setSelectedTheme(newTheme));
  };

  const handleLanguageChange = (event: any) => {
    const newLanguage = event.target.value;
    dispatch(generalActions.setLanguage(newLanguage));
  };

  return (
    <div
      style={{
        display: "flex",
        rowGap: "8px",
        width: "100%",
        justifyContent: "space-between",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <img
          style={{
            minWidth: "50px",
          }}
          alt="logo"
          src={""}
        />
        <Button
          variant="outlined"
          onClick={() => setOpenDesignsDialog(true)}
          sx={{
            height: "36px",
            textTransform: "none",
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            "&:hover": {
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          Designs
        </Button>
        <IconButton
          onClick={() => dispatch(fabricPageActions.setFirstVisit(true))}
          sx={{
            height: "36px",
            width: "36px",
            color: theme.palette.primary.main,
            border: `1px solid ${theme.palette.divider}`,
            "&:hover": {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.action.hover,
            },
          }}
          title="Help"
        >
          <HelpIcon />
        </IconButton>
      </div>

      {/* Theme and Language Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MaterialUISwitch
            checked={selectedTheme === "light"}
            onChange={handleThemeChange}
            inputProps={{ "aria-label": "theme switch" }}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={language}
            onChange={handleLanguageChange}
            displayEmpty
            sx={{
              height: "36px",
              fontSize: "14px",
              gap: "4px",
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                gap: "8px",
              },
            }}
          >
            <MenuItem value="en" style={{ fontSize: "14px", gap: "8px" }}>
              <span className="fi fi-gb fis"></span>English
            </MenuItem>
            <MenuItem value="el" style={{ fontSize: "14px", gap: "8px" }}>
              <span className="fi fi-gr fis"></span>Greek
            </MenuItem>
          </Select>
        </FormControl>
      </div>

      {isEditing ? (
        <TextField
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          size="small"
          sx={{
            "& .MuiInputBase-root": {
              fontSize: "15px",
              height: "36px",
            },
          }}
        />
      ) : (
        <Typography
          variant="h4"
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "15px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onDoubleClick={handleDoubleClick}
        >
          {selectedDesign?.Name}
        </Typography>
      )}
      <div
        style={{ display: "flex", marginInlineEnd: "8px" }}
        data-tut="SaveButtons"
      >
        <SaveRefreshFixedPosition
          onSave={handleSaveDesign}
          onRefresh={handleReturn}
          onRefreshTxt={t("GeneralTranslations.t.clear")}
          onSaveTxt={t("GeneralTranslations.t.save")}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        />
      </div>
      <DesignsDialog
        open={openDesignsDialog}
        onClose={() => setOpenDesignsDialog(false)}
        setScreenIndex={setScreenIndex}
        setSelectedDesign={setSelectedDesign}
      />
    </div>
  );
};

export default CanvasToolbar;
