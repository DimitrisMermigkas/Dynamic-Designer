import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Button from "../CustomButtons/Button";

export type InfoDialogProps = React.ComponentProps<typeof Dialog> & {
  btnTxt?: string;
  contentText?: React.ReactNode;
  handleClose?: (event: any) => void;
};

const InfoDialog = ({
  title,
  btnTxt,
  contentText,
  handleClose,
  children,
  ...props
}: InfoDialogProps) => {
  const actions = [
    <Button key="0" onClick={handleClose}>
      {btnTxt || "OK"}
    </Button>,
  ];

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      {...props}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        {contentText && (
          <DialogContentText id="alert-dialog-description">
            {contentText}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};

export default InfoDialog;
