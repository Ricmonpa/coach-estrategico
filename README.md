# Coach Estratégico

Una aplicación de coaching estratégico brutalmente honesta para emprendedores, empresarios y altos ejecutivos de alto desempeño.

## Características

- **Coach IA Brutal**: Coaching personalizado con IA que no tolera excusas
- **Seguimiento de Metas**: Sistema de metas críticas con métricas y progreso
- **Arsenal de Estrategias**: Modelos mentales y frameworks estratégicos
- **Perfil Estratégico**: Definición de misión personal y valores fundamentales
- **Diseño Mobile-First**: Optimizado para dispositivos móviles

## Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar API Key de Gemini**:
   - Crea un archivo `.env` en la raíz del proyecto
   - Agrega tu API key de Gemini:
   ```
   VITE_GEMINI_API_KEY=tu_api_key_de_gemini_aqui
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

## Tecnologías

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Iconos**: Lucide React
- **Animaciones**: Framer Motion
- **IA**: Google Gemini API

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Navigation.tsx   # Navegación principal
│   ├── CoachChat.tsx    # Chat con el coach IA
│   ├── GoalsView.tsx    # Vista de metas
│   ├── ResourcesView.tsx # Vista de recursos
│   └── ProfileView.tsx  # Vista de perfil
├── services/           # Servicios
│   └── aiService.ts    # Servicio de IA
├── types/              # Tipos TypeScript
│   └── index.ts
├── data/               # Datos iniciales
│   └── initialData.ts
└── App.tsx             # Componente principal
```

## Próximos Pasos

- [ ] Backend con Node.js y Express
- [ ] Base de datos para persistencia
- [ ] Autenticación de usuarios
- [ ] App móvil con React Native
- [ ] Más recursos estratégicos
- [ ] Sistema de accountability
- [ ] Dashboard de progreso avanzado
