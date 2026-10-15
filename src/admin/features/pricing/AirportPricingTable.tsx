import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react';
import {
  Plane,
  Edit2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Badge } from '@/admin/components/ui/Badge';
import { Modal } from '@/admin/components/ui/Modal';
import { DataTable, type Column } from '@/admin/components/common/DataTable';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatVND } from '@/admin/lib/utils';
import type { AirportPricingDoc } from '@/admin/types/settings';
import type { PaginatedResponse } from '@/admin/types/api';

const DEFAULT_AIRPORT_PRICING: AirportPricingDoc[] = [
  {
    id: 1,
    slug: 'ba-dinh',
    district: 'Quận Ba Đình',
    fromHanoiToAirport: { sedan5Seats: 200000, suv7Seats: 250000, van16Seats: 450000 },
    fromAirportToHanoi: { sedan5Seats: 250000, suv7Seats: 300000, van16Seats: 500000 },
    roundTrip: { sedan5Seats: 400000, suv7Seats: 500000, van16Seats: 850000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    slug: 'hoan-kiem',
    district: 'Quận Hoàn Kiếm',
    fromHanoiToAirport: { sedan5Seats: 220000, suv7Seats: 270000, van16Seats: 480000 },
    fromAirportToHanoi: { sedan5Seats: 260000, suv7Seats: 320000, van16Seats: 530000 },
    roundTrip: { sedan5Seats: 430000, suv7Seats: 530000, van16Seats: 900000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    slug: 'tay-ho',
    district: 'Quận Tây Hồ',
    fromHanoiToAirport: { sedan5Seats: 180000, suv7Seats: 230000, van16Seats: 420000 },
    fromAirportToHanoi: { sedan5Seats: 230000, suv7Seats: 280000, van16Seats: 470000 },
    roundTrip: { sedan5Seats: 370000, suv7Seats: 470000, van16Seats: 800000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    slug: 'cau-giay',
    district: 'Quận Cầu Giấy',
    fromHanoiToAirport: { sedan5Seats: 200000, suv7Seats: 250000, van16Seats: 450000 },
    fromAirportToHanoi: { sedan5Seats: 250000, suv7Seats: 300000, van16Seats: 500000 },
    roundTrip: { sedan5Seats: 400000, suv7Seats: 500000, van16Seats: 850000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    slug: 'dong-da',
    district: 'Quận Đống Đa',
    fromHanoiToAirport: { sedan5Seats: 220000, suv7Seats: 270000, van16Seats: 480000 },
    fromAirportToHanoi: { sedan5Seats: 260000, suv7Seats: 320000, van16Seats: 520000 },
    roundTrip: { sedan5Seats: 430000, suv7Seats: 530000, van16Seats: 900000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    slug: 'hai-ba-trung',
    district: 'Quận Hai Bà Trưng',
    fromHanoiToAirport: { sedan5Seats: 230000, suv7Seats: 280000, van16Seats: 490000 },
    fromAirportToHanoi: { sedan5Seats: 270000, suv7Seats: 330000, van16Seats: 540000 },
    roundTrip: { sedan5Seats: 450000, suv7Seats: 550000, van16Seats: 920000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    slug: 'hoang-mai',
    district: 'Quận Hoàng Mai',
    fromHanoiToAirport: { sedan5Seats: 240000, suv7Seats: 290000, van16Seats: 500000 },
    fromAirportToHanoi: { sedan5Seats: 280000, suv7Seats: 340000, van16Seats: 550000 },
    roundTrip: { sedan5Seats: 470000, suv7Seats: 570000, van16Seats: 940000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 8,
    slug: 'thanh-xuan',
    district: 'Quận Thanh Xuân',
    fromHanoiToAirport: { sedan5Seats: 220000, suv7Seats: 270000, van16Seats: 480000 },
    fromAirportToHanoi: { sedan5Seats: 260000, suv7Seats: 320000, van16Seats: 520000 },
    roundTrip: { sedan5Seats: 430000, suv7Seats: 530000, van16Seats: 900000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 9,
    slug: 'long-bien',
    district: 'Quận Long Biên',
    fromHanoiToAirport: { sedan5Seats: 220000, suv7Seats: 270000, van16Seats: 480000 },
    fromAirportToHanoi: { sedan5Seats: 260000, suv7Seats: 320000, van16Seats: 520000 },
    roundTrip: { sedan5Seats: 430000, suv7Seats: 530000, van16Seats: 900000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 10,
    slug: 'nam-tu-liem',
    district: 'Quận Nam Từ Liêm',
    fromHanoiToAirport: { sedan5Seats: 210000, suv7Seats: 260000, van16Seats: 460000 },
    fromAirportToHanoi: { sedan5Seats: 250000, suv7Seats: 310000, van16Seats: 510000 },
    roundTrip: { sedan5Seats: 410000, suv7Seats: 510000, van16Seats: 870000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 11,
    slug: 'bac-tu-liem',
    district: 'Quận Bắc Từ Liêm',
    fromHanoiToAirport: { sedan5Seats: 190000, suv7Seats: 240000, van16Seats: 430000 },
    fromAirportToHanoi: { sedan5Seats: 240000, suv7Seats: 290000, van16Seats: 480000 },
    roundTrip: { sedan5Seats: 390000, suv7Seats: 490000, van16Seats: 820000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 12,
    slug: 'ha-dong',
    district: 'Quận Hà Đông',
    fromHanoiToAirport: { sedan5Seats: 250000, suv7Seats: 300000, van16Seats: 520000 },
    fromAirportToHanoi: { sedan5Seats: 290000, suv7Seats: 350000, van16Seats: 570000 },
    roundTrip: { sedan5Seats: 490000, suv7Seats: 590000, van16Seats: 980000 },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function AirportPricingTable() {
  const [rates, setRates] = useState<AirportPricingDoc[]>(DEFAULT_AIRPORT_PRICING);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Sửa giá
  const [editingDoc, setEditingDoc] = useState<AirportPricingDoc | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form edit state
  const [toAirportSedan, setToAirportSedan] = useState(0);
  const [toAirportSuv, setToAirportSuv] = useState(0);
  const [toAirportVan, setToAirportVan] = useState(0);

  const [toHanoiSedan, setToHanoiSedan] = useState(0);
  const [toHanoiSuv, setToHanoiSuv] = useState(0);
  const [toHanoiVan, setToHanoiVan] = useState(0);

  const [roundTripSedan, setRoundTripSedan] = useState(0);
  const [roundTripSuv, setRoundTripSuv] = useState(0);
  const [roundTripVan, setRoundTripVan] = useState(0);

  const [isActive, setIsActive] = useState(true);

  const fetchRates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<PaginatedResponse<AirportPricingDoc>>('/airport_pricing', {
        params: { limit: 100, sort: 'district' },
      });
      if (res.data?.docs && res.data.docs.length > 0) {
        setRates(res.data.docs);
      }
    } catch (err) {
      // Giữ dữ liệu mặc định 12 quận
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleOpenEdit = (doc: AirportPricingDoc) => {
    setEditingDoc(doc);
    setModalError(null);

    setToAirportSedan(doc.fromHanoiToAirport?.sedan5Seats || 0);
    setToAirportSuv(doc.fromHanoiToAirport?.suv7Seats || 0);
    setToAirportVan(doc.fromHanoiToAirport?.van16Seats || 0);

    setToHanoiSedan(doc.fromAirportToHanoi?.sedan5Seats || 0);
    setToHanoiSuv(doc.fromAirportToHanoi?.suv7Seats || 0);
    setToHanoiVan(doc.fromAirportToHanoi?.van16Seats || 0);

    setRoundTripSedan(doc.roundTrip?.sedan5Seats || 0);
    setRoundTripSuv(doc.roundTrip?.suv7Seats || 0);
    setRoundTripVan(doc.roundTrip?.van16Seats || 0);

    setIsActive(doc.isActive ?? true);
  };

  const handleSavePricing = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setModalError(null);

    const payload = {
      fromHanoiToAirport: {
        sedan5Seats: Number(toAirportSedan),
        suv7Seats: Number(toAirportSuv),
        van16Seats: Number(toAirportVan),
      },
      fromAirportToHanoi: {
        sedan5Seats: Number(toHanoiSedan),
        suv7Seats: Number(toHanoiSuv),
        van16Seats: Number(toHanoiVan),
      },
      roundTrip: {
        sedan5Seats: Number(roundTripSedan),
        suv7Seats: Number(roundTripSuv),
        van16Seats: Number(roundTripVan),
      },
      isActive,
    };

    try {
      setIsSaving(true);
      const res = await apiClient.patch(`/airport_pricing/${editingDoc.id}`, payload);
      const updatedDoc = res.data?.doc || { ...editingDoc, ...payload };

      setRates((prev) => prev.map((r) => (r.id === editingDoc.id ? { ...r, ...updatedDoc } : r)));
      setSuccessMsg(`Cập nhật giá cước ${editingDoc.district} thành công!`);
      setEditingDoc(null);
    } catch (err) {
      setModalError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Filter theo search
  const filteredRates = useMemo(() => {
    if (!searchQuery.trim()) return rates;
    const q = searchQuery.toLowerCase();
    return rates.filter((r) => r.district.toLowerCase().includes(q));
  }, [rates, searchQuery]);

  const columns: Column<AirportPricingDoc>[] = [
    {
      key: 'district',
      header: 'Khu vực / Quận',
      render: (item) => (
        <div>
          <div className="font-semibold text-white">{item.district}</div>
          <div className="text-xs text-slate-400 font-mono">{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'fromHanoiToAirport',
      header: 'Hà Nội → Sân bay',
      render: (item) => (
        <div className="space-y-1 text-xs">
          <div className="text-blue-400">Sedan 5: {formatVND(item.fromHanoiToAirport?.sedan5Seats)}</div>
          <div className="text-emerald-400">SUV 7: {formatVND(item.fromHanoiToAirport?.suv7Seats)}</div>
          <div className="text-amber-400">Van 16: {formatVND(item.fromHanoiToAirport?.van16Seats)}</div>
        </div>
      ),
    },
    {
      key: 'fromAirportToHanoi',
      header: 'Sân bay → Hà Nội',
      render: (item) => (
        <div className="space-y-1 text-xs">
          <div className="text-blue-400">Sedan 5: {formatVND(item.fromAirportToHanoi?.sedan5Seats)}</div>
          <div className="text-emerald-400">SUV 7: {formatVND(item.fromAirportToHanoi?.suv7Seats)}</div>
          <div className="text-amber-400">Van 16: {formatVND(item.fromAirportToHanoi?.van16Seats)}</div>
        </div>
      ),
    },
    {
      key: 'roundTrip',
      header: 'Khứ hồi (2 chiều)',
      render: (item) => (
        <div className="space-y-1 text-xs font-medium">
          <div className="text-blue-300">Sedan 5: {formatVND(item.roundTrip?.sedan5Seats)}</div>
          <div className="text-emerald-300">SUV 7: {formatVND(item.roundTrip?.suv7Seats)}</div>
          <div className="text-amber-300">Van 16: {formatVND(item.roundTrip?.van16Seats)}</div>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      render: (item) =>
        item.isActive ? (
          <Badge variant="success" className="bg-emerald-50 text-emerald-700 border border-emerald-200">
            Áp dụng
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200">
            Tạm dừng
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (item) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleOpenEdit(item)}
          className="gap-1 text-xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Sửa giá
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Alert thông báo */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Bảng giá 12 quận Hà Nội đi/về Sân bay Nội Bài
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchRates}
            isLoading={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredRates}
        columns={columns}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Tìm theo tên quận..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pagination
        pageSize={12}
        emptyTitle="Không tìm thấy mức giá quận nào"
        emptyMessage="Vui lòng thử lại với từ khóa tìm kiếm khác."
      />

      {/* Modal Chỉnh sửa mức giá */}
      {editingDoc && (
        <Modal
          isOpen={true}
          onClose={() => setEditingDoc(null)}
          title={`Chỉnh sửa giá cước: ${editingDoc.district}`}
          description="Cập nhật giá cước theo từng dòng xe cho chiều đi, chiều về và chuyến khứ hồi."
          size="lg"
        >
          <form onSubmit={handleSavePricing} className="space-y-5">
            {modalError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Chiều đi: Hà Nội -> Sân bay */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                1. Chiều đi: Hà Nội → Sân bay Nội Bài (VND)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Sedan 5 chỗ"
                  type="number"
                  step={10000}
                  value={toAirportSedan}
                  onChange={(e) => setToAirportSedan(Number(e.target.value))}
                  required
                />
                <Input
                  label="SUV 7 chỗ"
                  type="number"
                  step={10000}
                  value={toAirportSuv}
                  onChange={(e) => setToAirportSuv(Number(e.target.value))}
                  required
                />
                <Input
                  label="Van 16 chỗ"
                  type="number"
                  step={10000}
                  value={toAirportVan}
                  onChange={(e) => setToAirportVan(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Chiều về: Sân bay -> Hà Nội */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                2. Chiều về: Sân bay Nội Bài → Hà Nội (VND)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Sedan 5 chỗ"
                  type="number"
                  step={10000}
                  value={toHanoiSedan}
                  onChange={(e) => setToHanoiSedan(Number(e.target.value))}
                  required
                />
                <Input
                  label="SUV 7 chỗ"
                  type="number"
                  step={10000}
                  value={toHanoiSuv}
                  onChange={(e) => setToHanoiSuv(Number(e.target.value))}
                  required
                />
                <Input
                  label="Van 16 chỗ"
                  type="number"
                  step={10000}
                  value={toHanoiVan}
                  onChange={(e) => setToHanoiVan(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Khứ hồi */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                3. Giá Khứ hồi 2 chiều (VND)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Sedan 5 chỗ"
                  type="number"
                  step={10000}
                  value={roundTripSedan}
                  onChange={(e) => setRoundTripSedan(Number(e.target.value))}
                  required
                />
                <Input
                  label="SUV 7 chỗ"
                  type="number"
                  step={10000}
                  value={roundTripSuv}
                  onChange={(e) => setRoundTripSuv(Number(e.target.value))}
                  required
                />
                <Input
                  label="Van 16 chỗ"
                  type="number"
                  step={10000}
                  value={roundTripVan}
                  onChange={(e) => setRoundTripVan(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Kích hoạt áp dụng mức giá cho quận này
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingDoc(null)}
                disabled={isSaving}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" isLoading={isSaving} className="gap-2">
                <Check className="w-4 h-4" />
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
