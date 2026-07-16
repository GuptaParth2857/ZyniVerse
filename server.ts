import { createServer } from "http";
import { Server } from "socket.io";

const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const JIOTV_EPG_BASE = "https://jiotvapi.cdn.jio.com/apis/v1.3/getepg/get";

const JIOTV_CHANNEL_MAP: Record<string, number> = {
  cn: 816, sony_yay: 872, hungama: 1391, super_hungama: 1392,
  pogo: 559, nick: 545, nick_jr: 548, sonic: 815,
  discovery_kids: 554, disney_channel: 1373, disney_junior: 1374,
  epic_kids: 3385, animax: 2258,
};

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getDayNameFromDate(d: Date): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
}

function epochToIstHHMM(epochMs: number): string {
  const d = new Date(epochMs);
  const istMs = d.getTime() + (5.5 * 60 * 60 * 1000) + (d.getTimezoneOffset() * 60 * 1000);
  const ist = new Date(istMs);
  return `${ist.getHours().toString().padStart(2, "0")}:${ist.getMinutes().toString().padStart(2, "0")}`;
}

async function fetchJiotvEpg(channelId: number, offset: number) {
  const res = await fetch(`${JIOTV_EPG_BASE}?offset=${offset}&channel_id=${channelId}&langId=6`);
  if (!res.ok) return null;
  return await res.json() as { epg: { showname: string; description: string; startEpoch: number; endEpoch: number; episode_num: number; episodePoster: string }[] };
}

async function fetchAllEpg(): Promise<{ channelId: string; days: Record<string, { show: string; start: string; end: string; duration: number; description?: string }[]> }> {
  const entries = Object.entries(JIOTV_CHANNEL_MAP);
  const results: { channelId: string; days: Record<string, { show: string; start: string; end: string; duration: number; description?: string }[]> }[] = [];

  const BATCH_SIZE = 4;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async ([channelId, jiotvId]) => {
        const dayGroups: Record<string, { show: string; start: string; end: string; duration: number; description?: string }[]> = {};
        for (const d of ALL_DAYS) dayGroups[d] = [];

        const offsets = [-6, -5, -4, -3, -2, -1, 0];
        const responses = await Promise.allSettled(offsets.map((o) => fetchJiotvEpg(jiotvId, o)));

        for (const r of responses) {
          const resp = r.status === "fulfilled" ? r.value : null;
          if (!resp?.epg) continue;
          for (const entry of resp.epg) {
            const dayName = getDayNameFromDate(new Date(entry.startEpoch));
            if (dayGroups[dayName]) {
              dayGroups[dayName].push({
                show: entry.showname,
                start: epochToIstHHMM(entry.startEpoch),
                end: epochToIstHHMM(entry.endEpoch),
                duration: Math.round((entry.endEpoch - entry.startEpoch) / 60000),
                description: entry.description || undefined,
              });
            }
          }
        }

        for (const d of ALL_DAYS) {
          dayGroups[d].sort((a, b) => a.start.localeCompare(b.start));
        }

        return { channelId, days: dayGroups };
      })
    );

    for (const r of batchResults) {
      if (r.status === "fulfilled") results.push(r.value);
    }
  }

  return results.length > 0 ? results[0] : { channelId: "", days: {} };
}

// EPG endpoint — fetches real JioTV EPG data from Railway's non-datacenter IP
// Vercel serverless IPs get blocked by JioTV, so we proxy through here

const httpServer = createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.url === "/api/epg") {
    try {
      const entries = Object.entries(JIOTV_CHANNEL_MAP);
      const allResults: { channelId: string; days: Record<string, { show: string; start: string; end: string; duration: number; description?: string }[]> }[] = [];

      const BATCH_SIZE = 4;
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(
          batch.map(async ([channelId, jiotvId]) => {
            const dayGroups: Record<string, { show: string; start: string; end: string; duration: number; description?: string }[]> = {};
            for (const d of ALL_DAYS) dayGroups[d] = [];

            const offsets = [-6, -5, -4, -3, -2, -1, 0];
            const responses = await Promise.allSettled(offsets.map((o) => fetchJiotvEpg(jiotvId, o)));

            for (const r of responses) {
              const resp = r.status === "fulfilled" ? r.value : null;
              if (!resp?.epg) continue;
              for (const entry of resp.epg) {
                const dayName = getDayNameFromDate(new Date(entry.startEpoch));
                if (dayGroups[dayName]) {
                  dayGroups[dayName].push({
                    show: entry.showname,
                    start: epochToIstHHMM(entry.startEpoch),
                    end: epochToIstHHMM(entry.endEpoch),
                    duration: Math.round((entry.endEpoch - entry.startEpoch) / 60000),
                    description: entry.description || undefined,
                  });
                }
              }
            }

            for (const d of ALL_DAYS) {
              dayGroups[d].sort((a, b) => a.start.localeCompare(b.start));
            }

            return { channelId, days: dayGroups };
          })
        );

        for (const r of batchResults) {
          if (r.status === "fulfilled") allResults.push(r.value);
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ channels: allResults }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : "EPG fetch failed" }));
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

