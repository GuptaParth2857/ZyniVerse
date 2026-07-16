import { createServer } from "http";
import { Server } from "socket.io";

const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
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
