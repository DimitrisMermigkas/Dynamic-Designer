import { deepEqual } from "fast-equals";
import { useCallback, useEffect, useState } from "react";
import useUnsaved from "./useUnsaved";
import useValueHasChanged from "./useValueHasChanged";

/**
 * Keep a state containing unsaved data
 * @param  {any} initialData Initial state. If this changes then state will also reset to the new value.
 * @param  {Object} [options]
 * @param  {any[]} [options.resetDeps] List of items to watch for changes and reset state when changes occur
 */
export default function useUnsavedData<T>(
  initialData: T,
  options: { resetDeps?: any[]; allowNavigation?: boolean } = {}
) {
  const { resetDeps = [] } = options;

  const initialDataHasChanged = useValueHasChanged(initialData);

  const [unsavedData, setUnsavedData] = useState(initialData);

  const reset = useCallback(() => setUnsavedData(initialData), [initialData]);

  // Reset unsaved if initial data changes
  useEffect(() => {
    if (initialDataHasChanged) setUnsavedData(initialData);
  }, [initialDataHasChanged, ...resetDeps]);

  // Set to false if initial data has just changed, to prevent flashing
  const hasChanges =
    !deepEqual(unsavedData, initialData) && !initialDataHasChanged;

  useUnsaved(hasChanges, undefined, { disabled: options.allowNavigation });

  return { unsavedData, setUnsavedData, hasChanges, reset };
}
