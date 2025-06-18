import React from "react";
import { FormControl, InputLabel, MenuItem } from "@mui/material";
import SelectOutlined from "../../../../components/Select/SelectOutlined";
import { useTranslation } from "../../translationUtils";

const MultimediaEditor = ({ aspectRatio, handleChangeAspectRatio }) => {
  const { t } = useTranslation();
  return (
    <>
      <FormControl variant="standard">
        <InputLabel>{t("DesignerTranslations.t.aspectRatio")}</InputLabel>
        <SelectOutlined
          value={aspectRatio}
          onChange={(e) => handleChangeAspectRatio(e.target.value)}
        >
          <MenuItem value="contain">
            {t("DesignerTranslations.t.fitFrame")}
          </MenuItem>
          <MenuItem value="fill">
            {t("DesignerTranslations.t.stretchFit")}
          </MenuItem>
          <MenuItem value="cover">
            {t("DesignerTranslations.t.cropFit")}
          </MenuItem>
        </SelectOutlined>
      </FormControl>
    </>
  );
};

export default MultimediaEditor;
