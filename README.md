# 💰 FinanceVM — Controle Financeiro Inteligente

> Um aplicativo web progressivo (PWA) moderno e responsivo para gestão financeira pessoal. Controle total de receitas, despesas, cartões e investimentos com uma interface estilo Fintech.

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-1D9E75?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat-square)

🔗 **[Ver projeto ao vivo →](https://myfinances-self.vercel.app/login)**

---

## 💡 A origem do projeto

Quando meu amigo comentou sobre a dificuldade de enxergar para onde ia o dinheiro dele, pensei: _"provavelmente já existe um app pra isso.",e existem muitos. Mas, como Mark Zuckerber diz: **As ideias não vêm totalmente formadas. Elas só se tornam claras à medida que você trabalha nelas. Você só precisa começar.** — então decidi construir do zero, pelo aprendizado e pela paixão que tenho em desenvolver projetos que resolvem problemas reais.

---

## 📌 Funcionalidades principais

Desenvolvido com foco em **mobile-first** e alta performance:

| Funcionalidade | Descrição |
|---|---|
| 🔐 **Autenticação Private Bank** | Login seguro com JWT e Refresh Tokens |
| 📊 **Dashboard de Ativos** | Visão consolidada de liquidez, reserva e patrimônio |
| ⚡ **Gestão de Fluxo** | Registro rápido de entradas, saídas e faturas de cartão |
| 🔔 **Agenda de Pagamentos** | Alertas para vencimentos do dia, atrasados e próximos |
| 📈 **Análise Gráfica** | Distribuição de gastos por categoria e ranking de consumo |
| 📱 **PWA Nativo** | Instalável no Android e iOS, funciona como app nativo |
| 🖥️ **Interface Responsiva** | Design adaptativo otimizado para qualquer tela |

---

## 🚀 Stack tecnológica

### Frontend (este repositório)
- **[Next.js 15](https://nextjs.org/)** — App Router
- **[TypeScript](https://www.typescriptlang.org/)** — Tipagem estática
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Estilização moderna
- **[Recharts](https://recharts.org/)** — Visualizações e gráficos interativos
- **[Lucide React](https://lucide.dev/)** — Ícones
- **[Workbox](https://developer.chrome.com/docs/workbox/)** — Service Workers e suporte PWA

### Backend (repositório privado)
A API REST que alimenta este frontend foi desenvolvida em **Python/Django** e está hospedada em produção. O repositório é mantido privado por questões de segurança e controle de dados pessoais.

---

## 🛠️ Rodando localmente

### Pré-requisitos
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/en/) v18+
- Acesso à API (instância própria ou endpoint configurado)

### Configuração

```bash
# Clone o repositório
git clone https://github.com/VictorrMendes/Frontend_Finances.git
cd Frontend_Finances

# Instale as dependências
npm install
```

Crie um arquivo `.env.local` na raiz do projeto com a URL da sua API:

```env
NEXT_PUBLIC_API_URL=https://sua-api.com
```

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000** para visualizar a aplicação.

---

## 📦 Deploy

O frontend está publicado na **[Vercel](https://vercel.com)** com deploy automático a cada push na branch principal.

🔗 [myfinances-self.vercel.app](https://myfinances-self.vercel.app/login)

---

## 📝 Licença

Projeto desenvolvido para fins de estudo e uso pessoal. Sinta-se à vontade para utilizar como referência.

---

<div align="center">

Desenvolvido com paixão por **Victor Mendes** 🚀

_De uma conversa com um amigo a um projeto completo._

</div>
