import { Delete } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CustomIconButton from "components/CustomButtons/IconButton";
import ConfirmDialog from "components/CustomDialogs/ConfirmDialog";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "tss-react/mui";
import NewTemplateModal from "./NewTemplateModal";
import PaperWithTitle from "components/PageBlocks/PaperWithTitle";
import TableNumRowsIndicator from "components/Tables/TableNumRowsIndicator";
import { useTranslation } from "../../translationUtils";

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    height: "100%",
    width: "100%",
    borderRadius: "0px 10px 10px 0px",
    padding: theme.spacing(2),
  },
  button: {
    width: "90%",
    minHeight: "60px",
    height: "100%",
    fontSize: "1.3rem",
  },
  card: {
    transition: "all .2s ease-in-out",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  deleteIcon: {
    display: "none",
    "&:hover": {
      display: "block",
    },
  },
  mediaLandscape: {
    height: 200,
    width: 300,
  },
  mediaPortrait: {
    height: 300,
    width: 200,
  },
  layouts: {
    height: 100,
    width: 150,
  },
  ribbon: {
    position: "absolute",
    top: -2, // Adjust the position of the ribbon
    right: -2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    padding: "4px 8px",
  },
}));

const ImageWithFallback = ({ src, alt, index, onClick }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  return hasError ? (
    <div
      style={{
        flex: "1",
        display: "flex",
        justifyContent: "center",
        padding: "6px 0",
      }}
    >
      Not available
    </div>
  ) : (
    <Button
      onClick={onClick}
      style={{
        flex: "1",
        display: "flex",
        justifyContent: "center",
        padding: "6px 0",
      }}
    >
      <img src={src} height={63} alt={alt} onError={handleError} />
    </Button>
  );
};

