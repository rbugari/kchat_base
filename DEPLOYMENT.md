# Guía de Despliegue - Kargho Chatbot

## Resumen

Este proyecto consta de dos componentes principales:
- **Backend**: API Express.js que maneja la lógica del chatbot (para Railway)
- **Frontend**: Interfaz web estática (para Vercel)

## Configuración Previa

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura las siguientes variables:

```bash
# Kargho API Configuration
KARGHO_API_BASE="https://kargho-backend.melpomenia.theworkpc.com"
KARGHO_JWT="your-jwt-token-here"

# LLM Configuration
LLM_PROVIDER=openai
OPENAI_API_KEY="your-openai-api-key-here"
LLM_MODEL=gpt-4o-mini

# Alternative LLM Provider
GROQ_API_KEY="your-groq-api-key-here"

# API Mode
MOCK_API=false
```

### 2. Instalación de CLIs

```bash
# Railway CLI
npm install -g @railway/cli
railway login

# Vercel CLI
npm install -g vercel
vercel login
```

## Despliegue Automático

### 🚀 CI/CD con GitHub Actions (Recomendado)

El proyecto incluye configuración de GitHub Actions para despliegue automático:

**Configuración de Secrets en GitHub:**
1. Ve a tu repositorio → Settings → Secrets and variables → Actions
2. Añade los siguientes secrets:

```bash
# Railway
RAILWAY_TOKEN=your-railway-token
RAILWAY_SERVICE_ID=your-service-id

# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

**Flujo Automático:**
- ✅ Push a `main`/`master` → Despliegue automático
- ✅ Pull Request → Tests automáticos
- ✅ Backend desplegado primero, luego frontend
- ✅ Rollback automático en caso de error

### 📱 Despliegue Manual (Alternativo)

#### Opción 1: Despliegue Completo
```bash
npm run deploy:full
```

#### Opción 2: Despliegue por Componentes
```bash
# Solo backend
npm run deploy:backend

# Solo frontend (requiere URL del backend)
npm run deploy:frontend https://your-backend.railway.app
```

## Despliegue Manual

### Backend en Railway

1. **Crear proyecto en Railway**:
   ```bash
   cd kargho-web-backend
   railway login
   railway init
   ```

2. **Configurar variables de entorno en Railway**:
   - Ve a tu proyecto en railway.app
   - Añade todas las variables del archivo `.env`
   - Asegúrate de configurar `PORT` (Railway lo asigna automáticamente)

3. **Desplegar**:
   ```bash
   railway up
   ```

4. **Obtener URL del despliegue**:
   ```bash
   railway status
   ```

### Frontend en Vercel

1. **Actualizar URL del backend**:
   - Edita `kargho-web-frontend/index.html`
   - Reemplaza `"https://your-railway-backend-url.up.railway.app"` con tu URL real

2. **Desplegar**:
   ```bash
   cd kargho-web-frontend
   vercel --prod
   ```

## Configuración de Dominio Personalizado

### Railway
1. Ve a tu proyecto en railway.app
2. Settings → Domains
3. Añade tu dominio personalizado

### Vercel
1. Ve a tu proyecto en vercel.com
2. Settings → Domains
3. Añade tu dominio personalizado

## Monitoreo y Logs

### Railway
```bash
railway logs
```

### Vercel
```bash
vercel logs
```

## Solución de Problemas

### Error: "Cannot find module"
- Asegúrate de que todas las dependencias estén instaladas
- Ejecuta `npm install` en ambos directorios

### Error: "API Key not found"
- Verifica que todas las variables de entorno estén configuradas
- En Railway, revisa la sección Variables

### Error: "CORS"
- Asegúrate de que el backend esté configurado correctamente
- Verifica que la URL del backend en el frontend sea correcta

### Error: "Port already in use"
- Railway asigna automáticamente el puerto
- Para desarrollo local, cambia el puerto en `.env`

## Scripts Disponibles

```bash
# Desarrollo local
npm run dev:backend    # Inicia el backend en puerto 3000
npm run dev:frontend   # Inicia el frontend en puerto 8080

# Despliegue
npm run deploy:backend   # Despliega solo el backend
npm run deploy:frontend  # Despliega solo el frontend
npm run deploy:full      # Despliega ambos componentes

# Utilidades
npm run build           # Instala todas las dependencias
```

## Estructura de Archivos de Configuración

```
kargho-web-backend/
├── railway.json        # Configuración de Railway
├── Dockerfile         # Imagen Docker alternativa
└── package.json       # Dependencias y scripts

kargho-web-frontend/
├── vercel.json        # Configuración de Vercel
└── index.html         # Punto de entrada

.env.example           # Plantilla de variables de entorno
deploy.js             # Script de despliegue automatizado
```

## Notas Importantes

1. **Seguridad**: Nunca commitees el archivo `.env` al repositorio
2. **Variables**: Todas las API keys deben configurarse en las plataformas de despliegue
3. **CORS**: El backend ya está configurado para aceptar requests del frontend
4. **Escalabilidad**: Railway maneja automáticamente el escalado del backend
5. **CDN**: Vercel proporciona CDN global para el frontend automáticamente