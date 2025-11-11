import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { Colors } from '../../constants/theme';

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
}

function Square({ value, onSquareClick, size }: SquareProps & { size: number }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { width } = Dimensions.get('window');
  const squareSize = Math.min(width / size - 10, 80); // Adjust size based on screen width and board size

  return (
    <TouchableOpacity
      style={[styles.square, { width: squareSize, height: squareSize, borderColor: "0A0A0A" }]}
      onPress={onSquareClick}
      accessible={true}
      accessibilityLabel={`Square ${value ? `with ${value}` : 'empty'}`}
      accessibilityRole="button"
    >
      <Text style={[styles.squareText, { color: "0A0A0A" }]}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    margin: 2,
    backgroundColor: 'transparent',
  },
  squareText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Square;
