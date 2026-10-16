import { describe, expect, it } from "vitest";

import { BOOKING_ACTIVITY_RECORDS } from "@/components/layout/BookingActivityToast";

describe("BookingActivityToast data", () => {
  it("contains ten confirmed illustrative booking records", () => {
    expect(BOOKING_ACTIVITY_RECORDS).toHaveLength(10);
    expect(
      BOOKING_ACTIVITY_RECORDS.every(
        (record) => record.status === "Đã xác nhận",
      ),
    ).toBe(true);
  });

  it("masks every illustrative phone number", () => {
    expect(
      BOOKING_ACTIVITY_RECORDS.every((record) => record.phone.includes("•")),
    ).toBe(true);
  });
});
