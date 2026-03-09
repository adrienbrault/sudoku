import { memo } from "react";
import { DIGITS } from "../lib/constants.ts";
import type { AssistLevel, Cell as CellType } from "../lib/types.ts";

type CellProps = {
  cell: CellType;
  row: number;
  col: number;
  isSelected: boolean;
  isMultiSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  isConflict: boolean;
  isHintRelated?: boolean | undefined;
  isSameNumberRowCol?: boolean | undefined;
  assistLevel?: AssistLevel | undefined;
  onSelect: (row: number, col: number) => void;
  revealDelay?: number | undefined;
};

function getCellBgClass(opts: {
  isSelected: boolean;
  isMultiSelected: boolean;
  isPaper: boolean;
  isConflict: boolean;
  isHintRelated?: boolean | undefined;
  isSameNumber: boolean;
  isHighlighted: boolean;
  isSameNumberRowCol?: boolean | undefined;
}): string {
  if (opts.isSelected || opts.isMultiSelected) {
    return opts.isPaper ? "bg-cell-bg" : "bg-cell-selected";
  }
  if (opts.isConflict) return "bg-cell-conflict-bg";
  if (opts.isHintRelated) return "bg-amber-100 dark:bg-amber-900/40";
  if (opts.isSameNumber) return "bg-cell-same-number";
  if (opts.isHighlighted) return "bg-cell-highlight";
  if (opts.isSameNumberRowCol) return "bg-cell-match-row-col";
  return "bg-cell-bg";
}

export const Cell = memo(function Cell({
  cell,
  row,
  col,
  isSelected,
  isMultiSelected,
  isHighlighted,
  isSameNumber,
  isConflict,
  isHintRelated,
  isSameNumberRowCol,
  assistLevel = "standard",
  onSelect,
  revealDelay,
}: CellProps) {
  const isPaper = assistLevel === "paper";
  const bgClass = getCellBgClass({
    isSelected,
    isMultiSelected,
    isPaper,
    isConflict,
    isHintRelated,
    isSameNumber,
    isHighlighted,
    isSameNumberRowCol,
  });

  const textClass = cell.isGiven
    ? "text-cell-given font-bold"
    : isConflict
      ? "text-cell-conflict font-semibold"
      : "text-cell-user font-semibold";

  const borderRight =
    col === 2 || col === 5 ? "border-r-2 border-r-board-border" : "";
  const borderBottom =
    row === 2 || row === 5 ? "border-b-2 border-b-board-border" : "";

  return (
    <button
      type="button"
      className={`
				relative flex items-center justify-center
				aspect-square w-full
				border border-border-default
				${bgClass} ${borderRight} ${borderBottom}
				transition-colors duration-100
				select-none touch-manipulation
				outline-none focus-visible:ring-2 focus-visible:ring-accent
				${isSelected || isMultiSelected ? (isPaper ? "ring-2 ring-accent ring-inset" : "cell-selected-glow") : ""}
				${revealDelay !== undefined ? "animate-cell-reveal" : ""}
			`}
      style={
        revealDelay !== undefined
          ? { animationDelay: `${revealDelay}ms` }
          : undefined
      }
      data-row={row}
      data-col={col}
      onClick={() => onSelect(row, col)}
      aria-label={`Cell row ${row + 1} column ${col + 1}${cell.value ? `, value ${cell.value}` : ", empty"}`}
    >
      {cell.value ? (
        <span
          key={cell.value}
          className={`text-[clamp(0.875rem,4vw,1.5rem)] leading-none ${textClass} ${!cell.isGiven ? "animate-pop-in" : ""}`}
        >
          {cell.value}
        </span>
      ) : cell.notes.size > 0 ? (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[1px]">
          {DIGITS.map((n) => (
            <span
              key={n}
              className="flex items-center justify-center text-[clamp(0.5625rem,2.2vw,0.75rem)] text-text-secondary font-medium leading-none"
            >
              {cell.notes.has(n) ? n : ""}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
});
