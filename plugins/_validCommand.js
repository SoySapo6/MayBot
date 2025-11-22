export async function before(m, { conn }) {
if (!m.text || !global.prefix.test(m.text)) return
const usedPrefix = global.prefix.exec(m.text)[0]
const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()
if (!command || command.length === 0) return

const validCommand = (command, plugins) => {
for (let plugin of Object.values(plugins)) {
let cmds = plugin.command
if (!cmds) continue
if (!Array.isArray(cmds)) cmds = [cmds]
if (cmds.includes(command)) return true
}
return false
}

let chat = global.db.data.chats[m.chat]
let settings = global.db.data.settings[conn.user.jid]
let owner = [...global.owner.map(([num]) => num)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)

if (chat.modoadmin) return
if (settings.self) return
if (command === 'mute') return
if (chat.isMute && !owner) return
if (command === 'bot') return
if (chat.isBanned && !owner) return

if (validCommand(command, global.plugins)) return

let comandos = []
for (let plugin of Object.values(global.plugins)) {
let cmds = plugin.command
if (!cmds) continue
if (!Array.isArray(cmds)) cmds = [cmds]
comandos.push(...cmds)
}

let mejor = null
let distanciaMin = Infinity

for (let cmd of comandos) {
let d = levenshtein(command, cmd)
if (d < distanciaMin) {
distanciaMin = d
mejor = cmd
}
}

let sugerencia = mejor ? `${usedPrefix}${mejor}` : null

let texto = `•——————•°•✿•°•——————•
╰┈➤ MαყBσƚ ⌇°•
⊱┊ ᴴᵉᶜʰᵒ ᵖᵒʳ ${global.etiqueta}
●～●～●～●～●～●～●～●～

ꕥ El comando <${command}> no existe.

${sugerencia ? `Tal vez quisiste decir:
❀ ${sugerencia}` : ''}

•——————•°•✿•°•——————•`

await conn.sendMessage(m.chat, {
text: texto,
contextInfo: {
externalAdReply: {
title: global.canalNombreM[0],
body: '⊱┊ MαყBσƚ ᵇʸ ˢᵒʸᵐᵃʸᶜᵒˡ ❦',
thumbnailUrl: 'https://files.catbox.moe/x8xyh8.jpeg',
sourceUrl: 'https://mayapi.ooguy.com',
mediaType: 1,
renderLargerThumbnail: true
},
mentionedJid: [m.sender],
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: global.canalIdM[0],
newsletterName: global.canalNombreM[0],
serverMessageId: -1
}
}
}, { quoted: m })
}

function levenshtein(a, b) {
if (a.length === 0) return b.length
if (b.length === 0) return a.length
let matrix = []
for (let i = 0; i <= b.length; i++) matrix[i] = [i]
for (let j = 0; j <= a.length; j++) matrix[0][j] = j
for (let i = 1; i <= b.length; i++) {
for (let j = 1; j <= a.length; j++) {
matrix[i][j] = Math.min(
matrix[i - 1][j] + 1,
matrix[i][j - 1] + 1,
matrix[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1)
)
}
}
return matrix[b.length][a.length]
}
