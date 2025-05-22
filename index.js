const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('maybailyes');
const qrcode = require('qrcode-terminal');

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
        console.log(`Código de emparejamiento: ${code}`);
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
            console.log('¡Conectado exitosamente a WhatsApp!');
        }
    });

    // Guardar credenciales cuando se actualicen
    sock.ev.on('creds.update', saveCreds);

    // Manejar mensajes entrantes
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        
        if (!message.key.fromMe && m.type === 'notify') {
            console.log('Nuevo mensaje:', message.message?.conversation || message.message?.extendedTextMessage?.text);
            
            // Ejemplo: responder a mensajes que contengan "hola"
            const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
            
            if (messageText.toLowerCase().includes('hola')) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '¡Hola! Soy un bot de WhatsApp.' 
                });
            }
        }
    });

    return sock;
}

// Función auxiliar para solicitar número de teléfono
function askForPhoneNumber() {
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Ingresa tu número de teléfono (con código de país, ej: 521234567890): ', (phone) => {
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
