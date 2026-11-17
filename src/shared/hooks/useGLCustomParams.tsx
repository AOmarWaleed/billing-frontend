import { useEffect, useRef } from "react";
import { isEqual } from "lodash";

export function useGLCustomParams(
  callback: () => void,
  params: Record<string, any>
) {
  const currentParams = useRef<Record<string, any>>();
  console.log(">>>>>>>>>param", params, currentParams.current);
  if (!currentParams.current || !isEqual(currentParams.current, params)) {
    currentParams.current = params;
  }

  useEffect(callback, [currentParams.current]);
}
