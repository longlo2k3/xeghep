interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Renders JSON-LD schema safely in Next.js
 * Escapes '<' to prevent XSS vulnerability per AGENTS.md rule 7.1
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
