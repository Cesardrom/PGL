# SplitExpenser App

Esta aplicación es una herramienta para gestionar gastos compartidos en grupos, construida con un backend en Flask (Python) y un frontend en Expo (React Native). Incluye autenticación basada en tokens Bearer (JWT) para proteger las rutas de la API.

## Arquitectura General

- **Backend**: API RESTful en Flask con autenticación JWT, base de datos SQLite y documentación Swagger.
- **Frontend**: Aplicación móvil en Expo con navegación basada en rutas, almacenamiento seguro de tokens y gestión de estado de autenticación.
- **Autenticación**: Uso de tokens Bearer para verificar la identidad del usuario en cada solicitud protegida.

## Requisitos Previos

### Backend

- Python 3.10+
- Dependencias listadas en `back/splitexpenser-back/pyproject.toml`

### Frontend

- Node.js y npm
- Expo CLI
- Variables de entorno: `API_URL` y `TOKEN_KEY` (ver `.env` o configuración)

## Instalación y Configuración

### Backend

1. Navega al directorio del backend:

   ```
   cd back/splitexpenser-back
   ```

2. Instala las dependencias:

   ```
   pip install -r requirements.txt  # o usando uv: uv sync
   ```

3. Ejecuta la aplicación:
   ```
   python main.py
   ```
   El servidor se ejecutará en `http://0.0.0.0:8000`.

### Frontend

1. Navega al directorio del frontend:

   ```
   cd front/splitexpenser-front
   ```

2. Instala las dependencias:

   ```
   npm install
   ```

3. Configura las variables de entorno (crea un archivo `.env`):

   ```
   API_URL=http://localhost:8000
   TOKEN_KEY=your-secure-token-key
   ```

4. Ejecuta la aplicación:
   ```
   npm start
   ```
   O para plataformas específicas:
   ```
   npm run android  # Para Android
   npm run ios      # Para iOS
   npm run web      # Para web
   ```

## Funcionamiento Paso a Paso

### 1. Configuración Inicial del Backend

En `back/splitexpenser-back/main.py`:

- **Configuración de Flask y Extensiones**:

  ```python
  app = Flask(__name__)
  CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True, expose_headers=["Content-Type", "Authorization"], allow_headers=["Content-Type", "Authorization"])
  app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///splitexpenser.db"
  app.config["JWT_SECRET_KEY"] = "secret-jwt-key"
  app.config["JWT_ALGORITHM"] = "HS256"
  db = SQLAlchemy(app)
  jwt = JWTManager(app)
  ```

  - Se configura Flask con CORS para permitir solicitudes desde el frontend.
  - Se establece la base de datos SQLite y las claves JWT.

- **API con Swagger**:

  ```python
  api = Api(app, title="Splitexpenser API", version="1.0", description="API para gestión de gastos en grupo", authorizations={"jwt": {"type": "apiKey", "in": "header", "name": "Authorization"}}, security=None)
  ```

  - Se crea la instancia de la API con documentación Swagger y configuración de autorización JWT.

- **Modelos de Base de Datos**:

  - `User`: Almacena usuarios con username y password hasheado.
  - `Group`: Grupos con miembros.
  - `Expense`: Gastos asociados a grupos y usuarios.
  - Tabla intermedia `group_members` para relaciones muchos-a-muchos.

- **Modelos Swagger**: Definiciones para validación de entradas en la API.

### 2. Autenticación en el Backend

- **Registro (`/auth/register`)**:

  ```python
  @auth_ns.route("/register")
  class Register(Resource):
      @auth_ns.expect(registration_model, validate=True)
      def post(self):
          # Valida datos, verifica unicidad, hashea password y guarda usuario
  ```

  - Recibe username y password, valida, hashea la contraseña y guarda en DB.

- **Login (`/auth/login`)**:

  ```python
  @auth_ns.route("/login")
  class Login(Resource):
      def post(self):
          # Verifica credenciales y genera token JWT
          token = create_access_token(identity=str(user.id))
          return {"access_token": token}
  ```

  - Verifica username/password, genera token JWT si es válido.

- **Verificación de Token en Rutas Protegidas**:

  ```python
  @jwt_required()
  def get(self):
      user_id = get_jwt_identity()
      # Accede a recursos basados en user_id
  ```

  - El decorador `@jwt_required()` verifica el token Bearer en el header `Authorization`.
  - `get_jwt_identity()` extrae el ID del usuario del token.

