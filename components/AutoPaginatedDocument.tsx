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
  blockCount: number;
  blockKeys: string[];
  layoutKey: string;
  onPageCountChange: (count: number) => void;
  renderPage: (blockIndexes: number[], pageIndex: number) => ReactNode;
}

function samePages(left: string[][], right: string[][]) {
  return left.length === right.length
    && left.every((page, pageIndex) => (
      page.length === right[pageIndex]?.length
      && page.every((key, keyIndex) => key === right[pageIndex][keyIndex])
    ));
}

/**
 * Keep the current page boundaries where possible while atomically reconciling
 * additions, removals, and section toggles. Page state stores stable block keys
 * instead of array indexes so inserting a block cannot temporarily reinterpret
 * every following block or make the rest of the document disappear.
 */
function reconcilePages(current: string[][], orderedKeys: string[]) {
  if (orderedKeys.length === 0) return [[]];

  const order = new Map(orderedKeys.map((key, index) => [key, index]));
  const retained = current
    .map((page) => page.filter((key) => order.has(key)))
    .filter((page) => page.length > 0);
  if (retained.length === 0) return [[...orderedKeys]];

  const next: string[][] = [];
  let cursor = 0;
  for (let pageIndex = 0; pageIndex < retained.length - 1; pageIndex += 1) {
    const end = Math.max(...retained[pageIndex].map((key) => order.get(key) ?? -1));
    if (end < cursor) continue;
    next.push(orderedKeys.slice(cursor, end + 1));
    cursor = end + 1;
  }
  if (cursor < orderedKeys.length) next.push(orderedKeys.slice(cursor));
  return next.length > 0 ? next : [[...orderedKeys]];
}

/**
 * Packs one continuous stream of document blocks into physical A4 sheets.
 * Blocks from different sections may share a sheet; a trailing block moves to
 * the next sheet only when the browser confirms that the complete page overflows.
 */
