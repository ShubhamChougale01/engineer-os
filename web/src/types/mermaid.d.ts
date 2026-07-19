/**
 * Minimal local declaration for mermaid — v11.16.0 publishes an exports map
 * pointing at dist/mermaid.d.ts, but that file is missing from the npm
 * package. We only use two functions, so declare exactly what we need.
 */
declare module "mermaid" {
  export interface MermaidConfig {
    startOnLoad?: boolean;
    theme?: "default" | "dark" | "neutral" | "forest" | "base";
    securityLevel?: "strict" | "loose" | "antiscript" | "sandbox";
  }

  export interface RenderResult {
    svg: string;
    bindFunctions?: (element: Element) => void;
  }

  const mermaid: {
    initialize(config: MermaidConfig): void;
    render(id: string, text: string): Promise<RenderResult>;
  };

  export default mermaid;
}
