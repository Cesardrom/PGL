import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Groups() {
    const { token, groups } = useContext(AuthContext);
    const router = useRouter();
    const [groupList, setGroupList] = useState<any[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setTimeout(() => router.replace("/login"), 0);
            return;
        }
        const fetchGroups = async () => {
            const res = await groups();
    
            if (Array.isArray(res)) {
                setGroupList(res);
            } else if (res && Array.isArray(res.groups)) {
                setGroupList(res.groups);
            } else {
                setError("Formato de respuesta incorrecto: " + JSON.stringify(res));
            }
        };

        fetchGroups();
    }, [token]);

    if (!token) return null;

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Mis Grupos</Text>
            {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
            <FlatList
                data={groupList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ padding: 10, borderBottomWidth: 1 }}>
                        <Text>{item.name}</Text>
                        <Button title="Ver Detalles" onPress={() => router.push({ pathname: "/group_details", params: { groupId: item.id, groupName: item.name } })} />
                    </View>
                )}

            />
            <Button title="Añadir Grupo" onPress={() => router.push("/add_group")} />
        </View>
    );
}
