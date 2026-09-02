# Blog CMS Evoluo

## 1. Criar projeto no Supabase

Crie um projeto exclusivo para a Evoluo no Supabase.

## 2. Rodar o SQL

Abra o SQL Editor do Supabase e execute:

```sql
-- conteúdo de supabase/schema.sql
```

Isso cria:

- `blog_posts` com validações de tamanho, slug e status
- `blog_admins` para liberar quem pode publicar
- `blog_audit_events` para auditoria de criação e edição
- RLS em todas as tabelas

## 3. Criar usuário admin

No Supabase Auth, crie um usuário com e-mail e senha forte.

Depois copie o `User ID` e rode:

```sql
insert into public.blog_admins (user_id)
values ('COLE_O_USER_ID_AQUI');
```

## 4. Configurar variáveis

Crie `.env.local` a partir de `.env.example`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

Não coloque senha, service role key ou qualquer secret no código.

## 5. Usar

- Login/admin: `/admin`
- Posts publicados aparecem na seção Blog da LP
- Artigo público: `/blog/slug-do-artigo`
