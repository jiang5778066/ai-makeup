import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerationRows = vi.fn();
const mockDeleteObject = vi.fn();
const mockDeleteAuthUser = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: () => ({
      from: () => ({ where: () => mockGenerationRows() })
    })
  }
}));

vi.mock("@/lib/storage", () => ({
  R2_BUCKET_ORIGINALS: "originals",
  R2_BUCKET_RESULTS: "results",
  deleteObject: (...args: unknown[]) => mockDeleteObject(...args)
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: () => ({
    auth: { admin: { deleteUser: (...args: unknown[]) => mockDeleteAuthUser(...args) } }
  })
}));

beforeEach(() => {
  mockGenerationRows.mockReset();
  mockDeleteObject.mockReset();
  mockDeleteAuthUser.mockReset();
  mockDeleteObject.mockResolvedValue(undefined);
  mockDeleteAuthUser.mockResolvedValue({ error: null });
});

describe("deleteUserData", () => {
  it("deletes original, rendered and result objects before deleting the auth user", async () => {
    mockGenerationRows.mockResolvedValue([{
      uploadKey: "user_1/original.jpg",
      renderedUploadKey: "user_1/rendered.png",
      resultKey: "results/gen_1.jpg"
    }]);
    const { deleteUserData } = await import("./account-deletion");

    const result = await deleteUserData("user_1");

    expect(mockDeleteObject).toHaveBeenCalledWith("originals", "user_1/original.jpg");
    expect(mockDeleteObject).toHaveBeenCalledWith("originals", "user_1/rendered.png");
    expect(mockDeleteObject).toHaveBeenCalledWith("results", "results/gen_1.jpg");
    expect(mockDeleteAuthUser).toHaveBeenCalledWith("user_1");
    expect(mockDeleteObject.mock.invocationCallOrder.at(-1)).toBeLessThan(
      mockDeleteAuthUser.mock.invocationCallOrder[0]
    );
    expect(result).toEqual({ deletedGenerations: 1, deletedObjects: 3 });
  });

  it("does not delete the auth user when storage cleanup fails", async () => {
    mockGenerationRows.mockResolvedValue([{
      uploadKey: "user_1/original.jpg",
      renderedUploadKey: null,
      resultKey: null
    }]);
    mockDeleteObject.mockRejectedValueOnce(new Error("r2_failed"));
    const { deleteUserData } = await import("./account-deletion");

    await expect(deleteUserData("user_1")).rejects.toThrow("r2_failed");

    expect(mockDeleteAuthUser).not.toHaveBeenCalled();
  });
});
