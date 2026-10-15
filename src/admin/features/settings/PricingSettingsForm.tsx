import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  Receipt,
  Clock,
  Moon,
  Calendar,
  AlertTriangle,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { Button } from '@/admin/components/ui/Button';
import { Input } from '@/admin/components/ui/Input';
import { Textarea } from '@/admin/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/admin/components/ui/Card';
import { Badge } from '@/admin/components/ui/Badge';
import { apiClient, getApiErrorMessage } from '@/admin/lib/api-client';
import type { PricingSettings } from '@/admin/types/settings';

export function PricingSettingsForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pricing form state
  const [minLeadTimeMinutes, setMinLeadTimeMinutes] = useState<number>(15);
  const [freeCancelMinutes, setFreeCancelMinutes] = useState<number>(30);
  const [maxPassengersPerShareTrip, setMaxPassengersPerShareTrip] = useState<number>(3);
  const [returningCustomerDiscountPercent, setReturningCustomerDiscountPercent] = useState<number>(5);

  // priceValidUntil (BẮT BUỘC THEO CONSTITUTION)
  const [priceValidUntil, setPriceValidUntil] = useState<string>('2026-12-31');
  const [priceValidUntilWarning, setPriceValidUntilWarning] = useState<string | null>(null);

  // Phụ phí đêm & Lễ tết
  const [overnightNote, setOvernightNote] = useState<string>(
    'Phụ phí đêm áp dụng từ 22:00 đến 05:00 sáng (+30.000đ – 50.000đ tùy cung đường).'
  );
  const [overnightPhone, setOvernightPhone] = useState<string>('0858.911.247');
  const [holidayNote, setHolidayNote] = useState<string>(
    'Dịp lễ Tết (Tết Nguyên Đán, 30/4 - 1/5) phụ thu theo thỏa thuận trước khi xác nhận.'
  );

  // Thời gian chờ & Vé cầu đường
  const [waitingFreeMinutes, setWaitingFreeMinutes] = useState<number>(30);
  const [waitingFeePerHour, setWaitingFeePerHour] = useState<number>(60000);
  const [roundTripDiscountText, setRoundTripDiscountText] = useState<string>(
    'Giảm ngay 20% - 30% cho chiều về khi đặt khứ hồi trong ngày.'
  );
  const [tollsNote, setTollsNote] = useState<string>(
    'Giá cước đã bao gồm vé cầu đường cao tốc chuẩn theo thỏa thuận ban đầu.'
  );

  // Gửi hàng
  const [parcelFromPrice, setParcelFromPrice] = useState<number>(150000);
  const [parcelDeliveryText, setParcelDeliveryText] = useState<string>('2–4 giờ');

  // Tính toán cảnh báo hạn áp dụng bảng giá
  const calculateExpiryStatus = (dateStr: string) => {
    if (!dateStr) return { status: 'expired', text: 'Chưa thiết lập hạn giá (BẮT BUỘC!)' };
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return { status: 'invalid', text: 'Ngày không hợp lệ' };

    const now = new Date();
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', text: `ĐÃ HẾT HẠN (${Math.abs(diffDays)} ngày trước). Cần cập nhật ngay!` };
    }
    if (diffDays <= 30) {
      return { status: 'warning', text: `Sắp hết hạn trong ${diffDays} ngày!` };
    }
    return { status: 'valid', text: `Còn hiệu lực ${diffDays} ngày (hết hạn ngày ${dateStr})` };
  };

  const expiryInfo = calculateExpiryStatus(priceValidUntil);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<PricingSettings>('/globals/pricing_settings');
      const data = res.data;
      if (data) {
        if (data.minLeadTimeMinutes != null) setMinLeadTimeMinutes(data.minLeadTimeMinutes);
        if (data.freeCancelMinutes != null) setFreeCancelMinutes(data.freeCancelMinutes);
        if (data.maxPassengersPerShareTrip != null) setMaxPassengersPerShareTrip(data.maxPassengersPerShareTrip);
        if (data.returningCustomerDiscountPercent != null)
          setReturningCustomerDiscountPercent(data.returningCustomerDiscountPercent);

        if (data.priceValidUntil) {
          // Chuẩn hóa định dạng YYYY-MM-DD
          const formatted = String(data.priceValidUntil).slice(0, 10);
          setPriceValidUntil(formatted);
        }
        if (data.priceValidUntilWarning) {
          setPriceValidUntilWarning(data.priceValidUntilWarning);
        }

        if (data.overnightNote != null) setOvernightNote(data.overnightNote);
        if (data.overnightPhone != null) setOvernightPhone(data.overnightPhone);
        if (data.holidayNote != null) setHolidayNote(data.holidayNote);

        if (data.waitingFreeMinutes != null) setWaitingFreeMinutes(data.waitingFreeMinutes);
        if (data.waitingFeePerHour != null) setWaitingFeePerHour(data.waitingFeePerHour);
        if (data.roundTripDiscountText != null) setRoundTripDiscountText(data.roundTripDiscountText);
        if (data.tollsNote != null) setTollsNote(data.tollsNote);

        if (data.parcelFromPrice != null) setParcelFromPrice(data.parcelFromPrice);
        if (data.parcelDeliveryText != null) setParcelDeliveryText(data.parcelDeliveryText);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // KIỂM TRA BẮT BUỘC priceValidUntil THEO CONSTITUTION
    if (!priceValidUntil || !priceValidUntil.trim()) {
      setError('Hạn áp dụng bảng giá (priceValidUntil) là bắt buộc theo quy định hệ thống.');
      return;
    }

    if (minLeadTimeMinutes < 0) {
      setError('Thời gian đặt trước tối thiểu không thể là số âm.');
      return;
    }

    const payload: Partial<PricingSettings> = {
      priceValidUntil: priceValidUntil.trim(),
      minLeadTimeMinutes: Number(minLeadTimeMinutes),
      freeCancelMinutes: Number(freeCancelMinutes),
      maxPassengersPerShareTrip: Number(maxPassengersPerShareTrip),
      returningCustomerDiscountPercent: Number(returningCustomerDiscountPercent),
      overnightNote: overnightNote.trim() || null,
      overnightPhone: overnightPhone.trim() || null,
      holidayNote: holidayNote.trim() || null,
      waitingFreeMinutes: Number(waitingFreeMinutes),
      waitingFeePerHour: Number(waitingFeePerHour),
      roundTripDiscountText: roundTripDiscountText.trim() || null,
      tollsNote: tollsNote.trim() || null,
      parcelFromPrice: Number(parcelFromPrice),
      parcelDeliveryText: parcelDeliveryText.trim() || null,
    };

    try {
      setIsSaving(true);
      await apiClient.post('/globals/pricing_settings', payload);
      setSuccessMessage('Cập nhật cấu hình giá chung và chính sách thành công!');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
        <p className="text-sm">Đang tải cấu hình giá...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông báo kết quả */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* 1. Hạn áp dụng bảng giá (Bắt buộc theo Hiến pháp SCH-1) */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <div>
                <CardTitle className="text-amber-900">
                  Hạn áp dụng Bảng giá (Constitution SCH-1)
                </CardTitle>
                <CardDescription>
                  Bắt buộc niêm yết công khai hạn hiệu lực giá theo quy định minh bạch cước vận tải.
                </CardDescription>
              </div>
            </div>
            {expiryInfo.status === 'expired' && (
              <Badge variant="destructive" className="bg-rose-500 text-white animate-pulse">
                {expiryInfo.text}
              </Badge>
            )}
            {expiryInfo.status === 'warning' && (
              <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {expiryInfo.text}
              </Badge>
            )}
            {expiryInfo.status === 'valid' && (
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {expiryInfo.text}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Ngày hết hạn bảng giá (YYYY-MM-DD)"
                type="date"
                value={priceValidUntil}
                onChange={(e) => setPriceValidUntil(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Quy định: Mỗi bảng giá cước phải có hạn áp dụng rõ ràng để bảo vệ quyền lợi người đặt xe.
              </p>
            </div>
            {priceValidUntilWarning && (
              <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-semibold">Cảnh báo hệ thống:</span> {priceValidUntilWarning}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Cấu hình Thời gian đặt & Điều phối */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <CardTitle>Thời gian Đặt trước & Quy định Chuyến</CardTitle>
          </div>
          <CardDescription>
            Quy định ngưỡng thời gian tối thiểu trước giờ đón và quyền miễn phí hủy chuyến.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Thời gian đặt trước tối thiểu (phút)"
              type="number"
              min={0}
              value={minLeadTimeMinutes}
              onChange={(e) => setMinLeadTimeMinutes(Number(e.target.value))}
              required
            />
            <Input
              label="Miễn phí hủy trước giờ đón (phút)"
              type="number"
              min={0}
              value={freeCancelMinutes}
              onChange={(e) => setFreeCancelMinutes(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Số khách tối đa trên 1 chuyến ghép"
              type="number"
              min={1}
              max={16}
              value={maxPassengersPerShareTrip}
              onChange={(e) => setMaxPassengersPerShareTrip(Number(e.target.value))}
              required
            />
            <Input
              label="Giảm giá khách hàng thân thiết (%)"
              type="number"
              min={0}
              max={100}
              value={returningCustomerDiscountPercent}
              onChange={(e) => setReturningCustomerDiscountPercent(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Phụ phí Đêm & Lễ Tết */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <CardTitle>Phụ phí Đêm, Lễ Tết & Khẩn cấp</CardTitle>
          </div>
          <CardDescription>
            Thông báo phụ thu chuyến chạy đêm hoặc các ngày lễ cao điểm trong năm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Chính sách & Phụ phí chạy đêm"
            rows={2}
            value={overnightNote}
            onChange={(e) => setOvernightNote(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Số hotline tổng đài hỗ trợ đêm"
              placeholder="0858.911.247"
              value={overnightPhone}
              onChange={(e) => setOvernightPhone(e.target.value)}
            />
          </div>

          <Textarea
            label="Chính sách phụ thu dịp Lễ, Tết"
            rows={2}
            value={holidayNote}
            onChange={(e) => setHolidayNote(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* 4. Thời gian chờ, Khứ hồi & Vé cầu đường */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <CardTitle>Thời gian chờ, Khứ hồi & Phí cầu đường</CardTitle>
          </div>
          <CardDescription>
            Quy định phí phát sinh khi tài xế chờ khách và ưu đãi chiều về.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Thời gian chờ miễn phí (phút)"
              type="number"
              min={0}
              value={waitingFreeMinutes}
              onChange={(e) => setWaitingFreeMinutes(Number(e.target.value))}
            />
            <Input
              label="Phí chờ phát sinh theo giờ (VND/giờ)"
              type="number"
              min={0}
              step={10000}
              value={waitingFeePerHour}
              onChange={(e) => setWaitingFeePerHour(Number(e.target.value))}
            />
          </div>

          <Textarea
            label="Chính sách giảm giá chuyến khứ hồi"
            rows={2}
            value={roundTripDiscountText}
            onChange={(e) => setRoundTripDiscountText(e.target.value)}
          />

          <Textarea
            label="Ghi chú vé cầu đường cao tốc"
            rows={2}
            value={tollsNote}
            onChange={(e) => setTollsNote(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* 5. Dịch vụ Gửi hàng nhanh */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <CardTitle>Dịch vụ Gửi hàng theo xe</CardTitle>
          </div>
          <CardDescription>
            Bảng giá cơ sở cho dịch vụ gửi bưu kiện, hàng hóa kèm chuyến xe ghép.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Giá gửi hàng khởi điểm (VND)"
              type="number"
              min={0}
              step={10000}
              value={parcelFromPrice}
              onChange={(e) => setParcelFromPrice(Number(e.target.value))}
            />
            <Input
              label="Thời gian giao hàng cam kết"
              placeholder="2–4 giờ"
              value={parcelDeliveryText}
              onChange={(e) => setParcelDeliveryText(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Thanh hành động lưu */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 p-4 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg">
        <Button type="submit" isLoading={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          Lưu cấu hình Giá chung
        </Button>
      </div>
    </form>
  );
}
