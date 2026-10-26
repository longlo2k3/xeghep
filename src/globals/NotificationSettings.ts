import type { GlobalConfig } from "payload";
import { adminWrite, isAuthenticated } from "../collections/shared/access";

export const NotificationSettings: GlobalConfig = {
  slug: "notification_settings",
  access: {
    read: isAuthenticated,
    update: adminWrite,
  },
  admin: {
    description: "Cấu hình gửi thông báo email khi có đơn đặt xe mới (spec 4.2.10).",
  },
  fields: [
    {
      name: "emailEnabled",
      type: "checkbox",
      label: "Bật gửi email thông báo khi có khách đặt xe",
      defaultValue: false,
    },
    {
      name: "emailTo",
      type: "text",
      label: "Danh sách email nhận thông báo",
      admin: {
        description: "Nhập các địa chỉ email nhận thông báo, cách nhau bằng dấu phẩy (ví dụ: admin@xeghep.vn, tongdai@gmail.com).",
      },
    },
    {
      name: "smtpHost",
      type: "text",
      label: "Máy chủ SMTP (Host)",
      defaultValue: "smtp.gmail.com",
      admin: {
        description: "Ví dụ: smtp.gmail.com (Gmail), smtp.resend.com, smtp.zoho.com, smtp-relay.brevo.com",
      },
    },
    {
      name: "smtpPort",
      type: "number",
      label: "Cổng SMTP (Port)",
      defaultValue: 587,
      admin: {
        description: "Thường dùng: 587 (TLS/STARTTLS) hoặc 465 (SSL).",
      },
    },
    {
      name: "smtpSecure",
      type: "checkbox",
      label: "Bật kết nối bảo mật SSL (chọn nếu dùng cổng 465)",
      defaultValue: false,
    },
    {
      name: "smtpUser",
      type: "text",
      label: "Tài khoản / Email đăng nhập SMTP",
      admin: {
        description: "Địa chỉ email dùng để gửi thư (ví dụ: hotro.xegheplientinh@gmail.com).",
      },
    },
    {
      name: "smtpPassword",
      type: "text",
      label: "Mật khẩu SMTP / Mật khẩu ứng dụng (App Password)",
      admin: {
        description: "Lưu ý với Gmail: Bắt buộc dùng Mật khẩu ứng dụng 16 chữ số (App Password), không dùng mật khẩu cá nhân chính.",
      },
    },
    {
      name: "senderName",
      type: "text",
      label: "Tên người gửi (Sender Name)",
      defaultValue: "Xe Ghép Liên Tỉnh — Tổng đài",
    },
    {
      name: "senderEmail",
      type: "text",
      label: "Email người gửi (From Email)",
      admin: {
        description: "Để trống sẽ tự động lấy theo Tài khoản đăng nhập SMTP.",
      },
    },
    {
      name: "telegramEnabled",
      type: "checkbox",
      label: "Bật thông báo Telegram",
      defaultValue: false,
    },
    {
      name: "telegramBotToken",
      type: "text",
      label: "Telegram Bot Token",
    },
    {
      name: "telegramChatId",
      type: "text",
      label: "Telegram Chat ID",
    },
  ],
};
