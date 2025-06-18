import { deepEqual } from "fast-equals";
import { useEffect, useRef } from "react";

export default function useValueHasChanged<T>(
  value: T,
  compare: (previous: T, next: T) => boolean = deepEqual<T, T>
) {
  const previousRef = useRef(value);
  const previous = previousRef.current;
  const isEqual = compare(previous, value);

  useEffect(() => {
    if (!isEqual) previousRef.current = value;
  }, [value]);

  return !isEqual;
}
