import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Board from './components/board';
import calculateWinner from '../utils/calculateWinner';
import { registerDevice, loadStats, createMatch, checkWaitingStatus, syncGame, makeMove } from '../utils/apiService';

export default function Game() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const router = useRouter();
  const [size, setSize] = useState(3);

  // Estados para lógica offline
  const [offlineBoard, setOfflineBoard] = useState<(string | null)[]>([]);
  const [offlineTurn, setOfflineTurn] = useState<string | null>(null);
  const [offlineWinner, setOfflineWinner] = useState<string | null>(null);
  const [offlineWins, setOfflineWins] = useState(0);
  const [offlineLosses, setOfflineLosses] = useState(0);
  const [offlineGameStarted, setOfflineGameStarted] = useState(false);

  // Estados para lógica online
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [onlineBoard, setOnlineBoard] = useState<(string | null)[]>([]);
  const [onlineTurn, setOnlineTurn] = useState<string | null>(null);
  const [onlineWinner, setOnlineWinner] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ [key: string]: string } | null>(null);
  const [onlineWins, setOnlineWins] = useState(0);
  const [onlineLosses, setOnlineLosses] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determinar qué lógica usar según el modo
  const isOnline = mode === 'online';
  // Inicializar tablero offline
  useEffect(() => {
    setOfflineBoard(Array(size * size).fill(null));
    setOfflineTurn('X');
    setOfflineWinner(null);
    setOfflineGameStarted(false);
  }, [size]);

  // Registrar dispositivo online
  useEffect(() => {
    if (isOnline) {
      const init = async () => {
        try {
          const id = await registerDevice();
          setDeviceId(id);
          const stats = await loadStats(id);
          setOnlineWins(stats.wins);
          setOnlineLosses(stats.losses);
        } catch (err) {
          setError('Error conectando al servidor.');
        }
      };
      init();
    }
  }, [isOnline]);

  // Polling para sincronizar juego online
  useEffect(() => {
    if (matchId) {
      const interval = setInterval(async () => {
        try {
          const data = await syncGame(matchId);
          setOnlineBoard(data.board.flat());
          setOnlineTurn(data.turn);
          setOnlineWinner(data.winner);
          setPlayers(data.players);
          if (data.winner && deviceId) {
            const stats = await loadStats(deviceId);
            setOnlineWins(stats.wins);
            setOnlineLosses(stats.losses);
          }
        } catch (err) {
          setError('Error sincronizando partida.');
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [matchId, deviceId]);

  // Funciones offline
  const handlePlayOffline = (x: number, y: number) => {
    if (!offlineGameStarted || offlineWinner || offlineTurn !== 'X') return;
    const index = x * size + y;
    if (offlineBoard[index]) return;
    const newBoard = [...offlineBoard];
    newBoard[index] = 'X';
    setOfflineBoard(newBoard);
    const { winner: win } = calculateWinner(newBoard, size);
    if (win) {
      setOfflineWinner(win);
      setOfflineWins(offlineWins + 1);
    } else {
      setOfflineTurn('O');
      setTimeout(() => {
        const empty = newBoard.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
        if (empty.length > 0) {
          const rand = empty[Math.floor(Math.random() * empty.length)];
          const oppX = Math.floor(rand / size);
          const oppY = rand % size;
          const oppBoard = [...newBoard];
          oppBoard[rand] = 'O';
          setOfflineBoard(oppBoard);
          const { winner: oppWin } = calculateWinner(oppBoard, size);
          if (oppWin) {
            setOfflineWinner(oppWin);
            setOfflineLosses(offlineLosses + 1);
          } else {
            setOfflineTurn('X');
          }
        }
      }, 1000);
    }
  };

  const restartOfflineGame = () => {
    setOfflineBoard(Array(size * size).fill(null));
    setOfflineTurn('X');
    setOfflineWinner(null);
    setOfflineGameStarted(false);
  };

  // Funciones online
  const startOnlineMatch = async () => {
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
              setOnlineBoard(Array(size * size).fill(null));
              setPlayers(data.players);
              setOnlineTurn(data.players[deviceId]);
              setOnlineWinner(null);
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
        setOnlineBoard(Array(size * size).fill(null));
        setPlayers(res.data.players);
        setOnlineTurn(res.data.players[deviceId]);
        setOnlineWinner(null);
        setWaiting(false);
      }
    } catch (err) {
      setError('Error creando partida.');
      setWaiting(false);
    }
  };

  const playOnlineMove = async (x: number, y: number) => {
    if (!matchId || !deviceId || onlineTurn !== deviceId || onlineWinner) return;
    try {
      const data = await makeMove(matchId, deviceId, x, y);
      setOnlineBoard(data.board.flat());
      setOnlineTurn(data.next_turn);
      setOnlineWinner(data.winner);
      if (data.winner) {
        const stats = await loadStats(deviceId);
        setOnlineWins(stats.wins);
        setOnlineLosses(stats.losses);
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

  const resetOnlineDevice = async () => {
    setDeviceId(null);
    setOnlineWins(0);
    setOnlineLosses(0);
    setMatchId(null);
    setWaiting(false);
    setOnlineBoard([]);
    setOnlineTurn(null);
    setOnlineWinner(null);
    setPlayers(null);
    setError(null);
    try {
      const id = await registerDevice();
      setDeviceId(id);
      const stats = await loadStats(id);
      setOnlineWins(stats.wins);
      setOnlineLosses(stats.losses);
    } catch (err) {
      setError('Error reseteando dispositivo.');
    }
  };

  const restartOnlineGame = () => {
    setMatchId(null);
    setWaiting(false);
    setOnlineBoard([]);
    setOnlineTurn(null);
    setOnlineWinner(null);
    setPlayers(null);
    setError(null);
  };

  const gameLogic = isOnline ? {
    board: onlineBoard,
    turn: onlineTurn,
    winner: onlineWinner,
    wins: onlineWins,
    losses: onlineLosses,
    gameStarted: true, // Online always started if matchId
    matchId,
    waiting,
    error,
    deviceId,
    players,
    restartGame: restartOnlineGame,
    playMove: playOnlineMove,
    startMatch: startOnlineMatch,
    resetDevice: resetOnlineDevice,
  } : {
    board: offlineBoard,
    turn: offlineTurn,
    winner: offlineWinner,
    wins: offlineWins,
    losses: offlineLosses,
    gameStarted: offlineGameStarted,
    matchId: null,
    waiting: false,
    error: null,
    deviceId: null,
    players: null,
    restartGame: restartOfflineGame,
    playMove: handlePlayOffline,
    startMatch: () => {},
    resetDevice: () => {},
  };

  const backToMenu = () => {
    router.push('/');
  };

  const resetDevice = () => {
    Alert.alert(
      'Resetear Dispositivo',
      'Esto borrará todas las estadísticas y te desconectará. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          onPress: () => {
            if (isOnline) {
              resetOnlineDevice();
            }
          },
        },
      ]
    );
  };

  const startOfflineGame = () => {
    setOfflineBoard(Array(size * size).fill(null));
    setOfflineTurn('X');
    setOfflineWinner(null);
    setOfflineGameStarted(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.game}>
          <TouchableOpacity style={styles.backButton} onPress={backToMenu}>
            <Text style={styles.backButtonText}>Volver al Menú</Text>
          </TouchableOpacity>
          {isOnline && gameLogic.error && <Text style={styles.error}>{gameLogic.error}</Text>}
          <View style={styles.gameBoard}>
            <Text style={styles.label}>Selecciona un tamaño:</Text>
            <Picker
              selectedValue={size}
              onValueChange={(itemValue: number) => setSize(itemValue)}
              style={styles.picker}
            enabled={!(isOnline && (gameLogic.matchId || gameLogic.waiting))}
            >
              <Picker.Item label="3" value={3} />
              <Picker.Item label="4" value={4} />
              <Picker.Item label="5" value={5} />
              <Picker.Item label="6" value={6} />
              <Picker.Item label="7" value={7} />
            </Picker>
            <Text style={styles.label}>Tamaño seleccionado: {size}</Text>
            <Text style={styles.label}>Victorias: {gameLogic.wins} | Derrotas: {gameLogic.losses}</Text>
            {isOnline && (
              <TouchableOpacity style={styles.button} onPress={resetDevice}>
                <Text style={styles.buttonText}>Resetear Dispositivo</Text>
              </TouchableOpacity>
            )}
            {isOnline && !gameLogic.matchId && !gameLogic.waiting && (
              <TouchableOpacity style={styles.button} onPress={gameLogic.startMatch}>
                <Text style={styles.buttonText}>Buscar Partida</Text>
              </TouchableOpacity>
            )}
            {isOnline && gameLogic.waiting && <Text style={styles.waiting}>Esperando oponente...</Text>}
            {isOnline && gameLogic.matchId && (
              <Board
                squares={gameLogic.board}
                onPlay={gameLogic.playMove}
                size={size}
                onRestart={gameLogic.restartGame}
                winner={gameLogic.winner}
                turn={gameLogic.turn}
                deviceId={gameLogic.deviceId}
                players={gameLogic.players}
              />
            )}
            {!isOnline && !gameLogic.gameStarted && (
              <TouchableOpacity style={styles.button} onPress={startOfflineGame}>
                <Text style={styles.buttonText}>Iniciar Juego Offline</Text>
              </TouchableOpacity>
            )}
            {!isOnline && gameLogic.gameStarted && (
              <Board
                squares={gameLogic.board}
                onPlay={gameLogic.playMove}
                size={size}
                onRestart={gameLogic.restartGame}
                winner={gameLogic.winner}
                turn={gameLogic.turn}
                deviceId={null}
                players={null}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  game: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
  },
  backButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  gameBoard: {
    flex: 1,
    justifyContent: 'center',
  },
  gameInfo: {
    flex: 1,
    maxHeight: 200,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  waiting: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  movesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});
