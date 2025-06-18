import { useEffect, useMemo } from "react";
import { uniqueId } from "lodash";
import { useDispatch } from "react-redux";
import { generalActions } from "../Pages/GeneralRedAct";

const useUnsaved = (
  hasChanges?: boolean,
  id?: string,
  options?: { disabled?: boolean }
) => {
  const dispatch = useDispatch();

  const key = useMemo(() => id || uniqueId(), []);

  // Update reducer
  useEffect(() => {
    if (options?.disabled) return;
    dispatch(generalActions.updateUnsavedChangesByID({ id: key, hasChanges }));
  }, [hasChanges, options?.disabled]);

  // Clear key on unmount
  useEffect(() => {
    if (options?.disabled) return;
    return () => {
      dispatch(generalActions.clearUnsavedChangeByID(key));
    };
  }, [options?.disabled]);
};

export default useUnsaved;
