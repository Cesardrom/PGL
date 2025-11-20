# Examen Práctico: Desarrollo de Aplicaciones Multiplataforma (Nivel 2º)

**Duración estimada:** 120 minutos  
**Instrucciones:** Implementa la funcionalidad descrita en el enunciado. Para cada parte, proporciona el código correspondiente con explicaciones. Usa los conceptos de React Native, Expo, Flask y la app Splitexpenser. Al final, incluye un resumen de cómo probar la implementación.

## Enunciado

Implementa una nueva funcionalidad en Splitexpenser: "Listar Grupos del Usuario". Esta funcionalidad debe permitir a un usuario autenticado ver una lista de sus grupos en una nueva pantalla. Incluye:

- Un endpoint en el backend para obtener los grupos del usuario.
- Una nueva pantalla en el frontend para mostrar la lista de grupos.
- Navegación desde la pantalla principal (home) a la nueva pantalla.
- Manejo de errores y estado de carga.
- Seguridad con JWT.

La implementación debe usar al menos 5 conceptos de la guía (ej. hooks, componentes, JWT, fetch, SQLAlchemy).

## Parte 1: Backend - Endpoint para Listar Grupos (20 puntos)

Crea un endpoint en Flask que devuelva los grupos del usuario autenticado. Incluye autenticación JWT y validación.

**Código:**

```python
# En main.py, dentro del namespace groups_ns

@groups_ns.route("")
class GroupList(Resource):
    @jwt_required()
    def get(self):
        """Lista los grupos del usuario autenticado"""
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        if not user:
            return error_response("User not found", 404)
        groups = [{"id": g.id, "name": g.name} for g in user.groups]
        return groups
```

**Explicación:** El decorador `@jwt_required()` verifica el token JWT. `get_jwt_identity()` obtiene el ID del usuario. Se consulta la base de datos con SQLAlchemy para obtener los grupos relacionados. Se devuelve una lista de diccionarios con id y name.

## Parte 2: Frontend - Pantalla para Listar Grupos (25 puntos)

Crea una nueva pantalla `app/groups.tsx` que muestre la lista de grupos usando `FlatList`. Incluye navegación desde home y manejo de estado.

**Código:**

```typescript
// app/groups.tsx
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Groups() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(`${API_URL}/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGroups(data);
        } else {
          setError("Error al cargar grupos");
        }
      } catch (err) {
        setError("Error de red");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchGroups();
  }, [token]);

  if (loading) return <Text>Cargando...</Text>;
  if (error) return <Text>{error}</Text>;

  return (
    <View>
      <Text>Mis Grupos</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
    </View>
  );
}
```

**Explicación:** Se usa `useContext` para obtener el token. `useEffect` carga los datos al montar, con `fetch` a la API incluyendo el header Authorization. `useState` maneja grupos, loading y error. `FlatList` renderiza la lista eficientemente.

## Parte 3: Navegación y Integración (20 puntos)

Añade un botón en la pantalla home para navegar a la pantalla de grupos. Actualiza el layout si es necesario.

**Código en home:**

```typescript
// En index.tsx (home)
import { useRouter } from "expo-router";
// ... otros imports

export default function Home() {
  // ... código existente
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Bienvenido a Home!</Text>
      <Button title="Ver Grupos" onPress={() => router.push("/groups")} />
      <Button title="Cerrar sesión" onPress={() => void logout()} />
    </View>
  );
}
```

**Explicación:** Se importa `useRouter` y se añade un `Button` con `onPress` que llama `router.push("/groups")` para navegar a la nueva pantalla.

## Parte 4: Seguridad y Manejo de Errores (15 puntos)

Asegura que la pantalla de grupos solo sea accesible con token. Maneja errores de red y respuestas no OK.

**Código adicional en groups.tsx:**

```typescript
// Ya incluido en el código anterior, pero enfatizando:
useEffect(() => {
  if (!token) {
    router.replace("/login");
    return;
  }
  // ... fetch
}, [token]);
```

**Explicación:** En `useEffect`, si no hay token, redirige a login. El try-catch en fetch maneja errores de red, y se verifica `res.ok` para errores de API.

## Parte 5: Modelo Swagger y Testing (20 puntos)

Define un modelo Swagger para la respuesta del endpoint. Incluye cómo probar el endpoint con curl.

**Código en main.py:**

```python
group_model = api.model("Group", {
    "id": fields.Integer,
    "name": fields.String
})
groups_list_model = api.model("GroupsList", {
    "groups": fields.List(fields.Nested(group_model))
})
```

**Explicación:** Define modelos para validación y documentación Swagger.

**Testing:** Usa curl: `curl -H "Authorization: Bearer <token>" http://localhost:8000/groups`

## Rúbrica de Evaluación

- **Excelente (16-20 puntos por parte):** Código correcto, bien explicado, usa conceptos adecuados.
- **Bueno (11-15 puntos):** Implementación funcional con algunos detalles faltantes.
- **Suficiente (6-10 puntos):** Conceptos básicos correctos, pero errores en implementación.
- **Insuficiente (0-5 puntos):** Errores significativos o incompleto.

**Nota:** Este examen práctico evalúa la capacidad de implementar funcionalidades completas en multiplataforma.
