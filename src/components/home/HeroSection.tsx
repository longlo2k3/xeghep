import Image from "next/image";
import { COMPANY_INFO } from "@/data/company-info";
import type { CompanyInfoData } from "@/lib/api";

interface HeroSectionProps {
  companyInfo?: CompanyInfoData;
}

export function HeroSection({ companyInfo = COMPANY_INFO }: HeroSectionProps) {
  const info = companyInfo ?? COMPANY_INFO;

  return (
    <section
      aria-label="Ảnh banner xe ghép liên tỉnh"
      className="w-full bg-slate-50"
    >
      <Image
        src={info.heroImageUrl}
        alt={info.heroImageAlt}
        width={info.heroImageWidth}
        height={info.heroImageHeight}
        priority
        sizes="100vw"
        quality={85}
        className="block h-auto w-full"
      />
    </section>
  );
}
