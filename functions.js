// Archivo de funciones personalizadas para el bot de WhatsApp

// Ejemplo: Función para obtener el clima
async function getWeather(sock, message, messageText) {
    try {
        // Aquí puedes hacer una petición a una API de clima
        // Por ahora simularemos una respuesta
        const weatherInfo = `🌤️ **CLIMA ACTUAL**\n\n🌡️ Temperatura: 25°C\n💨 Viento: 10 km/h\n☁️ Condición: Parcialmente nublado\n💧 Humedad: 60%\n\n📍 Ciudad: México\n⏰ Actualizado: ${new Date().toLocaleString()}`;
        
        await sock.sendMessage(message.key.remoteJid, { 
            text: weatherInfo 
        });
    } catch (error) {
        console.error('Error en getWeather:', error);
        await sock.sendMessage(message.key.remoteJid, { 
            text: '❌ Error al obtener información del clima' 
        });
    }
}

// Ejemplo: Función personalizada simple
async function customExample(sock, message, messageText) {
    try {
        const userJid = message.key.remoteJid;
        const userName = message.pushName || 'Usuario';
        
        const customResponse = `👋 ¡Hola ${userName}!\n\n✨ Esta es una función personalizada ejecutándose.\n\n📝 Tu mensaje fue: "${messageText}"\n🕐 Hora: ${new Date().toLocaleString()}\n📱 Número: ${userJid.split('@')[0]}`;
        
        await sock.sendMessage(userJid, { 
            text: customResponse 
        });
    } catch (error) {
        console.error('Error en customExample:', error);
    }
}

// Ejemplo: Función completa con múltiples acciones
async function processComplete(sock, message, messageText) {
    try {
        const userJid = message.key.remoteJid;
        
        // Primera respuesta
        await sock.sendMessage(userJid, { 
            text: '🔄 Procesando solicitud completa...' 
        });
        
        // Simular tiempo de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Segunda respuesta con información detallada
        const detailedInfo = `✅ **PROCESAMIENTO COMPLETADO**\n\n📊 Datos procesados:\n• Mensaje recibido: ✅\n• Función ejecutada: ✅\n• Archivo preparado: ✅\n\n🔍 Análisis del mensaje:\n• Longitud: ${messageText.length} caracteres\n• Palabras: ${messageText.split(' ').length}\n• Timestamp: ${Date.now()}\n\n💡 Función completada exitosamente`;
        
        await sock.sendMessage(userJid, { 
            text: detailedInfo 
        });
    } catch (error) {
        console.error('Error en processComplete:', error);
    }
}

// Ejemplo: Función con petición HTTP (requiere axios)
async function makeApiRequest(sock, message, messageText) {
    try {
        // Descomenta y modifica según tu API
        /*
        const axios = require('axios');
        const response = await axios.get('https://api.ejemplo.com/data');
        
        await sock.sendMessage(message.key.remoteJid, { 
            text: `📡 Respuesta de API:\n${JSON.stringify(response.data, null, 2)}` 
        });
        */
        
        await sock.sendMessage(message.key.remoteJid, { 
            text: '⚠️ Función de API no configurada. Edita functions.js para añadir tu API.' 
        });
    } catch (error) {
        console.error('Error en makeApiRequest:', error);
    }
}

// Ejemplo: Función para procesar texto
async function processText(sock, message, messageText) {
    try {
        const processedText = messageText
            .toLowerCase()
            .split('')
            .reverse()
            .join('')
            .toUpperCase();
        
        await sock.sendMessage(message.key.remoteJid, { 
            text: `🔄 **TEXTO PROCESADO**\n\nOriginal: ${messageText}\nProcesado: ${processedText}` 
        });
    } catch (error) {
        console.error('Error en processText:', error);
    }
}

// Ejemplo: Función para obtener fecha y hora
async function getDateTime(sock, message, messageText) {
    try {
        const now = new Date();
        const dateInfo = `📅 **FECHA Y HORA ACTUAL**\n\n📆 Fecha: ${now.toLocaleDateString()}\n🕐 Hora: ${now.toLocaleTimeString()}\n🌍 Zona horaria: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n📊 Timestamp: ${now.getTime()}`;
        
        await sock.sendMessage(message.key.remoteJid, { 
            text: dateInfo 
        });
    } catch (error) {
        console.error('Error en getDateTime:', error);
    }
}

// Exportar todas las funciones
module.exports = {
    getWeather,
    customExample,
    processComplete,
    makeApiRequest,
    processText,
    getDateTime
};
