import type { PriceTier } from '../src/lib/pricing/types';

// Fixture nội bộ cho booking.validate test — chỉ cần slug/status;
// các fixture airport/distance/settings đã bị xóa cùng pricing REMOVE (MIGRATION §2.1).

function parseVndText(raw: string): PriceTier {
  const t = raw.trim().toLowerCase();
  if (/liên hệ|lien he|thỏa thuận|thoa thuan/.test(t)) {
    return { min: null, max: null, from: false, negotiable: true };
  }
  const nums = [...t.matchAll(/(\d[\d.]*)\s*k/g)].map(
    (m) => Number(m[1].replace(/\./g, '')) * 1000,
  );
  const from = t.startsWith('từ ') || t.startsWith('tu ');
  if (nums.length >= 2) {
    return { min: Math.min(...nums), max: Math.max(...nums), from: false, negotiable: false };
  }
  return { min: nums[0], max: null, from, negotiable: false };
}

type RawRoute = {
  slug: string;
  name: string;
  share1: string;
  share2?: string;
  charter45: string;
  charter7?: string;
  originAliases: string[];
  destinationAliases: string[];
};

const RAW_ROUTES: RawRoute[] = [
  {
    slug: 'hai-phong-bac-ninh-bac-giang',
    name: 'Hải Phòng ⇄ Bắc Ninh ⇄ Bắc Giang',
    share1: '400k – 500k',
    share2: 'từ 700k',
    charter45: 'từ 900k',
    charter7: 'từ 1.000k',
    originAliases: ['Hải Phòng', 'Quán Toan', 'Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Thủy Nguyên', 'An Dương'],
    destinationAliases: ['Bắc Ninh', 'Bắc Giang', 'TP. Bắc Ninh', 'TP. Bắc Giang', 'KCN Quế Võ', 'KCN Yên Phong', 'KCN Quang Châu', 'KCN Đình Trám'],
  },
  {
    slug: 'hai-phong-ha-noi-noi-bai',
    name: 'Hải Phòng ⇄ Hà Nội ⇄ Nội Bài',
    share1: '400k',
    share2: '700k',
    charter45: 'từ 899k',
    charter7: 'từ 999k',
    originAliases: ['Hải Phòng', 'Quán Toan', 'Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Hải An', 'Kiến An', 'Thủy Nguyên'],
    destinationAliases: ['Hà Nội', 'Nội Bài', 'Sân bay Nội Bài', 'Các quận nội thành Hà Nội', 'Các bệnh viện trung ương'],
  },
  {
    slug: 'hai-phong-ha-long',
    name: 'Hải Phòng ⇄ Hạ Long',
    share1: '250k – 300k',
    share2: '400k',
    charter45: '400k – 500k',
    charter7: '500k – 600k',
    originAliases: ['Hải Phòng', 'Quán Toan', 'Thủy Nguyên'],
    destinationAliases: ['Hạ Long', 'TP. Hạ Long', 'Bãi Cháy', 'Hòn Gai', 'Tuần Châu', 'Hùng Thắng'],
  },
  {
    slug: 'hai-phong-mong-cai',
    name: 'Hải Phòng ⇄ Móng Cái',
    share1: '500k – 600k',
    share2: 'từ 800k',
    charter45: '1.500k – 1.600k',
    charter7: '1.600k – 1.700k',
    originAliases: ['Hải Phòng', 'Quán Toan', 'Thủy Nguyên', 'An Dương'],
    destinationAliases: ['Móng Cái', 'TP. Móng Cái', 'Cửa khẩu quốc tế Móng Cái', 'Trà Cổ', 'Hải Hà'],
  },
  {
    slug: 'ha-long-bac-ninh-bac-giang',
    name: 'Hạ Long ⇄ Bắc Ninh ⇄ Bắc Giang',
    share1: '450k – 550k',
    share2: 'từ 700k',
    charter45: 'từ 900k',
    charter7: 'từ 1.000k',
    originAliases: ['Hạ Long', 'TP. Hạ Long', 'Bãi Cháy', 'Hòn Gai', 'Tuần Châu'],
    destinationAliases: ['Bắc Ninh', 'Bắc Giang', 'TP. Bắc Ninh', 'TP. Bắc Giang', 'Việt Yên', 'Yên Dũng', 'Tiên Du'],
  },
  {
    slug: 'ha-noi-mong-cai',
    name: 'Hà Nội ⇄ Móng Cái',
    share1: '600k – 800k',
    share2: 'từ 1.200k',
    charter45: '2.200k – 2.400k',
    charter7: '2.300k – 2.500k',
    originAliases: ['Hà Nội', 'Các quận nội thành Hà Nội', 'Sân bay Nội Bài'],
    destinationAliases: ['Móng Cái', 'TP. Móng Cái', 'Cửa khẩu quốc tế Móng Cái', 'Khu du lịch Trà Cổ'],
  },
  {
    slug: 'ha-noi-ha-long',
    name: 'Hà Nội ⇄ Hạ Long',
    share1: '450k – 550k',
    share2: 'từ 800k',
    charter45: '1.100k – 1.200k',
    charter7: '1.200k – 1.300k',
    originAliases: ['Hà Nội', 'Các quận nội thành Hà Nội', 'Sân bay Nội Bài'],
    destinationAliases: ['Hạ Long', 'TP. Hạ Long', 'Bãi Cháy', 'Hòn Gai', 'Cảng tàu khách Tuần Châu'],
  },
  {
    slug: 'hai-phong-hai-duong',
    name: 'Hải Phòng ⇄ Hải Dương',
    share1: '250k',
    share2: '400k',
    charter45: '500k',
    charter7: 'Liên hệ thỏa thuận',
    originAliases: ['Hải Phòng', 'Quán Toan', 'An Dương'],
    destinationAliases: ['Hải Dương', 'TP. Hải Dương', 'Kim Thành', 'Cẩm Giàng', 'KCN Nam Sách'],
  },
  {
    slug: 'hai-phong-thai-nguyen',
    name: 'Hải Phòng ⇄ Thái Nguyên',
    share1: '600k',
    share2: '900k',
    charter45: '1.400k',
    charter7: 'Liên hệ thỏa thuận',
    originAliases: ['Hải Phòng', 'Quán Toan'],
    destinationAliases: ['Thái Nguyên', 'TP. Thái Nguyên', 'TP. Sông Công', 'TP. Phổ Yên', 'KCN Samsung Phổ Yên'],
  },
];

