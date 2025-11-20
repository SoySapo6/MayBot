let handler = async (m, { conn, args }) => {
    let userId = m.mentionedJid?.[0] || m.sender
    let categories = {}
    
    for (let plugin of Object.values(global.plugins)) {
        if (!plugin.help || !plugin.tags) continue
        for (let tag of plugin.tags) {
            if (!categories[tag]) categories[tag] = []
            categories[tag].push(...plugin.help.map(cmd => `#${cmd}`))
        }
    }

    const toStyled = (text) => {
        const normal = "abcdefghijklmnopqrstuvwxyz"
        const styled = "αႦƈԃҽϝɠԋιʝƙʅɱɳσρϙɾʂƚυʋɯxყȥ"
        return text.toLowerCase().split('').map(char => {
            let i = normal.indexOf(char)
            return i !== -1 ? styled[i] : char
        }).join('')
    }

    let menuText = `•——————•°•✿•°•——————•
╰┈➤ MαყBσƚ ⌇°•
⊱┊ ᴴᵉᶜʰᵒ ᵖᵒʳ ${global.etiqueta}
➮ 𝐇𝐨𝐫𝐚: °❀ *${hora}*
➮ 𝐅𝐞𝐜𝐡𝐚: °❀ *${hora}*
.·:*¨¨* ≈☆≈ *¨¨*:·.
➮ 𝐓𝐢𝐩𝐨: °❀ *${(conn.user.jid == global.conn.user.jid ? 'Principal' : 'Sub-Bot')}*
➮ 𝐔𝐬𝐮𝐚𝐫𝐢𝐨𝐬: °❀ *${totalreg.toLocaleString()}*

> *${totalCommands}* ℂ𝕠𝕞𝕒𝕟𝕕𝕠𝕤 𝕕𝕚𝕤𝕡𝕠𝕟𝕚𝕓𝕝𝕖𝕤.
`.trim()

    for (let [tag, cmds] of Object.entries(categories)) {
        let tagName = toStyled(tag)
        menuText += `
ೃ‧₊› ${tagName} ：
${cmds.map(cmd => `╰┈➤ ${cmd}`).join('\n')}

↶*ೃ✧˚. ❃ ↷ ˊ-↶*ೃ✧˚. ❃ ↷ ˊ-
`
    }

    await conn.sendMessage(m.chat, {
        text: menuText,
        contextInfo: {
            externalAdReply: {
                title: global.canalNombreM[0],
                body: 'MαყBσƚ',
                thumbnailUrl: 'https://files.catbox.moe/0dvlsr.jpg',
                sourceUrl: 'https://mayapi.ooguy.com',
                mediaType: 1,
                renderLargerThumbnail: true
            },
            mentionedJid: [m.sender, userId],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.canalIdM[0],
                newsletterName: global.canalNombreM[0],
                serverMessageId: -1,
            }
        }
    }, { quoted: m })
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'ayuda']
handler.register = true

export default handler
