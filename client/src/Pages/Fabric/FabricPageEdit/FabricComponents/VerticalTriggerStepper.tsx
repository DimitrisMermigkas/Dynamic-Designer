import {
  Button,
  Grid2,
  Step,
  StepButton,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from "@mui/material";
import SelectFromObject from "../../../../components/Select/SelectFromObject";
import React, { useEffect, useState } from "react";
import { makeStyles, withStyles } from "tss-react/mui";
import { useTranslation } from "../../translationUtils";

const CustomTypographyDefault = withStyles(Typography, (theme) => ({
  root: {
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 500,
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: "100%",
    color: theme.palette.text.secondary,
    opacity: theme.palette.opacity.level1,
  },
}));

const useCustomStepIconStyles = makeStyles()((theme) => ({
  root: {
    width: "27px",
    height: "27px",
    color: "transparent",
    borderRadius: "100%",
    border: `2px solid rgba(255, 255, 255, 0.1)`,
  },
  active: {
    width: "27px",
    height: "27px",
    color: "transparent",
    borderRadius: "100%",
    border: `2px solid ${theme.palette.primary.main}`,
  },
  completed: {
    width: "31px",
    height: "31px",
    background:
      theme.palette.type === "dark"
        ? `linear-gradient(${theme.palette.primary.main}, ${theme.palette.primary.dark})`
        : "linear-gradient(180deg, #E51A29 0%, rgba(229, 26, 41, 0) 287.5%)",
    borderRadius: "100%",
    border: `1.7px  ${theme.palette.primary.main}`,
  },
}));

function isTypographyActiveOrCompleted(active, completed, icon, theme) {
  if (active || completed) {
    return (
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "13px",
          fontWeight: 500,
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          height: "100%",
          color:
            theme.palette.mode === "light"
              ? active
                ? theme.palette.text.contrast
                : "#FFFFFF"
              : theme.palette.text.contrast,
        }}
      >
        {icon}
      </Typography>
    );
  } else {
    return <CustomTypographyDefault>{icon}</CustomTypographyDefault>;
  }
}
function CustomStyledStepIcon(props) {
  const { classes, cx } = useCustomStepIconStyles();
  const { active, completed, icon } = props;
  const theme = useTheme();

  const customIcons = {
    1: isTypographyActiveOrCompleted(active, completed, icon, theme),
    2: isTypographyActiveOrCompleted(active, completed, icon, theme),
    3: isTypographyActiveOrCompleted(active, completed, icon, theme),
    4: isTypographyActiveOrCompleted(active, completed, icon, theme),
  };
  return (
    <div
      className={cx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed,
      })}
    >
      {customIcons[String(props.icon)]}
    </div>
  );
}

const VerticalTriggerStepper = ({ totalSteps, stateKeys, onApply }) => {
  const { t } = useTranslation();
  const initialState = Object.fromEntries(stateKeys.map((key) => [key, ""]));
  const [selectValues, setSelectValues] = useState(initialState);
  const [activeStep, setActiveStep] = useState(0);
  const [openApply, setOpenApply] = useState(false);

  useEffect(() => {
    if (selectValues?.referenceId !== "" || selectValues?.action == "tryMe")
      setOpenApply(true);
    else setOpenApply(false);
  }, [selectValues]);

  const handleSelectChange = (value, step) => {
    const updatedValues = { ...selectValues, [stateKeys[step]]: value };
    setSelectValues(updatedValues);

    const currentStep = totalSteps[step];
    if (currentStep.addStep.index > -1 && currentStep.addStep.value === value) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleStep = (index) => {
    if (activeStep > index) {
      const updatedValues = Object.fromEntries(
        stateKeys.map((key, idx) => {
          if (idx >= index) return [key, ""];
          else return [key, selectValues[key]];
        })
      );
      setSelectValues(updatedValues);
    }
    setActiveStep(index);
  };

  const handleApply = () => {
    onApply(selectValues);
  };

  const renderStepContent = (step, index) => (
    <Grid2 container spacing={2}>
      <Grid2 size={9}>
        <SelectFromObject
          style={{ width: "100%" }}
          value={selectValues[stateKeys[index]]}
          onChange={(value) => handleSelectChange(value, index)}
          options={step.options}
        />
      </Grid2>
    </Grid2>
  );

  return (
    <div style={{ width: "100%" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {totalSteps.map((step, index) =>
          index == 2 && selectValues?.action !== "goToScreen" ? null : (
            <Step key={step.label}>
              <StepButton onClick={() => handleStep(index)}>
                <StepLabel StepIconComponent={CustomStyledStepIcon}>
                  {step.label}
                </StepLabel>
              </StepButton>
              <StepContent>{renderStepContent(step, index)}</StepContent>
            </Step>
          )
        )}
      </Stepper>
      {openApply && (
        <Button onClick={handleApply}>{t("ManagementPage.t.Apply")}</Button>
      )}
    </div>
  );
};

export default VerticalTriggerStepper;
