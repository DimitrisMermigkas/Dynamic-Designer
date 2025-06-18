import {
  Typography,
  useTheme,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import useToolbarHandlers from "../FabricHandlers/Toolbar.handlers";
import SaveRefreshFixedPosition from "../../../Containers/SaveRefreshFixedPosition";
import { useTranslation } from "../../translationUtils";
import DesignsDialog from "./DesignsDialog";
import { useDispatch, useSelector } from "react-redux";
import HelpIcon from "@mui/icons-material/Help";
import { fabricPageActions } from "../../FabricPageRedAct";

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

  const { t } = useTranslation();

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