type FixtureRoute = {
  slug: string;
  name: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  tiers: {
    share1: PriceTier;
    share2?: PriceTier;
    charter45: PriceTier;
    charter7?: PriceTier;
  };
  areas: {
    originAliases: string[];
    destinationAliases: string[];
  };
};

export const routeFixtures: FixtureRoute[] = [
  ...RAW_ROUTES.map((r, i) => ({
    slug: r.slug,
    name: r.name,
    status: 'active' as const,
    sortOrder: i + 1,
    tiers: {
      share1: parseVndText(r.share1),
      share2: r.share2 ? parseVndText(r.share2) : undefined,
      charter45: parseVndText(r.charter45),
      charter7: r.charter7 ? parseVndText(r.charter7) : undefined,
    },
    areas: {
      originAliases: r.originAliases,
      destinationAliases: r.destinationAliases,
    },
  })),
  {
    slug: 'hai-phong-sa-pa-nghi',
    name: 'Hải Phòng ⇄ Sa Pa (ngừng hoạt động)',
    status: 'inactive',
    sortOrder: 10,
    tiers: {
      share1: { min: 900000, max: null, from: false, negotiable: false },
      charter45: { min: 2500000, max: null, from: true, negotiable: false },
    },
    areas: {
      originAliases: ['Hải Phòng'],
      destinationAliases: ['Sa Pa', 'Lào Cai'],
    },
  },
];

export const activeRoutes = routeFixtures.filter((r) => r.status === 'active');
