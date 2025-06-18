export const handleStringChange = (settings, value) => {
  let updatedState = {
    ...settings,
  };
  if (value !== "") {
    updatedState.numberValue = "";
    updatedState.showRadioGroup = false;
  } else {
    updatedState.showRadioGroup = true;
  }
  updatedState.stringValue = value;
  return updatedState;
};

export const handleNumberChange = (settings, value) => {
  let updatedState = {
    ...settings,
  };
  if (value !== "") {
    updatedState.stringValue = "";
    updatedState.showRadioGroup = true;
  } else {
    updatedState.showRadioGroup = false;
  }
  updatedState.numberValue = value;

  return updatedState;
};

export const convertStaticDynamicQRText = (settings) => {
  let dynamicText;
  let newSettings = settings;
  if (newSettings.dynamicValue == "DeviceDetail") {
    if (newSettings.numberValue)
      dynamicText = `Detail-${newSettings.numberValue}:${newSettings.selectedRadioOption}`;
    else dynamicText = `Detail:${newSettings.stringValue}`;
  } else {
    dynamicText = newSettings.dynamicValue;
  }
  newSettings.text =
    newSettings.typeText == "static" ? newSettings.staticText : dynamicText;

  return newSettings;
};
