import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/'; // For Android emulator, use 10.0.2.2 instead of localhost

// Registrar dispositivo en el servidor
export const registerDevice = async () => {
  const res = await axios.post(`${API_BASE}/devices`);
  return res.data.device_id;
};

// Cargar estadísticas del dispositivo
export const loadStats = async (deviceId: string) => {
  const res = await axios.get(`${API_BASE}/devices/${deviceId}/info`);
  return { wins: res.data.wins, losses: res.data.losses };
};

// Crear una nueva partida
export const createMatch = async (deviceId: string, size: number) => {
  const res = await axios.post(`${API_BASE}/matches`, { device_id: deviceId, size });
  return res;
};

// Verificar estado de espera
export const checkWaitingStatus = async (deviceId: string) => {
  const res = await axios.get(`${API_BASE}/matches/waiting-status?device_id=${deviceId}`);
  return res.data;
};

// Sincronizar estado del juego
export const syncGame = async (matchId: string) => {
  const res = await axios.get(`${API_BASE}/matches/${matchId}`);
  return res.data;
};

// Realizar un movimiento
export const makeMove = async (matchId: string, deviceId: string, x: number, y: number) => {
  const res = await axios.post(`${API_BASE}/matches/${matchId}/moves`, {
    device_id: deviceId,
    x,
    y,
  });
  return res.data;
};
