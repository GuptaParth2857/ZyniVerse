import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>SW Cleanup</title>
  <style>
    body { background: #0a0a0f; color: #e5e5e5; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { text-align: center; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #00d4ff; display: inline-block; animation: ping 1s infinite; }
    @keyframes ping { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
  </style>
</head>
<body>
  <div class="box">
    <p><span class="dot"></span> Cleaning service worker &amp; caches...</p>
    <p style="color:#666;font-size:12px">Redirecting to home shortly.</p>
  </div>
  <script>
    (async function () {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(function (r) { return r.unregister(); }));
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map(function (k) { return caches.delete(k); }));
      }
      setTimeout(function () { location.href = "/"; }, 800);
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
