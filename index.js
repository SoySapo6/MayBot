const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('maybailyes');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

async function connectToWhatsApp() {
    // Usar autenticación con archivos múltiples para mantener la sesión
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        // Configurar para usar código de emparejamiento
        auth: state,
        printQRInTerminal: false, // Desactivar QR ya que usaremos código de emparejamiento
        browser: ['WhatsApp Bot', 'Chrome', '1.0.0']
    });

    // Solicitar código de emparejamiento si no hay credenciales
    if (!sock.authState.creds.registered) {
        const phoneNumber = await askForPhoneNumber();
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\n🔐 CÓDIGO DE EMPAREJAMIENTO: ${code}`);
        console.log('📱 Ve a WhatsApp > Dispositivos vinculados > Vincular con número de teléfono');
        console.log('✨ Ingresa este código en tu WhatsApp móvil\n');
    }

    // Manejar actualizaciones de conexión
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('Código QR generado:');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexión cerrada debido a:', lastDisconnect?.error, ', reconectando:', shouldReconnect);
            
            // Reconectar si no fue desconectado por logout
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ ¡Conectado exitosamente a WhatsApp!');
            console.log('🤖 Bot listo para recibir mensajes');
        }
    });

    // Guardar credenciales cuando se actualicen
    sock.ev.on('creds.update', saveCreds);

    // Manejar mensajes entrantes
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

// Cargar mensajes desde JSON
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

// Procesar mensajes según el JSON de configuración
async function processMessage(sock, message, messageText) {
    const messages = loadMessages();
    
    for (const msgConfig of messages) {
        const command = msgConfig.Command?.toLowerCase();
        const userMessage = messageText.toLowerCase();
        
        // Verificar si el mensaje coincide con el comando
        if (command && userMessage.includes(command)) {
            try {
                // Respuesta de texto
                if (msgConfig.Reply) {
                    await sock.sendMessage(message.key.remoteJid, { 
                        text: msgConfig.Reply 
                    });
                }
                
                // Ejecutar función personalizada si existe
                if (msgConfig.Function) {
                    await executeCustomFunction(sock, message, msgConfig.Function, messageText);
                }
                
                // Enviar archivo si está especificado
                if (msgConfig.File) {
                    await sendFile(sock, message, msgConfig.File);
                }
                
                console.log(`✅ Comando "${command}" ejecutado`);
                break; // Salir del loop después de encontrar la primera coincidencia
                
            } catch (error) {
                console.error(`❌ Error procesando comando "${command}":`, error.message);
            }
        }
    }
}

// Ejecutar función personalizada
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

// Enviar archivo
async function sendFile(sock, message, filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        
        if (fs.existsSync(fullPath)) {
            const fileStats = fs.statSync(fullPath);
            const fileExtension = path.extname(filePath).toLowerCase();
            
            // Determinar tipo de archivo y enviar apropiadamente
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
                // Enviar como imagen
                await sock.sendMessage(message.key.remoteJid, {
                    image: fs.readFileSync(fullPath),
                    caption: `📸 Imagen enviada`
                });
            } else if (['.mp4', '.avi', '.mov', '.mkv'].includes(fileExtension)) {
                // Enviar como video
                await sock.sendMessage(message.key.remoteJid, {
                    video: fs.readFileSync(fullPath),
                    caption: `🎥 Video enviado`
                });
            } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(fileExtension)) {
                // Enviar como audio
                await sock.sendMessage(message.key.remoteJid, {
                    audio: fs.readFileSync(fullPath),
                    mimetype: 'audio/mp4'
                });
            } else {
                // Enviar como documento
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

// Función auxiliar para solicitar número de teléfono
function askForPhoneNumber() {
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('📱 Ingresa tu número de teléfono (con código de país, ej: 521234567890): ', (phone) => {
            rl.close();
            resolve(phone);
        });
    });
}

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('Error no manejado:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Excepción no capturada:', error);
    process.exit(1);
});

// Iniciar la conexión
connectToWhatsApp().catch(console.error);

console.log('Iniciando bot de WhatsApp...');
console.log('Presiona Ctrl+C para detener el bot');
