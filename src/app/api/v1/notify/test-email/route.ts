import { NextResponse } from "next/server";
import { getPayloadInstance } from "@/lib/api/ctx";
import {
  createSmtpTransporter,
  type NotificationSettingsDoc,
} from "@/lib/notify/email";

export async function POST(req: Request) {
  try {
    const payload = await getPayloadInstance();

    // Xác thực quyền admin từ request
    const authResult = await payload.auth({
      headers: req.headers,
    });

    if (!authResult || !authResult.user || (authResult.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Partial<NotificationSettingsDoc>;

    // Lấy cấu hình gửi lên từ body, nếu thiếu thì đọc từ DB
    const dbSettings = (await payload.findGlobal({
      slug: "notification_settings",
      overrideAccess: true,
    })) as NotificationSettingsDoc;

    const settings: NotificationSettingsDoc = {
      smtpHost: body.smtpHost ?? dbSettings.smtpHost,
      smtpPort: body.smtpPort ?? dbSettings.smtpPort,
      smtpSecure: body.smtpSecure ?? dbSettings.smtpSecure,
      smtpUser: body.smtpUser ?? dbSettings.smtpUser,
      smtpPassword: body.smtpPassword ?? dbSettings.smtpPassword,
      senderName: body.senderName ?? dbSettings.senderName,
      senderEmail: body.senderEmail ?? dbSettings.senderEmail,
      emailTo: body.emailTo ?? dbSettings.emailTo,
    };

    if (!settings.smtpUser || !settings.smtpPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập đầy đủ Tài khoản SMTP và Mật khẩu ứng dụng trước khi gửi thử.",
        },
        { status: 400 }
      );
    }

    const recipients = (settings.emailTo || "")
      .split(/[,;\n]/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập ít nhất một địa chỉ Email nhận thông báo.",
        },
        { status: 400 }
      );
    }

    const transporter = createSmtpTransporter(settings);

    // 1. Kiểm tra kết nối SMTP
    await transporter.verify();

    // 2. Gửi thử nghiệm
    const senderName = settings.senderName?.trim() || "Xe Ghép Liên Tỉnh";
    const senderEmail = settings.senderEmail?.trim() || settings.smtpUser?.trim();
    const from = senderEmail
      ? `"${senderName}" <${senderEmail}>`
      : `"${senderName}" <${settings.smtpUser}>`;

    const nowStr = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    await transporter.sendMail({
      from,
      to: recipients.join(", "),
      subject: `[KIỂM TRA] Cấu hình email thông báo đơn đặt xe thành công!`,
      text: `Xin chào!\n\nĐây là email kiểm tra từ hệ thống quản trị Xe Ghép Liên Tỉnh.\nMáy chủ SMTP đã kết nối và gửi thư thành công lúc: ${nowStr}.\n\nHệ thống đã sẵn sàng gửi thông báo khi có khách đặt xe mới!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff;">
          <h2 style="color: #16a34a; margin-top: 0;">🎉 Kết nối máy chủ Email thành công!</h2>
          <p>Xin chào quản trị viên,</p>
          <p>Đây là email kiểm tra được gửi từ hệ thống quản trị <strong>Xe Ghép Liên Tỉnh</strong>.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin: 16px 0; color: #166534; font-size: 14px;">
            ✅ <strong>Trạng thái:</strong> Máy chủ SMTP hoạt động hoàn hảo.<br>
            ⏰ <strong>Thời gian gửi:</strong> ${nowStr}<br>
            📬 <strong>Gửi đến:</strong> ${recipients.join(", ")}
          </div>
          <p style="font-size: 14px; color: #64748b;">Kể từ bây giờ, mỗi khi có khách hàng đặt xe trên website, hệ thống sẽ tự động gửi email thông báo chi tiết về hòm thư này.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Đã gửi thành công email thử nghiệm tới: ${recipients.join(", ")}`,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[notify/test-email]", errorMsg);
    return NextResponse.json(
      {
        success: false,
        message: `Lỗi kết nối máy chủ SMTP: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}
