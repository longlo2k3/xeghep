/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. MODIFY AT YOUR OWN RISK. */
import config from "@payload-config";
import "@payloadcms/next/css";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

/**
 * Chuẩn hóa request `multipart/form-data`:
 * Payload 3 chỉ đọc các field phụ (alt, caption...) nếu được gửi trong JSON `_payload`.
 * Khi client gửi multipart thông thường (field trực tiếp `alt`, `caption`),
 * hàm này tự gom các text field thành `_payload` để Payload xử lý chính xác.
 */
async function normalizeMultipartRequest(request: Request): Promise<Request> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return request;
  }

  try {
    const formData = await request.clone().formData();
    // Nếu client đã gửi `_payload`, giữ nguyên
    if (formData.has("_payload")) {
      return request;
    }

    const payloadData: Record<string, unknown> = {};
    const newFormData = new FormData();

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        payloadData[key] = value;
      } else {
        newFormData.append(key, value);
      }
    }

    newFormData.append("_payload", JSON.stringify(payloadData));

    const headers = new Headers(request.headers);
    headers.delete("content-type");

    return new Request(request.url, {
      method: request.method,
      headers,
      body: newFormData,
      // @ts-expect-error duplex required in Node fetch when body is a stream/form
      duplex: "half",
    });
  } catch {
    return request;
  }
}

const defaultGet = REST_GET(config);
const defaultPost = REST_POST(config);
const defaultDelete = REST_DELETE(config);
const defaultPatch = REST_PATCH(config);
const defaultPut = REST_PUT(config);
const defaultOptions = REST_OPTIONS(config);

export const GET = defaultGet;
export const POST = async (request: Request, context: any) => {
  const req = await normalizeMultipartRequest(request);
  return defaultPost(req, context);
};
export const DELETE = defaultDelete;
export const PATCH = async (request: Request, context: any) => {
  const req = await normalizeMultipartRequest(request);
  return defaultPatch(req, context);
};
export const PUT = async (request: Request, context: any) => {
  const req = await normalizeMultipartRequest(request);
  return defaultPut(req, context);
};
export const OPTIONS = defaultOptions;

