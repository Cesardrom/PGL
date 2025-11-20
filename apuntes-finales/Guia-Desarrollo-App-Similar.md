# Guía para Desarrollar una Aplicación Similar a Splitexpenser

Esta guía proporciona una visión general paso a paso para crear una aplicación móvil similar a Splitexpenser, que gestiona gastos compartidos en grupos. La aplicación consta de un backend API RESTful y un frontend móvil. Aquí se explica qué tecnologías utilizar, conceptos clave de Expo y React Native, y cómo estructurar el desarrollo sin incluir código específico.

## Arquitectura General

- **Backend**: Una API RESTful que maneja la lógica de negocio, autenticación y base de datos.
- **Frontend**: Una aplicación móvil construida con Expo y React Native, enfocada en la interfaz de usuario y la interacción con la API.
- **Autenticación**: Basada en tokens JWT (JSON Web Tokens) para proteger las rutas de la API.
- **Base de Datos**: Una base de datos relacional para almacenar usuarios, grupos y gastos.

## Tecnologías Recomendadas

### Backend

- **Flask**: Un framework web ligero en Python para construir la API RESTful. Es simple y extensible.
- **SQLAlchemy**: Una biblioteca ORM (Object-Relational Mapping) para interactuar con la base de datos de manera orientada a objetos.
- **Flask-JWT-Extended**: Para manejar la autenticación basada en tokens JWT.
- **Flask-RESTX**: Para crear documentación automática de la API (Swagger) y validar entradas.
- **Flask-CORS**: Para permitir solicitudes desde el frontend móvil.
- **Base de Datos**: SQLite para desarrollo local, o PostgreSQL/MySQL para producción.
- **Werkzeug**: Para hashear contraseñas de manera segura.

### Frontend

- **Expo**: Una plataforma para desarrollar aplicaciones React Native sin necesidad de configurar entornos nativos complejos. Permite probar en dispositivos reales o simuladores fácilmente.
- **React Native**: El framework base para construir la interfaz móvil usando JavaScript/TypeScript.
- **Expo Router**: Para manejar la navegación entre pantallas en la aplicación.
- **Expo SecureStore**: Para almacenar tokens de autenticación de forma segura en el dispositivo.
- **React Navigation** (opcional, pero integrado en Expo Router): Para navegación avanzada si es necesario.

## Conceptos Clave de Expo y React Native

Expo y React Native permiten crear aplicaciones móviles nativas usando JavaScript. A continuación, se explican componentes esenciales, etiquetas (componentes) importantes y funciones clave.

### Componentes Principales (Etiquetas)

En React Native, los "componentes" son como etiquetas HTML, pero renderizan elementos nativos en iOS/Android. Los más importantes para una app como Splitexpenser incluyen:

- **View**: El contenedor básico para layout. Equivalente a un `<div>` en web. Se usa para agrupar otros componentes y aplicar estilos (como flexbox para layout).
- **Text**: Para mostrar texto en la pantalla. Es el equivalente a `<p>` o `<span>`. Siempre envuelve texto plano.
- **TextInput**: Un campo de entrada para texto, como username o password. Soporta propiedades como `placeholder`, `secureTextEntry` (para contraseñas) y `onChangeText` para manejar cambios.
- **Button**: Un botón simple para acciones como "Login" o "Registrar". Tiene propiedades como `title` (texto del botón) y `onPress` (función a ejecutar al presionar).
- **ScrollView**: Un contenedor que permite scroll cuando el contenido es más grande que la pantalla. Útil para listas largas de gastos o miembros.
- **FlatList**: Para renderizar listas eficientes de datos, como una lista de grupos o gastos. Es más performante que mapear manualmente en un ScrollView.
- **TouchableOpacity**: Un wrapper para hacer cualquier componente "tocable" (como un botón personalizado). Cambia la opacidad al presionar para feedback visual.

Estos componentes se importan desde 'react-native' y se usan para construir la UI de manera declarativa.

### Funciones y Hooks Importantes

React Native usa "hooks" de React para manejar estado y efectos. Los hooks son funciones que permiten usar características de React en componentes funcionales.

