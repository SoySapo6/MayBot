const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('maybailyes');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

async function connectToWhatsApp() {
    // Usar autenticación con archivos múltiples para mantener la sesión
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // ACTIVAR QR como respaldo
        browser: ['WhatsApp Bot', 'Chrome', '1.0.0'],
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        version: [2, 3000, 1020608496],
        logger: {
            level: 'warn'
        }
    });

    // Manejar actualizaciones de conexión
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📱 Escanea este código QR con tu WhatsApp:');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            
            console.log('🔌 Conexión cerrada');
            console.log('📊 Código de estado:', statusCode);
            
            if (statusCode === DisconnectReason.badSession) {
                console.log('❌ Sesión inválida. Eliminando credenciales...');
                const authDir = path.join(__dirname, 'auth_info_baileys');
                if (fs.existsSync(authDir)) {
                    fs.rmSync(authDir, { recursive: true, force: true });
                }
                console.log('🔄 Reinicia el bot');
                process.exit(1);
            } else if (shouldReconnect) {
                console.log('⏳ Reconectando en 5 segundos...');
                setTimeout(() => connectToWhatsApp(), 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ ¡Conectado exitosamente a WhatsApp!');
            console.log('🤖 Bot listo para recibir mensajes');
        }
    });

    // Guardar credenciales cuando se actualicen
    sock.ev.on('creds.update', saveCreds);

    // Manejar mensajes entrantes (mismo sistema que el principal)
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        
        if (!message.key.fromMe && m.type === 'notify') {
            const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
            console.log('📨 Nuevo mensaje:', messageText);
            
            // Procesar mensaje con el sistema JSON
            await processMessage(sock, message, messageText);
        }
    });

    return sock;
}

// Cargar mensajes desde JSON (misma función)
function loadMessages() {
    try {
        const messagesPath = path.join(__dirname, 'messages.json');
        if (fs.existsSync(messagesPath)) {
            const data = fs.readFileSync(messagesPath, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('❌ Error cargando messages.json:', error.message);
        return [];
    }
}

// Procesar mensajes (misma función)
async function processMessage(sock, message, messageText) {
    const messages = loadMessages();
    
    for (const msgConfig of messages) {
        const command = msgConfig.Command?.toLowerCase();
        const userMessage = messageText.toLowerCase();
        
        if (command && userMessage.includes(command)) {
            try {
                if (msgConfig.Reply) {
                    await sock.sendMessage(message.key.remoteJid, { 
                        text: msgConfig.Reply 
                    });
                }
                
                if (msgConfig.Function) {
                    await executeCustomFunction(sock, message, msgConfig.Function, messageText);
                }
                
                if (msgConfig.File) {
                    await sendFile(sock, message, msgConfig.File);
                }
                
                console.log(`✅ Comando "${command}" ejecutado`);
                break;
                
            } catch (error) {
                console.error(`❌ Error procesando comando "${command}":`, error.message);
            }
        }
    }
}

// Ejecutar función personalizada (misma función)
async function executeCustomFunction(sock, message, functionName, messageText) {
    try {
        const functionsPath = path.join(__dirname, 'functions.js');
        if (fs.existsSync(functionsPath)) {
            const customFunctions = require('./functions.js');
            
            if (typeof customFunctions[functionName] === 'function') {
                await customFunctions[functionName](sock, message, messageText);
            } else {
                console.log(`⚠️ Función "${functionName}" no encontrada`);
            }
        } else {
            console.log('⚠️ Archivo functions.js no encontrado');
        }
    } catch (error) {
        console.error('❌ Error ejecutando función personalizada:', error.message);
    }
}

// Enviar archivo (misma función)
async function sendFile(sock, message, filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        
        if (fs.existsSync(fullPath)) {
            const fileExtension = path.extname(filePath).toLowerCase();
            
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
                await sock.sendMessage(message.key.remoteJid, {
                    image: fs.readFileSync(fullPath),
                    caption: `📸 Imagen enviada`
                });
            } else if (['.mp4', '.avi', '.mov', '.mkv'].includes(fileExtension)) {
                await sock.sendMessage(message.key.remoteJid, {
                    video: fs.readFileSync(fullPath),
                    caption: `🎥 Video enviado`
                });
            } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(fileExtension)) {
                await sock.sendMessage(message.key.remoteJid, {
                    audio: fs.readFileSync(fullPath),
                    mimetype: 'audio/mp4'
                });
            } else {
                await sock.sendMessage(message.key.remoteJid, {
                    document: fs.readFileSync(fullPath),
                    fileName: path.basename(filePath),
                    mimetype: 'application/octet-stream'
                });
            }
            
            console.log(`📎 Archivo enviado: ${filePath}`);
        } else {
            console.log(`❌ Archivo no encontrado: ${filePath}`);
        }
    } catch (error) {
        console.error('❌ Error enviando archivo:', error.message);
    }
}

// Manejo de errores
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error);
    process.exit(1);
});

// Iniciar la conexión
connectToWhatsApp().catch(console.error);

console.log('🚀 Iniciando bot de WhatsApp con QR...');
console.log('📱 Escanea el código QR que aparecerá');
console.log('⌨️  Presiona Ctrl+C para detener el bot');