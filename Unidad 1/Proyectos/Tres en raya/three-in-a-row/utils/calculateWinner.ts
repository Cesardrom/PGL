export default function calculateWinner(squares: (string | null)[], size: number): { winner: string | null; winningSquares: number[] } {
  const lines: number[][] = [];

  // Rows
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(i * size + j);
    }
    lines.push(row);
  }

  // Columns
  for (let i = 0; i < size; i++) {
    const col: number[] = [];
    for (let j = 0; j < size; j++) {
      col.push(j * size + i);
    }
    lines.push(col);
  }

  // Diagonals
  const diag1: number[] = [];
  const diag2: number[] = [];
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i);
    diag2.push(i * size + (size - 1 - i));
  }
  lines.push(diag1);
  lines.push(diag2);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const first = squares[line[0]];
    if (first && line.every(index => squares[index] === first)) {
      return { winner: first, winningSquares: line };
    }
  }
  return { winner: null, winningSquares: [] };
}
