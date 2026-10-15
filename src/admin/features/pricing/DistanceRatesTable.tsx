import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  Route,
  Edit2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Moon,
  Receipt,
  Percent,
  Check,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Modal } from '@/admin/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/admin/components/ui/Card';
import { DataTable, type Column } from '@/admin/components/common/DataTable';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import { formatVND } from '@/admin/lib/utils';
import type { DistanceRateDoc, PricingSettings } from '@/admin/types/settings';
import type { PaginatedResponse } from '@/admin/types/api';

const DEFAULT_DISTANCE_RATES: DistanceRateDoc[] = [
  {
    id: 1,
    label: 'Dải 1: Dưới 100 km (30 - 100 km)',
    minKm: 30,
    maxKm: 100,
    sedan5Seats: 10000,
    suv7Seats: 12000,
    van16Seats: 18000,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    label: 'Dải 2: Từ 101 - 200 km',
    minKm: 101,
    maxKm: 200,
    sedan5Seats: 9000,
    suv7Seats: 11000,
    van16Seats: 16000,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    label: 'Dải 3: Từ 201 - 300 km',
    minKm: 201,
    maxKm: 300,
    sedan5Seats: 8500,
    suv7Seats: 10000,
    van16Seats: 15000,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    label: 'Dải 4: Trên 300 km',
    minKm: 301,
    maxKm: null,
    sedan5Seats: 8000,
    suv7Seats: 9500,
    van16Seats: 14000,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function DistanceRatesTable() {
  const [rates, setRates] = useState<DistanceRateDoc[]>(DEFAULT_DISTANCE_RATES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Policies from PricingSettings
  const [policies, setPolicies] = useState<{
    roundTripDiscountText: string;
    waitingFreeMinutes: number;
    waitingFeePerHour: number;
    overnightNote: string;
  }>({
    roundTripDiscountText: 'Giảm 20% - 30% cho chiều về khi đặt khứ hồi trong ngày',
    waitingFreeMinutes: 30,
    waitingFeePerHour: 60000,
    overnightNote: 'Phụ phí đêm từ 22:00 - 05:00 sáng (+30.000đ – 50.000đ tùy tuyến)',
  });

  // Modal Sửa giá dải km
  const [editingDoc, setEditingDoc] = useState<DistanceRateDoc | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [editLabel, setEditLabel] = useState('');
  const [editMinKm, setEditMinKm] = useState(0);
  const [editMaxKm, setEditMaxKm] = useState<string>('');
  const [editSedan, setEditSedan] = useState(0);
  const [editSuv, setEditSuv] = useState(0);
  const [editVan, setEditVan] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch distance rates
      const ratesRes = await apiClient.get<PaginatedResponse<DistanceRateDoc>>('/distance_rates', {
        params: { limit: 100, sort: 'sortOrder' },
      });
      if (ratesRes.data?.docs && ratesRes.data.docs.length > 0) {
        setRates(ratesRes.data.docs);
      }

      // 2. Fetch pricing settings for policies
      try {
        const settingsRes = await apiClient.get<PricingSettings>('/globals/pricing_settings');
        if (settingsRes.data) {
          setPolicies({
            roundTripDiscountText:
              settingsRes.data.roundTripDiscountText || 'Giảm 20% - 30% cho chiều về khi đặt khứ hồi trong ngày',
            waitingFreeMinutes: settingsRes.data.waitingFreeMinutes ?? 30,
            waitingFeePerHour: settingsRes.data.waitingFeePerHour ?? 60000,
            overnightNote:
              settingsRes.data.overnightNote || 'Phụ phí đêm từ 22:00 - 05:00 sáng (+30.000đ – 50.000đ tùy tuyến)',
          });
        }
      } catch {
        // use default policy text
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenEdit = (doc: DistanceRateDoc) => {
    setEditingDoc(doc);
    setModalError(null);
    setEditLabel(doc.label);
    setEditMinKm(doc.minKm);
    setEditMaxKm(doc.maxKm != null ? String(doc.maxKm) : '');
    setEditSedan(doc.sedan5Seats);
    setEditSuv(doc.suv7Seats);
    setEditVan(doc.van16Seats);
  };

  const handleSaveRate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setModalError(null);

    const payload = {
      label: editLabel.trim(),
      minKm: Number(editMinKm),
      maxKm: editMaxKm.trim() ? Number(editMaxKm) : null,
      sedan5Seats: Number(editSedan),
      suv7Seats: Number(editSuv),
      van16Seats: Number(editVan),
    };

    try {
      setIsSaving(true);
      const res = await apiClient.patch(`/distance_rates/${editingDoc.id}`, payload);
      const updatedDoc = res.data?.doc || { ...editingDoc, ...payload };

      setRates((prev) => prev.map((r) => (r.id === editingDoc.id ? { ...r, ...updatedDoc } : r)));
      setSuccessMsg(`Cập nhật đơn giá cho "${editingDoc.label}" thành công!`);
      setEditingDoc(null);
    } catch (err) {
      setModalError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<DistanceRateDoc>[] = [
    {
      key: 'label',
      header: 'Dải cự ly',
      render: (item) => (
        <div>
          <div className="font-semibold text-white">{item.label}</div>
          <div className="text-xs text-slate-400">
            {item.maxKm ? `${item.minKm} km – ${item.maxKm} km` : `Từ ${item.minKm} km trở lên`}
          </div>
        </div>
      ),
    },
    {
      key: 'sedan5Seats',
      header: 'Sedan 5 chỗ (VND/km)',
      render: (item) => (
        <span className="font-medium text-blue-400">{formatVND(item.sedan5Seats)} / km</span>
      ),
    },
    {
      key: 'suv7Seats',
      header: 'SUV 7 chỗ (VND/km)',
      render: (item) => (
        <span className="font-medium text-emerald-400">{formatVND(item.suv7Seats)} / km</span>
      ),
    },
    {
      key: 'van16Seats',
      header: 'Van 16 chỗ (VND/km)',
      render: (item) => (
        <span className="font-medium text-amber-400">{formatVND(item.van16Seats)} / km</span>
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
    <div className="space-y-6">
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
          <Route className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Bảng giá 4 dải km đường dài theo cự ly
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchData}
            isLoading={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Table dải km */}
      <DataTable
        data={rates}
        columns={columns}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        pagination={false}
      />

      {/* Khối hiển thị các chính sách đi kèm */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Giảm giá khứ hồi */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm font-semibold">Giảm giá khứ hồi</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600">{policies.roundTripDiscountText}</p>
          </CardContent>
        </Card>

        {/* 2. Thời gian chờ miễn phí */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm font-semibold">Chờ miễn phí</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">{policies.waitingFreeMinutes} phút</div>
            <p className="text-xs text-slate-500 mt-0.5">Thời gian tài xế đợi ban đầu không tính phí</p>
          </CardContent>
        </Card>

        {/* 3. Phí chờ theo giờ */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-semibold">Phí chờ theo giờ</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-amber-600">{formatVND(policies.waitingFeePerHour)}/giờ</div>
            <p className="text-xs text-slate-500 mt-0.5">Áp dụng sau khi hết thời gian chờ miễn phí</p>
          </CardContent>
        </Card>

        {/* 4. Phụ phí qua đêm */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-600" />
              <CardTitle className="text-sm font-semibold">Phụ phí qua đêm</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600">{policies.overnightNote}</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal chỉnh sửa dải km */}
      {editingDoc && (
        <Modal
          isOpen={true}
          onClose={() => setEditingDoc(null)}
          title={`Sửa đơn giá: ${editingDoc.label}`}
          description="Cập nhật đơn giá theo km cho 3 dòng xe Sedan 5 chỗ, SUV 7 chỗ và Van 16 chỗ."
          size="md"
        >
          <form onSubmit={handleSaveRate} className="space-y-4">
            {modalError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <Input
              label="Tên dải cự ly"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cự ly từ (km)"
                type="number"
                min={0}
                value={editMinKm}
                onChange={(e) => setEditMinKm(Number(e.target.value))}
                required
              />
              <Input
                label="Cự ly đến (km, để trống nếu không giới hạn)"
                type="number"
                min={0}
                value={editMaxKm}
                onChange={(e) => setEditMaxKm(e.target.value)}
                placeholder="Ví dụ: 200"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Đơn giá mỗi km theo dòng xe (VND/km)
              </h4>
              <Input
                label="Sedan 5 chỗ"
                type="number"
                step={500}
                value={editSedan}
                onChange={(e) => setEditSedan(Number(e.target.value))}
                required
              />
              <Input
                label="SUV 7 chỗ"
                type="number"
                step={500}
                value={editSuv}
                onChange={(e) => setEditSuv(Number(e.target.value))}
                required
              />
              <Input
                label="Van 16 chỗ"
                type="number"
                step={500}
                value={editVan}
                onChange={(e) => setEditVan(Number(e.target.value))}
                required
              />
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
                Lưu đơn giá
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
