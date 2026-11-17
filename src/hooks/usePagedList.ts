// components/paged-autocomplete/usePagedList.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type FetchPageFn<T> = (args: { q: string; page: number; limit: number }) =>
  Promise<{ totalCount: number; data: T[] }>;

export function usePagedList<T>(
  fetchPage: FetchPageFn<T>,
  {
    pageSize = 50,
    maxPagesBuffered = 6,
    query = "",
  }: { pageSize?: number; maxPagesBuffered?: number; query?: string }
) {
  const [pages, setPages] = useState<Map<number, T[]>>(new Map());
  const [firstPage, setFirstPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const inflight = useRef<Set<number>>(new Set());

  // reset when query changes
  useEffect(() => {
    setPages(new Map());
    setFirstPage(1);
    setLastPage(1);
    setTotalCount(0);
    inflight.current.clear();
  }, [query, pageSize]);

  const loadPage = useCallback(async (page: number) => {
    if (page < 1) return;
    if (inflight.current.has(page)) return;
    if (pages.has(page)) return;

    inflight.current.add(page);
    setLoading(true);
    try {
      const res = await fetchPage({ q: query, page, limit: pageSize });
      setTotalCount(res.totalCount || 0);
      setPages(prev => {
        const next = new Map(prev);
        next.set(page, res.data);
        return next;
      });
      setFirstPage(f => Math.min(f, page));
      setLastPage(l => Math.max(l, page));
    } finally {
      inflight.current.delete(page);
      setLoading(false);
    }
  }, [fetchPage, pageSize, pages, query]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canLoadPrev = firstPage > 1;
  const canLoadNext = lastPage < totalPages;

  const trimIfNeeded = useCallback((direction: "append" | "prepend") => {
    const countPages = lastPage - firstPage + 1;
    if (countPages <= maxPagesBuffered) return;

    setPages(prev => {
      const next = new Map(prev);
      if (direction === "append") {
        next.delete(firstPage);
        setFirstPage(f => f + 1);
      } else {
        next.delete(lastPage);
        setLastPage(l => l - 1);
      }
      return next;
    });
  }, [firstPage, lastPage, maxPagesBuffered]);

  const options = useMemo(() => {
    const out: T[] = [];
    for (let p = firstPage; p <= lastPage; p++) {
      const data = pages.get(p);
      if (data) out.push(...data);
    }
    return out;
  }, [pages, firstPage, lastPage]);

  return {
    pageSize,
    totalCount,
    totalPages,
    options,
    loading,
    firstPage,
    lastPage,
    canLoadPrev,
    canLoadNext,
    loadPage,
    trimIfNeeded,
  };
}
