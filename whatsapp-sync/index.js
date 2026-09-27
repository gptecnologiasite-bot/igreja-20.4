import 'dotenv/config'
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import makeWASocket, {
  Browsers,
  DisconnectReason,
  downloadMediaMessage,
  getContentType,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { createClient } from '@supabase/supabase-js'
import pino from 'pino'
import QRCode from 'qrcode'

const __dirname = dirname(fileURLToPath(import.meta.url))
const AUTH_DIR = join(__dirname, 'auth')
const UPLOADED_FILE = join(__dirname, 'uploaded.json')
const QR_FILE = join(__dirname, 'qr.png')
const WA_PHONE = process.env.WA_PHONE?.replace(/\D/g, '')
const MAX_BYTES = 45 * 1024 * 1024
const MAX_GALLERY = 40

// Grupos → destinos no site_settings
// targets: { key, field: 'carousel'|'gallery', captionField }
const GROUP_CONFIGS = [
  {
    match: (process.env.WA_GROUP_ADMAC || 'ADMAC SEDE').trim(),
    id: process.env.WA_GROUP_ADMAC_JID?.trim() || null,
    label: 'ADMAC SEDE',
    targets: [
      { key: 'home', field: 'carousel', imageKey: 'image', title: 'ADMAC' },
      { key: 'ministry_sobre', field: 'gallery', imageKey: 'url', title: 'ADMAC SEDE' },
      { key: 'ministry_midia', field: 'gallery', imageKey: 'url', title: 'ADMAC SEDE' }
    ]
  },
  {
    match: (process.env.WA_GROUP_MIDIA || 'MIDIA ADMAC2').trim(),
    id: process.env.WA_GROUP_MIDIA_JID?.trim() || null,
    label: 'MIDIA ADMAC2',
    targets: [
      { key: 'ministry_midia', field: 'gallery', imageKey: 'url', title: 'Mídia ADMAC' }
    ]
  }
]

const logger = pino({ level: 'silent' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('[sync] Defina SUPABASE_URL e SUPABASE_KEY no whatsapp-sync/.env')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

function loadUploaded() {
  if (!existsSync(UPLOADED_FILE)) return {}
  try {
    return JSON.parse(readFileSync(UPLOADED_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function saveUploaded(map) {
  writeFileSync(UPLOADED_FILE, JSON.stringify(map, null, 2))
}

const uploaded = loadUploaded()

const MEDIA_KINDS = {
  imageMessage: { ext: 'jpg', folder: 'fotos' },
  videoMessage: { ext: 'mp4', folder: 'videos' }
}

function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 6 && current; i++) {
    const type = getContentType(current)
    if (!type) return null
    if (
      type === 'ephemeralMessage' ||
      type === 'viewOnceMessage' ||
      type === 'viewOnceMessageV2' ||
      type === 'viewOnceMessageV2Extension' ||
      type === 'documentWithCaptionMessage'
    ) {
      current = current[type]?.message
      continue
    }
    return { type, content: current[type], message: current }
  }
  return null
}

function matchGroup(list, cfg) {
  if (cfg.id) return list.find((g) => g.id === cfg.id) || null
  const lower = cfg.match.toLowerCase()
  const exact = list.find((g) => (g.subject || '').toLowerCase() === lower)
  const partial = list.find((g) => (g.subject || '').toLowerCase().includes(lower))
  return exact || partial
}

async function resolveGroups(sock) {
  const groups = await sock.groupFetchAllParticipating()
  const list = Object.values(groups || {})
  const resolved = []

  for (const cfg of GROUP_CONFIGS) {
    const match = matchGroup(list, cfg)
    if (match) {
      console.log(`[sync] Grupo ${cfg.label}: ${match.subject} (${match.id})`)
      resolved.push({ jid: match.id, subject: match.subject, cfg })
    } else {
      console.warn(`[sync] Grupo ${cfg.label} ("${cfg.match}") não encontrado`)
    }
  }

  if (!resolved.length) {
    console.error('[sync] Nenhum grupo configurado encontrado. Disponíveis:')
    for (const g of list) console.error(`  - ${g.subject} (${g.id})`)
  }
  return resolved
}

async function appendToSettings(targets, publicUrl, caption) {
  for (const t of targets) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('data')
        .eq('key', t.key)
        .maybeSingle()
      if (error) {
        console.warn(`[sync] Leitura ${t.key}: ${error.message}`)
        continue
      }
      const current = data?.data && typeof data.data === 'object' ? data.data : {}
      const arr = Array.isArray(current[t.field]) ? [...current[t.field]] : []

      if (arr.some((item) => item?.[t.imageKey] === publicUrl)) continue

      const entry = t.field === 'carousel'
        ? { image: publicUrl, title: caption || t.title, subtitle: 'WhatsApp ADMAC' }
        : { url: publicUrl, caption: caption || t.title }

      arr.unshift(entry)
      if (arr.length > MAX_GALLERY) arr.length = MAX_GALLERY
      current[t.field] = arr

      const { error: upErr } = await supabase
        .from('site_settings')
        .upsert({ key: t.key, data: current, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (upErr) console.warn(`[sync] Gravação ${t.key}: ${upErr.message}`)
      else console.log(`[sync] Atualizado site_settings[${t.key}].${t.field}`)
    } catch (err) {
      console.warn(`[sync] settings ${t.key}:`, err.message || err)
    }
  }
}

async function processMessage(sock, group, msg) {
  if (!msg?.message || msg.key.remoteJid !== group.jid) return

  const key = `${msg.key.remoteJid}:${msg.key.id}`
  if (uploaded[key]) return

  const unwrapped = unwrapMessage(msg.message)
  if (!unwrapped) return

  const kind = MEDIA_KINDS[unwrapped.type]
  if (!kind) return

  const media = unwrapped.content
  if (!media?.mimetype) return
  const fileSize = Number(media.fileLength || 0)
  if (fileSize > MAX_BYTES) {
    console.warn(`[sync] Mídia >45MB ignorada (${key})`)
    uploaded[key] = { skipped: true, reason: 'too-large' }
    saveUploaded(uploaded)
    return
  }

  try {
    const buffer = await downloadMediaMessage(msg, 'buffer', {}, {
      logger,
      ...(sock ? { reuploadRequest: sock.updateMediaMessage } : {})
    })
    if (!buffer?.length) throw new Error('buffer vazio')
    if (buffer.length > MAX_BYTES) {
      console.warn(`[sync] Download >45MB ignorado (${key})`)
      uploaded[key] = { skipped: true, reason: 'too-large' }
      saveUploaded(uploaded)
      return
    }

    const ext = kind.ext
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const groupFolder = group.cfg.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const path = `whatsapp/${groupFolder}/${kind.folder}/${safe}`
    const contentType = media.mimetype || (ext === 'mp4' ? 'video/mp4' : 'image/jpeg')

    const { error } = await supabase.storage.from('site-images').upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: '3600'
    })
    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('site-images').getPublicUrl(path)
    const publicUrl = data?.publicUrl || ''
    const caption = media.caption || group.cfg.label

    uploaded[key] = {
      path,
      url: publicUrl,
      type: unwrapped.type,
      group: group.cfg.label,
      targets: group.cfg.targets.map((t) => t.key),
      at: new Date().toISOString()
    }
    saveUploaded(uploaded)
    console.log(`[sync] Enviado (${group.cfg.label}): ${path}`)
    if (publicUrl) await appendToSettings(group.cfg.targets, publicUrl, caption)
  } catch (err) {
    console.error(`[sync] Falha ao processar ${key}:`, err.message || err)
  }
}

let loggedOutStreak = 0

async function start() {
  mkdirSync(AUTH_DIR, { recursive: true })
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)

  const sock = makeWASocket({
    auth: state,
    logger,
    browser: Browsers.ubuntu('ADMAC Sync'),
    printQRInTerminal: false,
    markOnlineOnConnect: false,
    syncFullHistory: false
  })

  let groups = []
  let pairingRequested = false
  let qrWriteCount = 0

  sock.ev.on('creds.update', saveCreds)

  const requestPairingCode = async () => {
    if (pairingRequested) return
    if (!WA_PHONE) return
    if (sock.authState?.creds?.registered) return
    pairingRequested = true
    try {
      const code = await sock.requestPairingCode(WA_PHONE)
      console.log('\n[sync] Código de pareamento (8 dígitos):')
      console.log(`\n   ${code.match(/.{1,4}/g).join('-')}\n`)
    } catch (err) {
      pairingRequested = false
      console.warn('[sync] Falha ao pedir código:', err.message || err)
    }
  }

  const writeQr = async (qr) => {
    try {
      await QRCode.toFile(QR_FILE, qr, { width: 720, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } })
      qrWriteCount += 1
      console.log(`\n[sync] QR #${qrWriteCount}: ${QR_FILE}`)
      console.log('[sync] Escaneie com o WhatsApp (câmera → QR).\n')
      if (qrWriteCount === 1) {
        try {
          const { exec } = await import('node:child_process')
          exec(`start "" "${QR_FILE}"`)
        } catch {}
      }
    } catch (err) {
      console.warn('[sync] Falha ao gravar qr.png:', err.message || err)
    }
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      loggedOutStreak = 0
      if (WA_PHONE) await requestPairingCode()
      else await writeQr(qr)
    }

    if (connection === 'open') {
      console.log('[sync] Conectado ao WhatsApp.')
      loggedOutStreak = 0
      groups = await resolveGroups(sock)
      if (groups.length) {
        console.log(`[sync] Observando ${groups.length} grupo(s): ${groups.map((g) => g.cfg.label).join(', ')}`)
      } else {
        console.error('[sync] Ajuste WA_GROUP_* no .env')
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error instanceof Boom
        ? lastDisconnect.error.output?.statusCode
        : lastDisconnect?.error?.output?.statusCode
      const loggedOut = statusCode === DisconnectReason.loggedOut
      console.log(`[sync] Conexão fechada (code ${statusCode ?? '?'}). loggedOut=${loggedOut}`)

      if (loggedOut) {
        loggedOutStreak += 1
        if (loggedOutStreak >= 2) {
          console.error('[sync] Sessão deslogada. Apague auth/ e escaneie o QR de novo (qr.png).')
          process.exit(1)
        }
        try {
          if (existsSync(AUTH_DIR)) {
            for (const name of readdirSync(AUTH_DIR)) unlinkSync(join(AUTH_DIR, name))
          }
          if (existsSync(QR_FILE)) unlinkSync(QR_FILE)
        } catch {}
        console.log('[sync] Sessão deslogada. Limpando auth/… QR novo em 2s')
        setTimeout(() => {
          start().catch((err) => {
            console.error('[sync] Erro ao reconectar:', err)
            process.exit(1)
          })
        }, 2000)
        return
      }

      console.log('[sync] Reconectando em 3s…')
      setTimeout(() => {
        start().catch((err) => {
          console.error('[sync] Erro ao reconectar:', err)
          process.exit(1)
        })
      }, 3000)
    }
  })

  const handleBatch = async (messages) => {
    if (!groups.length) return
    for (const msg of messages || []) {
      const jid = msg?.key?.remoteJid
      const group = groups.find((g) => g.jid === jid)
      if (!group) continue
      await processMessage(sock, group, msg)
    }
  }

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify' && type !== 'append') return
    await handleBatch(messages)
  })

  sock.ev.on('messaging.history.set', async ({ messages }) => {
    await handleBatch(messages)
  })
}

start().catch((err) => {
  console.error('[sync] Falha ao iniciar:', err)
  process.exit(1)
})
