import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  Mail,
  Send,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Server,
  HelpCircle,
  Eye,
  EyeOff,
  Inbox,
} from "lucide-react";
import { Button } from "@/admin/components/ui/Button";
import { Input } from "@/admin/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/admin/components/ui/Card";
import { apiClient, getApiErrorMessage } from "@/admin/lib/api-client";
import type { NotificationSettings } from "@/admin/types/settings";

export function NotificationSettingsForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [senderName, setSenderName] = useState("Xe Ghép Liên Tỉnh — Tổng đài");
  const [senderEmail, setSenderEmail] = useState("");

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await apiClient.get<NotificationSettings>(
        "/globals/notification_settings"
      );
      if (res.data) {
        const d = res.data;
        setEmailEnabled(Boolean(d.emailEnabled));
        setEmailTo(d.emailTo || "");
        setSmtpHost(d.smtpHost || "smtp.gmail.com");
        setSmtpPort(d.smtpPort ? Number(d.smtpPort) : 587);
        setSmtpSecure(Boolean(d.smtpSecure));
        setSmtpUser(d.smtpUser || "");
        setSmtpPassword(d.smtpPassword || "");
        setSenderName(d.senderName || "Xe Ghép Liên Tỉnh — Tổng đài");
        setSenderEmail(d.senderEmail || "");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: `Không thể nạp cấu hình: ${getApiErrorMessage(err)}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload = {
      emailEnabled,
      emailTo,
      smtpHost,
      smtpPort: Number(smtpPort) || 587,
      smtpSecure,
      smtpUser,
      smtpPassword,
      senderName,
      senderEmail,
    };

    try {
      await apiClient.post("/globals/notification_settings", payload);
      setMessage({
        type: "success",
        text: "Đã lưu thành công cấu hình thông báo email!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: `Lỗi khi lưu cấu hình: ${getApiErrorMessage(err)}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!smtpUser || !smtpPassword) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập đầy đủ Tài khoản SMTP và Mật khẩu ứng dụng trước khi thử nghiệm.",
      });
      return;
    }

    if (!emailTo) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập Email nhận thông báo trước khi gửi thử.",
      });
      return;
    }

    setIsTesting(true);
    setMessage(null);

    try {
      const res = await apiClient.post<{ success: boolean; message: string }>(
        "/v1/notify/test-email",
        {
          emailEnabled,
          emailTo,
          smtpHost,
          smtpPort: Number(smtpPort) || 587,
          smtpSecure,
          smtpUser,
          smtpPassword,
          senderName,
          senderEmail,
        }
      );

      if (res.data?.success) {
        setMessage({
          type: "success",
          text: res.data.message || "Gửi email thử nghiệm thành công! Hãy kiểm tra hòm thư của bạn.",
        });
      } else {
        setMessage({
          type: "error",
          text: res.data?.message || "Gửi email thử thất bại.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(err),
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-600" />
        <span>Đang nạp cấu hình thông báo...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Thông báo trạng thái */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Card 1: Trạng thái & Email người nhận */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-600" />
            <CardTitle>Bật / Tắt & Người nhận thông báo</CardTitle>
          </div>
          <CardDescription>
            Kích hoạt tính năng tự động gửi email thông báo khi có khách đặt xe mới trên website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="emailEnabled"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="emailEnabled"
              className="text-sm font-semibold text-slate-800 cursor-pointer select-none"
            >
              Bật tự động gửi email thông báo khi có đơn đặt xe mới
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Email nhận thông báo <span className="text-red-500">*</span>
            </label>
            <Input
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="admin@xegheplientinh.vn, tongdai@gmail.com"
              required={emailEnabled}
            />
            <p className="text-xs text-slate-500">
              Có thể nhập nhiều email nhận, phân cách nhau bằng dấu phẩy (,) hoặc chấm phẩy (;).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Tên người gửi (Sender Name)
              </label>
              <Input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Xe Ghép Liên Tỉnh — Tổng đài"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email người gửi (From Email - tùy chọn)
              </label>
              <Input
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="Để trống sẽ dùng tài khoản SMTP bên dưới"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Máy chủ SMTP */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <CardTitle>Cấu hình Máy chủ SMTP (Gửi thư)</CardTitle>
          </div>
          <CardDescription>
            Hệ thống hỗ trợ gửi qua Gmail SMTP, Resend SMTP, Brevo, Zoho Mail hoặc bất kỳ máy chủ SMTP nào.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Máy chủ SMTP (Host) <span className="text-red-500">*</span>
              </label>
              <Input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
                required={emailEnabled}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Cổng (Port) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                placeholder="587"
                required={emailEnabled}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="smtpSecure"
              checked={smtpSecure}
              onChange={(e) => setSmtpSecure(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="smtpSecure"
              className="text-xs font-medium text-slate-700 cursor-pointer"
            >
              Sử dụng kết nối bảo mật SSL (thường tích nếu dùng cổng 465; không tích nếu dùng cổng 587 TLS)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Tài khoản / Email đăng nhập SMTP <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="hotro.xegheplientinh@gmail.com"
                required={emailEnabled}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Mật khẩu SMTP / App Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="Nhập 16 ký tự App Password"
                  required={emailEnabled}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Hướng dẫn nhanh cho Gmail */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Hướng dẫn lấy Mật khẩu ứng dụng (App Password) cho Gmail:</span>
        </div>
        <ol className="text-xs space-y-1.5 list-decimal pl-5 text-amber-900/90 leading-relaxed">
          <li>
            Bật <strong>Xác minh 2 bước</strong> cho tài khoản Google / Gmail của bạn nếu chưa bật.
          </li>
          <li>
            Truy cập trang{" "}
            <a
              href="https://myaccount.google.com/apppasswords"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-blue-700 hover:text-blue-900"
            >
              Tạo mật khẩu ứng dụng (Google App Passwords) ↗
            </a>
            .
          </li>
          <li>
            Đặt tên ứng dụng (ví dụ: <code>Xe Ghep Web</code>) và bấm <strong>Tạo</strong>.
          </li>
          <li>
            Google sẽ cung cấp một chuỗi mã 16 chữ số (ví dụ: <code>abcd efgh ijkl mnop</code>). Hãy sao chép chuỗi này và dán vào ô <strong>Mật khẩu SMTP</strong> ở trên.
          </li>
          <li>
            Giữ nguyên Host: <code>smtp.gmail.com</code>, Cổng: <code>587</code>, và bấm <strong>Gửi email thử nghiệm</strong> để xác nhận!
          </li>
        </ol>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleTestEmail}
          disabled={isTesting || isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          {isTesting ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Send className="w-4 h-4 text-blue-600" />
          )}
          <span>Gửi email thử nghiệm</span>
        </Button>

        <Button
          type="submit"
          disabled={isSaving || isTesting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Lưu cấu hình thông báo</span>
        </Button>
      </div>
    </form>
  );
}
