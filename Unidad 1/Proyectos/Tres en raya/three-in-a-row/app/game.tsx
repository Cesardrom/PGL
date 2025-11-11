import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Board from './components/board';
import MoveButton from './components/moveButton';
import { Colors } from '../constants/theme';

const API_BASE = 'http://localhost:5000';

export default function Game() {
  const [size, setSize] = useState(3);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [opponentDeviceId, setOpponentDeviceId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [board, setBoard] = useState<(string | null)[]>([]);
  const [turn, setTurn] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ [key: string]: string } | null>(null);
  const [winsX, setWinsX] = useState(0);
  const [winsO, setWinsO] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const registerDevices = async () => {
      try {
        const playerRes = await axios.post(`${API_BASE}/devices`, { alias: 'Player' });
        setDeviceId(playerRes.data.device_id);
        console.log(playerRes.data);
        const opponentRes = await axios.post(`${API_BASE}/devices`, { alias: 'Opponent' });
        setOpponentDeviceId(opponentRes.data.device_id);
      } catch (error) {
        console.error('Error registering devices:', error);
      }
    };
    registerDevices();
  }, []);

  const startGame = async () => {
    if (!deviceId || !opponentDeviceId) return;
    try {
      const res1 = await axios.post(`${API_BASE}/matches`, { device_id: deviceId, size });
      console.log(res1.data);
      if (res1.status === 202) {
        const res2 = await axios.post(`${API_BASE}/matches`, { device_id: opponentDeviceId, size });
        console.log(res2.data);
        if (res2.status === 201) {
          setMatchId(res2.data.match_id);
          setBoard(Array(size * size).fill(null));
          setPlayers(res2.data.players);
          setTurn(deviceId); // Assuming deviceId is X
          setWinner(null);
        }
      }
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const makeMove = async (device: string, x: number, y: number) => {
    if (!matchId) return;
    try {
      const res = await axios.post(`${API_BASE}/matches/${matchId}/moves`, {
        device_id: device,
        x,
        y,
      });
      console.log(res.data)
      setBoard(res.data.board.flat());
      setTurn(res.data.next_turn);
      setWinner(res.data.winner);
      if (res.data.winner && res.data.winner !== 'Draw') {
        if (res.data.winner === 'X') {
          setWinsX(winsX + 1);
        } else if (res.data.winner === 'O') {
          setWinsO(winsO + 1);
        }
      }
    } catch (error) {
      console.error('Error making move:', error);
    }
  };

  const handlePlay = async (x: number, y: number) => {
    if (!deviceId || winner || turn !== deviceId) return;
    await makeMove(deviceId, x, y);
    if (!winner) {
      // Make opponent move
      const emptyCells = board.map((cell, index) => cell === null ? index : null).filter(i => i !== null);
      if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const oppX = Math.floor(randomIndex / size);
        const oppY = randomIndex % size;
        await makeMove(opponentDeviceId!, oppX, oppY);
      }
    }
  };

  const restartGame = async () => {
    await startGame();
  };

  const resetStats = () => {
    setWinsX(0);
    setWinsO(0);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "FFFFFF" }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.game}>
          <View style={styles.gameBoard}>
            <Text style={styles.label}>Selecciona un tamaño:</Text>
            <Picker
              selectedValue={size}
              onValueChange={(itemValue: number) => setSize(itemValue)}
              style={styles.picker}>
              <Picker.Item label="3" value={3} />
              <Picker.Item label="4" value={4} />
              <Picker.Item label="5" value={5} />
              <Picker.Item label="6" value={6} />
              <Picker.Item label="7" value={7} />
            </Picker>
            <Text style={styles.label}>Tamaño seleccionado: {size}</Text>
            <Text style={styles.label}>Victorias Jugador: {winsX} | Victorias Oponente: {winsO}</Text>
            <TouchableOpacity style={styles.button} onPress={resetStats}>
              <Text style={styles.buttonText}>Reiniciar Estadísticas</Text>
            </TouchableOpacity>
            {!matchId ? (
              <TouchableOpacity style={styles.button} onPress={startGame}>
                <Text style={styles.buttonText}>Iniciar Juego</Text>
              </TouchableOpacity>
            ) : (
              <Board squares={board} onPlay={handlePlay} size={size} onRestart={restartGame} winner={winner} turn={turn} deviceId={deviceId} players={players} />
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
  movesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});
