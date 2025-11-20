# Examen Simulado: Desarrollo de Aplicaciones Multiplataforma (Nivel 2º)

**Duración estimada:** 90 minutos  
**Instrucciones:** Responde a todas las preguntas. Para las preguntas de desarrollo, explica tu razonamiento. Usa conceptos de React Native, Expo, Flask y autenticación JWT basados en la aplicación Splitexpenser.

## Parte 1: Preguntas Teóricas (40 puntos)

### 1. Conceptos Básicos (10 puntos)

a) Explica qué es Expo y por qué se usa en el desarrollo de aplicaciones React Native. (3 puntos)  
**Respuesta:** Expo es una plataforma de desarrollo que simplifica la creación de aplicaciones React Native al proporcionar un entorno preconfigurado, herramientas para testing en dispositivos reales o simuladores, y módulos nativos listos para usar. Se usa porque evita la complejidad de configurar Xcode o Android Studio directamente, permitiendo enfocarse en el código JavaScript/TypeScript y acelerar el desarrollo multiplataforma.

b) ¿Cuál es la diferencia entre un componente `View` y un componente `ScrollView` en React Native? (2 puntos)  
**Respuesta:** `View` es un contenedor básico para organizar layouts, similar a un `<div>` en HTML, usado para agrupar componentes y aplicar estilos con Flexbox. `ScrollView` es un tipo de `View` que añade capacidad de scroll vertical u horizontal cuando el contenido supera el tamaño de la pantalla, ideal para listas largas.

c) ¿Qué es un hook en React y cuál es la función de `useState`? (3 puntos)  
**Respuesta:** Un hook es una función especial de React que permite usar características como estado o efectos en componentes funcionales. `useState` declara una variable de estado y una función setter; cuando se llama al setter, el componente se re-renderiza automáticamente, actualizando la UI.

d) En el contexto de la app Splitexpenser, ¿qué rol juega `SecureStore` de Expo? (2 puntos)  
**Respuesta:** `SecureStore` de Expo almacena datos sensibles de forma encriptada en el dispositivo móvil, protegiendo información como tokens JWT de accesos no autorizados, a diferencia de AsyncStorage que no encripta.

### 2. Autenticación y Backend (10 puntos)

a) Describe brevemente cómo funciona la autenticación JWT en la API de Splitexpenser. (3 puntos)  
**Respuesta:** En la autenticación JWT de Splitexpenser, al hacer login, el backend genera un token con la identidad del usuario. Este token se envía en headers `Authorization: Bearer <token>` para rutas protegidas. El backend usa `@jwt_required()` para verificar el token y extraer la identidad con `get_jwt_identity()`, permitiendo acceso solo a usuarios autenticados.

b) ¿Por qué se usa `Flask-CORS` en el backend? (2 puntos)  
**Respuesta:** `Flask-CORS` se usa para configurar políticas de Cross-Origin Resource Sharing, permitiendo que el frontend (en un dominio diferente) haga solicitudes al backend sin errores de seguridad del navegador, esencial en apps móviles que llaman a APIs remotas.

c) Explica el propósito de `SQLAlchemy` en la aplicación. (3 puntos)  
**Respuesta:** `SQLAlchemy` es un ORM que traduce objetos Python en consultas SQL, facilitando la interacción con la base de datos (ej. crear, leer, actualizar usuarios o gastos) sin escribir SQL manual, mejorando mantenibilidad y abstrayendo diferencias entre motores de BD.

d) ¿Qué es un "namespace" en Flask-RESTX y cómo se usa en la app? (2 puntos)  
**Respuesta:** Un namespace en Flask-RESTX agrupa endpoints relacionados (como auth o groups) en un objeto, organizando la API lógicamente, generando documentación Swagger automática y permitiendo validaciones y modelos compartidos para entradas/salidas.

### 3. Navegación y Estado (10 puntos)

a) ¿Cómo funciona la navegación en Expo Router? Da un ejemplo de estructura de archivos. (3 puntos)  
**Respuesta:** Expo Router usa el sistema de archivos para definir rutas: cada archivo en `app/` (ej. `login.tsx` para `/login`) crea una pantalla. Navega con hooks como `useRouter().push("/ruta")` para apilar pantallas o `replace()` para reemplazar.

