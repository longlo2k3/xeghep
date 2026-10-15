import { describe, expect, it } from "vitest";

import {
  anonymizeEmail,
  anonymizeName,
  buildAnonymizedData,
  maskPhone,
  scrubNotes,
} from "../src/seed/anonymizePii";

describe("T086 — anonymize PII (FR-B08)", () => {
  it("maskPhone giữ 4 số cuối", () => {
    expect(maskPhone("0962298293")).toBe("******8293");
    expect(maskPhone("+84962298293")).toBe("*******8293");
    expect(maskPhone("0962.298.293")).toBe("******8293");
  });

  it("maskPhone idempotent (chạy lại không đổi)", () => {
    expect(maskPhone("******8293")).toBeNull();
    expect(maskPhone("***")).toBeNull();
    expect(maskPhone(null)).toBeNull();
  });

  it("anonymizeName theo mẫu `Khách hàng ****` và idempotent", () => {
    expect(anonymizeName("Nguyễn Văn A")).toBe("Khách hàng ****");
    expect(anonymizeName("Khách hàng ****")).toBeNull();
    expect(anonymizeName("")).toBeNull();
  });

  it("anonymizeEmail redacted và idempotent", () => {
    expect(anonymizeEmail("khach@example.com")).toBe("redacted@redacted.invalid");
    expect(anonymizeEmail("redacted@redacted.invalid")).toBeNull();
    expect(anonymizeEmail(null)).toBeNull();
  });

  it("scrubNotes ẩn dãy số giống SĐT trong ghi chú, idempotent", () => {
    expect(scrubNotes("Gọi lại SĐT 0962 298 293 giúp mình")).toBe(
      "Gọi lại SĐT *** giúp mình",
    );
    expect(scrubNotes("Gọi lại SĐT *** giúp mình")).toBeNull();
    expect(scrubNotes("Đón tại bến xe Miền Đông")).toBeNull();
  });

  it("buildAnonymizedData chỉ trả field cần sửa, null khi đã ẩn hết", () => {
    const data = buildAnonymizedData({
      id: 1,
      customerName: "Trần Thị B",
      customerPhone: "0987654321",
      note: "SĐT 0987654321",
      dispatcherNote: null,
    });
    expect(data).toMatchObject({
      customerName: "Khách hàng ****",
      customerPhone: "******4321",
      note: "SĐT ***",
    });

    expect(
      buildAnonymizedData({
        id: 2,
        customerName: "Khách hàng ****",
        customerPhone: "******4321",
        note: "SĐT ***",
      }),
    ).toBeNull();
  });
});