export function AutoPaginatedDocument({ blockCount, blockKeys, layoutKey, onPageCountChange, renderPage }: Props) {
  const blockSignature = blockKeys.join("\u001f");
  const keyToIndex = useMemo(
    () => new Map(blockKeys.map((key, index) => [key, index])),
    // blockSignature represents the ordered keys without retaining an unstable
    // array identity from Doc's render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blockSignature],
  );
  const [pages, setPages] = useState<string[][]>(() => [[...blockKeys]]);
  const [renderedBlockSignature, setRenderedBlockSignature] = useState(blockSignature);
  const [scales, setScales] = useState<Record<number, number>>({});
  const contentRefs = useRef(new Map<number, HTMLDivElement>());
  const blockedPulls = useRef(new Set<number>());
  const pullTrial = useRef<{ boundary: number; block: string } | null>(null);

  // React immediately retries this render with the reconciled partition. That
  // prevents even a one-frame gap where a newly inserted tail block (and its
  // add control) is absent while a user is making rapid consecutive edits.
  if (renderedBlockSignature !== blockSignature) {
    blockedPulls.current.clear();
    pullTrial.current = null;
    setRenderedBlockSignature(blockSignature);
    setScales({});
    setPages((current) => {
      const next = reconcilePages(current, blockKeys);
      return samePages(current, next) ? current : next;
    });
  }

  // Text edits can change measured height without changing the block stream.
  // Preserve the partition, clear failed-fit memoization, and let the observer
  // incrementally move or backfill the affected blocks after the edit settles.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) return;
      blockedPulls.current.clear();
      pullTrial.current = null;
      setScales({});
    }, 80);
    return () => window.clearTimeout(id);
  }, [layoutKey]);

  useEffect(() => {
    const id = window.setTimeout(() => onPageCountChange(pages.length), 0);
    return () => window.clearTimeout(id);
  }, [onPageCountChange, pages.length]);

  const reflow = useCallback(() => {
    // Reparenting a focused contenteditable would destroy its caret. Its blur
    // commit changes layoutKey and triggers a complete repack immediately after.
    if (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable) return;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const content = contentRefs.current.get(pageIndex);
      const body = content?.parentElement;
      if (!content || !body || scales[pageIndex]) continue;

      const naturalHeight = Math.max(content.scrollHeight, content.offsetHeight);
      if (naturalHeight <= body.clientHeight + 1) continue;

      const trial = pullTrial.current;
      if (trial?.boundary === pageIndex) {
        // The speculative pull did not fit. Put that exact block back and
        // remember the boundary until document content changes.
        blockedPulls.current.add(pageIndex);
        pullTrial.current = null;
        setPages((current) => {
          const next = current.map((items) => [...items]);
          const currentPage = next[pageIndex];
          if (!currentPage || currentPage[currentPage.length - 1] !== trial.block) return current;
          currentPage.pop();
          if (next[pageIndex + 1]) next[pageIndex + 1].unshift(trial.block);
          else next.splice(pageIndex + 1, 0, [trial.block]);
          return next;
        });
        return;
      }

      const pageBlocks = pages[pageIndex];
      if (pageBlocks.length > 1) {
        const bodyBottom = body.getBoundingClientRect().bottom;
        let splitAt = pageBlocks.findIndex((key) => {
          const markers = content.querySelectorAll<HTMLElement>(`[data-flow-key="${CSS.escape(key)}"]`);
          return [...markers].some((marker) => marker.getBoundingClientRect().bottom > bodyBottom + 1);
        });

        // If editor-only tail chrome caused the overflow, the final atomic block
        // is the safest unit to move. Never create an empty physical page: a
        // single oversized first block is handled by scale-to-fit on the next pass.
        if (splitAt < 0) splitAt = pageBlocks.length - 1;
        splitAt = Math.max(1, splitAt);

        setScales({});
        setPages((current) => {
          const next = current.map((items) => [...items]);
          // A rapid edit may have reset the page array after this measurement
          // was queued. Ignore stale observer work instead of touching a page
          // that no longer exists.
          if (!next[pageIndex]) return current;
          const moved = next[pageIndex].splice(splitAt);
          if (moved.length === 0) return current;
          if (next[pageIndex + 1]) next[pageIndex + 1].unshift(...moved);
          else next.push(moved);
          return next;
        });
        return;
      }

      // A genuinely indivisible block cannot become shorter on an identical
      // continuation sheet. Scale only that sheet as the final no-clipping guard.
      const scale = Math.min(1, body.clientHeight / Math.max(naturalHeight, 1));
      setScales((current) => ({ ...current, [pageIndex]: scale }));
      return;
    }

    // Every page fits. Pull the first block from a following page backward and
    // let the next measured frame accept or revert it. This closes gaps caused
    // by conditional headings, font hydration, and grid row reflow.
    pullTrial.current = null;
    const boundary = pages.findIndex((_, index) => (
      index < pages.length - 1
      && pages[index + 1].length > 0
      && !blockedPulls.current.has(index)
      && !scales[index]
    ));
    if (boundary >= 0) {
      const block = pages[boundary + 1][0];
      pullTrial.current = { boundary, block };
      setPages((current) => {
        const next = current.map((items) => [...items]);
        if (!next[boundary] || next[boundary + 1]?.[0] !== block) return current;
        next[boundary].push(block);
        next[boundary + 1].shift();
        if (next[boundary + 1].length === 0) next.splice(boundary + 1, 1);
        return next;
      });
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

    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(schedule);
    contentRefs.current.forEach((node) => observer?.observe(node));
    schedule();
    document.fonts?.ready.then(schedule).catch(() => undefined);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pages, reflow]);

  return (
    <>
      {pages.map((pageKeys, pageIndex) => (
        <PageFrame
          key={pageIndex}
          pageNo={pageIndex + 1}
          total={pages.length}
          contentScale={scales[pageIndex]}
          contentRef={(node) => {
            if (node) contentRefs.current.set(pageIndex, node);
            else contentRefs.current.delete(pageIndex);
          }}
        >
          {renderPage(
            pageKeys
              .map((key) => keyToIndex.get(key))
              .filter((index): index is number => index !== undefined && index < blockCount),
            pageIndex,
          )}
        </PageFrame>
      ))}
    </>
  );
}
