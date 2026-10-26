import { describe, it, expect } from "vitest";
import {
  buildBookingEmailHtml,
  formatDateTime,
  createSmtpTransporter,
  type BookingNotificationData,
} from "../src/lib/notify/email";

describe("Email Notification Module", () => {
  it("formats date-time correctly", () => {
    const formatted = formatDateTime("2026-10-26T14:30:00.000Z");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });

  it("builds clean and complete HTML for a booking notification", () => {
    const booking: BookingNotificationData = {
      bookingCode: "XG-261026-A1B2C3",
      customerName: "Nguyễn Văn A",
      customerPhone: "0962298293",
      pickupLocation: "123 Cầu Giấy, Hà Nội",
      dropoffLocation: "Hạ Long, Quảng Ninh",
      pickupDateTime: "2026-10-27T08:00:00.000Z",
      vehicleType: "4cho",
      rideType: "ghep",
      passengerCount: 2,
      estimatedPriceFormatted: "400.000đ",
      route: { name: "Hà Nội - Hạ Long", slug: "ha-noi-ha-long" },
      note: "Có 1 vali to và đón đúng giờ",
    };

    const html = buildBookingEmailHtml(booking);

    expect(html).toContain("XG-261026-A1B2C3");
    expect(html).toContain("Nguyễn Văn A");
    expect(html).toContain("0962298293");
    expect(html).toContain("tel:0962298293");
    expect(html).toContain("123 Cầu Giấy, Hà Nội");
    expect(html).toContain("Hạ Long, Quảng Ninh");
    expect(html).toContain("Hà Nội - Hạ Long");
    expect(html).toContain("Xe 4 chỗ");
    expect(html).toContain("Đi ghép (2 người)");
    expect(html).toContain("400.000đ");
    expect(html).toContain("Có 1 vali to và đón đúng giờ");
  });

  it("throws clear error when SMTP credentials are missing", () => {
    expect(() => {
      createSmtpTransporter({
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpUser: "",
        smtpPassword: "",
      });
    }).toThrow("Chưa cấu hình tài khoản hoặc mật khẩu SMTP.");
  });
});