const ScreenList = ({
  selectedDesign,
  theme,
  handleAddNewTemplate,
  handleEdit,
  handleSelectScreen,
  selectedScreenIndex,
  confirmationDeleteScreen,
}) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        borderRadius: "0px, 10px, 10px, 0px",
        border: theme.palette.background.defaultLight,
        backgroundColor: theme.palette.background.defaultDark,
      }}
    >
      <PaperWithTitle
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          borderRadius: "0px 10px 10px 0px",
          borderLeft: "none",
          backgroundColor: theme.palette.background.defaultDark,
        }}
        actionsContainerStyle={{ flex: 1 }}
        title={t("DesignerTranslations.t.screens")}
        actions={
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TableNumRowsIndicator
              total={selectedDesign.Configuration.screens.length}
            />
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <CustomIconButton
                onClick={() => handleAddNewTemplate()}
                size="large"
              >
                <AddIcon />
              </CustomIconButton>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                style={{ height: "100%", fontSize: "1.3rem" }}
                disabled={selectedDesign.Configuration.screens.length == 0}
                onClick={handleEdit}
              >
                {t("GeneralTranslations.t.edit")}
              </Button>
            </div>
          </div>
        }
      >
        {/* <TableNumRowsIndicator
          total={selectedDesign.Configuration.screens.length}
        /> */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: theme.spacing(2),
            marginTop: 0,
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              borderRadius: "4px",
              justifyContent: "space-around",
              alignItems: "center",
              backgroundColor: theme.palette.background.defaultLight,
              marginBlockEnd: "4px",
              minHeight: theme.spacing(4.5),
            }}
          >
            <div
              style={{ flex: "1", display: "flex", justifyContent: "center" }}
            >
              <Typography>
                {t("DesignerTranslations.t.screenPreview")}
              </Typography>
            </div>
            <div
              style={{ flex: "1", display: "flex", justifyContent: "center" }}
            >
              <Typography>{t("GeneralTranslations.t.name")}</Typography>
            </div>
            <div
              style={{ flex: "1", display: "flex", justifyContent: "center" }}
            >
              <Typography>{t("ManagementPage.t.Orientation")}</Typography>
            </div>
            <div
              style={{ flex: "1", display: "flex", justifyContent: "center" }}
            >
              <Typography>{t("DesignerTranslations.t.resolution")}</Typography>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                minWidth: "100px",
              }}
            ></div>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column", // Change to column
              rowGap: "4px",
            }}
          >
            {selectedDesign.Configuration.screens.length > 0 &&
              selectedDesign.Configuration.screens?.map((screen, index) => {
                return (
                  <div
                    key={index + screen.id}
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      alignItems: "center",
                      backgroundColor: theme.palette.background.default,
                      borderRadius: "4px",
                      border:
                        selectedScreenIndex == index
                          ? `solid ${theme.palette.primary.main}`
                          : null,
                    }}
                    onClick={() => handleSelectScreen(index)}
                  >
                    <Typography
                      variant="body1"
                      style={{
                        flex: "1",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {screen.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{
                        flex: "1",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {screen.orientation}
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{
                        flex: "1",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >{`${screen.resolution?.width} x ${screen.resolution?.height}`}</Typography>
                    <CustomIconButton
                      onClick={(e) => {
                        e.preventDefault();
                        confirmationDeleteScreen(index);
                      }}
                      size="large"
                    >
                      <Delete />
                    </CustomIconButton>
                  </div>
                );
              })}
          </div>
        </div>
      </PaperWithTitle>
    </div>
  );
};

const LayoutSelector = ({
  selectedDesign,
  setSelectedDesign,
  onUpdateDesign,
  setScreenIndex,
  g,
}) => {
  const theme = useTheme();
  const { classes } = useStyles();
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(null);
  const [openTemplateModal, setOpenTemplateModal] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(null);

  const handleSelectScreen = (index) => {
    setSelectedScreenIndex(index);
    setScreenIndex(index);
  };

  const handleAddNewTemplate = () => {
    setOpenTemplateModal(true);
    const app = document.getElementById("app");
    app.style.filter = "blur(3px)";
  };
  const handleCloseNewTemplate = () => {
    setOpenTemplateModal(false);
    const app = document.getElementById("app");
    app.style.filter = "unset";
  };

  const navigate = useNavigate();
  const handleEdit = () => {
    navigate("edit");
  };

  const confirmationDeleteScreen = (index) => {
    setOpenConfirmationModal(index);
  };

  const deleteDesignScreen = (index) => {
    let updatedScreens = selectedDesign.Configuration.screens.filter(
      (screen, idx) => idx !== index
    );
    const updatedDesign = {
      ...selectedDesign,
      Configuration: {
        ...selectedDesign.Configuration,
        screens: updatedScreens,
      },
    };
    setOpenConfirmationModal(null);
    setSelectedDesign(updatedDesign);
    onUpdateDesign(updatedDesign);
  };

  return (
    <div className={classes.root}>
      <ScreenList
        selectedDesign={selectedDesign}
        theme={theme}
        handleAddNewTemplate={handleAddNewTemplate}
        handleEdit={handleEdit}
        handleSelectScreen={handleSelectScreen}
        selectedScreenIndex={selectedScreenIndex}
        confirmationDeleteScreen={confirmationDeleteScreen}
      />
      <NewTemplateModal
        open={openTemplateModal}
        onClose={handleCloseNewTemplate}
        setSelectedDesign={setSelectedDesign}
        selectedDesign={selectedDesign}
        onUpdateDesign={onUpdateDesign}
      />
      {openConfirmationModal !== null && (
        <ConfirmDialog
          open={openConfirmationModal !== null}
          content={`Are you sure you want to delete ${selectedDesign.Configuration.screens[openConfirmationModal]?.name}?`}
          okFunc={() => deleteDesignScreen(openConfirmationModal)}
          cancelFunc={() => setOpenConfirmationModal(null)}
        />
      )}
    </div>
  );
};

export default LayoutSelector;
