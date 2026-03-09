import { describe, expect, it } from "bun:test";
import {
  boxOrigin,
  cellKey,
  generatePuzzle,
  getCandidates,
  getConflicts,
  getErrors,
  isBoardComplete,
  parsePuzzle,
  solvePuzzle,
} from "./sudoku.ts";
import type { Board } from "./types.ts";

// A known valid puzzle and its solution — avoids calling generatePuzzle in every test
const KNOWN_PUZZLE =
  "..4.7...2....89...8...6.9....6...54.7.....3..1............974...2..18.....3..5.6.";
const KNOWN_SOLUTION =
  "594173682267589134831462957386721549742956318159834276618397425425618793973245861";

describe("boxOrigin", () => {
  it("returns {0,0} for cells in the top-left box", () => {
    expect(boxOrigin(0, 0)).toEqual({ boxRow: 0, boxCol: 0 });
    expect(boxOrigin(2, 2)).toEqual({ boxRow: 0, boxCol: 0 });
  });

  it("returns correct origin for mid-board cells", () => {
    expect(boxOrigin(4, 7)).toEqual({ boxRow: 3, boxCol: 6 });
    expect(boxOrigin(3, 6)).toEqual({ boxRow: 3, boxCol: 6 });
  });

  it("returns {6,6} for cells in the bottom-right box", () => {
    expect(boxOrigin(8, 8)).toEqual({ boxRow: 6, boxCol: 6 });
    expect(boxOrigin(6, 6)).toEqual({ boxRow: 6, boxCol: 6 });
  });
});

describe("getCandidates", () => {
  it("returns all 9 digits for an empty board cell", () => {
    const board = parsePuzzle(".".repeat(81));
    expect(getCandidates(board, 0, 0).size).toBe(9);
  });

  it("excludes values already in the same row", () => {
    // Row 0: 1,2,3 in cols 0-2; cell at (0,3) cannot be 1, 2, or 3
    const board = parsePuzzle("123" + ".".repeat(78));
    const candidates = getCandidates(board, 0, 3);
    expect(candidates.has(1)).toBe(false);
    expect(candidates.has(2)).toBe(false);
    expect(candidates.has(3)).toBe(false);
    expect(candidates.has(4)).toBe(true);
  });

  it("excludes values already in the same column", () => {
    // Col 0: value 7 in row 5; cell at (0,0) cannot be 7
    const board = parsePuzzle(".".repeat(45) + "7" + ".".repeat(35));
    const candidates = getCandidates(board, 0, 0);
    expect(candidates.has(7)).toBe(false);
  });

  it("excludes values already in the same box", () => {
    // Cell (2,2) has value 9; cell (0,0) is in the same box
    const board = parsePuzzle(".".repeat(20) + "9" + ".".repeat(60));
    const candidates = getCandidates(board, 0, 0);
    expect(candidates.has(9)).toBe(false);
  });
});

describe("generatePuzzle", () => {
  it("returns an 81-character string", () => {
    const puzzle = generatePuzzle("medium");
    expect(puzzle).toHaveLength(81);
  });

  it("contains only digits 0-9 and dots for empty cells", () => {
    const puzzle = generatePuzzle("medium");
    expect(puzzle).toMatch(/^[1-9.]{81}$/);
  });

  it("has more clues for easier difficulties", () => {
    const easy = generatePuzzle("easy");
    const expert = generatePuzzle("expert");
    const easyClues = easy.replace(/\./g, "").length;
    const expertClues = expert.replace(/\./g, "").length;
    expect(easyClues).toBeGreaterThan(expertClues);
  });

  it("generates different puzzles on each call", () => {
    const a = generatePuzzle("medium");
    const b = generatePuzzle("medium");
    expect(a).not.toBe(b);
  });
});

describe("solvePuzzle", () => {
  it("returns a valid 81-character solution", () => {
    const solution = solvePuzzle(KNOWN_PUZZLE);
    expect(solution).toHaveLength(81);
    expect(solution).toMatch(/^[1-9]{81}$/);
  });

  it("solution contains all digits 1-9 in each row", () => {
    const solution = solvePuzzle(KNOWN_PUZZLE);
    for (let row = 0; row < 9; row++) {
      const digits = solution.slice(row * 9, row * 9 + 9).split("");
      expect(new Set(digits).size).toBe(9);
    }
  });

  it("solution contains all digits 1-9 in each column", () => {
    const solution = solvePuzzle(KNOWN_PUZZLE);
    for (let col = 0; col < 9; col++) {
      const digits: string[] = [];
      for (let row = 0; row < 9; row++) {
        digits.push(solution[row * 9 + col]!);
      }
      expect(new Set(digits).size).toBe(9);
    }
  });

  it("preserves given clues from the puzzle", () => {
    const solution = solvePuzzle(KNOWN_PUZZLE);
    for (let i = 0; i < 81; i++) {
      if (KNOWN_PUZZLE[i] !== ".") {
        expect(solution[i]).toBe(KNOWN_PUZZLE[i]);
      }
    }
  });
});

