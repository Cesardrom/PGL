import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Board from './components/board';
import { useGameLogic } from '../hooks/useGameLogic.tsx';
import { useOnlineGame } from '../hooks/useOnlineGame.tsx';

export default function Game() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const router = useRouter();
  const [size, setSize] = useState(3);

  // Hooks para lógica de juego
  const offlineLogic = useGameLogic(size, mode);
  const onlineLogic = useOnlineGame(size);

  // Determinar qué lógica usar según el modo
  const isOnline = mode === 'online';
  const gameLogic = isOnline ? onlineLogic : offlineLogic;

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
              onlineLogic.resetDevice();
            }
          },
        },
      ]
    );
  };

  const startOfflineGame = () => {
    offlineLogic.setBoard(Array(size * size).fill(null));
    offlineLogic.setTurn('X');
    offlineLogic.setWinner(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.game}>
          <TouchableOpacity style={styles.backButton} onPress={backToMenu}>
            <Text style={styles.backButtonText}>Volver al Menú</Text>
          </TouchableOpacity>
          {gameLogic.error && <Text style={styles.error}>{gameLogic.error}</Text>}
          <View style={styles.gameBoard}>
            <Text style={styles.label}>Selecciona un tamaño:</Text>
            <Picker
              selectedValue={size}
              onValueChange={(itemValue: number) => setSize(itemValue)}
              style={styles.picker}
              enabled={!gameLogic.matchId && !gameLogic.waiting}
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
              <TouchableOpacity style={styles.button} onPress={onlineLogic.startMatch}>
                <Text style={styles.buttonText}>Buscar Partida</Text>
              </TouchableOpacity>
            )}
            {gameLogic.waiting && <Text style={styles.waiting}>Esperando oponente...</Text>}
            {gameLogic.matchId && (
              <Board
                squares={gameLogic.board}
                onPlay={isOnline ? onlineLogic.playMove : offlineLogic.handlePlayOffline}
                size={size}
                onRestart={gameLogic.restartGame}
                winner={gameLogic.winner}
                turn={gameLogic.turn}
                deviceId={gameLogic.deviceId}
                players={gameLogic.players}
              />
            )}
            {!isOnline && !gameLogic.matchId && (
              <TouchableOpacity style={styles.button} onPress={startOfflineGame}>
                <Text style={styles.buttonText}>Iniciar Juego Offline</Text>
              </TouchableOpacity>
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
