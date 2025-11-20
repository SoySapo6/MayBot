import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) { 
global.canalIdM = ["120363406779062566@newsletter"]
global.canalNombreM = ["𝐒𝐨𝐲𝐌𝐚𝐲𝐜𝐨𝐥 <𝟑 • Actualizaciones"]
global.channelRD = await getRandomChannel()

global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, {weekday: 'long'})
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
global.mes = d.toLocaleDateString('es', {month: 'long'})
global.año = d.toLocaleDateString('es', {year: 'numeric'})
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

var canal = 'https://whatsapp.com/channel/0029VbBBNfH4Y9ltpS4C8w3c'  
var comunidad = 'https://chat.whatsapp.com/KqkJwla1aq1LgaPiuFFtEY'
var git = 'https://github.com/SoySapo6'
var github = 'https://github.com/SoySapo6/MayBot' 
var correo = 'soymaycol.cn@gmail.com'
global.redes = [canal, comunidad, git, github, correo].getRandom()

let nombre = m.pushName || 'Anónimo'
let botname = global.botName || 'MαყBσƚ'
  
global.packsticker = `
°•☆╮⎯⃘✦⎯⃘☆•°
᯽ᬊ Usuario: ${nombre}
✺ Fecha: ${fecha}
✹ Hora: ${hora}
⊱┊ MαყBσƚ ᴮʸ ˢᵒʸᵐᵃʸᶜᵒˡ ·˚ *
⏚⭒°•☆╯⎯⃘✦⎯⃘☆•°
`
  
global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }
global.rcanal = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '', newsletterName: channelRD.name }, externalAdReply: { title: botname, body: dev, mediaUrl: null, description: null, previewType: "PHOTO", thumbnail: await (await fetch(icono)).buffer(), sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false }, mentionedJid: null }}
}

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalIdM.length)
let id = canalIdM[randomIndex]
let name = canalNombreM[randomIndex]
return { id, name }
}
