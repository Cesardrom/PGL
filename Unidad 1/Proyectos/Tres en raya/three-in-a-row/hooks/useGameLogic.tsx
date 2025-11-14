import { useState, useEffect } from 'react';
import calculateWinner from '../utils/calculateWinner';

export const useGameLogic = (size: number, mode: string) => {
  const [board, setBoard] = useState<(string | null)[]>([]);
  const [turn, setTurn] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  // Inicializar tablero
  useEffect(() => {
    setBoard(Array(size * size).fill(null));
    setTurn('X');
    setWinner(null);
  }, [size]);

  // Manejar jugada en modo offline
  const handlePlayOffline = (x: number, y: number) => {
    if (winner || turn !== 'X') return;
    const index = x * size + y;
    if (board[index]) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    const { winner: win } = calculateWinner(newBoard, size);
    if (win) {
      setWinner(win);
      setWins(wins + 1);
    } else {
      setTurn('O');
      setTimeout(() => {
        const empty = newBoard.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
        if (empty.length > 0) {
          const rand = empty[Math.floor(Math.random() * empty.length)];
          const oppX = Math.floor(rand / size);
          const oppY = rand % size;
          const oppBoard = [...newBoard];
          oppBoard[rand] = 'O';
          setBoard(oppBoard);
          const { winner: oppWin } = calculateWinner(oppBoard, size);
          if (oppWin) {
            setWinner(oppWin);
            setLosses(losses + 1);
          } else {
            setTurn('X');
          }
        }
      }, 1000);
    }
  };

  const restartGame = () => {
    setBoard(Array(size * size).fill(null));
    setTurn('X');
    setWinner(null);
  };

  return {
    board,
    setBoard,
    turn,
    setTurn,
    winner,
    setWinner,
    wins,
    setWins,
    losses,
    setLosses,
    handlePlayOffline,
    restartGame,
  };
};
