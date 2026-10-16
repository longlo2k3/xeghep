import postcss, { type ChildNode, type Declaration, type Rule } from "postcss";

const SCOPE = "[data-route-pricing]";
const BLOCKED_VALUE = /[<>\\]|url\s*\(|image-set\s*\(|expression\s*\(|javascript:|data:|@import/i;
const BLOCKED_PROPERTY = /^(?:behavior|-moz-binding|src|content)$/i;

function safeSelector(selector: string): string | null {
  const value = selector.trim();
  if (!value || value.length > 500 || /[<>\\{};@]/.test(value)) return null;
  if (/^[+~]/.test(value) || /:global\b|:host\b/i.test(value)) return null;
  if (value.startsWith(":scope") && /[+~]/.test(value)) return null;
  const rootSelector = value.match(/^(?::root|html|body)(?=$|[\s.:#\[])/i);
  if (rootSelector) {
    const remainder = value.slice(rootSelector[0].length);
    if (/^\s*[+~]/.test(remainder)) return null;
    return `${SCOPE}${remainder}`;
  }
  if (value.startsWith(":scope")) return value.replace(/^:scope\b/, SCOPE);
  return `${SCOPE} ${value}`;
}

function safeDeclaration(declaration: Declaration): string | null {
  const property = declaration.prop.toLowerCase();
  let value = declaration.value.trim();
  if (!/^-{0,2}[a-z][a-z0-9-]*$/.test(property) || BLOCKED_PROPERTY.test(property)) return null;
  if (property === "display") {
    const quotedDisplay = value.match(/^["'](none|block|inline|inline-block|flex|inline-flex|grid|inline-grid|table|table-cell)["']$/i);
    if (quotedDisplay) value = quotedDisplay[1];
  }
  if (!value || value.length > 1000 || BLOCKED_VALUE.test(value)) return null;
  if (property === "position" && /^(?:fixed|sticky)$/i.test(value)) return null;
  return `${property}:${value}${declaration.important ? " !important" : ""}`;
}

function renderNodes(nodes: ChildNode[]): string {
  return nodes.flatMap((node) => {
    if (node.type === "atrule") {
      if (!/^(?:media|supports)$/i.test(node.name)) return [];
      if (!node.nodes || !/^[a-z0-9\s():.,%/\-]+$/i.test(node.params)) return [];
      const inner = renderNodes(node.nodes);
      return inner ? [`@${node.name.toLowerCase()} ${node.params}{${inner}}`] : [];
    }
    if (node.type !== "rule") return [];

    const selectors = (node as Rule).selectors.map(safeSelector).filter((s): s is string => s !== null);
    if (!selectors.length) return [];
    const declarations = (node.nodes ?? [])
      .filter((child): child is Declaration => child.type === "decl")
      .map(safeDeclaration)
      .filter((value): value is string => value !== null);
    if (!declarations.length) return [];
    return [`${selectors.join(",")}{${declarations.join(";")}}`];
  }).join("");
}

/** Scope admin CSS to the route price section and discard unsafe or global rules. */
export function sanitizeRoutePricingCss(input: string | null | undefined): string {
  if (!input?.trim() || input.length > 30000) return "";
  try {
    return renderNodes(postcss.parse(input).nodes);
  } catch {
    return "";
  }
}
