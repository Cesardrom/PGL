import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function AddGroup() {
  const { token, addGroup } = useContext(AuthContext);
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setTimeout(() => router.replace("/login"), 0);
    }
  }, [token]);

  if (!token) return null;

  const handleAddGroup = async () => {
    if (!name.trim()) {
      setError("El nombre del grupo es requerido");
      return;
    }
    console.log(name);
    const res = await addGroup(name);
    console.log(res)
    if (res.ok !== false) {
      router.replace("/groups");
    } else {
      setError(res.msg || "Error al crear grupo");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <TextInput
        placeholder="Nombre del grupo"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <Button title="Crear Grupo" onPress={handleAddGroup} />
      <Button title="Volver" onPress={() => router.push("/groups")} />
    </View>
  );
}
