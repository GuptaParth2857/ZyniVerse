import { prisma } from "./prisma";

export interface WatchPartyData {
  id: string;
  hostId: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
  coverImage: string | null;
  episode: number;
  status: "waiting" | "live" | "ended";
  startTime: Date | null;
  videoUrl: string | null;
  videoType: string | null;
  isPlaying: boolean;
  playbackPos: number;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  host: { id: string; username: string; avatar: string | null };
  members: {
    id: string;
    userId: string;
    role: string;
    joinedAt: Date;
    user: { id: string; username: string; avatar: string | null };
  }[];
}

function mapParty(party: Record<string, unknown>): WatchPartyData {
  return {
    ...party,
    status: party.status as WatchPartyData["status"],
  } as unknown as WatchPartyData;
}

const PARTY_INCLUDE = {
  host: { select: { id: true, username: true, avatar: true } },
  members: {
    include: { user: { select: { id: true, username: true, avatar: true } } },
    orderBy: { joinedAt: "asc" as const },
  },
};

export async function createParty(
  hostId: string,
  mediaId: number,
  mediaTitle: string,
  mediaImage?: string | null,
  coverImage?: string | null
): Promise<WatchPartyData> {
  const party = await prisma.watchParty.create({
    data: { hostId, mediaId, mediaTitle, mediaImage, coverImage },
    include: PARTY_INCLUDE,
  });

  await prisma.watchPartyMember.create({
    data: { partyId: party.id, userId: hostId, role: "host" },
  });

  const updated = await prisma.watchParty.findUnique({
    where: { id: party.id },
    include: PARTY_INCLUDE,
  });

  return mapParty(updated!);
}

export async function joinParty(partyId: string, userId: string) {
  const existing = await prisma.watchPartyMember.findUnique({
    where: { partyId_userId: { partyId, userId } },
  });
  if (existing) return existing;

  return prisma.watchPartyMember.create({
    data: { partyId, userId },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });
}

export async function leaveParty(partyId: string, userId: string): Promise<void> {
  await prisma.watchPartyMember.deleteMany({
    where: { partyId, userId },
  });
}

export async function getParty(partyId: string): Promise<WatchPartyData | null> {
  const party = await prisma.watchParty.findUnique({
    where: { id: partyId },
    include: PARTY_INCLUDE,
  });
  return party ? mapParty(party) : null;
}

export async function getActiveParties(): Promise<WatchPartyData[]> {
  const parties = await prisma.watchParty.findMany({
    where: { status: { in: ["waiting", "live"] } },
    include: PARTY_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return parties.map(mapParty);
}

export async function updateEpisode(partyId: string, episode: number, userId: string): Promise<void> {
  const party = await prisma.watchParty.findUnique({ where: { id: partyId } });
  if (!party) throw new Error("Party not found");
  if (party.hostId !== userId) throw new Error("Only the host can change episode");
  await prisma.watchParty.update({
    where: { id: partyId },
    data: { episode },
  });
}

export async function endParty(partyId: string, userId: string): Promise<void> {
  const party = await prisma.watchParty.findUnique({ where: { id: partyId } });
  if (!party) throw new Error("Party not found");
  if (party.hostId !== userId) throw new Error("Only the host can end the party");
  await prisma.watchParty.update({
    where: { id: partyId },
    data: { status: "ended" },
  });
}

export async function startParty(partyId: string, userId: string): Promise<void> {
  const party = await prisma.watchParty.findUnique({ where: { id: partyId } });
  if (!party) throw new Error("Party not found");
  if (party.hostId !== userId) throw new Error("Only the host can start the party");
  await prisma.watchParty.update({
    where: { id: partyId },
    data: { status: "live", startTime: new Date() },
  });
}

export async function getUserParties(userId: string): Promise<WatchPartyData[]> {
  const memberships = await prisma.watchPartyMember.findMany({
    where: { userId },
    select: { partyId: true },
  });

  const partyIds = memberships.map((m) => m.partyId);
  if (partyIds.length === 0) return [];

  const parties = await prisma.watchParty.findMany({
    where: { id: { in: partyIds }, status: { not: "ended" } },
    include: PARTY_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return parties.map(mapParty);
}

export async function sendPartyMessage(
  partyId: string,
  userId: string,
  message: string
): Promise<void> {
  await prisma.activity.create({
    data: {
      userId,
      type: "WATCH_PARTY",
      mediaTitle: message,
      message: `[PARTY:${partyId}] ${message}`,
    },
  });
}

export async function setVideoSource(
  partyId: string,
  videoUrl: string,
  videoType: string,
  userId: string
): Promise<void> {
  const party = await prisma.watchParty.findUnique({ where: { id: partyId } });
  if (!party) throw new Error("Party not found");
  if (party.hostId !== userId) throw new Error("Only the host can set video");
  await prisma.watchParty.update({
    where: { id: partyId },
    data: { videoUrl, videoType },
  });
}

export async function updatePlaybackState(
  partyId: string,
  isPlaying: boolean,
  playbackPos: number,
  userId: string
): Promise<void> {
  const party = await prisma.watchParty.findUnique({ where: { id: partyId } });
  if (!party) throw new Error("Party not found");
  if (party.hostId !== userId) throw new Error("Only the host can control playback");
  await prisma.watchParty.update({
    where: { id: partyId },
    data: { isPlaying, playbackPos, lastSyncAt: new Date() },
  });
}
