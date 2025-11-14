import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  const goToOffline = () => {
    router.push('/game?mode=offline');
  };

  const goToOnline = () => {
    router.push('/game?mode=online');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menu}>
        <Text style={styles.title}>Tres en Raya</Text>
        <TouchableOpacity style={styles.button} onPress={goToOffline}>
          <Text style={styles.buttonText}>Jugar Offline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={goToOnline}>
          <Text style={styles.buttonText}>Jugar Online</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  menu: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#0A0A0A',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