b) Explica el patrón de `AuthContext` en React Native. (3 puntos)  
**Respuesta:** `AuthContext` es un proveedor de contexto que comparte estado global (token, loading) entre componentes usando `useContext`, evitando prop drilling y centralizando lógica de autenticación en un AuthProvider.

c) ¿Qué hook usarías para ejecutar código al montar un componente y por qué? (2 puntos)  
**Respuesta:** `useEffect` con un array de dependencias vacío `[]`, porque se ejecuta solo una vez al montar el componente, ideal para inicializaciones como cargar datos o verificar autenticación.

d) En la app, ¿cómo se maneja el estado de carga durante el login? (2 puntos)  
**Respuesta:** Se usa `useState` para un booleano `loading`, establecido a `true` antes de la llamada API y a `false` después, mostrando un indicador visual (ej. spinner) mientras se procesa el login.

### 4. Componentes y UI (10 puntos)

a) Lista 4 componentes básicos de React Native y su uso típico. (4 puntos)  
**Respuesta:** `Text`: Para mostrar texto estático o dinámico. `TextInput`: Para entradas de usuario como texto o contraseñas. `Button`: Para acciones simples como submit. `View`: Contenedor para layout y agrupación de componentes.

b) ¿Cómo se maneja el input de texto en un formulario de login? (3 puntos)  
**Respuesta:** Se usa `TextInput` con props como `value` (estado actual), `onChangeText` (función para actualizar estado con `useState`), `placeholder` (texto guía) y `secureTextEntry` (true para contraseñas), manejando cambios en tiempo real.

c) Explica cómo se implementa un botón personalizado usando `TouchableOpacity`. (3 puntos)  
**Respuesta:** Se envuelve el componente (ej. `Text` o `View`) en `TouchableOpacity`, definiendo `onPress` para la acción (ej. submit). Al presionar, reduce la opacidad automáticamente para feedback, y se puede personalizar con estilos.

## Parte 2: Preguntas Prácticas (40 puntos)

### 5. Escenario de Desarrollo (15 puntos)

Imagina que quieres añadir una nueva pantalla en Splitexpenser para "Ver Perfil de Usuario".  
a) ¿Qué archivo crearías en la carpeta `app/` y qué hook usarías para navegar a ella? (4 puntos)  
**Respuesta:** Crearía `app/profile.tsx` en la carpeta `app/`. Usaría el hook `useRouter` para navegar con `router.push("/profile")` desde otra pantalla, como un botón en home.

b) ¿Cómo protegerías esta pantalla para que solo usuarios autenticados puedan acceder? (4 puntos)  
**Respuesta:** En `useEffect`, accedería al token del `AuthContext`; si no existe, redirigiría a login con `router.replace("/login")` para proteger la ruta.

c) Describe los componentes que usarías para mostrar el perfil (nombre, email, etc.) y cómo manejarías la carga de datos desde la API. (7 puntos)  
**Respuesta:** Usaría `View` como contenedor principal con Flexbox para centrar. `Text` para labels y valores (ej. "Nombre: {user.name}"). Para listas (ej. grupos), `FlatList` con `data` y `renderItem`. Cargar datos con `useEffect` llamando `fetch("/auth/profile", {headers: {Authorization: `Bearer ${token}`}})`, manejando loading con `useState` y errores con try-catch.

### 6. Problema de Código (10 puntos)

Analiza el siguiente snippet de código de la app Splitexpenser (frontend):

```typescript
const handleLogin = async () => {
  const res = await login(username, password);
  if (res.access_token) {
    router.replace("/");
  } else {
    setError(res.msg || "Login fallido");
  }
};
```

a) ¿Qué hace esta función? (3 puntos)  
**Respuesta:** Esta función maneja el proceso de login: llama a `login(username, password)` del contexto, que hace una petición POST a la API; si la respuesta incluye `access_token`, redirige a home con `router.replace("/")`; sino, establece un error con `setError`.

