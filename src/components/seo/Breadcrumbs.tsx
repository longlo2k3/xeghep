import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { buildBreadcrumbSchema, BreadcrumbItem } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schema = buildBreadcrumbSchema(items);

  return (
    <div className="bg-slate-50 border-b border-slate-200/80 py-2.5 px-4 sm:px-6 lg:px-8">
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm text-slate-600 flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    className="w-4 h-4 text-slate-400 mx-1.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span
                    className="font-medium text-emerald-800 line-clamp-1"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="hover:text-emerald-700 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                  >
                    {index === 0 && <Home className="w-3.5 h-3.5" aria-hidden="true" />}
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
