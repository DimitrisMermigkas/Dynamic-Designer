import React from "react";
import AutocompleteVirtualized from "./AutocompleteVirtualized";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  AutocompleteRenderOptionState,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fabricPageActions } from "../../Pages/Fabric/FabricPageRedAct";
import { useState } from "react";
import { RootState } from "reduxConfig/reduxStoreConfig";
import CustomTextField from "../TextFields/CustomTextField";

type TextfieldSelectorProps = {
  type: string;
  value: number | string;
  label: string;
  freeSolo: boolean;
  options: { label: string; value: number | string; [key: string]: any }[];
  onChange: (value: any) => void;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & { key: any },
    option: { label: string; value: number | string; [key: string]: any },
    state: AutocompleteRenderOptionState
  ) => React.ReactNode;
  textfieldProps?: React.ComponentProps<typeof CustomTextField>;
  importFonts?: boolean;
  g?: (key: string) => string;
};

function CustomFontModal({ open, onClose, onFontAdded, g }) {
  const [fontUrl, setFontUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fontName, setFontName] = useState("");
  const [error, setError] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setFontName(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ""));
      setFontUrl("");
      setError("");
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFontName(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      setFontUrl("");
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const fontFace = new FontFace(fontName || file.name, arrayBuffer);
        await fontFace.load();
        document.fonts.add(fontFace);
        onFontAdded(fontName || file.name);
        onClose();
      } catch (e) {
        setError("Failed to load font file.");
      }
    } else if (fontUrl) {
      // Try to extract font name from URL if possible
      let extractedFontName = fontName;
      const match = fontUrl.match(/family=([^:&']+)/);
      if (match) {
        extractedFontName = decodeURIComponent(match[1]).replace(/\+/g, " ");
      }
      const style = document.createElement("style");
      style.textContent = `@import url('${fontUrl}');`;
      document.head.appendChild(style);
      onFontAdded(extractedFontName || fontUrl);
      onClose();
    } else {
      setError("Please provide a font file or a URL.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{g ? g("Add Custom Font") : "Add Custom Font"}</DialogTitle>
      <DialogContent>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: "1px dashed #ccc",
            padding: 20,
            marginBottom: 10,
            textAlign: "center",
            borderRadius: 8,
          }}
        >
          Drag & drop a font file here
          <br />
          <input
            type="file"
            accept=".woff,.woff2,.ttf,.otf"
            onChange={handleFileInput}
            style={{ marginTop: 8 }}
          />
        </div>
        <div style={{ margin: "10px 0" }}>or</div>
        <CustomTextField
          type="text"
          placeholder="Paste a Google Fonts or custom font URL"
          value={fontUrl}
          onChange={(e) => {
            setFontUrl(e.target.value);
            setFile(null);
            setFontName("");
            setError("");
          }}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
          Example:
          <br />
          <code>
            @import
            url('https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap');
          </code>
        </div>
        <CustomTextField
          type="text"
          placeholder="Font name (optional)"
          value={fontName}
          onChange={(e) => setFontName(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained">
          {g ? g("GeneralTranslations.t.ok") : "Add Font"}
        </Button>
        <Button onClick={onClose} variant="outlined">
          {g ? g("GeneralTranslations.t.cancel") : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TextfieldSelector({
  type,
  options,
  value,
  freeSolo,
  label,
  onChange,
  renderOption,
  textfieldProps,
  importFonts = false,
  g,
}: TextfieldSelectorProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const dispatch = useDispatch();
  // Check if the current value exists in the options or custom fonts
  const extraFonts = useSelector(
    (state: RootState) => state.fabricPageReducer.fontList || []
  );
  const allOptions = [...options, ...extraFonts];
  const currentValueExists = allOptions.some(
    (option) =>
      (option as { label: string; value: number | string; [key: string]: any })
        .value === value
  );

  // Create grouped options if current value does not exist
  const groupedOptions = currentValueExists
    ? allOptions
    : [
        {
          value: value,
          label: `${value === 0 ? "" : value}`,
          group: "Current Value",
        },
        ...allOptions.map((option) => ({
          ...(option as {
            label: string;
            value: number | string;
            [key: string]: any;
          }),
          group: "All Options",
        })),
      ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (e.key === "Enter") {
      onChange(target.valueAsNumber);
      target.blur();
    }
  };
  const handleBlur = (e) => {
    const target = e.target as HTMLInputElement;
    if (target.valueAsNumber === 0 || Number.isNaN(target.valueAsNumber)) {
      onChange(value);
    } else onChange(target.valueAsNumber);
  };

  const handleFontAdded = (fontName: string) => {
    dispatch(
      fabricPageActions.setFontList([
        ...extraFonts,
        { label: fontName, value: fontName },
      ])
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      <AutocompleteVirtualized
        textfieldProps={{
          type: type,
          hasArrows: false,
          label: label,
          id: "textfield-selector",
          hasBorder: true,
          onKeyDown: handleKeyDown,
          onBlur: handleBlur,
          ...textfieldProps,
        }}
        freeSolo={freeSolo}
        options={groupedOptions as any}
        value={value}
        onChange={(value) => {
          if (value !== undefined && value !== null) onChange(value);
        }}
        style={{ paddingBottom: 0, flex: 1 }}
        renderOption={renderOption}
      />
      {importFonts && (
        <Button
          style={{
            borderRadius: 4,
            border: "1px solid #888",
            flex: 0.2,
            cursor: "pointer",
            height: "100%",
            padding: "7px",
          }}
          variant="outlined"
          onClick={() => setModalOpen(true)}
        >
          {g ? g("Add Custom Font") : "Add Font"}
        </Button>
      )}
      {importFonts && modalOpen && (
        <CustomFontModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onFontAdded={handleFontAdded}
          g={g}
        />
      )}
    </div>
  );
}

export default TextfieldSelector;
