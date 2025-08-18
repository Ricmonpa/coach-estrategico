#!/bin/bash

echo "🚀 Configuración de Gemini AI para Coach Estratégico"
echo "=================================================="
echo ""

# Verificar si ya existe el archivo .env
if [ -f ".env" ]; then
    echo "⚠️  El archivo .env ya existe."
    read -p "¿Quieres sobrescribirlo? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuración cancelada."
        exit 1
    fi
fi

# Crear archivo .env desde el ejemplo
if [ -f "env.example" ]; then
    cp env.example .env
    echo "✅ Archivo .env creado desde env.example"
else
    echo "❌ No se encontró el archivo env.example"
    exit 1
fi

echo ""
echo "📋 Pasos para completar la configuración:"
echo ""
echo "1. Ve a https://makersuite.google.com/app/apikey"
echo "2. Inicia sesión con tu cuenta de Google"
echo "3. Haz clic en 'Create API Key'"
echo "4. Copia la API Key generada"
echo ""
echo "5. Edita el archivo .env y reemplaza:"
echo "   VITE_GEMINI_API_KEY=tu_api_key_de_gemini_aqui"
echo "   con tu API Key real"
echo ""
echo "6. Reinicia el servidor de desarrollo:"
echo "   npm run dev"
echo ""

# Verificar si el usuario quiere abrir el navegador
read -p "¿Quieres abrir Google AI Studio en tu navegador? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://makersuite.google.com/app/apikey"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://makersuite.google.com/app/apikey"
    else
        echo "No se pudo abrir el navegador automáticamente."
        echo "Abre manualmente: https://makersuite.google.com/app/apikey"
    fi
fi

echo ""
echo "🎉 ¡Configuración inicial completada!"
echo "Recuerda configurar tu API Key en el archivo .env"
