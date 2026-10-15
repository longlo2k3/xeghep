import { useMemo, useState } from 'react';
import { Users, Car, AlertCircle, Info, Calculator, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card } from '@/admin/components/ui/Card';
import { Input } from '@/admin/components/ui/Input';
import { Badge } from '@/admin/components/ui/Badge';
import { Button } from '@/admin/components/ui/Button';
import { formatVND } from '@/admin/lib/utils';
import type { PriceTier, PriceType } from '@/admin/types/routes';

export interface PricingTiersState {
  tierShare1?: PriceTier | null;
  tierShare2?: PriceTier | null;
  tierCharter45?: PriceTier | null;
  tierCharter4to5?: PriceTier | null;
  tierCharter7?: PriceTier | null;
}

export interface PricingTiersSectionProps {
  value: PricingTiersState;
  onChange: (value: PricingTiersState) => void;
  error?: string | null;
  readOnly?: boolean;
}

/**
 * Tính toán giá từ (priceFrom) ước tính:
 * Lấy mức giá tối thiểu thấp nhất của các tier không phải negotiable (FR-D04).
 */
export function computePriceFrom(tiers: PricingTiersState): number | null {
  const charter45 = tiers.tierCharter45 ?? tiers.tierCharter4to5;
  const list = [tiers.tierShare1, tiers.tierShare2, charter45, tiers.tierCharter7];
  const mins: number[] = [];
  for (const tier of list) {
    if (!tier || tier.negotiable) continue;
    if (tier.min != null && tier.min > 0) {
      mins.push(tier.min);
    }
  }
  return mins.length ? Math.min(...mins) : null;
}

export function detectPriceType(tier?: PriceTier | null): PriceType {
  if (!tier) return 'fixed';
  if (tier.negotiable) return 'negotiable';
  if (tier.from) return 'from';
  if (tier.max != null && tier.min != null && tier.max > tier.min) return 'range';
  return 'fixed';
}

interface TierConfig {
  key: keyof PricingTiersState;
  title: string;
  badge: string;
  icon: typeof Users;
  description: string;
  requiredRule?: boolean;
}

const TIER_CONFIGS: TierConfig[] = [
  {
    key: 'tierShare1',
    title: 'Xe ghép 1 người',
    badge: 'tierShare1',
    icon: Users,
    description: 'Ghép 1 khách (Bắt buộc ít nhất hạng này hoặc Bao xe 4-5 chỗ)',
    requiredRule: true,
  },
  {
    key: 'tierShare2',
    title: 'Xe ghép 2 người',
    badge: 'tierShare2',
    icon: Users,
    description: 'Ghép 2 khách (Để trống = Hệ thống tự tính x2 của ghép 1 khách)',
  },
  {
    key: 'tierCharter45',
    title: 'Bao xe 4-5 chỗ',
    badge: 'tierCharter45',
    icon: Car,
    description: 'Bao trọn xe 4-5 chỗ (Bắt buộc ít nhất hạng này hoặc Ghép 1 khách)',
    requiredRule: true,
  },
  {
    key: 'tierCharter7',
    title: 'Bao xe 7 chỗ',
    badge: 'tierCharter7',
    icon: Car,
    description: 'Bao trọn xe 7 chỗ cao cấp / gia đình',
  },
];

