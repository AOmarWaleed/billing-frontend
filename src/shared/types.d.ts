interface GlListResponse<T> {
  data: T[];
  total: number;
}

interface UseGlListParams {
  url: string;
  initParams?: Record<string, any>;
  options?: any;
  customFetch?: any
}

interface UseGlListReturn<T> {
  glList: GlListResponse<T> | undefined;
  isLoading: boolean;
  isError: any;
  mutateGlList: () => void;
  isValidatingGlList: boolean;
  handleParamsChange: (newParams: Record<string, any>) => void;
  replaceParams: (newParams: Record<string, any>) => void;

}

