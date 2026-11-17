// hooks/useGlList.ts
import useSWR, { SWRConfiguration } from "swr";
import { fetcher } from "../../utils/Api";
import { fetcherNphies } from "../../utils/ApiNphies";
import { useState, useCallback, useEffect } from "react";

interface UseGlListParams {
  url?: string;
  initParams?: Record<string, any>;
  options?: SWRConfiguration;
  nphiesFetcher?: boolean;
}

interface UseGlListReturn<T> {
  glList: T;
  isLoading: boolean;
  isError: any;
  mutateGlList: () => void;
  isValidatingGlList: boolean;
  handleParamsChange: (newParams: Record<string, any>) => void;
  replaceParams: (newParams: Record<string, any>) => void;
}

export function useGlList<T = any>({
  url,
  initParams = {},
  options = {},
  nphiesFetcher,
}: UseGlListParams): UseGlListReturn<T> {
  useEffect(() => {
    console.log("useGlList mounted");
    return () => {
      console.log("useGlList unmounted");
    };
  }, []);
  const fetcherForChoosenBackend = nphiesFetcher ? fetcherNphies : fetcher;
  const [params, setParams] = useState(initParams);

  const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
    keepPreviousData: true,
    errorRetryCount: 3,
    ...options,
  };

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    url ? [url, { params }] : null,
    fetcherForChoosenBackend,
    swrConfig
  );

  const handleParamsChange = useCallback((newParams: Record<string, any>) => {
    setParams((prevParams) => ({ ...prevParams, ...newParams }));
  }, []);

  const replaceParams = useCallback((newParams: Record<string, any>) => {
    setParams(newParams);
  }, []);

  return {
    glList: data,
    isLoading,
    isError: error,
    mutateGlList: mutate,
    isValidatingGlList: isValidating,
    handleParamsChange,
    replaceParams,
  };
}
