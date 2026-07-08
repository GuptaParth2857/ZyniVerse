import http from "k6/http";
import { check } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const apiLatency = new Trend("api_latency");

export const options = {
  stages: [
    { duration: "5s", target: 5 },
    { duration: "5s", target: 20 },
    { duration: "5s", target: 50 },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    api_latency: ["p(95)<2000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const PATHS = [
  "/api/streaming?title=Naruto",
  "/api/streaming?title=One%20Piece",
  "/api/streaming?title=Demon%20Slayer",
  "/api/streaming?title=Jujutsu%20Kaisen",
  "/api/streaming?title=Death%20Note",
];

export default function () {
  const path = PATHS[Math.floor(Math.random() * PATHS.length)];
  const res = http.get(`${BASE_URL}${path}`, {
    tags: { name: "streaming" },
    timeout: "5s",
  });

  errorRate.add(res.status !== 200 && res.status !== 429);
  apiLatency.add(res.timings.duration);
}
