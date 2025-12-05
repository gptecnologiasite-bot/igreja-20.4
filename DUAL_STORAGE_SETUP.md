# Guia de Setup - Sistema de Fallback Duplo (Supabase + localStorage)

## 📋 Passo a Passo

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# .env
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**Como obter a chave:**

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie a chave `anon` `public`

### 2. Criar Tabelas no Supabase

Execute o script SQL no Supabase SQL Editor:

1. Acesse seu projeto no Supabase Dashboard
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo do arquivo: [`create_analytics_tables.sql`](file:///c:/Users/humberto.freitas/Desktop/ADMAC/supabase/migrations/create_analytics_tables.sql)
5. Clique em **Run**

Você verá a mensagem: `✅ Analytics tables created successfully!`

### 3. Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl + C)
# Reiniciar
npm run dev
```

## ✅ Como Funciona

### Modo Normal (Supabase Online)

```
Login → ActivityTracker → Supabase ✅
                       ↓
                  localStorage (cache)
```

**Console mostrará:**

```
✅ Using Supabase for storage
📊 Loading analytics data...
```

### Modo Fallback (Supabase Offline)

```
Login → ActivityTracker → Supabase ❌
                       ↓
                  localStorage ✅
                       ↓
                  Pending Sync Queue
```

**Console mostrará:**

```
⚠️ Supabase unavailable, using localStorage
Error saving to Supabase, falling back to localStorage
```

### Sincronização Automática

Quando Supabase voltar online:

```
ActivityTracker detecta → Sincroniza dados pendentes
                       ↓
                  Limpa fila de pending
```

**Console mostrará:**

```
🔄 Syncing X pending events to Supabase...
✅ Pending data synced successfully!
```

## 🔧 Comandos de Debug

Abra o console do navegador (F12) e use:

```javascript
// Verificar status do storage
await AnalyticsDebug.checkStorageStatus();
// Retorna: { supabase: true/false, localStorage: true, pendingSync: 0 }

// Testar conexão com Supabase
await AnalyticsDebug.testConnection();
// Retorna: true/false

// Forçar sincronização
await AnalyticsDebug.syncToSupabase();

// Ver dados atuais
AnalyticsDebug.checkData();
AnalyticsDebug.viewStats();
```

## 🎯 Verificação

### Teste 1: Supabase Online

1. Acesse `/painel/analytics`
2. Abra o console (F12)
3. Verifique: `✅ Using Supabase for storage`
4. Faça login/logout
5. Verifique dados no Supabase Dashboard → **Table Editor** → `activity_logs`

### Teste 2: Supabase Offline

1. Desconecte a internet OU
2. Remova a `VITE_SUPABASE_ANON_KEY` do `.env`
3. Recarregue a página
4. Verifique: `⚠️ Supabase unavailable, using localStorage`
5. Faça login/logout
6. Dados devem aparecer normalmente no dashboard

### Teste 3: Sincronização

1. Com Supabase offline, faça alguns logins
2. Reconecte internet / adicione a chave de volta
3. Recarregue a página
4. Verifique: `🔄 Syncing X pending events to Supabase...`
5. Verifique dados no Supabase Dashboard

## 📊 Estrutura dos Dados

### Supabase Tables

**activity_logs:**

- `id` (TEXT) - ID único
- `type` (TEXT) - login, logout, pageview
- `user_name`, `user_email`, `user_type`
- `country`, `state`, `city`, `district`
- `browser`, `platform`, `language`
- `timestamp` (TIMESTAMPTZ)
- `session_id` (TEXT)

**active_sessions:**

- `session_id` (TEXT) - ID único
- `user_name`, `user_email`, `user_type`
- `country`, `state`, `city`, `district`
- `browser`, `platform`, `language`
- `login_time`, `last_activity` (TIMESTAMPTZ)

### localStorage Keys

- `admac_activity_logs` - Cache de logs
- `admac_active_sessions` - Cache de sessões
- `admac_pending_sync` - Fila de sincronização

## ⚠️ Troubleshooting

### Erro: "Supabase connection test failed"

**Solução:**

1. Verifique se a `VITE_SUPABASE_ANON_KEY` está correta no `.env`
2. Verifique se as tabelas foram criadas no Supabase
3. Verifique se o RLS (Row Level Security) está configurado corretamente

### Dados não aparecem no Supabase

**Solução:**

1. Verifique o console para erros
2. Use `AnalyticsDebug.checkStorageStatus()` para ver o status
3. Verifique as políticas RLS no Supabase

### Sincronização não funciona

**Solução:**

1. Limpe a fila: `localStorage.removeItem('admac_pending_sync')`
2. Force sincronização: `await AnalyticsDebug.syncToSupabase()`
3. Verifique erros no console

## 🎉 Pronto!

Seu sistema agora tem **redundância dupla**:

- ✅ Supabase como banco principal
- ✅ localStorage como backup automático
- ✅ Sincronização automática
- ✅ Zero downtime
