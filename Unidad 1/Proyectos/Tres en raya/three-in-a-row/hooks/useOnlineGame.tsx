import { useState, useEffect } from 'react';
import { registerDevice, loadStats, createMatch, checkWaitingStatus, syncGame, makeMove } from '../utils/apiService';

export const useOnlineGame = (size: number) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [board, setBoard] = useState<(string | null)[]>([]);
  const [turn, setTurn] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ [key: string]: string } | null>(null);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registrar dispositivo al inicializar
  useEffect(() => {
    const init = async () => {
      try {
        const id = await registerDevice();
        setDeviceId(id);
        const stats = await loadStats(id);
        setWins(stats.wins);
        setLosses(stats.losses);
      } catch (err) {
        setError('Error conectando al servidor.');
      }
    };
    init();
  }, []);

  // Polling para sincronizar juego
  useEffect(() => {
    if (matchId) {
      const interval = setInterval(async () => {
        try {
          const data = await syncGame(matchId);
          setBoard(data.board.flat());
          setTurn(data.turn);
          setWinner(data.winner);
          setPlayers(data.players);
          if (data.winner && deviceId) {
            const stats = await loadStats(deviceId);
            setWins(stats.wins);
            setLosses(stats.losses);
          }
        } catch (err) {
          setError('Error sincronizando partida.');
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [matchId, deviceId]);

  const startMatch = async () => {
    if (!deviceId) return;
    setWaiting(true);
    setError(null);
    try {
      const res = await createMatch(deviceId, size);
      if (res.status === 202) {
        const check = async () => {
          try {
            const data = await checkWaitingStatus(deviceId);
            if (data.status === 'matched') {
              setMatchId(data.match_id);
              setBoard(Array(size * size).fill(null));
              setPlayers(data.players);
              setTurn(data.players[deviceId]);
              setWinner(null);
              setWaiting(false);
            } else {
              setTimeout(check, 2000);
            }
          } catch (err) {
            setError('Error verificando estado de espera.');
          }
        };
        check();
      } else if (res.status === 201) {
        setMatchId(res.data.match_id);
        setBoard(Array(size * size).fill(null));
        setPlayers(res.data.players);
        setTurn(res.data.players[deviceId]);
        setWinner(null);
        setWaiting(false);
      }
    } catch (err) {
      setError('Error creando partida.');
      setWaiting(false);
    }
  };

  const playMove = async (x: number, y: number) => {
    if (!matchId || !deviceId || turn !== deviceId || winner) return;
    try {
      const data = await makeMove(matchId, deviceId, x, y);
      setBoard(data.board.flat());
      setTurn(data.next_turn);
      setWinner(data.winner);
      if (data.winner) {
        const stats = await loadStats(deviceId);
        setWins(stats.wins);
        setLosses(stats.losses);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('No es tu turno.');
      } else if (err.response?.status === 400) {
        setError('Movimiento inválido.');
      } else {
        setError('Error realizando movimiento.');
      }
    }
  };

  const resetDevice = async () => {
    setDeviceId(null);
    setWins(0);
    setLosses(0);
    setMatchId(null);
    setWaiting(false);
    setBoard([]);
    setTurn(null);
    setWinner(null);
    setPlayers(null);
    setError(null);
    try {
      const id = await registerDevice();
      setDeviceId(id);
      const stats = await loadStats(id);
      setWins(stats.wins);
      setLosses(stats.losses);
    } catch (err) {
      setError('Error reseteando dispositivo.');
    }
  };

  const restartGame = () => {
    setMatchId(null);
    setWaiting(false);
    setBoard([]);
    setTurn(null);
    setWinner(null);
    setPlayers(null);
    setError(null);
  };

  return {
    deviceId,
    matchId,
    board,
    turn,
    winner,
    players,
    wins,
    losses,
    waiting,
    error,
    startMatch,
    playMove,
    resetDevice,
    restartGame,
  };
};
