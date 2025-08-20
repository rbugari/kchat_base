# Configuración de GitHub Actions para CI/CD

## 🔧 Configuración de Secrets

### Railway Secrets

1. **Obtener Railway Token:**
   ```bash
   railway login
   railway whoami --token
   ```
   - Copia el token y guárdalo como `RAILWAY_TOKEN`

2. **Obtener Service ID:**
   ```bash
   cd kargho-web-backend
   railway status --json
   ```
   - Busca el campo `serviceId` y guárdalo como `RAILWAY_SERVICE_ID`

### Vercel Secrets

1. **Obtener Vercel Token:**
   - Ve a [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Crea un nuevo token
   - Guárdalo como `VERCEL_TOKEN`

2. **Obtener Organization ID:**
   ```bash
   vercel teams list
   ```
   - Copia tu Organization ID y guárdalo como `VERCEL_ORG_ID`

3. **Obtener Project ID:**
   ```bash
   cd kargho-web-frontend
   vercel project ls
   ```
   - Busca tu proyecto y copia el ID
   - Guárdalo como `VERCEL_PROJECT_ID`

## 📝 Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Añade cada secret:

| Name | Value | Description |
|------|-------|-------------|
| `RAILWAY_TOKEN` | `tu-railway-token` | Token de autenticación de Railway |
| `RAILWAY_SERVICE_ID` | `tu-service-id` | ID del servicio en Railway |
| `VERCEL_TOKEN` | `tu-vercel-token` | Token de autenticación de Vercel |
| `VERCEL_ORG_ID` | `tu-org-id` | ID de tu organización en Vercel |
| `VERCEL_PROJECT_ID` | `tu-project-id` | ID del proyecto en Vercel |

## 🚀 Activar CI/CD

### Estructura de Branches

```
main/master (producción)
├── develop (desarrollo)
├── feature/nueva-funcionalidad
└── hotfix/correccion-urgente
```

### Flujo de Trabajo

1. **Desarrollo:**
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   # Hacer cambios
   git commit -m "feat: nueva funcionalidad"
   git push origin feature/mi-nueva-funcionalidad
   ```

2. **Pull Request:**
   - Crear PR hacia `main`
   - GitHub Actions ejecutará tests automáticamente
   - Revisar y aprobar cambios

3. **Despliegue:**
   ```bash
   git checkout main
   git merge feature/mi-nueva-funcionalidad
   git push origin main
   ```
   - GitHub Actions desplegará automáticamente

## 🔍 Monitoreo de Despliegues

### Ver Status de Actions
1. Ve a tu repositorio → Actions
2. Selecciona el workflow "Deploy to Railway and Vercel"
3. Revisa logs de cada step

### Comandos de Verificación
```bash
# Verificar despliegue en Railway
railway status

# Verificar despliegue en Vercel
vercel ls
```

## 🛠️ Troubleshooting

### Error: "Invalid token"
- Regenerar tokens en Railway/Vercel
- Actualizar secrets en GitHub

### Error: "Service not found"
- Verificar `RAILWAY_SERVICE_ID`
- Asegurar que el servicio existe

### Error: "Project not found"
- Verificar `VERCEL_PROJECT_ID`
- Asegurar que el proyecto está vinculado

### Error: "Build failed"
- Revisar logs en Actions
- Verificar dependencias en package.json
- Comprobar variables de entorno

## 📋 Checklist de Configuración

- [ ] Railway CLI instalado y autenticado
- [ ] Vercel CLI instalado y autenticado
- [ ] Tokens obtenidos de ambas plataformas
- [ ] Secrets configurados en GitHub
- [ ] Workflow file presente en `.github/workflows/`
- [ ] Primer push a main para activar CI/CD
- [ ] Verificar despliegue exitoso

## 🔄 Actualizaciones Futuras

Para añadir más steps al workflow:

1. Edita `.github/workflows/deploy.yml`
2. Añade nuevos jobs o steps
3. Commit y push para activar cambios

Ejemplos de mejoras:
- Tests de integración
- Análisis de código con SonarCloud
- Notificaciones a Slack/Discord
- Backup de base de datos antes del deploy