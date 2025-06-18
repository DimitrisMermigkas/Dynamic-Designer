import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useSelector, useDispatch } from "react-redux";
import { fabricPageActions } from "../../FabricPageRedAct";
import { v4 as uuidv4 } from "uuid";
import { Design } from "../../../../schemas/schemaDesigner";
import { useDesignsDialogHandlers } from "../FabricHandlers/DesignsDialog.handlers";

interface DesignsDialogProps {
  open: boolean;
  onClose: () => void;
  setSelectedDesign: (design: Design) => void;
  setScreenIndex: (index: number) => void;
}

const DesignsDialog: React.FC<DesignsDialogProps> = ({
  open,
  onClose,
  setSelectedDesign,
  setScreenIndex,
}) => {
  const theme = useTheme();
  const designs = useSelector((state: any) => state.fabricPageReducer.designs);
  const selectedDesign = useSelector(
    (state: any) => state.fabricPageReducer.selectedDesign
  );

  const { onClickDesign, onDeleteDesign, onCreateDesign } =
    useDesignsDialogHandlers({ setSelectedDesign, setScreenIndex });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: theme.palette.background.default,
          minHeight: "400px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6">Designs</Typography>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreateDesign()}
            sx={{
              textTransform: "none",
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Add Design
          </Button>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <List>
          {designs.map((design) => (
            <ListItem
              key={design.ID}
              disablePadding
              sx={{
                mb: 1,
              }}
            >
              <ListItemButton
                onClick={() => onClickDesign(design)}
                selected={selectedDesign?.ID === design.ID}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.action.selected,
                    "&:hover": {
                      backgroundColor: theme.palette.action.selected,
                    },
                  },
                }}
              >
                <ListItemText
                  primary={design.Name}
                  secondary={`${design.Configuration.screens.length} screen(s)`}
                />
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDesign(design.ID);
                  }}
                  size="small"
                  disabled={designs.length <= 1}
                  sx={{
                    color: theme.palette.error.main,
                    "&:hover": {
                      backgroundColor: theme.palette.error.light,
                    },
                    "&.Mui-disabled": {
                      color: theme.palette.action.disabled,
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default DesignsDialog;
