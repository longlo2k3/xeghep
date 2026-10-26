import nodemailer from "nodemailer";
import { getPayloadInstance } from "../api/ctx";

export interface BookingNotificationData {
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  serviceType?: string | null;
  rideType?: string | null;
  vehicleType: string;
  passengerCount?: number | null;
  route?: { name?: string | null; slug?: string | null } | null;
  estimatedPriceFormatted?: string | null;
  note?: string | null;
}

export interface NotificationSettingsDoc {
  emailEnabled?: boolean | null;
  emailTo?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean | null;
  smtpUser?: string | null;
  smtpPassword?: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
}

const VEHICLE_LABELS: Record<string, string> = {
  "4cho": "Xe 4 chỗ",
  "5cho": "Xe 5 chỗ",
  "7cho": "Xe 7 chỗ",
  "16cho": "Xe 16 chỗ",
  guihang: "Gửi hàng",
};

const RIDE_LABELS: Record<string, string> = {
  ghep: "Đi ghép",
  bao: "Bao trọn xe",
};

export function createSmtpTransporter(settings: NotificationSettingsDoc) {
  const host = settings.smtpHost?.trim() || "smtp.gmail.com";
  const port = Number(settings.smtpPort) || 587;
  const secure = Boolean(settings.smtpSecure) || port === 465;
  const user = settings.smtpUser?.trim();
  const pass = settings.smtpPassword?.trim();

  if (!user || !pass) {
    throw new Error("Chưa cấu hình tài khoản hoặc mật khẩu SMTP.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Chấp nhận TLS certificates linh hoạt
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export function formatDateTime(isoOrDate: string): string {
  try {
    const d = new Date(isoOrDate);
    if (isNaN(d.getTime())) return isoOrDate;
    return d.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoOrDate;
  }
}

export function buildBookingEmailHtml(booking: BookingNotificationData): string {
  const vehicleText = VEHICLE_LABELS[booking.vehicleType] || booking.vehicleType;
  const rideText = booking.rideType ? RIDE_LABELS[booking.rideType] || booking.rideType : "—";
  const formattedTime = formatDateTime(booking.pickupDateTime);
  const routeText = booking.route?.name || "Tùy chọn theo yêu cầu";
  const passengers = booking.passengerCount ? `${booking.passengerCount} người` : "—";
  const priceText = booking.estimatedPriceFormatted || "Liên hệ báo giá";

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đơn đặt xe mới - ${booking.bookingCode}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-code { display: inline-block; background: #ffffff; color: #dc2626; font-size: 15px; font-weight: 900; padding: 4px 14px; border-radius: 9999px; margin-top: 6px; }
    .content { padding: 24px; }
    .call-box { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; text-align: center; }
    .call-btn { display: inline-block; background: #dc2626; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 17px; padding: 10px 22px; border-radius: 8px; margin-top: 8px; }
    .table-details { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table-details td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top; }
    .table-details td.label { width: 34%; font-weight: 600; color: #64748b; }
    .table-details td.value { font-weight: 500; color: #0f172a; }
    .note-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #78350f; margin-bottom: 20px; }
    .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚖 CÓ ĐƠN ĐẶT XE MỚI</h1>
      <div><span class="badge-code">Mã đơn: ${booking.bookingCode}</span></div>
    </div>

    <div class="content">
      <div class="call-box">
        <div style="font-size: 15px; font-weight: 700; color: #991b1b;">
          Khách hàng: ${booking.customerName}
        </div>
        <div style="font-size: 13px; color: #7f1d1d; margin-top: 2px;">
          Bấm nút bên dưới để gọi ngay cho khách:
        </div>
        <a href="tel:${booking.customerPhone}" class="call-btn">
          📞 Gọi ngay: ${booking.customerPhone}
        </a>
      </div>

      <table class="table-details">
        <tr>
          <td class="label">Tuyến đường:</td>
          <td class="value"><strong style="color: #dc2626;">${routeText}</strong></td>
        </tr>
        <tr>
          <td class="label">Điểm đón:</td>
          <td class="value"><strong>${booking.pickupLocation}</strong></td>
        </tr>
        <tr>
          <td class="label">Điểm đến:</td>
          <td class="value"><strong>${booking.dropoffLocation}</strong></td>
        </tr>
        <tr>
          <td class="label">Thời gian đón:</td>
          <td class="value"><strong style="color: #b91c1c;">${formattedTime}</strong></td>
        </tr>
        <tr>
          <td class="label">Loại xe:</td>
          <td class="value">${vehicleText}</td>
        </tr>
        <tr>
          <td class="label">Hình thức đi:</td>
          <td class="value">${rideText} (${passengers})</td>
        </tr>
        <tr>
          <td class="label">Giá dự kiến:</td>
          <td class="value"><strong style="color: #059669;">${priceText}</strong></td>
        </tr>
      </table>

      ${
        booking.note
          ? `<div class="note-box"><strong>Ghi chú của khách:</strong> ${booking.note}</div>`
          : ""
      }
    </div>

    <div class="footer">
      Email thông báo tự động từ hệ thống <strong>Xe Ghép Liên Tỉnh</strong>.<br>
      Vui lòng liên hệ và xác nhận với khách hàng trong thời gian sớm nhất.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Gửi email thông báo đơn đặt xe mới tới danh sách quản trị viên.
 * Hoàn toàn chạy nền (non-blocking), bắt lỗi an toàn để không làm chậm API tạo đơn của khách.
 */
export async function sendBookingNotificationEmail(
  booking: BookingNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = await getPayloadInstance();
    const settings = (await payload.findGlobal({
      slug: "notification_settings",
      overrideAccess: true,
    })) as NotificationSettingsDoc;

    if (!settings || !settings.emailEnabled) {
      return { success: false, error: "Email notification is disabled" };
    }

    const recipients = (settings.emailTo || "")
      .split(/[,;\n]/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    if (recipients.length === 0) {
      console.warn("[EmailNotify] Bật gửi mail nhưng chưa điền emailTo.");
      return { success: false, error: "No recipient email configured" };
    }

    const transporter = createSmtpTransporter(settings);
    const senderName = settings.senderName?.trim() || "Xe Ghép Liên Tỉnh";
    const senderEmail = settings.senderEmail?.trim() || settings.smtpUser?.trim();

    const from = senderEmail
      ? `"${senderName}" <${senderEmail}>`
      : `"${senderName}" <${settings.smtpUser}>`;

    const html = buildBookingEmailHtml(booking);
    const text = `
ĐƠN ĐẶT XE MỚI: ${booking.bookingCode}
- Khách hàng: ${booking.customerName} (${booking.customerPhone})
- Tuyến: ${booking.route?.name || "Tùy chọn"}
- Đón: ${booking.pickupLocation}
- Đến: ${booking.dropoffLocation}
- Giờ đón: ${formatDateTime(booking.pickupDateTime)}
- Loại xe: ${VEHICLE_LABELS[booking.vehicleType] || booking.vehicleType}
- Giá dự kiến: ${booking.estimatedPriceFormatted || "Liên hệ báo giá"}
- Ghi chú: ${booking.note || "Không có"}
    `.trim();

    await transporter.sendMail({
      from,
      to: recipients.join(", "),
      subject: `[ĐƠN MỚI] ${booking.bookingCode} - ${booking.customerName} (${booking.pickupLocation} → ${booking.dropoffLocation})`,
      text,
      html,
    });

    console.info(`[EmailNotify] Đã gửi thông báo đơn ${booking.bookingCode} tới ${recipients.join(", ")}`);
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[EmailNotify] Lỗi khi gửi email:", msg);
    return { success: false, error: msg };
  }
}
