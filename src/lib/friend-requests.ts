import { prisma } from "./prisma";
import { createNotification } from "./notifications";

export async function sendFriendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) throw new Error("Cannot send request to yourself");

  const [sender, existing] = await Promise.all([
    prisma.user.findUnique({ where: { id: senderId }, select: { username: true } }),
    prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    }),
  ]);
  if (existing) throw new Error("Request already sent");

  const reverse = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } },
  });
  if (reverse?.status === "accepted") throw new Error("Already friends");
  if (reverse?.status === "pending") {
    await prisma.friendRequest.update({
      where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } },
      data: { status: "accepted" },
    });
    const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { username: true } });
    await Promise.all([
      createNotification({
        userId: senderId,
        type: "FRIEND",
        title: `You and @${receiver?.username ?? "them"} are now friends`,
        link: "/friends",
      }),
      createNotification({
        userId: receiverId,
        type: "FRIEND",
        title: `You and @${sender?.username ?? "them"} are now friends`,
        link: "/friends",
      }),
    ]);
    return { status: "accepted" };
  }

  await prisma.friendRequest.create({
    data: { senderId, receiverId, status: "pending" },
  });
  await createNotification({
    userId: receiverId,
    type: "FRIEND",
    title: `@${sender?.username ?? "Someone"} sent you a friend request`,
    body: "Accept or decline it from the Friends page.",
    link: "/friends",
  });
  return { status: "pending" };
}

export async function respondToRequest(requestId: string, userId: string, accept: boolean) {
  const req = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!req || req.receiverId !== userId) throw new Error("Not authorized");
  if (req.status !== "pending") throw new Error("Request already handled");

  const status = accept ? "accepted" : "rejected";
  await prisma.friendRequest.update({ where: { id: requestId }, data: { status } });

  if (accept) {
    const receiver = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
    await createNotification({
      userId: req.senderId,
      type: "FRIEND",
      title: `@${receiver?.username ?? "Someone"} accepted your friend request`,
      link: "/friends",
    });
  }
  return { status };
}

export async function getFriendStatus(userId: string, otherId: string) {
  if (userId === otherId) return { status: "self" as const };

  const [mine, theirs] = await Promise.all([
    prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId: userId, receiverId: otherId } },
    }),
    prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId: otherId, receiverId: userId } },
    }),
  ]);

  if (mine?.status === "accepted" || theirs?.status === "accepted") {
    return { status: "friends" as const };
  }
  if (mine?.status === "pending") {
    return { status: "pending-sent" as const, requestId: mine.id };
  }
  if (theirs?.status === "pending") {
    const sender = await prisma.user.findUnique({ where: { id: otherId }, select: { username: true } });
    return {
      status: "pending-received" as const,
      requestId: theirs.id,
      senderName: sender?.username ?? null,
    };
  }
  return { status: "none" as const };
}

export async function getPendingRequests(userId: string) {
  const requests = await prisma.friendRequest.findMany({
    where: { receiverId: userId, status: "pending" },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
  return requests;
}

export async function getSentRequests(userId: string) {
  const requests = await prisma.friendRequest.findMany({
    where: { senderId: userId, status: "pending" },
    include: { receiver: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
  return requests;
}

export async function getFriends(userId: string) {
  const sent = await prisma.friendRequest.findMany({
    where: { senderId: userId, status: "accepted" },
    include: { receiver: { select: { id: true, username: true, avatar: true } } },
  });
  const received = await prisma.friendRequest.findMany({
    where: { receiverId: userId, status: "accepted" },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
  });

  const friends = [
    ...sent.map((r) => ({ id: r.receiver.id, username: r.receiver.username, avatar: r.receiver.avatar })),
    ...received.map((r) => ({ id: r.sender.id, username: r.sender.username, avatar: r.sender.avatar })),
  ];

  return friends;
}

export async function removeFriend(userId: string, friendId: string) {
  await prisma.friendRequest.deleteMany({
    where: {
      OR: [
        { senderId: userId, receiverId: friendId, status: "accepted" },
        { senderId: friendId, receiverId: userId, status: "accepted" },
      ],
    },
  });
}
