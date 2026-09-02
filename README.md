# Site Evoluo

Site institucional da Evoluo Fisioterapia, construído com React, TypeScript e Vite. O blog e o painel administrativo usam Supabase; o deploy está preparado para Vercel.

## Handoff / Deploy na Vercel

### Requisitos e instalação

- Node.js 22 ou 24 (a Vercel atual usa Node.js 24.x)
- npm

```bash
npm ci
cp .env.example .env.local
```

Preencha `.env.local` somente na máquina local. O arquivo é ignorado pelo Git e nunca deve ser commitado.

### Build e validação local

```bash
npm run build
npm run preview
```

O build executa a checagem TypeScript e gera os artefatos estáticos em `public/`. Os arquivos gerados `public/app.js`, `public/app.css`, `public/assets/custom.css` e `public/index.html` não são versionados; eles são recriados em cada build.

### Environment Variables

Cadastre as variáveis na Vercel em **Project Settings → Environment Variables**. Para o funcionamento completo em produção:

| Variável | Escopo | Obrigatória | Uso |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Build/frontend e Function | Sim | URL do projeto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Build/frontend | Sim | Chave pública/publishable do Supabase usada pelo navegador. |
| `SUPABASE_SERVICE_ROLE_KEY` | Function | Sim, se o cron for mantido | Chave secreta de servidor usada pelo heartbeat. Nunca expor no frontend ou no Git. Uma nova Supabase secret key também pode ser usada nesse campo durante a migração das chaves legadas. |
| `CRON_SECRET` | Function/cron | Sim, recomendado | Protege `/api/supabase-heartbeat`. Use um valor aleatório forte, cadastrado diretamente na Vercel. |

Variáveis usadas apenas por scripts locais de manutenção:

| Variável | Uso |
| --- | --- |
| `SUPABASE_BLOG_AUTHOR_ID` | Autor explícito ao executar o seed com credencial de servidor. Se ausente, o script usa o primeiro registro de `blog_admins`. |
| `SUPABASE_ADMIN_EMAIL` | Alternativa local à credencial de servidor para autenticar o seed. |
| `SUPABASE_ADMIN_PASSWORD` | Senha local correspondente. Nunca cadastrar no Git. |
| `PORT` | Porta opcional do servidor estático local; padrão `5174`. |

Não é necessário entregar secrets por mensagem. A pessoa com acesso autorizado deve obtê-los no serviço correspondente e cadastrá-los diretamente na nova Vercel.

### Serviços externos necessários

#### Supabase

O projeto usa:

- Postgres/Data API: `blog_posts`, `blog_admins`, `blog_audit_events` e `supabase_heartbeat_events`;
- Supabase Auth com login por e-mail e senha para `/admin`;
- Storage público: buckets `blog-covers` e `blog-inline-images`;
- Row Level Security e policies definidas em `supabase/schema.sql`.

Há duas opções para o handoff:

1. **Continuar no Supabase existente:** transferir o projeto ou conceder o acesso apropriado ao novo proprietário. Criar um usuário Auth próprio para ele e adicionar o `user_id` em `public.blog_admins`. O banco, usuários e imagens continuam na conta/projeto existente até que a transferência seja concluída.
2. **Usar um Supabase novo:** criar o projeto, executar `supabase/schema.sql`, criar o usuário Auth/admin e migrar separadamente posts e objetos de Storage. O GitHub não contém os dados de produção.

O script `scripts/seed-evoluo-blogs.mjs` apaga os posts e imagens existentes antes de recriar o conteúdo de seed. Não o execute em produção sem intenção explícita de substituir esses dados.

#### Outros serviços e links externos

- Google Fonts, sem credencial;
- WhatsApp, e-mail e Instagram da Evoluo, definidos diretamente no código;
- domínio `evoluofisioterapia.com.br`, usado nas imagens Open Graph/Twitter e no redirect de `www` para o domínio raiz.

Não há integração detectada com Mailchimp, Resend, Google APIs autenticadas, webhooks, analytics, Stripe ou Sentry.

### Importar o repositório na Vercel

1. Transfira o repositório no GitHub ou conceda acesso ao novo proprietário.
2. Na conta Vercel dele, escolha **Add New → Project** e importe o repositório do GitHub.
3. Use a raiz do repositório (`.`) e o preset **Vite**.
4. Confirme o Build Command `npm run build` e o Output Directory `public`. Esses valores também estão em `vercel.json`.
5. Use Node.js 24.x, ou uma versão compatível 22/24.
6. Cadastre as quatro variáveis de produção listadas acima antes do primeiro deploy funcional. Se previews precisarem acessar o blog, cadastre também nos ambientes Preview/Development apropriados.
7. Faça o deploy e valide `/`, `/admin`, uma rota `/blog/<slug>` e `/api/supabase-heartbeat`.
8. Em **Settings → Cron Jobs**, confirme o agendamento `0 6 */2 * *` para `/api/supabase-heartbeat` e que `CRON_SECRET` está configurado.

`vercel.json` também contém:

- rewrites de `/admin` e `/blog/*` para a SPA;
- redirect permanente de `www.evoluofisioterapia.com.br` para o domínio raiz;
- Content Security Policy permitindo Google Fonts e conexões Supabase;
- headers de segurança;
- `cleanUrls: true` e `trailingSlash: false`.

### Configuração manual após o deploy

- Decidir e concluir a transferência ou migração do Supabase.
- Criar o usuário administrativo do novo proprietário no Supabase Auth e adicioná-lo a `blog_admins`.
- Confirmar que as policies/RLS e os dois buckets de Storage existem.
- Testar publicação, edição e upload de imagens pelo `/admin`.
- Confirmar que o cron responde com sucesso e está protegido.
- Somente quando houver autorização para a migração do domínio: adicionar o domínio à nova Vercel, atualizar DNS e revisar as URLs Open Graph/Twitter. A importação do GitHub não transfere domínio, DNS, deployments, aliases nem variáveis da Vercel atual.

O diretório local `.vercel/` é específico da conta/projeto Vercel de quem fez o link e permanece ignorado. Ao trabalhar com a nova conta, vincule o checkout ao novo projeto; não copie o `.vercel/project.json` atual.