- **useState**: Para manejar estado local en un componente. Por ejemplo, para almacenar el valor de un input de texto o el estado de carga. Devuelve un array con el valor actual y una función para actualizarlo.
- **useEffect**: Para ejecutar efectos secundarios, como cargar datos al montar el componente o redirigir si no hay token. Se ejecuta después del render y puede depender de variables específicas.
- **useContext**: Para acceder a un contexto global, como el de autenticación. Permite compartir estado entre componentes sin pasar props manualmente.
- **useRouter** (de Expo Router): Para navegar entre pantallas. Funciones como `push` (ir a una nueva pantalla) o `replace` (reemplazar la actual).
- **useMemo**: Para memoizar valores calculados, optimizando rendimiento si hay cálculos costosos.
- **useCallback**: Para memoizar funciones, evitando re-renders innecesarios en componentes hijos.

### Navegación con Expo Router

Expo Router usa un sistema de archivos para definir rutas. Por ejemplo:

- `app/index.tsx` es la pantalla principal (home).
- `app/login.tsx` es la pantalla de login.
- `app/_layout.tsx` es el layout raíz que envuelve todas las pantallas.

En el layout raíz, se puede envolver la app con proveedores de contexto (como AuthProvider) para compartir estado global.

### Gestión de Estado y Contexto

- Usa el Context API de React para manejar estado global, como el token de autenticación.
- Un AuthProvider puede cargar el token al iniciar la app, manejar login/register/logout, y proporcionar funciones a toda la app.
- Para almacenamiento persistente, usa Expo SecureStore para guardar tokens de forma encriptada.

### Llamadas a la API

- Usa `fetch` (nativo de JavaScript) para hacer solicitudes HTTP al backend.
- Incluye headers como `Authorization: Bearer <token>` para rutas protegidas.
- Maneja respuestas JSON y errores de red.

## Pasos para Desarrollar la Aplicación

### 1. Planificación

- Define las funcionalidades: registro/login, creación de grupos, añadir gastos, etc.
- Diseña la base de datos: tablas para usuarios, grupos, gastos y relaciones.
- Piensa en la UI: pantallas para login, registro, home, listas de grupos/gastos.

### 2. Configuración del Backend

- Instala Flask y las extensiones mencionadas.
- Configura la base de datos y JWT.
- Crea modelos para User, Group, Expense.
- Implementa endpoints para auth (register, login), groups (crear, listar, añadir miembros), expenses (crear, listar, actualizar).
- Usa decoradores para proteger rutas con JWT.
- Documenta con Swagger.

### 3. Configuración del Frontend

- Crea un proyecto Expo: `npx create-expo-app`.
- Instala dependencias: `expo-secure-store`, `expo-router`.
- Configura variables de entorno para la URL de la API.
- Estructura carpetas: `app/` para rutas, `context/` para AuthContext.

### 4. Implementación de Autenticación

- Crea un AuthContext con estado para token y loading.
- Implementa funciones para register, login (llamadas a API), logout (eliminar token).
- Usa useEffect para cargar token al iniciar.
- En pantallas, usa useContext para acceder a auth.

### 5. Navegación y Pantallas

- Define rutas en `app/`: \_layout.tsx (proveedor), index.tsx (home), login.tsx, register.tsx.
- En home, verifica token; si no hay, redirige a login.
- En login/register, maneja inputs con useState, llama a auth functions, muestra errores.

### 6. Funcionalidades Principales

- Una vez autenticado, añade pantallas para grupos y gastos.
- Usa FlatList para mostrar listas.
- Para crear/editar, usa formularios con TextInput y Button.
- Maneja loading y errores con useState.

### 7. Testing y Depuración

- Prueba en simulador o dispositivo real con Expo Go.
- Usa console.log para debug.
- Verifica llamadas a API con herramientas como Postman.

### 8. Despliegue

- Backend: Despliega en servicios como Heroku o AWS.
- Frontend: Construye con `expo build` y sube a tiendas (App Store, Google Play) o usa EAS Build de Expo.

## Consejos Finales

- Comienza simple: Implementa auth primero, luego añade funcionalidades.
- Aprende React Native leyendo la documentación oficial.
- Usa Expo para evitar configuraciones nativas complejas.
- Para layouts, domina Flexbox (similar a CSS).
- Recuerda que React Native renderiza componentes nativos, no web, así que no uses HTML/CSS directamente.

Esta guía te da una base sólida para construir una app similar. Experimenta y consulta la documentación de Expo y React Native para detalles específicos.
