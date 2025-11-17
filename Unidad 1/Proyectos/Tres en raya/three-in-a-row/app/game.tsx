import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
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
  const [offlineHistory, setOfflineHistory] = useState<{board: (string | null)[], turn: string | null}[]>([]);

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
    setOfflineHistory([]);
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
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchId, deviceId]);

  // Funciones offline
  const handlePlayOffline = (x: number, y: number) => {
    if (!offlineGameStarted || offlineWinner) return;
    const index = x * size + y;
    if (offlineBoard[index]) return;
    const newBoard = [...offlineBoard];
    newBoard[index] = offlineTurn;
    setOfflineBoard(newBoard);
    const nextTurn = offlineTurn === 'X' ? 'O' : 'X';
    setOfflineHistory([...offlineHistory, {board: newBoard, turn: nextTurn}]);
    const { winner: win } = calculateWinner(newBoard, size);
    if (win) {
      setOfflineWinner(win);
      if (win === 'X') {
        setOfflineWins(offlineWins + 1);
      } else {
        setOfflineLosses(offlineLosses + 1);
      }
    } else {
      setOfflineTurn(nextTurn);
    }
  };

  const restartOfflineGame = () => {
    setOfflineBoard(Array(size * size).fill(null));
    setOfflineTurn('X');
    setOfflineWinner(null);
    setOfflineGameStarted(false);
    setOfflineHistory([]);
  };

  const goToMove = (index: number) => {
    if (index === -1) {
      setOfflineBoard(Array(size * size).fill(null));
      setOfflineTurn('X');
      setOfflineWinner(null);
      setOfflineHistory([]);
    } else {
      const state = offlineHistory[index];
      setOfflineBoard(state.board);
      setOfflineTurn(state.turn);
      setOfflineWinner(null);
      setOfflineHistory(offlineHistory.slice(0, index + 1));
    }
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
            setTimeout(check, 1000);
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
    resetDevice: () => {},
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

  const startOfflineGame = () => {
    setOfflineBoard(Array(size * size).fill(null));
    setOfflineTurn('X');
    setOfflineWinner(null);
    setOfflineGameStarted(true);
    setOfflineHistory([]);
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
            {!isOnline && (
              <View style={styles.offlineControls}>
                {!gameLogic.gameStarted && (
                  <TouchableOpacity style={styles.button} onPress={startOfflineGame}>
                    <Text style={styles.buttonText}>Iniciar Juego Offline</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.button} onPress={() => { setOfflineWins(0); setOfflineLosses(0); }}>
                  <Text style={styles.buttonText}>Resetear Estadísticas</Text>
                </TouchableOpacity>
              </View>
            )}
            {!isOnline && gameLogic.gameStarted && (
              <View>
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
                <ScrollView horizontal style={styles.movesContainer}>
                  <TouchableOpacity style={styles.moveButton} onPress={() => goToMove(-1)}>
                    <Text style={styles.moveButtonText}>Inicio</Text>
                  </TouchableOpacity>
                  {offlineHistory.map((_, index) => (
                    <TouchableOpacity key={index} style={styles.moveButton} onPress={() => goToMove(index)}>
                      <Text style={styles.moveButtonText}>Mov {index + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
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
  offlineControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  movesContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  moveButton: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  moveButtonText: {
    color: 'white',
    fontSize: 14,
  },
});
