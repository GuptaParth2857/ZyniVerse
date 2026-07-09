import { prisma } from "./prisma";

export async function sendFriendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) throw new Error("Cannot send request to yourself");

  const existing = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId, receiverId } },
  });
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
    return { status: "accepted" };
  }

  await prisma.friendRequest.create({
    data: { senderId, receiverId, status: "pending" },
  });
  return { status: "pending" };
}

export async function respondToRequest(requestId: string, userId: string, accept: boolean) {
  const req = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!req || req.receiverId !== userId) throw new Error("Not authorized");
  if (req.status !== "pending") throw new Error("Request already handled");

  const status = accept ? "accepted" : "rejected";
  await prisma.friendRequest.update({ where: { id: requestId }, data: { status } });
  return { status };
}

export async function getPendingRequests(userId: string) {
  const requests = await prisma.friendRequest.findMany({
    where: { receiverId: userId, status: "pending" },
    include: { sender: { select: { id: true, username: true, avatar: true } } },
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
