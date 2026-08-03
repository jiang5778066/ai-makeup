import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/makeup/advice", () => {
  it("does not return fabricated face analysis in the paid beta", async () => {
    const response = await POST();

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      code: "not_available",
      message: "Personalized face analysis is not included in the paid beta."
    });
  });
});
