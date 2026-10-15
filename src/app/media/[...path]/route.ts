import { promises as fs } from "node:fs";
import fsSync from "node:fs";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

/**
 * Serve media uploads tại `/media/*` (KHÔNG dưới `/api/` — robots Disallow /api/,
 * Constitution §2.1 / plan AD-5). Files nằm trong `backend/media` (upload.staticDir).
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const { path: segments } = await params;

  if (!segments || segments.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  // Tìm thư mục media khả dụng (hỗ trợ cả khi cwd là cms hay cms/backend)
  const candidateDirs = [
    path.resolve(process.cwd(), "media"),
    path.resolve(process.cwd(), "backend", "media"),
  ];
  const mediaDir = candidateDirs.find((d) => fsSync.existsSync(d)) || candidateDirs[0];

  const rawPath = segments.join("/");
  let filePath = path.resolve(mediaDir, rawPath);

  if (!filePath.startsWith(mediaDir + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  // 1) Thử đường dẫn file chính xác
  let stats: any = null;
  try {
    stats = await fs.stat(filePath);
  } catch {
    stats = null;
  }

  // 2) Fallback thông minh: nếu file có hậu tố số trùng (-1, -2) hoặc chưa sinh size sharp (-640x427)
  // (ví dụ: HaNoi-2.webp -> HaNoi.webp; HaNoi-2-640x427.webp -> HaNoi-640x427.webp -> HaNoi.webp)
  if (!stats || !stats.isFile()) {
    const ext = path.extname(filePath);
    const baseWithoutExt = path.basename(filePath, ext);
    const dir = path.dirname(filePath);

    // Bỏ hậu tố kích thước sharp (ví dụ: -640x427, -1200x630)
    const withoutSize = baseWithoutExt.replace(/-\d+x\d+$/, "");
    // Bỏ hậu tố số trùng (ví dụ: -1, -2, -3)
    const withoutIndex = baseWithoutExt.replace(/-\d+$/, "");
    // Bỏ cả hậu tố số trùng lẫn kích thước
    const withoutBoth = withoutSize.replace(/-\d+$/, "");

    const candidates = [
      path.join(dir, `${withoutSize}${ext}`),
      path.join(dir, `${withoutIndex}${ext}`),
      path.join(dir, `${withoutBoth}${ext}`),
    ];

    for (const cand of candidates) {
      if (cand !== filePath && cand.startsWith(mediaDir + path.sep)) {
        try {
          const candStat = await fs.stat(cand);
          if (candStat.isFile()) {
            filePath = cand;
            stats = candStat;
            break;
          }
        } catch {
          // Thử ứng viên tiếp theo
        }
      }
    }
  }

  if (!stats || !stats.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const contentType =
    MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
  const data = await fs.readFile(filePath);

  return new Response(new Uint8Array(data), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Length": String(stats.size),
      "Content-Type": contentType,
    },
  });
}

