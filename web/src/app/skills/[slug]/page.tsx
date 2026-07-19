import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SKILLS, SKILL_BY_SLUG } from "@/data/catalog";
import { loadContent } from "@/content";
import { loadCheatSheet } from "@/content/cheatsheets";
import { SkillDetail } from "@/components/SkillDetail";

/**
 * Server component: statically generates one page per catalog skill.
 * Content (when available) is loaded server-side and streamed to the
 * client component that owns interactivity (progress, bookmarks, TOC).
 */

export function generateStaticParams() {
  return SKILLS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = SKILL_BY_SLUG[slug];
  return { title: skill ? skill.name : "Skill not found" };
}

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = SKILL_BY_SLUG[slug];
  if (!skill) notFound();

  const [content, cheatSheet] = await Promise.all([loadContent(slug), loadCheatSheet(slug)]);
  return <SkillDetail skill={skill} content={content} cheatSheet={cheatSheet} />;
}
