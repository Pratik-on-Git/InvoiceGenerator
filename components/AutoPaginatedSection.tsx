"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { PageFrame } from "./PageFrame";

interface Props {
  itemCount: number;
  layoutKey: string;
  startPage: number;
  total: number;
  onPageCountChange: (count: number) => void;
  renderPage: (itemIndexes: number[], pageIndex: number, isLast: boolean) => ReactNode;
}

export interface PaginatedSectionProps {
  startPage: number;
  total: number;
  onPageCountChange: (count: number) => void;
}

/**
 * Splits a section across fixed A4 sheets using the browser's actual layout
 * measurements. Items are moved as atomic blocks, so cards and grid rows never
 * get cut between pages. A single item that is taller than an entire continuation
 * sheet is scaled as a final safety net instead of being clipped.
 */
export function AutoPaginatedSection({
  itemCount,
  layoutKey,
  startPage,
  total,
  onPageCountChange,
  renderPage,
}: Props) {
  const allItems = useMemo(() => Array.from({ length: itemCount }, (_, i) => i), [itemCount]);
  const [pages, setPages] = useState<number[][]>(() => [allItems]);
  const [scales, setScales] = useState<Record<number, number>>({});
  const contentRefs = useRef(new Map<number, HTMLDivElement>());

  // Text edits and list changes can make an earlier page able to accept more
  // content, so restart from one page and greedily paginate again.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) return;
      setPages([allItems]);
      setScales({});
    }, 0);
    return () => window.clearTimeout(id);
  }, [allItems, layoutKey]);

  useEffect(() => {
    const id = window.setTimeout(() => onPageCountChange(pages.length), 0);
    return () => window.clearTimeout(id);
  }, [onPageCountChange, pages.length]);

  const reflow = useCallback(() => {
    // Moving a contenteditable node between page components would destroy the
    // caret. Let its blur commit trigger the normal layout reset instead.
    if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) return;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const content = contentRefs.current.get(pageIndex);
      const body = content?.parentElement;
      if (!content || !body || scales[pageIndex]) continue;

      const naturalHeight = Math.max(content.scrollHeight, content.offsetHeight);
      if (naturalHeight <= body.clientHeight + 1) continue;

      const pageItems = pages[pageIndex];
      const canMoveLastItem = pageItems.length > 1 || (pageIndex === 0 && pageItems.length === 1);

      if (canMoveLastItem) {
        setScales({});
        setPages((current) => {
          const next = current.map((items) => [...items]);
          // A text/list reset may have compacted the pages after this observer
          // callback was scheduled. Ignore that stale measurement safely.
          if (!next[pageIndex]) return current;
          const moved = next[pageIndex].pop();
          if (moved === undefined) return current;
          if (next[pageIndex + 1]) next[pageIndex + 1].unshift(moved);
          else next.push([moved]);
          return next;
        });
        return;
      }

      // An indivisible block cannot be sent to another identical continuation
      // sheet. Scale it as a final safeguard so nothing is clipped in the PDF.
      const scale = Math.min(1, body.clientHeight / Math.max(naturalHeight, 1));
      setScales((current) => ({ ...current, [pageIndex]: scale }));
      return;
    }
  }, [pages, scales]);

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!cancelled) reflow();
      });
    };

    const observer = new ResizeObserver(schedule);
    contentRefs.current.forEach((node) => observer.observe(node));
    schedule();
    document.fonts?.ready.then(schedule).catch(() => undefined);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pages, reflow]);

  return (
    <>
      {pages.map((itemIndexes, pageIndex) => (
        <PageFrame
          key={pageIndex}
          pageNo={startPage + pageIndex}
          total={total}
          contentScale={scales[pageIndex]}
          contentRef={(node) => {
            if (node) contentRefs.current.set(pageIndex, node);
            else contentRefs.current.delete(pageIndex);
          }}
        >
          {renderPage(itemIndexes, pageIndex, pageIndex === pages.length - 1)}
        </PageFrame>
      ))}
    </>
  );
}
