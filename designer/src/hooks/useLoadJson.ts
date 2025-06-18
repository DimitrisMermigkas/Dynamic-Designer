import {
  Design,
  DesignerSchema,
} from "@hella_project/common/validation/schemaDesigner";

export default function useLoadJson() {
  let json: Design["Configuration"] | null = null;
  let error;
  try {
    json = JSON.parse(atob(window.DESIGN_CONFIG ?? ""));
    console.log("🚀 ~ useLoadJson ~ json:", json)
    // DesignerSchema.shape.Configuration.parse(json);
  } catch (err) {
    console.error(err);
    error = err;
  }
  return { json, error };
}
