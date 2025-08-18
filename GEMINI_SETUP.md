# Configuración de Gemini AI para Coach Estratégico

## 🚀 Configuración Rápida

### 1. Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API Key generada

### 2. Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env`:
```bash
cp env.example .env
```

2. Edita el archivo `.env` y reemplaza `tu_api_key_de_gemini_aqui` con tu API Key real:
```env
VITE_GEMINI_API_KEY=AIzaSyC...tu_api_key_real_aqui
```

### 3. Reiniciar el Servidor

```bash
npm run dev
```

## 🔧 Configuración Avanzada

### Modelos Disponibles

- `gemini-1.5-flash` (recomendado) - Rápido y eficiente
- `gemini-1.5-pro` - Más potente pero más lento
- `gemini-2.0-flash-exp` - Experimental, más rápido

Para cambiar el modelo, agrega esta línea a tu `.env`:
```env
VITE_GEMINI_MODEL=gemini-1.5-pro
```

### Configuración de Seguridad

El servicio incluye configuraciones de seguridad automáticas para:
- Prevenir contenido dañino
- Filtrar acoso y discurso de odio
- Bloquear contenido sexualmente explícito
- Evitar contenido peligroso

## 🐛 Solución de Problemas

### Error: "API Key no configurada"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Asegúrate de que `VITE_GEMINI_API_KEY` esté definido correctamente
- Reinicia el servidor de desarrollo

### Error: "Error de API Gemini: 400"
- Verifica que tu API Key sea válida
- Asegúrate de que tengas cuota disponible en Google AI Studio
- Revisa que el modelo especificado esté disponible

### Error: "Error de API Gemini: 403"
- Tu API Key no tiene permisos para el modelo especificado
- Verifica que tu cuenta tenga acceso a Gemini API
- Considera usar un modelo diferente

### Error: "Error de API Gemini: 429"
- Has excedido el límite de cuota
- Espera unos minutos antes de intentar nuevamente
- Considera actualizar tu plan en Google AI Studio

## 💡 Características del Coach IA

### Personalidad
- **Brutalmente honesto** pero constructivo
- **Enfocado en resultados** y acciones específicas
- **Experiencia en empresas multimillonarias**
- **Conocimiento profundo** en psicología y estrategia

### Respuestas Estructuradas
Cada respuesta incluye:
- **La Verdad Dura**: Análisis directo de la situación
- **Plan de Acción**: Pasos específicos y medibles
- **Tu Reto**: Desafío personalizado
- **Recursos Sugeridos**: Material relevante del sistema

### Integración con Recursos
El coach puede sugerir automáticamente recursos del sistema basándose en:
- El contexto de la conversación
- Los objetivos del usuario
- Las áreas de mejora identificadas

## 🔒 Seguridad y Privacidad

- Las conversaciones se procesan en los servidores de Google
- No se almacenan conversaciones permanentemente
- Se aplican filtros de seguridad automáticos
- La API Key se mantiene segura en variables de entorno

## 📊 Monitoreo y Uso

### Verificar Estado de la API
El sistema verifica automáticamente la conexión con Gemini al cargar la aplicación.

### Indicadores Visuales
- 🟢 **Conectado**: API funcionando correctamente
- 🟡 **Sin API Key**: Necesitas configurar tu clave
- 🔴 **Error**: Problema de conexión o configuración

### Límites de Uso
- Consulta [Google AI Studio](https://makersuite.google.com/app/apikey) para ver tu cuota actual
- Los límites varían según tu plan y región
- El sistema maneja automáticamente los errores de cuota

## 🆘 Soporte

Si tienes problemas:
1. Verifica la configuración siguiendo esta guía
2. Revisa la consola del navegador para errores detallados
3. Consulta la [documentación oficial de Gemini](https://ai.google.dev/docs)
4. Verifica el estado del servicio en [Google Cloud Status](https://status.cloud.google.com/)
