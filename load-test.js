import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const apiLatency = new Trend("api_latency");

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "10s", target: 50 },
    { duration: "10s", target: 100 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    errors: ["rate<0.10"],
    api_latency: ["p(95)<2000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const ANIME_TITLES = ["Naruto", "One Piece", "Attack on Titan", "Demon Slayer", "Jujutsu Kaisen", "Death Note", "Fullmetal Alchemist Brotherhood"];

export default function () {
  const r = Math.random();

  let path, name;
  if (r < 0.20) {
    const title = ANIME_TITLES[Math.floor(Math.random() * ANIME_TITLES.length)];
    path = `/api/streaming?title=${encodeURIComponent(title)}`;
    name = "streaming";
  } else if (r < 0.35) {
    path = "/api/quiz/generate";
    name = "quiz";
  } else if (r < 0.50) {
    path = "/api/quiz/generate?count=5";
    name = "quiz-5";
  } else if (r < 0.65) {
    path = "/api/conventions";
    name = "conventions";
  } else {
    path = "/api/awards";
    name = "awards";
  }

  const res = http.get(`${BASE_URL}${path}`, {
    tags: { name },
    headers: { "User-Agent": "k6-load-test" },
    timeout: "10s",
  });

  const ok = check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 2000ms": (r) => r.timings.duration < 2000,
  });

  errorRate.add(!ok);
  apiLatency.add(res.timings.duration);

  sleep(Math.random() * 0.3 + 0.05);
}
