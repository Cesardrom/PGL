import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import React, { createContext, useEffect, useMemo, useState } from "react";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "";
const TOKEN_KEY = Constants.expoConfig?.extra?.tokenKey ?? "";

type AuthContextType = {
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<any>;
  register: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  addGroup: (name: string) => Promise<any>;
  groups: () => Promise<any>;
  getExpenses: (groupId: number) => Promise<any>;
  addExpense: (groupId: number, description: string, amount: number) => Promise<any>;
  updateExpense: (groupId: number, expenseId: number, description?: string, amount?: number) => Promise<any>;
  deleteExpense: (groupId: number, expenseId: number) => Promise<any>;

};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  loading: true,
  login: async () => ({}),
  register: async () => ({}),
  logout: async () => { },
  addGroup: async () => ({}),
  groups: async () => { },
  getExpenses: async () => ({}),
  addExpense: async () => ({}),
  updateExpense: async () => ({}),
  deleteExpense: async () => ({}),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const exp_valid_password = new RegExp("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%&?]).{8,}$");


  useEffect(() => {
    const loadToken = async () => {
      const saved = await SecureStore.getItemAsync(TOKEN_KEY);
      if (saved) setToken(saved);
      setLoading(false);
    };
    loadToken();
  }, []);

  const register = async (username: string, password: string) => {
    try {
      if (exp_valid_password.test(password)) {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        return await res.json();
      }
      return { ok: false, msg: "La contraseña no es segura" }
    } catch (err) {
      return { ok: false, msg: "Network error" };
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
        setToken(data.access_token);
      }
      return data;
    } catch (err) {
      return { ok: false, msg: "Network error" };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
  };

  const addGroup = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { ok: false, msg: "Network error" };
    }
  };

  const groups = async () => {
    if (!token) {
      return { ok: false, msg: "No token available" };
    }
    console.log("Token value:", token);
    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const data = await res.json();
      console.log("API response:", data);
      return data;
    } catch (err) {
      console.log("Network error:", err);
      return { ok: false, msg: "Network error" };
    }
  };


  const getExpenses = async (groupId: number) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/expenses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { ok: false, msg: "Network error" };
    }
  };

  const addExpense = async (groupId: number, description: string, amount: number) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ description, amount }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { ok: false, msg: "Network error" };
    }
  };

  const updateExpense = async (groupId: number, expenseId: number, description?: string, amount?: number) => {
    try {
      const body: any = {};
      if (description !== undefined) body.description = description;
      if (amount !== undefined) body.amount = amount;
      const res = await fetch(`${API_URL}/groups/${groupId}/expenses/${expenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { ok: false, msg: "Network error" };
    }
  };

  const deleteExpense = async (groupId: number, expenseId: number) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/expenses/${expenseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { ok: false, msg: "Network error" };
    }
  };


  const value = useMemo(
    () => ({ token, loading, login, register, logout, addGroup, groups, deleteExpense, updateExpense, addExpense, getExpenses }),
    [token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
