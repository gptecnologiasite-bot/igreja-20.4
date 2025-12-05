# Guia de Troubleshooting - Analytics Dashboard

## Problema: Dados não estão sendo mostrados

### Passo 1: Verificar o Console do Navegador

1. Abra o navegador em `http://localhost:5173/painel/analytics`
2. Pressione `F12` para abrir as Ferramentas de Desenvolvedor
3. Vá para a aba **Console**
4. Procure por mensagens como:
   - `📊 Loading analytics data...`
   - `Found X activity logs`
   - `✅ Analytics data loaded successfully!`

### Passo 2: Usar o Analytics Debug Helper

No console do navegador, digite:

```javascript
// Verificar se há dados
AnalyticsDebug.checkData();

// Ver estatísticas atuais
AnalyticsDebug.viewStats();

// Gerar dados de teste manualmente
AnalyticsDebug.generateTestData();

// Limpar todos os dados (se necessário)
AnalyticsDebug.clearData();
```

### Passo 3: Verificar localStorage

No console do navegador:

```javascript
// Ver logs de atividade
JSON.parse(localStorage.getItem("admac_activity_logs"));

// Ver sessões ativas
JSON.parse(localStorage.getItem("admac_active_sessions"));
```

### Passo 4: Forçar Geração de Dados

Se ainda não houver dados:

1. Limpe o localStorage:

```javascript
localStorage.removeItem("admac_activity_logs");
localStorage.removeItem("admac_active_sessions");
```

2. Recarregue a página `/painel/analytics`
3. O sistema deve gerar dados automaticamente

### Passo 5: Verificar Erros

Procure por erros em vermelho no console. Erros comuns:

- **Import errors**: Verifique se todos os componentes foram criados
- **Syntax errors**: Verifique se não há erros de sintaxe nos arquivos
- **Missing dependencies**: Verifique se `lucide-react` está instalado

### Comandos Úteis

```bash
# Reinstalar dependências
npm install

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar se o servidor está rodando
npm run dev
```

### Estrutura Esperada dos Dados

**Activity Logs** (`admac_activity_logs`):

```json
[
  {
    "id": "timestamp_randomid",
    "type": "login",
    "user": {
      "name": "João Silva",
      "email": "joao@admac.com",
      "userType": "admin"
    },
    "location": {
      "country": "Brasil",
      "state": "São Paulo",
      "city": "São Paulo",
      "district": "Centro"
    },
    "browserInfo": {
      "browser": "Chrome",
      "platform": "Win32",
      "language": "pt-BR"
    },
    "timestamp": "2025-12-05T10:30:00.000Z",
    "sessionId": "session_timestamp_randomid"
  }
]
```

**Active Sessions** (`admac_active_sessions`):

```json
[
  {
    "sessionId": "session_timestamp_randomid",
    "user": {
      "name": "João Silva",
      "email": "joao@admac.com",
      "userType": "admin"
    },
    "location": {
      "country": "Brasil",
      "state": "São Paulo",
      "city": "São Paulo",
      "district": "Centro"
    },
    "browserInfo": {
      "browser": "Chrome",
      "platform": "Win32",
      "language": "pt-BR"
    },
    "loginTime": "2025-12-05T10:00:00.000Z",
    "lastActivity": "2025-12-05T10:30:00.000Z"
  }
]
```

### Solução Rápida

Se nada funcionar, execute no console:

```javascript
// Solução completa em um comando
localStorage.removeItem("admac_activity_logs");
localStorage.removeItem("admac_active_sessions");
window.location.reload();
```

Isso vai limpar os dados e recarregar a página, forçando a geração automática de novos dados.
