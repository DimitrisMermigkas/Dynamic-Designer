import { Cancel as CancelIcon } from "@mui/icons-material";
import {
  Button,
  Grid2,
  MenuItem,
  Modal,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import CustomIconButton from "components/CustomButtons/IconButton";
import CustomTextField from "components/TextFields/CustomTextField";
import React, { useEffect, useState } from "react";
import LandScape from "static/images/landscape.svg";
import LandScapeSelected from "static/images/landscape_Selected.svg";
import Portrait from "static/images/portrait.svg";
import PortraitSelected from "static/images/portrait_Selected.svg";
import { v4 as uuid } from "uuid";
import { useTranslation } from "../../translationUtils";

const NewTemplateModal = ({
  open,
  onClose,
  selectedDesign,
  setSelectedDesign,
  onUpdateDesign,
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [selectedRes, setSelectedRes] = useState<{
    width: number | string;
    height: number | string;
  }>({ width: "", height: "" });

  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  useEffect(() => {
    const numberOfExistScreens =
      selectedDesign.Configuration.screens.length + 1;
    setTemplateName(`Screen-${numberOfExistScreens}`);
    setSelectedRes({ width: 1920, height: 1080 });
    setSelectedImage("first");
  }, [selectedDesign]);

  const handleCreateTemplate = () => {
    const newTemplateScreen = {
      name: templateName,
      id: uuid(),
      default:
        selectedDesign.Configuration.screens.length > 0
          ? selectedDesign.Configuration.screens[0].orientation == ""
            ? true
            : false
          : true,
      onIdleReturn: {
        id: "",
        time: "",
      },
      background: "#FFFFFF",
      orientation: selectedImage == "second" ? "portrait" : "landscape",
      resolution: { width: selectedRes.width, height: selectedRes.height },
      objects: [],
      previewImageUrl: "",
    };
    const updatedDesign = {
      ...selectedDesign,
      Configuration: {
        screens: [...selectedDesign.Configuration.screens, newTemplateScreen],
      },
    };
    setSelectedDesign(updatedDesign);
    onUpdateDesign(updatedDesign);
    setSelectedImage(null);
    setSelectedRes({ width: "", height: "" });
    setTemplateName("");
    onClose();
  };

  const isSelectDisabled = !selectedImage;

  const handleDisableCreateTemplate = () => {
    if (templateName == "") return true;
    else {
      if (selectedRes.width == "") return true;
      else return false;
    }
  };
  const handleResolutionChange = (event) => {
    const [width, height] = event.target.value.split("x");
    const value = {
      width: parseInt(width),
      height: parseInt(height),
    };
    const selectedRes = resolutions[
      selectedImage == "first" ? "landscape" : "portrait"
    ].find((res) => res.height === value.height && res.width === value.width);
    setSelectedRes({ width: selectedRes.width, height: selectedRes.height });
  };

  const resolutions = {
    landscape: [
      { width: 3840, height: 2160, label: "Ultra HD,4K:" },
      { width: 2560, height: 1440, label: "Quad HD,2K:" },
      { width: 1920, height: 1080, label: "Full HD:" },
      { width: 1440, height: 900 },
      { width: 1366, height: 768 },
      { width: 1280, height: 800 },
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
      { width: 800, height: 600 },
    ],
    portrait: [
      { width: 2160, height: 3840, label: "Ultra HD,4K:" },
      { width: 1440, height: 2560, label: "Quad HD,2K:" },
      { width: 1080, height: 1920, label: "Full HD:" },
      { width: 900, height: 1440, label: "" },
      { width: 1024, height: 1366, label: "(iPad Pro)" },
      { width: 768, height: 1024, label: "(iPad)" },
      {
        width: 414,
        height: 896,
        label: "(iPhone XR/XS Max/11/11 Pro Max)",
      },
      { width: 375, height: 667, label: "(iPhone 6/7/8)" },
      { width: 320, height: 480, label: "(iPhone 3)" },
    ],
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Paper style={{ padding: "20px", width: "400px" }}>
          <Typography
            variant="h6"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {t("DesignerTranslations.t.newTemplate")}
            <CustomIconButton onClick={onClose} size="large">
              <CancelIcon />
            </CustomIconButton>
          </Typography>

          {/* Custom Search Component */}
          <div style={{ marginBottom: "20px" }}>
            <CustomTextField
              required
              variant="outlined"
              placeholder={t("DesignerTranslations.t.newTemplateName")}
              value={templateName || ""}
              onChange={(e) => {
                setTemplateName(e.target.value);
              }}
            />
          </div>

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 4 }}>
              <Typography variant="subtitle2">
                {t("ManagementPage.t.Orientation")}
              </Typography>
              <div style={{ display: "flex", flexDirection: "row" }}>
                {/* Using LandscapeSharpIcon and PortraitSharpIcon */}
                <img
                  style={{
                    height: "45px",
                    width: "100%",
                    cursor: "pointer",
                  }}
                  src={
                    selectedImage === "first" ? LandScapeSelected : LandScape
                  }
                  onClick={() => {
                    handleImageSelect("first");
                    setSelectedRes({ width: 1920, height: 1080 });
                  }}
                />
                <img
                  src={selectedImage === "second" ? PortraitSelected : Portrait}
                  style={{
                    height: "45px",
                    width: "100%",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleImageSelect("second");
                    setSelectedRes({ width: 1024, height: 1366 });
                  }}
                />
              </div>
            </Grid2>

            <Grid2 size={{ xs: 8 }}>
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography>{t("DesignerTranslations.t.selectRes")}</Typography>
                <Select
                  style={{ height: "36px" }}
                  variant="outlined"
                  disabled={isSelectDisabled}
                  labelId="resolution-label"
                  id="resolution"
                  value={`${selectedRes.width}x${selectedRes.height}`}
                  onChange={(e) => {
                    handleResolutionChange(e);
                  }}
                >
                  {resolutions[
                    selectedImage == "first" ? "landscape" : "portrait"
                  ].map((res) => (
                    <MenuItem
                      key={`${res.width}x${res.height}`}
                      value={`${res.width}x${res.height}`}
                    >
                      {res.label
                        ? `${res.label} ${res.width}x${res.height}`
                        : `${res.width}x${res.height}`}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </Grid2>
          </Grid2>

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateTemplate}
            disabled={handleDisableCreateTemplate()}
            style={{ marginTop: "20px" }}
          >
            {t("DesignerTranslations.t.createTemplate")}
          </Button>
        </Paper>
      </div>
    </Modal>
  );
};

export default NewTemplateModal;
