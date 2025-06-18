import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import screenLayout1 from "./images/screenLayout1.svg";
import screenLayout2 from "./images/screenLayout2.svg";
import screenLayout3 from "./images/screenLayout3.svg";
import screenLayout4 from "./images/screenLayout4.svg";
import portraitLayout1 from "./images/portraitLayout1.svg";
import portraitLayout2 from "./images/portraitLayout2.svg";
import portraitLayout3 from "./images/portraitLayout3.svg";
import { Button, DialogActions, ListItemButton } from "@mui/material";
import { createSplitAreas } from "../FabricHandlers/Toolbar.handlers";
import { useTranslation } from "../../translationUtils";

const LayoutEditorDialog = ({
  open,
  onClose,
  selectedDesign,
  screenIndex,
  canvas,
}) => {
  // State to keep track of the selected layout index
  const [selectedLayout, setSelectedLayout] = useState(0);

  const { t } = useTranslation();
  // Define the layout items
  const layoutList =
    selectedDesign.Configuration.screens[screenIndex].orientation == "landscape"
      ? [
          { img: screenLayout1, title: "Fullscreen view" },
          {
            img: screenLayout2,
            title: "Vertical splitscreen",
          },
          {
            img: screenLayout4,
            title: "Horizontal splitscreen",
          },
          { img: screenLayout3, title: "4-way multiview" },
        ]
      : [
          { img: portraitLayout1, title: "Fullscreen view" },

          {
            img: portraitLayout3,
            title: "Horizontal splitscreen",
          },
          {
            img: portraitLayout2,
            title: "Vertical splitscreen",
          },
        ];

  // Event handler when a layout item is selected
  const handleLayoutSelect = (index) => {
    setSelectedLayout(index);
  };

  const onApply = () => {
    createSplitAreas(selectedLayout, canvas);
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth onClose={onClose}>
      <DialogContent>
        <div style={{ display: "flex" }}>
          <List style={{ marginRight: "20px", width: "200px" }}>
            <Typography variant="h6">Layouts</Typography>
            {layoutList.map((item, index) => (
              <ListItemButton
                key={item.title}
                selected={selectedLayout === index}
                onClick={() => handleLayoutSelect(index)}
              >
                <ListItemText primary={item.title} />
              </ListItemButton>
            ))}
          </List>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <img
              src={layoutList[selectedLayout].img}
              alt={`Layout ${selectedLayout + 1}`}
              width={
                selectedDesign.Configuration.screens[screenIndex].orientation ==
                "landscape"
                  ? "80%"
                  : "35%"
              }
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t("ManagementPage.t.Close")}
        </Button>
        <Button onClick={onApply} color="primary">
          {t("ManagementPage.t.Apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LayoutEditorDialog;
