import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Button, FlatList, Text, TextInput, View, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function GroupDetails() {
  const { token, getExpenses, addExpense } = useContext(AuthContext);
  const router = useRouter();
  const { groupId, groupName } = useLocalSearchParams();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setTimeout(() => router.replace("/login"), 0);
      return;
    }
    fetchExpenses();
  }, [token]);

  const fetchExpenses = async () => {
    const res = await getExpenses(Number(groupId));
    if (res.ok !== false) {
      setExpenses(res);
    } else {
      setError(res.msg || "Error al cargar gastos");
    }
  };

  const handleAddExpense = async () => {
    if (!description.trim() || !amount.trim()) {
      setError("Descripción y cantidad son requeridas");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt)) {
      setError("Cantidad debe ser un número");
      return;
    }
    const res = await addExpense(Number(groupId), description, amt);
    if (res.ok !== false) {
      setDescription("");
      setAmount("");
      fetchExpenses();
    } else {
      setError(res.msg || "Error al añadir gasto");
    }
  };


  if (!token) return null;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>{groupName}</Text>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Añadir Gasto</Text>
      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Cantidad"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <Button title="Añadir Gasto" onPress={handleAddExpense} />
      
      <Text style={{ fontSize: 18, marginTop: 20, marginBottom: 10 }}>Gastos</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
          </View>
        )}
      />
      <Button title="Volver" onPress={() => router.push("/groups")} />
    </View>
  );
}