b) ¿Qué hook se está usando implícitamente aquí? (2 puntos)  
**Respuesta:** Se usa implícitamente `useContext` para acceder a `login` y `router` del AuthContext y useRouter, respectivamente.

c) ¿Cómo mejoraría esta función para manejar errores de red? (5 puntos)  
**Respuesta:** Agregaría un try-catch: `try { const res = await login(...); if (res.access_token) ... else setError(res.msg); } catch (err) { setError("Error de red: " + err.message); }` para manejar fallos de conexión, mostrando un mensaje específico.

### 7. Diseño de API (15 puntos)

Diseña un nuevo endpoint para la API de Splitexpenser: "Obtener balance de un grupo" (suma de gastos por usuario).  
a) ¿Qué ruta y método HTTP usarías? (3 puntos)  
**Respuesta:** Usaría `GET /groups/<int:group_id>/balance` para obtener el balance de un grupo específico.

b) ¿Qué modelo Swagger definirías para la respuesta? (4 puntos)  
**Respuesta:** Modelo Swagger: `balance_model = api.model("Balance", {"balances": fields.List(fields.Nested(api.model("UserBalance", {"user_id": fields.Integer, "balance": fields.Float})))})` para una lista de objetos con user_id y balance.

c) ¿Cómo implementarías la lógica en Flask, incluyendo autenticación? (8 puntos)  
**Respuesta:** Decorador `@jwt_required()` para proteger. Obtener `user_id = get_jwt_identity()`. Verificar que el usuario pertenezca al grupo con `Group.query.get(group_id).users`. Calcular balances con SQLAlchemy: `expenses = Expense.query.filter_by(group_id=group_id).all()`, luego agrupar por `paid_by` y sumar. Devolver JSON con la lista.

## Parte 3: Pregunta de Ensayo (20 puntos)

### 8. Desarrollo Completo (20 puntos)

Describe paso a paso cómo implementarías una funcionalidad completa en Splitexpenser: "Editar un gasto existente". Incluye:

- Cambios en el backend (endpoint, validación).
- Cambios en el frontend (pantalla, navegación, llamadas API).
- Manejo de errores y estado.
- Consideraciones de seguridad.

Usa al menos 5 conceptos de los explicados en la guía (ej. hooks, componentes, JWT, etc.).

**Respuesta:** Para implementar "Editar un gasto existente":

- **Backend:** Crear endpoint `PUT /groups/<group_id>/expenses/<expense_id>` con modelo Swagger para `description` y `amount`. Usar `@jwt_required()`, verificar que el gasto exista y pertenezca al grupo, y que `paid_by == user_id`. Actualizar con `expense.description = data["description"]`; `db.session.commit()`.
- **Frontend:** Pantalla `app/edit-expense.tsx` con `useRouter` para obtener params (`group_id`, `expense_id`). Usar `useState` para `description` y `amount`, `useEffect` para fetch GET inicial. Formulario con `TextInput` y `TouchableOpacity` para submit. Llamar `fetch` PUT con headers Authorization.
- **Errores/Estado:** `useState` para `loading` (true durante fetch) y `error`. Mostrar con `Text` si hay error.
- **Seguridad:** Backend verifica JWT y propiedad del gasto. Frontend incluye token en headers. Usar `useContext` para token, `useRouter` para navegación post-edición.

Esto integra hooks (`useState`, `useEffect`, `useRouter`, `useContext`), componentes (`TextInput`, `TouchableOpacity`), JWT, fetch y SQLAlchemy.

## Rúbrica de Evaluación

- **Excelente (16-20 puntos por parte):** Respuestas completas, correctas y bien explicadas.
- **Bueno (11-15 puntos):** Respuestas mayoritariamente correctas con algunos detalles faltantes.
- **Suficiente (6-10 puntos):** Conceptos básicos correctos, pero falta profundidad.
- **Insuficiente (0-5 puntos):** Errores significativos o respuestas incompletas.

**Nota:** Este examen evalúa comprensión de conceptos de desarrollo multiplataforma. ¡Buena suerte!
