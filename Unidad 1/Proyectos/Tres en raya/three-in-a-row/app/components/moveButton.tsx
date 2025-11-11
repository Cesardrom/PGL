import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

interface MoveButtonProps {
  description: string;
  onClick: () => void;
}

function MoveButton({ description, onClick }: MoveButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: "0A0A0A" }]}
      onPress={onClick}
      accessible={true}
      accessibilityLabel={`Move button: ${description}`}
      accessibilityRole="button"
    >
      <Text style={[styles.move, { color: "0A0A0A" }]}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  move: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MoveButton;
