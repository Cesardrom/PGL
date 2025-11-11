import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import Square from './square';
import { Colors } from '../../constants/theme';

interface BoardProps {
  squares: (string | null)[];
  size: number;
  onPlay: (x: number, y: number) => void;
  onRestart: () => void;
  winner: string | null;
  turn: string | null;
  deviceId: string | null;
  players: { [key: string]: string } | null;
}

function Board({ squares, onPlay, size = 3, onRestart, winner, turn, deviceId, players }: BoardProps) {

  function handleClick(i: number) {
    if (winner || squares[i] || turn !== deviceId) {
      return;
    }
    const x = Math.floor(i / size);
    const y = i % size;
    onPlay(x, y);
  }

  const status = winner ? `Ganador: ${winner}` : turn === deviceId ? 'Tu turno' : 'Turno del oponente';

  return (
    <View style={styles.container}>
      <Text
        style={[styles.status, { color: "0A0A0A" }]}
        accessible={true}
        accessibilityLabel={`Game status: ${status}`}
      >
        {status}
      </Text>
      <View style={styles.board}>
        {Array.from({ length: size }, (_, rowIndex) => (
          <View style={styles.boardRow} key={rowIndex}>
            {Array.from({ length: size }, (_, colIndex) => {
              const index = rowIndex * size + colIndex;
              return (
                <Square
                  key={index}
                  value={squares[index]}
                  onSquareClick={() => handleClick(index)}
                  size={size}
                />
              );
            })}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
        <Text style={styles.restartButtonText}>Reiniciar Juego</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  board: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    padding: 10,
  },
  boardRow: {
    flexDirection: 'row',
  },
  restartButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  restartButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Board;