export function PricingTiersSection({
  value,
  onChange,
  error,
  readOnly = false,
}: PricingTiersSectionProps) {
  // Quản lý riêng priceType được chọn thủ công để tránh mất trạng thái khi min/max chưa gõ
  const [overridePriceTypes, setOverridePriceTypes] = useState<Record<string, PriceType>>({});

  const priceFrom = useMemo(() => computePriceFrom(value), [value]);

  const handlePriceTypeChange = (tierKey: keyof PricingTiersState, newType: PriceType) => {
    setOverridePriceTypes((prev) => ({ ...prev, [tierKey]: newType }));

    const currentTier = value[tierKey] ?? {};

    let updatedTier: PriceTier;
    if (newType === 'negotiable') {
      updatedTier = {
        negotiable: true,
        min: null,
        max: null,
        from: false,
      };
    } else if (newType === 'from') {
      updatedTier = {
        negotiable: false,
        from: true,
        min: currentTier.min ?? null,
        max: null,
      };
    } else if (newType === 'range') {
      updatedTier = {
        negotiable: false,
        from: false,
        min: currentTier.min ?? null,
        max: currentTier.max ?? null,
      };
    } else {
      // 'fixed'
      updatedTier = {
        negotiable: false,
        from: false,
        min: currentTier.min ?? null,
        max: null,
      };
    }

    const updated = {
      ...value,
      [tierKey]: updatedTier,
    };
    if (tierKey === 'tierCharter45') {
      updated.tierCharter4to5 = updatedTier;
    }
    onChange(updated);
  };

  const handleUpdatePrice = (
    tierKey: keyof PricingTiersState,
    field: 'min' | 'max',
    valStr: string
  ) => {
    const num = valStr === '' ? null : Number(valStr);
    const currentTier = value[tierKey] ?? {
      negotiable: false,
      from: (overridePriceTypes[tierKey] ?? detectPriceType(value[tierKey])) === 'from',
    };

    const updatedTier: PriceTier = {
      ...currentTier,
      [field]: num,
    };

    const updated = {
      ...value,
      [tierKey]: updatedTier,
    };
    if (tierKey === 'tierCharter45') {
      updated.tierCharter4to5 = updatedTier;
    }
    onChange(updated);
  };

  const handleClearTier = (tierKey: keyof PricingTiersState) => {
    setOverridePriceTypes((prev) => {
      const copy = { ...prev };
      delete copy[tierKey];
      return copy;
    });

    const updated = {
      ...value,
      [tierKey]: null,
    };
    if (tierKey === 'tierCharter45') {
      updated.tierCharter4to5 = null;
    }
    onChange(updated);
  };

  const hasAtLeastOneRequiredPrice = useMemo(() => {
    const s1 = value.tierShare1;
    const c45 = value.tierCharter45 ?? value.tierCharter4to5;
    const s1Ok = s1 && (s1.negotiable || (s1.min != null && s1.min > 0));
    const c45Ok = c45 && (c45.negotiable || (c45.min != null && c45.min > 0));
    return Boolean(s1Ok || c45Ok);
  }, [value]);

  return (
    <div className="space-y-6" data-testid="pricing-tiers-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Cấu hình 4 hạng vé cước tuyến
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết lập giá cước chi tiết cho từng loại hình phục vụ. Hỗ trợ giá cố định, khoảng giá, giá từ hoặc liên hệ thỏa thuận.
          </p>
        </div>

        {/* Live Estimated PriceFrom */}
        <div
          className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl"
          data-testid="computed-price-from-box"
        >
          <div className="text-right">
            <span className="text-[11px] text-blue-700 block font-medium">
              Giá từ ước tính (priceFrom)
            </span>
            <span
              className="text-base font-bold text-slate-900 font-mono"
              data-testid="computed-price-from"
            >
              {priceFrom ? formatVND(priceFrom) : 'Chưa xác định'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            ₫
          </div>
        </div>
      </div>

      {/* Thông báo lỗi tổng quát nếu có */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid 4 Hạng vé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TIER_CONFIGS.map((config) => {
          const currentTier = value[config.key];
          const activeType = overridePriceTypes[config.key] ?? detectPriceType(currentTier);
          const isConfigured = Boolean(
            currentTier &&
              (currentTier.negotiable ||
                (currentTier.min != null && currentTier.min > 0) ||
                (currentTier.max != null && currentTier.max > 0))
          );

          const testPrefix =
            config.key === 'tierShare1'
              ? 'share1'
              : config.key === 'tierShare2'
              ? 'share2'
              : config.key === 'tierCharter45'
              ? 'charter4to5'
              : 'charter7';

          return (
            <Card
              key={config.key}
              className={`p-5 space-y-4 border transition-all ${
                isConfigured
                  ? 'border-blue-200 bg-blue-50/20 shadow-sm'
                  : 'border-slate-200 bg-white'
              }`}
              data-testid={`tier-card-${testPrefix}`}
            >
              {/* Header card */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isConfigured
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <config.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      {config.title}
                      {config.requiredRule && (
                        <span className="text-rose-500 text-xs" title="Bắt buộc ít nhất Ghép 1 khách hoặc Bao xe 4-5 chỗ">
                          *
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{config.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!readOnly && isConfigured && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearTier(config.key)}
                      title="Xóa cấu hình giá hạng này"
                      className="text-slate-500 hover:text-slate-800 h-7 px-2 text-xs cursor-pointer"
                      data-testid={`tier-${testPrefix}-clear`}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Xóa
                    </Button>
                  )}
                  <Badge variant={isConfigured ? 'default' : 'secondary'} size="sm">
                    {isConfigured ? 'Đã cài' : 'Chưa cài'}
                  </Badge>
                </div>
              </div>

              {/* Lựa chọn loại giá (Price Type) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Loại giá cước
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(
                    [
                      { type: 'fixed', label: 'Cố định' },
                      { type: 'range', label: 'Khoảng giá' },
                      { type: 'from', label: 'Giá từ' },
                      { type: 'negotiable', label: 'Thỏa thuận' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      disabled={readOnly}
                      onClick={() => !readOnly && handlePriceTypeChange(config.key, item.type)}
                      data-testid={`tier-${testPrefix}-type-${item.type}`}
                      className={`text-xs py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                        activeType === item.type
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      } ${readOnly ? 'cursor-default opacity-85' : 'cursor-pointer'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Hỗ trợ Select cho form controls / test compatibility */}
                <select
                  className="sr-only"
                  aria-label={`Loại giá ${config.title}`}
                  data-testid={`tier-${testPrefix}-price-type`}
                  value={activeType}
                  disabled={readOnly}
                  onChange={(e) =>
                    !readOnly && handlePriceTypeChange(config.key, e.target.value as PriceType)
                  }
                >
                  <option value="fixed">fixed</option>
                  <option value="range">range</option>
                  <option value="from">from</option>
                  <option value="negotiable">negotiable</option>
                </select>
              </div>

              {/* Input giá tương ứng theo loại giá */}
              {activeType === 'negotiable' ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Khách hàng sẽ liên hệ với tổng đài để thỏa thuận báo giá trực tiếp.
                  </span>
                </div>
              ) : activeType === 'range' ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <Input
                      label="Giá tối thiểu (Từ)"
                      type="number"
                      placeholder="VD: 200000"
                      value={currentTier?.min ?? ''}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleUpdatePrice(config.key, 'min', e.target.value)
                      }
                      data-testid={`tier-${testPrefix}-min-price`}
                    />
                    <div className="mt-1 text-[11px] text-slate-500 font-mono">
                      {formatVND(currentTier?.min)}
                    </div>
                  </div>
                  <div>
                    <Input
                      label="Giá tối đa (Đến)"
                      type="number"
                      placeholder="VD: 250000"
                      value={currentTier?.max ?? ''}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleUpdatePrice(config.key, 'max', e.target.value)
                      }
                      data-testid={`tier-${testPrefix}-max-price`}
                    />
                    <div className="mt-1 text-[11px] text-slate-500 font-mono">
                      {formatVND(currentTier?.max)}
                    </div>
                  </div>
                </div>
              ) : (
                /* fixed hoặc from */
                <div className="pt-1">
                  <Input
                    label={
                      activeType === 'from'
                        ? 'Giá khởi điểm (Từ VND)'
                        : 'Mức giá cố định (VND)'
                    }
                    type="number"
                    placeholder="VD: 200000"
                    value={currentTier?.min ?? ''}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleUpdatePrice(config.key, 'min', e.target.value)
                    }
                    data-testid={`tier-${testPrefix}-fixed-price`}
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">
                      Định dạng:{' '}
                      <strong className="text-blue-600">
                        {formatVND(currentTier?.min)}
                      </strong>
                    </span>
                    {activeType === 'from' && (
                      <span className="text-amber-600 font-medium">
                        Hiển thị &ldquo;từ {formatVND(currentTier?.min)}&rdquo;
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Chú thích quy định bắt buộc */}
      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
        {hasAtLeastOneRequiredPrice ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
        )}
        <span>
          Quy định bắt buộc (FR-D05): Tuyến đường phải có ít nhất 1 mức giá hợp lệ (hoặc thỏa thuận) cho{' '}
          <strong className="text-slate-800">Xe ghép 1 người</strong> hoặc{' '}
          <strong className="text-slate-800">Bao xe 4-5 chỗ</strong>.
        </span>
      </div>
    </div>
  );
}

export default PricingTiersSection;
