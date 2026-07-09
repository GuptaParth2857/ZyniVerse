"use client";

import { motion } from "framer-motion";

const COLORS = {
  cyan: "#00E5FF",
  blue: "#3B82F6",
  violet: "#8B5CF6",
};

const RINGS = [
  { r: 130, dash: 100, gap: 716.81, color: COLORS.cyan, duration: 8, dir: 1, tilt: 20 },
  { r: 100, dash: 80, gap: 548.32, color: COLORS.blue, duration: 5.5, dir: -1, tilt: -30 },
  { r: 70, dash: 60, gap: 379.82, color: COLORS.violet, duration: 3.5, dir: 1, tilt: 45 },
];

const PARTICLES = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * Math.PI * 2;
  const radius = 60 + Math.random() * 50;
  return {
    id: i,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    size: 2 + Math.random() * 2.5,
    delay: Math.random() * 4,
    duration: 2.5 + Math.random() * 3,
    color: [COLORS.cyan, COLORS.blue, COLORS.violet][i % 3],
  };
});

export default function FluidNeonOrb() {
  return (
    <div className="relative flex items-center justify-center w-full min-h-[60vh] overflow-hidden select-none">
      {/* Ambient page glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.06) 0%, rgba(59,130,246,0.03) 25%, rgba(139,92,246,0.02) 50%, transparent 70%)",
        }}
      />

      {/* Animated background glows */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.05) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(59,130,246,0.04) 0%, transparent 50%)",
        }}
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.05, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.04) 0%, transparent 50%)",
        }}
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Main 3D assembly */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{ perspective: "800px" }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
          animate={{
            rotateX: [8, -8, 8],
            rotateY: [-12, 12, -12],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative w-72 h-72 sm:w-80 sm:h-80">
            {/* Sonar pulse rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`pulse-${i}`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  width: "40%",
                  height: "40%",
                  border: "1px solid",
                  borderColor: [COLORS.cyan, COLORS.blue, COLORS.violet][i],
                  opacity: 0,
                }}
                animate={{
                  scale: [1, 2.8, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* 3D orbital rings */}
            {RINGS.map((ring, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{
                  transformStyle: "preserve-3d",
                  rotateX: ring.tilt,
                  transform: `translateZ(${i * 15 - 15}px)`,
                }}
              >
                <motion.div
                  className="w-full h-full"
                  animate={{ rotate: ring.dir * 360 }}
                  transition={{
                    duration: ring.duration,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <svg
                    viewBox="0 0 300 300"
                    className="w-full h-full"
                    style={{
                      filter: `drop-shadow(0 0 10px ${ring.color}50) drop-shadow(0 0 30px ${ring.color}20)`,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id={`ringGrad${i}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor={ring.color} stopOpacity="0.9" />
                        <stop offset="50%" stopColor={ring.color} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={ring.color} stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="150"
                      cy="150"
                      r={ring.r}
                      fill="none"
                      stroke={`url(#ringGrad${i})`}
                      strokeWidth="2"
                      strokeDasharray={`${ring.dash} ${ring.gap}`}
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            ))}

            {/* Glassmorphism glow behind center */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,229,255,0.15) 0%, rgba(59,130,246,0.08) 20%, rgba(139,92,246,0.05) 40%, transparent 65%)",
                filter: "blur(50px)",
              }}
            />

            {/* Center glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5) 0%, rgba(0,229,255,0.7) 20%, rgba(59,130,246,0.5) 45%, rgba(139,92,246,0.35) 70%, rgba(10,10,15,0) 100%)",
                  boxShadow:
                    "0 0 40px rgba(0,229,255,0.35), 0 0 80px rgba(59,130,246,0.2), 0 0 120px rgba(139,92,246,0.15)",
                }}
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Inner bright core */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,1), rgba(0,229,255,0.5))",
                    boxShadow:
                      "0 0 20px rgba(255,255,255,0.5), 0 0 50px rgba(0,229,255,0.4)",
                  }}
                />
              </motion.div>
            </div>

            {/* Floating particles */}
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: p.size,
                  height: p.size,
                  left: `calc(50% + ${p.x}px)`,
                  top: `calc(50% + ${p.y}px)`,
                  backgroundColor: p.color,
                  boxShadow: `0 0 12px ${p.color}, 0 0 24px ${p.color}40`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -20 - Math.random() * 25],
                  x: [0, (Math.random() - 0.5) * 20],
                  scale: [0, 1.6, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}