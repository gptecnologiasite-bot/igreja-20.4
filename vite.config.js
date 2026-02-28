import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pages-crud',
      configureServer(server) {
        const clientsPages = new Set();
        const clientsUsers = new Set();
        const clientsServices = new Set();
        const sendSSE = (set, payload) => {
          const data = `data: ${JSON.stringify(payload)}\n\n`;
          for (const res of set) {
            try { res.write(data); } catch { void 0 }
          }
        };
        const keepAlive = (set) => setInterval(() => sendSSE(set, { type: 'ping' }), 15000);
        keepAlive(clientsPages);
        keepAlive(clientsUsers);
        keepAlive(clientsServices);

        server.watcher.add('src/pages/**/*.jsx');
        server.watcher.add('src/services/**/*.jsx');
        server.watcher.on('add', (file) => {
          if (file.includes('src\\pages') || file.includes('src/pages')) {
            sendSSE(clientsPages, { type: 'pages:change', file });
          } else if (file.includes('src\\services') || file.includes('src/services')) {
            sendSSE(clientsServices, { type: 'services:change', file });
          }
        });
        server.watcher.on('change', (file) => {
          if (file.includes('src\\pages') || file.includes('src/pages')) {
            sendSSE(clientsPages, { type: 'pages:change', file });
          } else if (file.includes('src\\services') || file.includes('src/services')) {
            sendSSE(clientsServices, { type: 'services:change', file });
          }
        });
        server.watcher.on('unlink', (file) => {
          if (file.includes('src\\pages') || file.includes('src/pages')) {
            sendSSE(clientsPages, { type: 'pages:change', file });
          } else if (file.includes('src\\services') || file.includes('src/services')) {
            sendSSE(clientsServices, { type: 'services:change', file });
          }
        });

        server.middlewares.use(async (req, res, next) => {
          try {
            const url = new URL(req.url, 'http://localhost')
            const parts = url.pathname.split('/').filter(Boolean)
            if (parts[0] !== 'api') return next()
            const root = fileURLToPath(new URL('.', import.meta.url))
            const pagesDir = path.join(root, 'src', 'pages')
            const servicesDir = path.join(root, 'src', 'services')
            const dataDir = path.join(root, '.data')
            const usersFile = path.join(dataDir, 'users.json')
            const statusFile = path.join(dataDir, 'pages_status.json')
            const protectedPages = ['Home', 'Login', 'Dashboard', 'PainelAdm', 'PainelApp']
            const ensureExt = (n) => (n.endsWith('.jsx') ? n : `${n}.jsx`)
            const sanitize = (n) => ensureExt(n.replace(/[^A-Za-z0-9_-]/g, ''))
            const readBody = () =>
              new Promise((resolve) => {
                let data = ''
                req.on('data', (c) => (data += c))
                req.on('end', () => {
                  try {
                    resolve(data ? JSON.parse(data) : {})
                  } catch {
                    resolve({})
                  }
                })
              })

            if (parts[1] === 'pages' && parts[2] === 'stream') {
              res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              });
              clientsPages.add(res);
              req.on('close', () => clientsPages.delete(res));
              res.write('\n');
              return;
            }

            if (parts[1] === 'services' && parts[2] === 'stream') {
              res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              });
              clientsServices.add(res);
              req.on('close', () => clientsServices.delete(res));
              res.write('\n');
              return;
            }

            if (parts[1] === 'users' && parts[2] === 'stream') {
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]', 'utf-8');
              res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              });
              clientsUsers.add(res);
              req.on('close', () => clientsUsers.delete(res));
              res.write('\n');
              return;
            }

            const getStatusMap = () => {
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              if (!fs.existsSync(statusFile)) fs.writeFileSync(statusFile, '{}', 'utf-8');
              try { return JSON.parse(fs.readFileSync(statusFile, 'utf-8')) } catch { return {} }
            };
            const setStatus = (name, active) => {
              const map = getStatusMap();
              map[name] = active;
              fs.writeFileSync(statusFile, JSON.stringify(map, null, 2), 'utf-8');
            };

            if (parts[1] === 'pages' && req.method === 'GET' && parts.length === 2) {
              const statusMap = getStatusMap();
              const items = fs
                .readdirSync(pagesDir, { withFileTypes: true })
                .filter((d) => d.isFile() && d.name.endsWith('.jsx'))
                .map((d) => {
                  const name = d.name.replace(/\.jsx$/, '')
                  const fp = path.join(pagesDir, d.name)
                  const s = fs.statSync(fp)
                  let photo = null
                  try {
                    const content = fs.readFileSync(fp, 'utf-8')
                    const parsed = JSON.parse(content)
                    photo = parsed.photo || null
                  } catch {
                    // Not a JSON page or no photo
                  }
                  return {
                    name,
                    file: d.name,
                    size: s.size,
                    mtime: s.mtimeMs,
                    active: statusMap[name] !== false,
                    isProtected: protectedPages.includes(name),
                    photo
                  }
                })
                .sort((a, b) => a.name.localeCompare(b.name))
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ items }))
              return
            }

            if (parts[1] === 'pages' && req.method === 'GET' && parts.length === 3) {
              const name = sanitize(parts[2])
              const fp = path.join(pagesDir, name)
              if (!fs.existsSync(fp)) {
                res.statusCode = 404
                res.end('Not found')
                return
              }
              const content = fs.readFileSync(fp, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ name: name.replace(/\.jsx$/, ''), content }))
              return
            }

            if (parts[1] === 'pages' && req.method === 'POST' && parts.length === 2) {
              const body = await readBody()
              const rawName = body?.name || ''
              const content = body?.content || ''
              const name = sanitize(rawName)
              if (!rawName || !content) {
                res.statusCode = 400
                res.end('Invalid body')
                return
              }
              const fp = path.join(pagesDir, name)
              if (fs.existsSync(fp)) {
                res.statusCode = 409
                res.end('File exists')
                return
              }
              fs.writeFileSync(fp, content, 'utf-8')
              sendSSE(clientsPages, { type: 'pages:change', file: fp })
              res.statusCode = 201
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            if (parts[1] === 'pages' && req.method === 'PUT' && parts.length === 3) {
              const name = sanitize(parts[2])
              const body = await readBody()
              const content = body?.content || ''
              const fp = path.join(pagesDir, name)
              if (!fs.existsSync(fp)) {
                res.statusCode = 404
                res.end('Not found')
                return
              }
              fs.writeFileSync(fp, content, 'utf-8')
              sendSSE(clientsPages, { type: 'pages:change', file: fp })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            if (parts[1] === 'pages' && req.method === 'PATCH' && parts[3] === 'status') {
              const name = parts[2].replace(/\.jsx$/, '')
              const body = await readBody()
              const active = body.active !== false
              setStatus(name, active)
              sendSSE(clientsPages, { type: 'pages:change' })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            if (parts[1] === 'pages' && req.method === 'DELETE' && parts.length === 3) {
              const baseName = parts[2].replace(/\.jsx$/, '')
              if (protectedPages.some(p => p.toLowerCase() === baseName.toLowerCase())) {
                res.statusCode = 403
                res.end('Forbidden: System page')
                return
              }
              const name = sanitize(parts[2])
              const fp = path.join(pagesDir, name)
              if (!fs.existsSync(fp)) {
                res.statusCode = 404
                res.end('Not found')
                return
              }
              fs.unlinkSync(fp)
              sendSSE(clientsPages, { type: 'pages:change', file: fp })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            if (parts[1] === 'services' && req.method === 'GET' && parts.length === 2) {
              if (!fs.existsSync(servicesDir)) fs.mkdirSync(servicesDir, { recursive: true });
              const items = fs
                .readdirSync(servicesDir, { withFileTypes: true })
                .filter((d) => d.isFile() && d.name.endsWith('.jsx'))
                .map((d) => {
                  const fp = path.join(servicesDir, d.name)
                  const s = fs.statSync(fp)
                  return {
                    name: d.name.replace(/\.jsx$/, ''),
                    file: d.name,
                    size: s.size,
                    mtime: s.mtimeMs,
                  }
                })
                .sort((a, b) => a.name.localeCompare(b.name))
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ items }))
              return
            }

            if (parts[1] === 'services' && req.method === 'GET' && parts.length === 3) {
              const name = sanitize(parts[2])
              const fp = path.join(servicesDir, name)
              if (!fs.existsSync(fp)) {
                res.statusCode = 404
                res.end('Not found')
                return
              }
              const content = fs.readFileSync(fp, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ name: name.replace(/\.jsx$/, ''), content }))
              return
            }

            if (parts[1] === 'services' && req.method === 'POST' && parts.length === 2) {
              const body = await readBody()
              const rawName = body?.name || ''
              const content = body?.content || ''
              const name = sanitize(rawName)
              if (!rawName || !content) {
                res.statusCode = 400
                res.end('Invalid body')
                return
              }
              const fp = path.join(servicesDir, name)
              if (fs.existsSync(fp)) {
                res.statusCode = 409
                res.end('File exists')
                return
              }
              fs.writeFileSync(fp, content, 'utf-8')
              sendSSE(clientsServices, { type: 'services:change', file: fp })
              res.statusCode = 201
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            if (parts[1] === 'services' && req.method === 'PUT' && parts.length === 3) {
              const name = sanitize(parts[2])
              const body = await readBody()
              const content = body?.content || ''
              const fp = path.join(servicesDir, name)
              if (!fs.existsSync(fp)) {
                res.statusCode = 404
                res.end('Not found')
                return
              }
              fs.writeFileSync(fp, content, 'utf-8')
              sendSSE(clientsServices, { type: 'services:change', file: fp })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            if (parts[1] === 'services' && req.method === 'DELETE' && parts.length === 3) {
              const name = sanitize(parts[2])
              const baseName = name.replace(/\.jsx$/, '')
              const protectedServices = ['initialData', 'DatabaseService', 'AnalyticsService']
              if (protectedServices.includes(baseName)) {
                res.statusCode = 403
                res.end('Forbidden: System service')
                return
              }
              const fp = path.join(servicesDir, name)
              if (!fs.existsSync(fp)) {
                res.statusCode = 404
                res.end('Not found')
                return
              }
              fs.unlinkSync(fp)
              sendSSE(clientsServices, { type: 'services:change', file: fp })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            if (parts[1] === 'users' && req.method === 'GET' && parts.length === 2) {
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]', 'utf-8');
              const data = JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ items: data }))
              return
            }

            if (parts[1] === 'users' && req.method === 'POST' && parts.length === 2) {
              const body = await readBody()
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              const data = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]') : []
              const nextId = data.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1
              const item = { id: nextId, ...body }
              data.push(item)
              fs.writeFileSync(usersFile, JSON.stringify(data, null, 2), 'utf-8')
              sendSSE(clientsUsers, { type: 'users:change' })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, item }))
              return
            }

            if (parts[1] === 'users' && req.method === 'PUT' && parts.length === 3) {
              const id = Number(parts[2])
              const body = await readBody()
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              const data = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]') : []
              const idx = data.findIndex((x) => Number(x.id) === id)
              if (idx === -1) { res.statusCode = 404; res.end('Not found'); return }
              data[idx] = { ...data[idx], ...body, id }
              fs.writeFileSync(usersFile, JSON.stringify(data, null, 2), 'utf-8')
              sendSSE(clientsUsers, { type: 'users:change' })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            if (parts[1] === 'users' && req.method === 'DELETE' && parts.length === 3) {
              const id = Number(parts[2])
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              const data = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]') : []
              const next = data.filter((x) => Number(x.id) !== id)
              fs.writeFileSync(usersFile, JSON.stringify(next, null, 2), 'utf-8')
              sendSSE(clientsUsers, { type: 'users:change' })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
              return
            }

            return next()
          } catch {
            res.statusCode = 500
            res.end('Server error')
          }
        })
      },
      configurePreviewServer(server) {
        const sendJSON = (res, data) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }
        server.middlewares.use(async (req, res, next) => {
          try {
            const url = new URL(req.url, 'http://localhost')
            const parts = url.pathname.split('/').filter(Boolean)
            if (parts[0] !== 'api') return next()
            const root = fileURLToPath(new URL('.', import.meta.url))
            const pagesDir = path.join(root, 'src', 'pages')
            const servicesDir = path.join(root, 'src', 'services')
            const dataDir = path.join(root, '.data')
            const usersFile = path.join(dataDir, 'users.json')
            const ensureExt = (n) => (n.endsWith('.jsx') ? n : `${n}.jsx`)
            const sanitize = (n) => ensureExt(n.replace(/[^A-Za-z0-9_-]/g, ''))
            const readBody = () =>
              new Promise((resolve) => {
                let data = ''
                req.on('data', (c) => (data += c))
                req.on('end', () => {
                  try { resolve(data ? JSON.parse(data) : {}) } catch { resolve({}) }
                })
              })

            if (parts[1] === 'pages' && req.method === 'GET' && parts.length === 2) {
              const items = fs
                .readdirSync(pagesDir, { withFileTypes: true })
                .filter((d) => d.isFile() && d.name.endsWith('.jsx'))
                .map((d) => {
                  const fp = path.join(pagesDir, d.name)
                  const s = fs.statSync(fp)
                  return { name: d.name.replace(/\.jsx$/, ''), file: d.name, size: s.size, mtime: s.mtimeMs }
                })
                .sort((a, b) => a.name.localeCompare(b.name))
              return sendJSON(res, { items })
            }

            if (parts[1] === 'pages' && req.method === 'GET' && parts.length === 3) {
              const name = sanitize(parts[2])
              const fp = path.join(pagesDir, name)
              if (!fs.existsSync(fp)) { res.statusCode = 404; return res.end('Not found') }
              const content = fs.readFileSync(fp, 'utf-8')
              return sendJSON(res, { name: name.replace(/\.jsx$/, ''), content })
            }

            if (parts[1] === 'pages' && req.method === 'POST' && parts.length === 2) {
              const body = await readBody()
              const rawName = body?.name || ''
              const content = body?.content || ''
              const name = sanitize(rawName)
              if (!rawName || !content) { res.statusCode = 400; return res.end('Invalid body') }
              const fp = path.join(pagesDir, name)
              if (fs.existsSync(fp)) { res.statusCode = 409; return res.end('File exists') }
              fs.writeFileSync(fp, content, 'utf-8')
              return sendJSON(res, { ok: true })
            }

            if (parts[1] === 'pages' && req.method === 'PUT' && parts.length === 3) {
              const name = sanitize(parts[2])
              const body = await readBody()
              const content = body?.content || ''
              const fp = path.join(pagesDir, name)
              if (!fs.existsSync(fp)) { res.statusCode = 404; return res.end('Not found') }
              fs.writeFileSync(fp, content, 'utf-8')
              return sendJSON(res, { ok: true })
            }

            if (parts[1] === 'pages' && req.method === 'DELETE' && parts.length === 3) {
              const name = sanitize(parts[2])
              const fp = path.join(pagesDir, name)
              if (!fs.existsSync(fp)) { res.statusCode = 404; return res.end('Not found') }
              fs.unlinkSync(fp)
              return sendJSON(res, { ok: true })
            }

            if (parts[1] === 'services' && req.method === 'GET' && parts.length === 2) {
              if (!fs.existsSync(servicesDir)) fs.mkdirSync(servicesDir, { recursive: true });
              const items = fs
                .readdirSync(servicesDir, { withFileTypes: true })
                .filter((d) => d.isFile() && d.name.endsWith('.jsx'))
                .map((d) => {
                  const fp = path.join(servicesDir, d.name)
                  const s = fs.statSync(fp)
                  return { name: d.name.replace(/\.jsx$/, ''), file: d.name, size: s.size, mtime: s.mtimeMs }
                })
                .sort((a, b) => a.name.localeCompare(b.name))
              return sendJSON(res, { items })
            }

            if (parts[1] === 'services' && req.method === 'GET' && parts.length === 3) {
              const name = sanitize(parts[2])
              const fp = path.join(servicesDir, name)
              if (!fs.existsSync(fp)) { res.statusCode = 404; return res.end('Not found') }
              const content = fs.readFileSync(fp, 'utf-8')
              return sendJSON(res, { name: name.replace(/\.jsx$/, ''), content })
            }

            if (parts[1] === 'services' && req.method === 'POST' && parts.length === 2) {
              const body = await readBody()
              const rawName = body?.name || ''
              const content = body?.content || ''
              const name = sanitize(rawName)
              if (!rawName || !content) { res.statusCode = 400; return res.end('Invalid body') }
              const fp = path.join(servicesDir, name)
              if (fs.existsSync(fp)) { res.statusCode = 409; return res.end('File exists') }
              fs.writeFileSync(fp, content, 'utf-8')
              return sendJSON(res, { ok: true })
            }

            if (parts[1] === 'services' && req.method === 'PUT' && parts.length === 3) {
              const name = sanitize(parts[2])
              const body = await readBody()
              const content = body?.content || ''
              const fp = path.join(servicesDir, name)
              if (!fs.existsSync(fp)) { res.statusCode = 404; return res.end('Not found') }
              fs.writeFileSync(fp, content, 'utf-8')
              return sendJSON(res, { ok: true })
            }

            if (parts[1] === 'services' && req.method === 'DELETE' && parts.length === 3) {
              const name = sanitize(parts[2])
              const fp = path.join(servicesDir, name)
              if (!fs.existsSync(fp)) { res.statusCode = 404; return res.end('Not found') }
              fs.unlinkSync(fp)
              return sendJSON(res, { ok: true })
            }

            if (parts[1] === 'users' && req.method === 'GET' && parts.length === 2) {
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]', 'utf-8');
              const data = JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
              return sendJSON(res, { items: data })
            }

            if (parts[1] === 'users' && req.method === 'POST' && parts.length === 2) {
              const body = await readBody()
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              const data = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]') : []
              const nextId = data.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1
              const item = { id: nextId, ...body }
              data.push(item)
              fs.writeFileSync(usersFile, JSON.stringify(data, null, 2), 'utf-8')
              return sendJSON(res, { ok: true, item })
            }

            if (parts[1] === 'users' && req.method === 'PUT' && parts.length === 3) {
              const id = Number(parts[2])
              const body = await readBody()
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              const data = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]') : []
              const idx = data.findIndex((x) => Number(x.id) === id)
              if (idx === -1) { res.statusCode = 404; return res.end('Not found') }
              data[idx] = { ...data[idx], ...body, id }
              fs.writeFileSync(usersFile, JSON.stringify(data, null, 2), 'utf-8')
              return sendJSON(res, { ok: true })
            }

            if (parts[1] === 'users' && req.method === 'DELETE' && parts.length === 3) {
              const id = Number(parts[2])
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              const data = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]') : []
              const next = data.filter((x) => Number(x.id) !== id)
              fs.writeFileSync(usersFile, JSON.stringify(next, null, 2), 'utf-8')
              return sendJSON(res, { ok: true })
            }

            return next()
          } catch {
            res.statusCode = 500
            res.end('Server error')
          }
        })
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 5173,
    strictPort: false,
  },
})