describe("parsePuzzle", () => {
  it("returns a 9x9 board", () => {
    const board = parsePuzzle(KNOWN_PUZZLE);
    expect(board).toHaveLength(9);
    for (const row of board) {
      expect(row).toHaveLength(9);
    }
  });

  it("marks given cells correctly", () => {
    const board = parsePuzzle(KNOWN_PUZZLE);
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const char = KNOWN_PUZZLE[row * 9 + col];
        if (char !== ".") {
          expect(board[row]![col]!.isGiven).toBe(true);
          expect(board[row]![col]!.value).toBe(Number(char));
        } else {
          expect(board[row]![col]!.isGiven).toBe(false);
          expect(board[row]![col]!.value).toBeNull();
        }
      }
    }
  });

  it("initializes empty notes for all cells", () => {
    const board = parsePuzzle(KNOWN_PUZZLE);
    for (const row of board) {
      for (const cell of row) {
        expect(cell.notes).toBeInstanceOf(Set);
        expect(cell.notes.size).toBe(0);
      }
    }
  });
});

describe("getConflicts", () => {
  it("returns empty set when no conflicts", () => {
    const board = parsePuzzle(KNOWN_SOLUTION);
    const conflicts = getConflicts(board);
    expect(conflicts.size).toBe(0);
  });

  it("detects row conflict", () => {
    const board = makeEmptyBoard();
    board[0]![0]!.value = 5;
    board[0]![4]!.value = 5;
    const conflicts = getConflicts(board);
    expect(conflicts.has(cellKey(0, 0))).toBe(true);
    expect(conflicts.has(cellKey(0, 4))).toBe(true);
  });

  it("detects column conflict", () => {
    const board = makeEmptyBoard();
    board[0]![0]!.value = 3;
    board[5]![0]!.value = 3;
    const conflicts = getConflicts(board);
    expect(conflicts.has(cellKey(0, 0))).toBe(true);
    expect(conflicts.has(cellKey(5, 0))).toBe(true);
  });

  it("detects box conflict", () => {
    const board = makeEmptyBoard();
    board[0]![0]!.value = 7;
    board[2]![2]!.value = 7;
    const conflicts = getConflicts(board);
    expect(conflicts.has(cellKey(0, 0))).toBe(true);
    expect(conflicts.has(cellKey(2, 2))).toBe(true);
  });

  it("does not flag non-conflicting cells", () => {
    const board = makeEmptyBoard();
    board[0]![0]!.value = 1;
    board[0]![1]!.value = 2;
    board[1]![0]!.value = 3;
    const conflicts = getConflicts(board);
    expect(conflicts.size).toBe(0);
  });
});

describe("getErrors", () => {
  it("returns empty set when all user values match the solution", () => {
    const board = parsePuzzle(KNOWN_PUZZLE);
    // Fill in all empty cells with the correct solution values
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!board[row]![col]!.isGiven) {
          board[row]![col]!.value = Number(KNOWN_SOLUTION[row * 9 + col]);
        }
      }
    }
    const errors = getErrors(board, KNOWN_SOLUTION);
    expect(errors.size).toBe(0);
  });

  it("flags a cell whose value differs from the solution", () => {
    const board = parsePuzzle(KNOWN_PUZZLE);
    // KNOWN_SOLUTION[0] is '5', so cell (0,0) is given as 5 — find an empty cell
    // Cell (0,0) is '.', so it's empty. Solution value is '5'.
    board[0]![0]!.value = 9; // wrong value (solution is 5)
    const errors = getErrors(board, KNOWN_SOLUTION);
    expect(errors.has(cellKey(0, 0))).toBe(true);
  });

  it("does not flag given cells even if they appear in the check", () => {
    const board = parsePuzzle(KNOWN_PUZZLE);
    // Given cells should never be flagged
    const errors = getErrors(board, KNOWN_SOLUTION);
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row]![col]!.isGiven) {
          expect(errors.has(cellKey(row, col))).toBe(false);
        }
      }
    }
  });

  it("does not flag empty cells", () => {
    const board = parsePuzzle(KNOWN_PUZZLE);
    const errors = getErrors(board, KNOWN_SOLUTION);
    expect(errors.size).toBe(0);
  });
});

describe("isBoardComplete", () => {
  it("returns true for a fully solved board", () => {
    const board = parsePuzzle(KNOWN_SOLUTION);
    expect(isBoardComplete(board)).toBe(true);
  });

  it("returns false when cells are empty", () => {
    const board = parsePuzzle(KNOWN_PUZZLE);
    expect(isBoardComplete(board)).toBe(false);
  });

  it("returns false when there are conflicts even if all filled", () => {
    const board = makeEmptyBoard();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        board[r]![c]!.value = 1;
      }
    }
    expect(isBoardComplete(board)).toBe(false);
  });
});

function makeEmptyBoard(): Board {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({
      value: null,
      isGiven: false,
      notes: new Set<number>(),
    })),
  );
}