const io = new Server(httpServer, {
  path: "/api/socketio",
  cors: { origin: "*", methods: ["GET", "POST"] },
  addTrailingSlash: false,
});

io.on("connection", (socket) => {
  console.log("[Socket] User connected:", socket.id);

  socket.on("join-party", ({ partyId, user, isHost }) => {
    socket.join(`party:${partyId}`);
    socket.data = { partyId, user, isHost: !!isHost };
    io.to(`party:${partyId}`).emit("member-joined", {
      user,
      members: Array.from(io.sockets.adapter.rooms.get(`party:${partyId}`) || []),
    });
    console.log(`[Socket] ${user.username} joined party ${partyId}`);
  });

  socket.on("leave-party", ({ partyId }) => {
    socket.leave(`party:${partyId}`);
    const user = socket.data.user;
    io.to(`party:${partyId}`).emit("member-left", {
      user,
      members: Array.from(io.sockets.adapter.rooms.get(`party:${partyId}`) || []),
    });
    console.log(`[Socket] ${user?.username} left party ${partyId}`);
  });

  socket.on("host-sync", ({ partyId, isPlaying, playbackPos, episode }) => {
    socket.to(`party:${partyId}`).emit("sync-state", {
      isPlaying,
      playbackPos,
      episode,
      timestamp: Date.now(),
    });
  });

  socket.on("host-play", ({ partyId, playbackPos }) => {
    socket.to(`party:${partyId}`).emit("play", { playbackPos, timestamp: Date.now() });
  });

  socket.on("host-pause", ({ partyId, playbackPos }) => {
    socket.to(`party:${partyId}`).emit("pause", { playbackPos, timestamp: Date.now() });
  });

  socket.on("host-seek", ({ partyId, playbackPos }) => {
    socket.to(`party:${partyId}`).emit("seek", { playbackPos, timestamp: Date.now() });
  });

  socket.on("host-episode", ({ partyId, episode }) => {
    socket.to(`party:${partyId}`).emit("episode-change", { episode });
  });

  socket.on("chat-message", ({ partyId, user, message }) => {
    io.to(`party:${partyId}`).emit("new-message", {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      message,
      type: "CHAT",
      createdAt: new Date().toISOString(),
    });
  });

  socket.on("reaction", ({ partyId, user, emoji }) => {
    socket.to(`party:${partyId}`).emit("new-reaction", {
      userId: user.id,
      username: user.username,
      emoji,
    });
  });

  socket.on("video-source", ({ partyId, videoUrl, videoType }) => {
    socket.to(`party:${partyId}`).emit("video-updated", { videoUrl, videoType });
  });

  socket.on("screen-share-started", ({ partyId }) => {
    socket.to(`party:${partyId}`).emit("screen-share-started-viewers", { partyId });
  });

  socket.on("screen-share-stopped", ({ partyId }) => {
    socket.to(`party:${partyId}`).emit("screen-share-stopped-viewers", { partyId });
  });

  socket.on("webrtc-viewer-ready", ({ partyId }) => {
    const hostSocket = Array.from(io.sockets.adapter.rooms.get(`party:${partyId}`) || [])
      .map((id) => io.sockets.sockets.get(id))
      .find((s) => s && s.data?.isHost);
    if (hostSocket) {
      hostSocket.emit("webrtc-viewer-join", { viewerId: socket.id, partyId });
    }
  });

  socket.on("webrtc-offer", ({ partyId, targetId, offer }) => {
    io.to(targetId).emit("webrtc-offer-viewer", { offer, partyId, hostId: socket.id });
  });

  socket.on("webrtc-viewer-answer", ({ partyId, hostId, answer }) => {
    io.to(hostId).emit("webrtc-viewer-answer", { viewerId: socket.id, answer, partyId });
  });

  socket.on("webrtc-ice-candidate", ({ partyId, targetId, candidate }) => {
    const eventName = socket.data?.isHost ? "webrtc-ice-candidate-viewer" : "webrtc-ice-candidate-host";
    io.to(targetId).emit(eventName, { candidate, partyId, senderId: socket.id });
  });

  socket.on("disconnect", () => {
    const { partyId, user } = socket.data || {};
    if (partyId) {
      io.to(`party:${partyId}`).emit("member-left", {
        user,
        members: Array.from(io.sockets.adapter.rooms.get(`party:${partyId}`) || []),
      });
      console.log(`[Socket] ${user?.username} disconnected from party ${partyId}`);
    }
  });
});

httpServer.listen(port, hostname, () => {
  console.log(`> Socket.io ready at http://${hostname}:${port}/api/socketio`);
});
