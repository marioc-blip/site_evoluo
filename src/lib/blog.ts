import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import DOMPurify from "dompurify";
import { z } from "zod";

export const BLOG_TITLE_MAX = 92;
export const BLOG_CONTENT_MAX = 12000;
export const BLOG_CONTENT_HTML_MAX = BLOG_CONTENT_MAX * 4;
export const BLOG_EXCERPT_MAX = 210;
export const BLOG_COVER_ALT_MAX = 140;
export const BLOG_COVER_BUCKET = "blog-covers";
export const BLOG_INLINE_IMAGE_BUCKET = "blog-inline-images";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_path: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  status: "published";
  published_at: string | null;
  updated_at: string;
}

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 20;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const blogPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(8, "Use um título com pelo menos 8 caracteres.")
    .max(BLOG_TITLE_MAX, `O título pode ter no máximo ${BLOG_TITLE_MAX} caracteres.`),
  content: z
    .string()
    .trim()
    .min(80, "O texto precisa ter pelo menos 80 caracteres.")
    .max(BLOG_CONTENT_HTML_MAX, `O conteúdo formatado ficou muito grande.`),
  cover_image_path: z
    .string()
    .regex(/^[0-9a-f-]{36}\/[a-z0-9-]{16,80}\.webp$/i, "A imagem de capa precisa ser enviada pelo painel.")
    .nullable(),
  cover_image_url: z
    .string()
    .url("A URL da imagem de capa é inválida.")
    .max(500, "A URL da imagem de capa é muito longa.")
    .refine((value) => value.includes(`/storage/v1/object/public/${BLOG_COVER_BUCKET}/`), "A imagem precisa estar no storage do projeto.")
    .nullable(),
  cover_image_alt: z
    .string()
    .trim()
    .max(BLOG_COVER_ALT_MAX, `O texto alternativo pode ter no máximo ${BLOG_COVER_ALT_MAX} caracteres.`)
    .nullable(),
});

export function sanitizeBlogHtml(value: string) {
  const cleanHtml = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "span", "ul", "ol", "li", "h2", "h3", "blockquote", "a", "img"],
    ALLOWED_ATTR: ["href", "target", "rel", "data-list", "src", "alt", "loading"],
    ALLOWED_URI_REGEXP: /^https:\/\/[^\s<>"]{1,300}$/i,
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["style", "class", "id", "onerror", "onclick", "onload"],
  }).trim();

  if (!/<img[\s>]/i.test(cleanHtml)) return cleanHtml;

  const template = document.createElement("template");
  template.innerHTML = cleanHtml;
  const allowedStoragePaths = [
    `/storage/v1/object/public/${BLOG_COVER_BUCKET}/`,
    `/storage/v1/object/public/${BLOG_INLINE_IMAGE_BUCKET}/`,
  ];

  template.content.querySelectorAll("img").forEach((image) => {
    const src = image.getAttribute("src") ?? "";
    let isAllowed = false;
    try {
      const url = new URL(src);
      isAllowed =
        url.protocol === "https:" &&
        url.hostname.endsWith(".supabase.co") &&
        allowedStoragePaths.some((path) => url.pathname.includes(path));
    } catch {
      isAllowed = false;
    }

    if (!isAllowed) {
      image.remove();
      return;
    }

    image.setAttribute("loading", "lazy");
    image.setAttribute("alt", (image.getAttribute("alt") ?? "").slice(0, 140));
  });

  return template.innerHTML.trim();
}

export function normalizeBlogInput(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

export function stripBlogMarkup(value: string) {
  return sanitizeBlogHtml(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|h2|h3|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\(https:\/\/[^)\s]{1,300}\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^-\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function makeSlug(title: string) {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const suffix = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 5);
  return `${slug || "post"}-${suffix}`;
}

export function makeCoverImagePath(userId: string) {
  const random = crypto.getRandomValues(new Uint32Array(4));
  const suffix = Array.from(random, (value) => value.toString(36)).join("-");
  return `${userId}/${Date.now().toString(36)}-${suffix}.webp`;
}

export function makeInlineImagePath(userId: string) {
  const random = crypto.getRandomValues(new Uint32Array(4));
  const suffix = Array.from(random, (value) => value.toString(36)).join("-");
  return `${userId}/${Date.now().toString(36)}-${suffix}.webp`;
}

export function getCoverImagePublicUrl(path: string) {
  if (!supabase) return "";
  return supabase.storage.from(BLOG_COVER_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function getInlineImagePublicUrl(path: string) {
  if (!supabase) return "";
  return supabase.storage.from(BLOG_INLINE_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function toExcerpt(content: string, max = BLOG_EXCERPT_MAX) {
  const compact = stripBlogMarkup(content);
  return compact.length > max ? `${compact.slice(0, max - 1).trim()}...` : compact;
}

export async function fetchPublishedPosts(limit = 6): Promise<BlogPost[]> {
  if (!supabase) return [];

  const safeLimit = Math.min(Math.max(limit, 1), 12);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,content,cover_image_path,cover_image_url,cover_image_alt,status,published_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(safeLimit);

  if (error || !data) return [];
  return data as BlogPost[];
}
