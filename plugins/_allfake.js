import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) {

var canal = 'https://whatsapp.com/channel/0029VbBBNfH4Y9ltpS4C8w3c'
var comunidad = 'https://chat.whatsapp.com/KqkJwla1aq1LgaPiuFFtEY'
var git = 'https://github.com/SoySapo6'
var github = 'https://github.com/SoySapo6/MayBot'
var correo = 'soymaycol.cn@gmail.com'
global.redes = pickRandom([canal, comunidad, git, github, correo])
  
let nombre = m.pushName || 'Anónimo'
let botname = global.botName || 'MαყBσƚ'

let thumb = await (await fetch(global.icono)).buffer()

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
let id = global.canalIdM[randomIndex]
let name = global.canalNombreM[randomIndex]
return { id, name }
}
