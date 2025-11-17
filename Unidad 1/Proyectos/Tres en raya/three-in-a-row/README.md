# Tres en Raya (Tic-Tac-Toe)

Una aplicación móvil de Tres en Raya (Tic-Tac-Toe) construida con React Native y Expo. Soporta modos offline y online, con tableros de diferentes tamaños (3x3 a 7x7).

## Características

- **Modo Offline**: Juega contra ti mismo o un amigo en el mismo dispositivo.
- **Modo Online**: Juega contra otros jugadores conectados a un servidor.
- **Tableros Variables**: Elige tamaños de tablero desde 3x3 hasta 7x7.
- **Historial de Movimientos**: En modo offline, puedes revisar movimientos anteriores.
- **Estadísticas**: Rastrea victorias y derrotas.

## Cómo Funciona

La app tiene dos modos principales:

### Modo Offline

- Selecciona el tamaño del tablero.
- Inicia el juego y juega turnos alternando entre X y O.
- El juego verifica automáticamente si hay un ganador o empate.
- Puedes reiniciar o ver el historial de movimientos.

### Modo Online

- Registra un dispositivo en el servidor.
- Busca una partida con otro jugador.
- Espera a que se empareje y juega en tiempo real.
- El servidor maneja los turnos y actualiza el estado del juego.

## Explicación del Código

### Pantalla Principal (app/index.tsx)

Esta pantalla muestra el menú principal con opciones para jugar offline o online.

```tsx
export default function Index() {
  const router = useRouter();

  const goToOffline = () => {
    router.push("/game?mode=offline");
  };

  const goToOnline = () => {
    router.push("/game?mode=online");
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
```

### Lógica del Juego (app/game.tsx)

Maneja la lógica principal del juego, diferenciando entre offline y online.

- **Estados Offline**: Maneja el tablero, turnos, ganador y historial.
- **Estados Online**: Conecta con el servidor para registrar dispositivo, crear partidas y sincronizar.

```tsx
const [offlineBoard, setOfflineBoard] = useState<(string | null)[]>([]);
const [offlineTurn, setOfflineTurn] = useState<string | null>(null);
const [offlineWinner, setOfflineWinner] = useState<string | null>(null);
```

Para movimientos offline:

```tsx
const handlePlayOffline = (x: number, y: number) => {
  if (!offlineGameStarted || offlineWinner) return;
  const index = x * size + y;
  if (offlineBoard[index]) return;
  const newBoard = [...offlineBoard];
  newBoard[index] = offlineTurn;
  setOfflineBoard(newBoard);
  const nextTurn = offlineTurn === "X" ? "O" : "X";
  setOfflineHistory([...offlineHistory, { board: newBoard, turn: nextTurn }]);
  const { winner: win } = calculateWinner(newBoard, size);
  if (win) {
    setOfflineWinner(win);
    if (win === "X") {
      setOfflineWins(offlineWins + 1);
    } else {
      setOfflineLosses(offlineLosses + 1);
    }
  } else {
    setOfflineTurn(nextTurn);
  }
};
```

### Componente Tablero (app/components/board.tsx)

Renderiza el tablero y maneja clics en las casillas.

```tsx
function Board({
  squares,
  onPlay,
  size = 3,
  onRestart,
  winner,
  turn,
  deviceId,
  players,
}: BoardProps) {
  function handleClick(i: number) {
    if (winner || squares[i]) {
      return;
    }
    if (deviceId && turn !== deviceId) {
      Alert.alert("No es tu turno", "Espera a que sea tu turno para jugar.");
      return;
    }
    const x = Math.floor(i / size);
    const y = i % size;
    onPlay(x, y);
  }

  const status = winner
    ? `Ganador: ${winner}`
    : deviceId
    ? turn === deviceId
      ? "Tu turno"
      : "Turno del oponente"
    : turn === "X"
    ? "Turno de X"
    : "Turno de O";

  return (
    <View style={styles.container}>
      <Text style={[styles.status, { color: "0A0A0A" }]}>{status}</Text>
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
```

### Componente Casilla (app/components/square.tsx)

Representa una casilla individual del tablero.

```tsx
function Square({
  value,
  onSquareClick,
  size,
}: SquareProps & { size: number }) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { width } = Dimensions.get("window");
  const squareSize = Math.min(width / size - 10, 80);

  return (
    <TouchableOpacity
      style={[
        styles.square,
        { width: squareSize, height: squareSize, borderColor: "0A0A0A" },
      ]}
      onPress={onSquareClick}
      accessible={true}
      accessibilityLabel={`Square ${value ? `with ${value}` : "empty"}`}
      accessibilityRole="button"
    >
      <Text style={[styles.squareText, { color: "0A0A0A" }]}>{value}</Text>
    </TouchableOpacity>
  );
}
```

### Función para Calcular Ganador (utils/calculateWinner.ts)

Verifica si hay un ganador en el tablero.

```tsx
export default function calculateWinner(
  squares: (string | null)[],
  size: number
): { winner: string | null; winningSquares: number[] } {
  const lines: number[][] = [];

  // Rows
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      row.push(i * size + j);
    }
    lines.push(row);
  }

  // Columns
  for (let i = 0; i < size; i++) {
    const col: number[] = [];
    for (let j = 0; j < size; j++) {
      col.push(j * size + i);
    }
    lines.push(col);
  }

  // Diagonals
  const diag1: number[] = [];
  const diag2: number[] = [];
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i);
    diag2.push(i * size + (size - 1 - i));
  }
  lines.push(diag1);
  lines.push(diag2);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const first = squares[line[0]];
    if (first && line.every((index) => squares[index] === first)) {
      return { winner: first, winningSquares: line };
    }
  }
  return { winner: null, winningSquares: [] };
}
```

### Servicio de API (utils/apiService.tsx)

Maneja las llamadas al servidor para el modo online.

```tsx
const API_BASE = Platform.select({
  android: "http://10.0.2.2:5000/",
  ios: "http://localhost:5000/",
  web: "http://localhost:5000/",
  default: "http://localhost:5000/",
});

// Registrar dispositivo en el servidor
export const registerDevice = async () => {
  const res = await axios.post(`${API_BASE}/devices`);
  return res.data.device_id;
};

// Crear una nueva partida
export const createMatch = async (deviceId: string, size: number) => {
  const res = await axios.post(`${API_BASE}/matches`, {
    device_id: deviceId,
    size,
  });
  return res;
};

// Realizar un movimiento
export const makeMove = async (
  matchId: string,
  deviceId: string,
  x: number,
  y: number
) => {
  const res = await axios.post(`${API_BASE}/matches/${matchId}/moves`, {
    device_id: deviceId,
    x,
    y,
  });
  return res.data;
};
```

## Instalación

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Inicia la app:
   ```bash
   npx expo start
   ```

## Uso

- Abre la app y selecciona "Jugar Offline" o "Jugar Online".
- En offline, elige el tamaño y juega.
- En online, espera a emparejarte con otro jugador.

Para el modo online, asegúrate de que el servidor backend esté corriendo en `http://localhost:5000/` (o ajusta la URL en `apiService.tsx`).
