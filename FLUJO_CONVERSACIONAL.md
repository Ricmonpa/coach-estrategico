# Flujo Conversacional Mejorado - Coach Estratégico

## Cambios Implementados

### 1. **Análisis de Contexto Inteligente**
- Se implementó una función `analyzeConversationContext()` que analiza automáticamente la conversación
- Detecta temas clave basados en palabras clave:
  - `problema_principal`: problema, obstáculo, bloqueo, dificultad, retroceso
  - `recursos`: dinero, tiempo, habilidades, conexiones, herramientas
  - `intentos_previos`: intenté, probé, hice, implementé, falló
  - `objetivo`: quiero, meta, objetivo, lograr, alcanzar
  - `limitaciones`: no puedo, no tengo, es difícil, imposible, no sé

### 2. **Criterios para Diagnóstico Final**
El coach ahora solo da el diagnóstico final cuando:
- Hay al menos 3 mensajes del usuario
- Se han cubierto al menos 3 temas clave diferentes
- Se tiene suficiente contexto sobre la situación

### 3. **Prompt del Sistema Mejorado**
- Se agregó información del contexto actual en cada respuesta
- El coach recibe instrucciones específicas sobre si debe continuar preguntando o dar el diagnóstico
- Se enfatiza hacer más preguntas de seguimiento antes del diagnóstico

### 4. **Detección Mejorada de Tipos de Respuesta**
- **Preguntas de seguimiento**: Solo usan el campo `challenge`, sin `plan`, `truth` o `meta`
- **Diagnóstico final**: Incluye `plan`, `truth` y `meta` (meta cuantitativa obligatoria)

### 5. **Flujo Conversacional Natural**
- Las preguntas de seguimiento se muestran como mensajes simples del coach
- Solo el diagnóstico final usa el formato estructurado (Verdad Dura + Plan + Reto + Meta)
- Se mantiene el contexto de la conversación entre intercambios

## Cómo Funciona

### Fase 1: Presentación Inicial
- El coach se presenta y da un desafío inicial
- NO diagnostica ni recomienda metas

### Fase 2: Preguntas de Seguimiento (3-5 preguntas)
- El coach hace preguntas específicas y profundas
- Cada pregunta se enfoca en un aspecto diferente de la situación
- Se mantiene el contexto de respuestas anteriores

### Fase 3: Diagnóstico Final
- Solo cuando hay suficiente contexto (mínimo 3 intercambios)
- Incluye análisis brutal, plan de acción y meta cuantitativa
- Se genera automáticamente el botón "Crear Meta"

## Beneficios

1. **Mayor Precisión**: El coach tiene más contexto antes de diagnosticar
2. **Flujo Natural**: Conversación más fluida y menos abrupta
3. **Mejor Comprensión**: Se exploran múltiples aspectos de la situación
4. **Contexto Preservado**: El coach recuerda toda la conversación
5. **Diagnóstico Más Acertado**: Basado en información completa

## Ejemplo de Flujo

```
Usuario: "Tengo problemas con mi negocio"
Coach: "¿Cuál es el problema más crítico? Sé específico"

Usuario: "No tengo suficientes clientes, solo 3"
Coach: "¿Cuánto tiempo llevas intentando y qué has probado?"

Usuario: "6 meses, he probado redes sociales y Google Ads"
Coach: "¿Cuál es tu propuesta de valor única?"

Usuario: "Soy especialista en transformación digital"
Coach: [DIAGNÓSTICO FINAL con plan y meta]
```

## Archivos Modificados

- `src/services/aiService.ts`: Lógica de análisis de contexto y prompt mejorado
- `src/components/CoachChat.tsx`: Detección mejorada de tipos de respuesta
- `src/App.tsx`: Mensaje inicial actualizado
