import type { IconType } from "react-icons";
import {
  SiApacheairflow,
  SiApachekafka,
  SiApachespark,
  SiClaudecode,
  SiClickhouse,
  SiCplusplus,
  SiCrewai,
  SiDjango,
  SiDocker,
  SiElasticsearch,
  SiExpress,
  SiFastapi,
  SiFlask,
  SiGithubactions,
  SiGit,
  SiGo,
  SiGooglecloud,
  SiGrafana,
  SiGraphql,
  SiJavascript,
  SiJenkins,
  SiJsonwebtokens,
  SiKubernetes,
  SiLangchain,
  SiLanggraph,
  SiLinux,
  SiMilvus,
  SiMlflow,
  SiModelcontextprotocol,
  SiMongodb,
  SiMysql,
  SiNeo4J,
  SiNestjs,
  SiNodedotjs,
  SiOllama,
  SiOpentelemetry,
  SiOwasp,
  SiPostgresql,
  SiPrometheus,
  SiPydantic,
  SiPython,
  SiQdrant,
  SiRabbitmq,
  SiRedis,
  SiRust,
  SiSpringboot,
  SiSqlite,
  SiTerraform,
  SiTypescript,
  SiVllm,
  SiWeightsandbiases,
} from "react-icons/si";

/**
 * Only skills that are an actual product/brand get an entry — see
 * SKILL_ICONS in data/catalog.ts for which slugs are mapped here. Explicit
 * named imports (not a dynamic index into the whole `si` module) so the
 * bundle only pays for the ~50 icons actually used, not all 3000+.
 */
const ICONS: Record<string, IconType> = {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiGo,
  SiRust,
  SiCplusplus,
  SiFastapi,
  SiDjango,
  SiFlask,
  SiExpress,
  SiSpringboot,
  SiNodedotjs,
  SiNestjs,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiNeo4J,
  SiElasticsearch,
  SiClickhouse,
  SiSqlite,
  SiMilvus,
  SiQdrant,
  SiGraphql,
  SiJsonwebtokens,
  SiLinux,
  SiOwasp,
  SiGooglecloud,
  SiDocker,
  SiKubernetes,
  SiTerraform,
  SiGithubactions,
  SiJenkins,
  SiGit,
  SiApachekafka,
  SiRabbitmq,
  SiPrometheus,
  SiGrafana,
  SiOpentelemetry,
  SiLangchain,
  SiLanggraph,
  SiCrewai,
  SiModelcontextprotocol,
  SiVllm,
  SiOllama,
  SiMlflow,
  SiWeightsandbiases,
  SiApacheairflow,
  SiApachespark,
  SiClaudecode,
  SiPydantic,
};

export function SkillIcon({
  icon,
  fallback,
  className,
}: {
  icon?: string;
  fallback: string;
  className?: string;
}) {
  const Icon = icon ? ICONS[icon] : undefined;
  if (Icon) return <Icon className={className} aria-hidden="true" />;
  return (
    <span className={className} aria-hidden="true">
      {fallback}
    </span>
  );
}
