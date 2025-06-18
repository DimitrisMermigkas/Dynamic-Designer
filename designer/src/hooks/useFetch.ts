import { useEffect, useMemo, useRef, useState } from "react";

type LoadingStatus = "idle" | "loading" | "success" | "failure";

export default function useFetch<ResponseType>(
  url: string,
  args?: RequestInit
) {
  const [data, setData] = useState<ResponseType | null>(null);
  const [status, setStatus] = useState<LoadingStatus>("idle");

  const isMounted = useRef(false);

  const argsMemoized = useMemo(() => args, [JSON.stringify(args)]);

  useEffect(() => {
    if (!isMounted.current) {
      setStatus("loading");
      fetch(url, { method: "GET", ...argsMemoized })
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setStatus("success");
        })
        .catch((err) => setStatus("failure"));
    }
    isMounted.current = true;
  }, [url, argsMemoized]);

  return {
    json: data,
    status,
    loading: status === "loading",
    error: status === "failure",
  };
}
