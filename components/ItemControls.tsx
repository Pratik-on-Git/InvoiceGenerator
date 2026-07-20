"use client";

interface Props {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}

/**
 * Hover controls for a repeatable list item: reorder up/down + remove.
 * Rendered inside a `.rowwrap`; hidden outside edit mode and in print via CSS.
 */
export function ItemControls({ index, count, onMove, onRemove }: Props) {
  const stop = (e: React.MouseEvent) => e.preventDefault();
  return (
    <div className="item-ctrls" onMouseDown={stop}>
      <button
        type="button"
        className="ic"
        title="Move up"
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
      >
        ↑
      </button>
      <button
        type="button"
        className="ic"
        title="Move down"
        aria-label="Move down"
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
      >
        ↓
      </button>
      <button type="button" className="ic rm" title="Remove" aria-label="Remove" onClick={onRemove}>
        ×
      </button>
    </div>
  );
}
