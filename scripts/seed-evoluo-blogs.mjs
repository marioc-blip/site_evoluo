import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ASSET_DIR = path.join(ROOT, "scripts/blog-seed-assets");
const COVER_BUCKET = "blog-covers";
const INLINE_BUCKET = "blog-inline-images";

async function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const envFile = await readFile(path.join(ROOT, file), "utf8");
      for (const line of envFile.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) continue;
        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
        if (key && process.env[key] === undefined) process.env[key] = value;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function paragraphs(values) {
  return values.map((value) => `<p>${value}</p>`).join("\n");
}

function list(items) {
  return `<ul>\n${items.map((item) => `<li>${item}</li>`).join("\n")}\n</ul>`;
}

function orderedList(items) {
  return `<ol>\n${items.map((item) => `<li>${item}</li>`).join("\n")}\n</ol>`;
}

function inlineImage(url, alt) {
  return `<p><img src="${url}" alt="${alt}" loading="lazy"></p>`;
}

async function uploadImage(client, bucket, storagePath, fileName) {
  const file = await readFile(path.join(ASSET_DIR, fileName));
  const { error } = await client.storage.from(bucket).upload(storagePath, file, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${bucket}/${storagePath}: ${error.message}`);
  return client.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

async function getClientAndAuthor() {
  const supabaseUrl = requireEnv("VITE_SUPABASE_URL").replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceRoleKey) {
    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: admins, error } = await client.from("blog_admins").select("user_id").limit(1);
    if (error) throw new Error(`Could not read blog_admins: ${error.message}`);
    const authorId = process.env.SUPABASE_BLOG_AUTHOR_ID || admins?.[0]?.user_id;
    if (!authorId) throw new Error("No blog admin found. Set SUPABASE_BLOG_AUTHOR_ID or add a row to blog_admins.");
    return { client, authorId };
  }

  const email = process.env.SUPABASE_ADMIN_EMAIL;
  const password = process.env.SUPABASE_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set SUPABASE_SERVICE_ROLE_KEY, or set SUPABASE_ADMIN_EMAIL and SUPABASE_ADMIN_PASSWORD for an existing blog admin.",
    );
  }

  const client = createClient(supabaseUrl, requireEnv("VITE_SUPABASE_ANON_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(`Admin sign-in failed: ${error?.message ?? "no user"}`);
  return { client, authorId: data.user.id };
}

async function removeExistingPostsAndImages(client) {
  const { data: posts, error: selectError } = await client
    .from("blog_posts")
    .select("id,cover_image_path,content");
  if (selectError) throw new Error(`Could not list existing posts: ${selectError.message}`);

  const coverPaths = [];
  const inlinePaths = [];
  for (const post of posts ?? []) {
    if (post.cover_image_path) coverPaths.push(post.cover_image_path);
    const matches = String(post.content ?? "").matchAll(/\/storage\/v1\/object\/public\/blog-inline-images\/([^"'<\s]+)/g);
    for (const match of matches) inlinePaths.push(decodeURIComponent(match[1]));
  }

  if (posts?.length) {
    const { error } = await client.from("blog_posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(`Could not delete existing posts: ${error.message}`);
  }

  if (coverPaths.length) await client.storage.from(COVER_BUCKET).remove(coverPaths);
  if (inlinePaths.length) await client.storage.from(INLINE_BUCKET).remove(inlinePaths);
}

function buildPosts(authorId, images) {
  return [
    {
      title: "Influenza e Sistema Respiratório: como evitar complicações em casa",
      slug: slugify("Influenza e Sistema Respiratório: como evitar complicações em casa"),
      cover_image_path: images.influenza.coverPath,
      cover_image_url: images.influenza.coverUrl,
      cover_image_alt: "Fisioterapeuta monitorando a oxigenação de uma paciente idosa em atendimento domiciliar.",
      content: [
        "<h2>Introdução</h2>",
        paragraphs([
          "A Influenza, conhecida como gripe, é frequentemente subestimada, mas em pacientes idosos, cardiopatas ou imunossuprimidos ela pode evoluir rapidamente para insuficiência respiratória e pneumonia. Quando o manejo é feito no ambiente domiciliar, o acompanhamento especializado pode ser o divisor de águas entre uma recuperação segura e uma internação hospitalar de urgência.",
        ]),
        "<h2>O papel da fisioterapia respiratória em casa</h2>",
        paragraphs([
          "A fisioterapia respiratória vai muito além da higiene brônquica. No tratamento domiciliar da Influenza, o profissional atua em pilares críticos que ajudam a reduzir esforço, melhorar a ventilação e acompanhar sinais de piora clínica.",
        ]),
        orderedList([
          "<strong>Otimização da mecânica ventilatória:</strong> técnicas de reexpansão pulmonar ajudam a manter diferentes áreas do pulmão ventiladas, reduzindo o esforço respiratório.",
          "<strong>Manejo de secreções:</strong> técnicas manuais e recursos de oscilação auxiliam a mobilizar secreções retidas e desobstruir vias aéreas.",
          "<strong>Monitorização, VNI e oxigenoterapia:</strong> avaliação de saturação, frequência respiratória, ausculta e sinais de fadiga orienta decisões rápidas e seguras.",
        ]),
        inlineImage(images.influenza.inlineUrl, "Equipamentos de monitorização respiratória, oxigenoterapia e ventilação não invasiva organizados em ambiente domiciliar."),
        "<h2>Monitorização, ventilação não invasiva e oxigenoterapia</h2>",
        paragraphs([
          "A monitorização rigorosa inclui oximetria de pulso, frequência respiratória, uso de musculatura acessória e ausculta pulmonar. Esse acompanhamento permite antecipar crises e orientar a conduta antes que o desconforto respiratório avance.",
          "Quando há desconforto respiratório moderado a grave ou fadiga muscular, a ventilação não invasiva com CPAP ou BiPAP pode diminuir o trabalho dos músculos respiratórios, abrir alvéolos colapsados e melhorar a oxigenação.",
          "A oxigenoterapia deve ser usada com critério. O fisioterapeuta ajusta o fluxo necessário para manter os tecidos oxigenados, evitando riscos relacionados ao uso inadequado, como hipercapnia em pacientes suscetíveis.",
        ]),
        "<h2>A vantagem do cuidado domiciliar</h2>",
        paragraphs([
          "Tratar a Influenza em casa protege pacientes fragilizados contra infecções hospitalares e permite que a reabilitação aconteça em ambiente controlado, confortável e com a participação próxima da família e de um fisioterapeuta gerenciador.",
        ]),
        "<h3>Referências bibliográficas</h3>",
        list([
          "Organização Mundial da Saúde. <em>Global Influenza Strategy 2019-2030</em>. Genebra: OMS, 2019.",
          "Torres, A., et al. Severe autumn-winter respiratory viral infections: a European Respiratory Society position statement. <em>European Respiratory Journal</em>, 2023.",
          "Cochrane Database of Systematic Reviews. Chest physiotherapy for acute respiratory infections in children and adults.",
        ]),
        "<blockquote>Proteja quem você ama contra as complicações da Influenza. Não espere o desconforto respiratório evoluir para uma emergência hospitalar. Nossa equipe está pronta para avaliar, monitorar sinais vitais e aplicar o suporte respiratório necessário na segurança de casa.</blockquote>",
      ].join("\n"),
      author_id: authorId,
      status: "published",
    },
    {
      title: "Desequilíbrio na Terceira Idade: como prevenir quedas em casa",
      slug: slugify("Desequilíbrio na Terceira Idade: como prevenir quedas em casa"),
      cover_image_path: images.equilibrio.coverPath,
      cover_image_url: images.equilibrio.coverUrl,
      cover_image_alt: "Fisioterapeuta conduzindo treino de equilíbrio com uma paciente idosa em sala segura.",
      content: [
        "<h2>Introdução</h2>",
        paragraphs([
          "Uma queda na terceira idade nunca é apenas uma queda. Ela representa uma das principais causas de perda de autonomia, fraturas graves e declínio funcional acelerado. Muitas famílias acreditam que a perda de equilíbrio faz parte natural do envelhecimento, mas o equilíbrio pode e deve ser treinado e reabilitado dentro de casa.",
        ]),
        "<h2>Por que o equilíbrio falha?</h2>",
        paragraphs([
          "Com o avançar da idade, há redução de massa muscular, lentidão nos reflexos de proteção e alterações nos sistemas vestibular e visual. Quando isso se soma a tapetes soltos, iluminação inadequada ou calçados inapropriados, o risco de queda se torna muito maior.",
        ]),
        inlineImage(images.equilibrio.inlineUrl, "Ambiente domiciliar organizado para treino de equilíbrio, com cadeira estável e caminho livre para caminhada segura."),
        "<h2>A intervenção da fisioterapia gerontológica domiciliar</h2>",
        paragraphs([
          "A abordagem da Evoluo no domicílio foca na funcionalidade real do idoso: os movimentos que ele precisa para circular em casa, levantar, sentar, mudar de direção e reagir a pequenos tropeços com mais segurança.",
        ]),
        list([
          "<strong>Treinamento de dupla tarefa:</strong> exercícios que simulam o dia a dia, como caminhar desviando de obstáculos enquanto segura um objeto ou conversa.",
          "<strong>Fortalecimento funcional:</strong> foco em membros inferiores e estabilizadores do tronco, essenciais para levantar de uma poltrona ou recuperar o equilíbrio.",
          "<strong>Adaptação ambiental concreta:</strong> avaliação da rotina do paciente dentro da própria casa, com orientações ergonômicas para os cômodos mais usados.",
        ]),
        "<h3>Referências bibliográficas</h3>",
        list([
          "Sherrington, C., et al. Exercise for preventing falls in older people living in the community. <em>Cochrane Database of Systematic Reviews</em>, 2019.",
          "World Health Organization. <em>Step Safely: Strategies for preventing and managing falls across the life-course</em>. Genebra: WHO, 2021.",
          "Journal of the American Geriatrics Society. Clinical Practice Guideline for Prevention of Falls in Older Persons.",
        ]),
        "<blockquote>O desequilíbrio tem tratamento. Devolva segurança e autonomia à rotina de quem você ama com adaptação do ambiente, fortalecimento e treino funcional sem sair de casa.</blockquote>",
      ].join("\n"),
      author_id: authorId,
      status: "published",
    },
    {
      title: "Pós-Alta de Artroplastia de Quadril: retorno seguro à rotina",
      slug: slugify("Pós-Alta de Artroplastia de Quadril: retorno seguro à rotina"),
      cover_image_path: images.quadril.coverPath,
      cover_image_url: images.quadril.coverUrl,
      cover_image_alt: "Fisioterapeuta orientando paciente em treino de marcha com andador após cirurgia de quadril.",
      content: [
        "<h2>Introdução</h2>",
        paragraphs([
          "A artroplastia total de quadril devolve qualidade de vida a milhares de pacientes com artrose avançada. No entanto, o sucesso cirúrgico depende muito do que acontece nas primeiras semanas após a alta hospitalar, quando surgem medo de apoiar o pé no chão, rigidez muscular e risco de luxação da prótese.",
        ]),
        "<h2>A atuação do fisioterapeuta ortopédico no domicílio</h2>",
        paragraphs([
          "A transição do hospital para casa exige cuidados cirúrgicos e cinesiológicos precisos. A fisioterapia domiciliar especializada atua imediatamente para garantir segurança, autonomia progressiva e respeito ao protocolo do cirurgião.",
        ]),
        orderedList([
          "<strong>Treinamento de marcha seguro:</strong> ensino e correção do uso de andador ou muletas, respeitando a descarga de peso autorizada.",
          "<strong>Proteção da prótese:</strong> orientação sobre movimentos que devem ser evitados nas primeiras semanas e adaptação do mobiliário.",
          "<strong>Cinesioterapia avançada:</strong> exercícios terapêuticos precoces para ativação muscular e ganho de amplitude de movimento com controle de dor.",
        ]),
        inlineImage(images.quadril.inlineUrl, "Treino de marcha com andador e orientação fisioterapêutica em ambiente domiciliar após cirurgia de quadril."),
        "<h2>Gerenciamento e comunicação com o cirurgião</h2>",
        paragraphs([
          "Um diferencial da fisioterapia domiciliar estruturada é manter o médico ortopedista informado por meio de relatórios de evolução física. Assim, o protocolo de reabilitação respeita os critérios biológicos da cicatrização e as particularidades de cada cirurgia.",
        ]),
        "<h3>Referências bibliográficas</h3>",
        list([
          "American Academy of Orthopaedic Surgeons. Clinical Practice Guidelines for the Surgical Management of Osteoarthritis of the Hip.",
          "Cochrane Database of Systematic Reviews. Rehabilitation following total hip arthroplasty: a systematic review.",
          "The Journal of Bone and Joint Surgery. Effect of Early Rehabilitation on Functional Recovery After Total Hip Arthroplasty.",
        ]),
        "<blockquote>Vai realizar ou acabou de passar por uma cirurgia de quadril? Fale com nossa equipe e planeje uma transição segura do hospital para casa.</blockquote>",
      ].join("\n"),
      author_id: authorId,
      status: "published",
    },
  ];
}

await loadLocalEnv();

const { client, authorId } = await getClientAndAuthor();
const now = Date.now().toString(36);
const images = {
  influenza: {
    coverPath: `${authorId}/${now}-influenza-cover.webp`,
    inlinePath: `${authorId}/${now}-influenza-inline.webp`,
  },
  equilibrio: {
    coverPath: `${authorId}/${now}-equilibrio-cover.webp`,
    inlinePath: `${authorId}/${now}-equilibrio-inline.webp`,
  },
  quadril: {
    coverPath: `${authorId}/${now}-quadril-cover.webp`,
    inlinePath: `${authorId}/${now}-quadril-inline.webp`,
  },
};

await removeExistingPostsAndImages(client);

images.influenza.coverUrl = await uploadImage(client, COVER_BUCKET, images.influenza.coverPath, "influenza-cover.webp");
images.influenza.inlineUrl = await uploadImage(client, INLINE_BUCKET, images.influenza.inlinePath, "influenza-inline.webp");
images.equilibrio.coverUrl = await uploadImage(client, COVER_BUCKET, images.equilibrio.coverPath, "equilibrio-cover.webp");
images.equilibrio.inlineUrl = await uploadImage(client, INLINE_BUCKET, images.equilibrio.inlinePath, "equilibrio-inline.webp");
images.quadril.coverUrl = await uploadImage(client, COVER_BUCKET, images.quadril.coverPath, "quadril-cover.webp");
images.quadril.inlineUrl = await uploadImage(client, INLINE_BUCKET, images.quadril.inlinePath, "quadril-inline.webp");

const posts = buildPosts(authorId, images).map((post, index) => ({
  ...post,
  published_at: new Date(Date.now() - index * 60_000).toISOString(),
}));

const { data, error } = await client
  .from("blog_posts")
  .insert(posts)
  .select("title,slug,cover_image_url,published_at")
  .order("published_at", { ascending: false });

if (error) throw new Error(`Could not insert posts: ${error.message}`);

console.log(JSON.stringify({ inserted: data }, null, 2));
