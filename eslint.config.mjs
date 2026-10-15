import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * ESLint flat config (MIGRATION D9) — website gốc không có eslint.
 * Code 3 dự án được GIỮ NGUYÊN nên rule gây lỗi có sẵn được hạ tại đây
 * (chi tiết reason ghi ở MIGRATION.md §5).
 */
export default [
  { ignores: [".next/**", "node_modules/**", "media/**", "public/**", "**/*.d.ts", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Code giữ nguyên 100% (AC yêu cầu giao diện public không đổi) → không chặn build vì unused
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      // Logo/ảnh `<img>` dùng đúng width/height sẵn có; next/image không ép bắt buộc (rule 5.1 vẫn giữ alt/width/height)
      "@next/next/no-img-element": "warn",
      // React Compiler rules: code cũ dùng patterns hợp lệ nhưng chưa qua migrate
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      // Types any có sẵn trong code payload/admin — giữ warn để không sửa code nguồn
      "@typescript-eslint/no-explicit-any": "warn",
      // Flat config + Next: core-web-vitals đã tắt rule này, giữ warn an toàn
      "react/no-unescaped-entities": "off",
    },
  },
];