- **Desregistro (`/auth/unregister`)**:
  - Requiere autenticación y verificación de password para eliminar cuenta.

### 3. Gestión de Grupos y Gastos

- **Grupos**:

  - Crear grupo: Usuario autenticado crea grupo y se añade automáticamente.
  - Listar grupos: Devuelve grupos del usuario.
  - Añadir miembros: Añade usuarios existentes a un grupo.

- **Gastos**:
  - Crear gasto: Usuario paga un gasto en un grupo.
  - Listar gastos: Muestra gastos de un grupo.
  - Actualizar/Eliminar: Solo el creador puede modificar.

Todas las rutas requieren `@jwt_required()` para verificar el token.

### 4. Configuración del Frontend

En `front/splitexpenser-front/`:

- **app.config.js**: Configura extras como `apiUrl` y `tokenKey` desde variables de entorno.

- **package.json**: Dependencias incluyen `expo-secure-store` para almacenamiento seguro, `expo-router` para navegación.

- **app.json**: Configuración de Expo con plugins como `expo-secure-store`.

### 5. Gestión de Autenticación en el Frontend

En `front/splitexpenser-front/context/AuthContext.tsx`:

- **AuthContext**: Proporciona estado global de autenticación.

  ```typescript
  type AuthContextType = {
    token: string | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<any>;
    register: (username: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
  };
  ```

- **AuthProvider**:
  - **Estado**: `token` y `loading`.
  - **useEffect**: Carga token guardado en SecureStore al iniciar.
  - **register**: Envía POST a `/auth/register`.
  - **login**: Envía POST a `/auth/login`, guarda token en SecureStore si éxito.
  - **logout**: Elimina token de SecureStore y resetea estado.

### 6. Navegación y Rutas

En `front/splitexpenser-front/app/`:

- **\_layout.tsx**: Envuelve la app con `AuthProvider`.

- **index.tsx (Home)**:

  - Verifica si hay token; si no, redirige a `/login`.
  - Muestra pantalla principal si autenticado.

- **login.tsx**:

  - Formulario de login; llama a `login()` del contexto.
  - Si éxito, redirige a `/`; si falla, muestra error.

- **register.tsx**:
  - Formulario de registro; llama a `register()` del contexto.
  - Redirige a `/login` si éxito.

### 7. Flujo de Autenticación Completo

1. **Inicio de la App**:

   - `AuthProvider` carga token de SecureStore.
   - Si hay token, usuario va a Home; si no, a Login.

2. **Registro**:

   - Usuario ingresa datos en `register.tsx`.
   - `register()` envía a backend `/auth/register`.
   - Backend valida y guarda usuario.
   - Frontend redirige a Login.

3. **Login**:

   - Usuario ingresa credenciales en `login.tsx`.
   - `login()` envía a backend `/auth/login`.
   - Backend verifica y devuelve `access_token`.
   - Frontend guarda token en SecureStore y actualiza estado.
   - Redirige a Home.

4. **Solicitudes Protegidas**:

   - Para cualquier API call (grupos, gastos), incluir header:
     ```
     Authorization: Bearer <token>
     ```
   - Backend usa `@jwt_required()` para verificar token y extraer identidad.

5. **Logout**:
   - `logout()` elimina token de SecureStore y resetea estado.
   - Redirige a Login.

### 8. Seguridad

- **Backend**: Passwords hasheadas con Werkzeug, tokens JWT con clave secreta.
- **Frontend**: Tokens almacenados en SecureStore (encriptado).
- **CORS**: Configurado para permitir orígenes específicos en producción.

### 9. Base de Datos

- SQLite local (`splitexpenser.db`).
- Tablas creadas automáticamente con `db.create_all()`.

### 10. Documentación de API

Accede a `http://localhost:8000` para ver la documentación Swagger con todos los endpoints.

## Notas Adicionales

- En producción, cambia la clave JWT y configura CORS con orígenes específicos.
- Para testing, usa `pytest` en el backend.
- La app está diseñada para móvil, pero también funciona en web.

Este README cubre el flujo completo de cómo la aplicación Expo funciona con verificación de tokens Bearer, desde la configuración hasta las interacciones usuario-API.
