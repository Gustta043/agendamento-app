# Agendamento - Limpeza de Estofados

App de agendamento de serviços de limpeza de estofados.

## Funcionalidades

- 📋 Catálogo de serviços (sofá, colchão, tapete, etc.)
- 📅 Calendário com disponibilidade em tempo real
- 💳 Pagamento online integrado (Stripe)
- ✅ Confirmação automática com dia e hora
- 👤 Painel administrativo para gerenciamento

## Como rodar

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Acesse: http://localhost:3000

## Configuração

Crie um arquivo `.env` na raiz:

```
DATABASE_URL="file:./dev.db"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Admin

Acesse `/admin` para gerenciar serviços, horários e agendamentos.
