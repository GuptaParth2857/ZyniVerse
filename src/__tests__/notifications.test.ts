import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: { create: vi.fn() },
    notificationPreference: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/push", () => ({
  sendPushToUser: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";

const mockedFind = vi.mocked(prisma.notificationPreference.findUnique);
const mockedCreate = vi.mocked(prisma.notification.create);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createNotification preference gate", () => {
  it("creates notification when no preference row exists", async () => {
    mockedFind.mockResolvedValue(null);
    mockedCreate.mockResolvedValue({ id: "n1" } as never);

    const result = await createNotification({
      userId: "u1",
      type: "FOLLOW",
      title: "New follower",
    });

    expect(mockedCreate).toHaveBeenCalledTimes(1);
    expect(result).not.toBeNull();
  });

  it("skips creation when the type is disabled", async () => {
    mockedFind.mockResolvedValue({
      aiEnabled: true,
      followEnabled: false,
      commentEnabled: true,
      reviewEnabled: true,
      eventEnabled: true,
      systemEnabled: true,
      airingEnabled: true,
    } as never);

    const result = await createNotification({
      userId: "u1",
      type: "FOLLOW",
      title: "New follower",
    });

    expect(mockedCreate).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("creates notification when the type is enabled", async () => {
    mockedFind.mockResolvedValue({
      aiEnabled: true,
      followEnabled: true,
      commentEnabled: true,
      reviewEnabled: true,
      eventEnabled: true,
      systemEnabled: true,
      airingEnabled: true,
    } as never);
    mockedCreate.mockResolvedValue({ id: "n2" } as never);

    await createNotification({ userId: "u1", type: "REVIEW", title: "New review" });

    expect(mockedCreate).toHaveBeenCalledTimes(1);
    expect(sendPushToUser).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ title: "New review" })
    );
  });

  it("blocks disabled AIRING alerts", async () => {
    mockedFind.mockResolvedValue({
      aiEnabled: true,
      followEnabled: true,
      commentEnabled: true,
      reviewEnabled: true,
      eventEnabled: true,
      systemEnabled: true,
      airingEnabled: false,
    } as never);

    const result = await createNotification({
      userId: "u1",
      type: "AIRING",
      title: "Episode aired",
    });

    expect(result).toBeNull();
  });

  it("is not blocked by unrelated disabled types", async () => {
    mockedFind.mockResolvedValue({
      aiEnabled: true,
      followEnabled: false,
      commentEnabled: false,
      reviewEnabled: false,
      eventEnabled: false,
      systemEnabled: false,
      airingEnabled: false,
    } as never);
    mockedCreate.mockResolvedValue({ id: "n3" } as never);

    const result = await createNotification({
      userId: "u1",
      type: "IMPORT",
      title: "Import completed",
    });

    expect(result).not.toBeNull();
  });
});