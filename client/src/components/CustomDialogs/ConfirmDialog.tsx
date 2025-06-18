import React from "react";
import Button from "../CustomButtons/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTheme } from "@mui/material/styles";
import styled from "styled-components";
import Slide, { SlideProps } from "@mui/material/Slide";
import { ModalProps } from "@mui/material";
import { useTranslation } from "../../Pages/Fabric/translationUtils";

const Transition = React.forwardRef(function Transition(
  props: SlideProps,
  ref
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const StyledContent = styled(DialogContent)<{ maxheight: number }>`
  max-height: ${(props) => props.maxheight + "px"};
  min-width: "auto";
`;

const TitleStyled = styled(DialogTitle)`
  text-transform: capitalize;
`;

const TopFixedContent = styled.div`
  padding: 8px 24px;
`;

export type ConfirmDialogProps = Omit<
  React.ComponentProps<typeof Dialog>,
  "content"
> & {
  okBtnTxt?: string;
  okFunc?: React.MouseEventHandler<HTMLButtonElement>;
  cancelBtnTxt?: string;
  cancelFunc?: React.MouseEventHandler<HTMLButtonElement>;
  handleClose?: ModalProps["onClose"];
  topFixedContent?: React.ReactNode;
  maxheight?: number;
  contentStyle?: React.CSSProperties;
  content?: React.ReactNode;
  contentText?: React.ReactNode;
  disableBackdropClick?: boolean;
};

const ConfirmDialog = ({
  okBtnTxt,
  okFunc,
  cancelBtnTxt,
  cancelFunc,
  style,
  open,
  handleClose,
  title,
  topFixedContent,
  maxheight,
  maxWidth,
  fullWidth,
  contentStyle,
  contentText,
  content,
  disableBackdropClick = false,
  disableEscapeKeyDown,
  children,
  ...props
}: ConfirmDialogProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const onClose: ModalProps["onClose"] = (event, reason) => {
    if (disableBackdropClick && reason === "backdropClick") return;
    if (disableEscapeKeyDown && reason === "escapeKeyDown") return;
    if (handleClose) handleClose(event, reason);
  };

  return (
    <Dialog
      maxWidth={maxWidth || "md"}
      fullWidth={fullWidth === undefined || fullWidth}
      style={style}
      TransitionComponent={Transition}
      open={open || false}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      {...props}
    >
      {title && <TitleStyled id="alert-dialog-title">{title}</TitleStyled>}
      {topFixedContent && <TopFixedContent>{topFixedContent}</TopFixedContent>}

      <StyledContent maxheight={maxheight} style={{ ...contentStyle }}>
        {contentText && (
          <DialogContentText id="alert-dialog-description">
            {contentText}
          </DialogContentText>
        )}
        {content}
        {children}
      </StyledContent>
      <DialogActions>
        {okFunc && (
          <Button
            autoFocus
            style={{
              color:
                theme.palette.mode === "light"
                  ? theme.palette.text.primary
                  : null,
            }}
            onClick={okFunc}
          >
            {okBtnTxt || t("GeneralTranslations.t.ok")}
          </Button>
        )}
        {cancelFunc && (
          <Button
            style={{
              color:
                theme.palette.mode === "light"
                  ? theme.palette.text.primary
                  : null,
            }}
            onClick={cancelFunc}
          >
            {cancelBtnTxt || t("GeneralTranslations.t.cancel")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
