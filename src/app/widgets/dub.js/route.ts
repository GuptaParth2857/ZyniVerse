import { NextResponse } from "next/server";

const JS = `(function(){
  var s = document.currentScript;
  if (!s) return;
  var malId = s.getAttribute('data-mal-id');
  var theme = s.getAttribute('data-theme') || 'dark';

  var isDark = theme === 'dark';
  var text = isDark ? '#f0eef8' : '#1a1a2e';
  var line = isDark ? '#1f1d33' : '#e2e8f0';

  var langColors = {
    Hindi: '#ff9933',
    Tamil: '#e03c31',
    Telugu: '#ffd700',
    English: '#29f2e0'
  };
  var langLabels = {
    Hindi: 'हिन्दी',
    Tamil: 'தமிழ்',
    Telugu: 'తెలుగు',
    English: 'English'
  };

  var root = document.createElement('div');
  root.style.cssText = 'font-family:Inter,system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.5;';
  root.innerHTML = '<span style="color:#807ba3;font-size:12px;">Checking dubs...</span>';
  s.parentNode.insertBefore(root, s);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/anime-dub-status?malId=' + malId + '&t=' + Date.now(), true);
  xhr.onload = function() {
    try {
      var data = JSON.parse(xhr.responseText);
      if (!data.success) {
        root.innerHTML = '<span style="color:#807ba3;font-size:11px;">No dub info</span>';
        return;
      }
      renderBadges(data.available || []);
    } catch(e) {
      root.innerHTML = '<span style="color:#ff2d78;font-size:11px;">Error</span>';
    }
  };
  xhr.onerror = function() {
    root.innerHTML = '<span style="color:#ff2d78;font-size:11px;">Network error</span>';
  };
  xhr.send();

  function renderBadges(available) {
    if (available.length === 0) {
      root.innerHTML = '<span style="color:#807ba3;font-size:12px;">No dubs available</span>';
      return;
    }
    var html = '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">';
    for (var i = 0; i < available.length; i++) {
      var lang = available[i];
      var color = langColors[lang] || '#807ba3';
      var label = langLabels[lang] || lang;
      html += '<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:20px;border:1px solid ' + color + '40;background:' + color + '15;color:' + text + ';font-size:11px;font-weight:600;">';
      html += '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
      html += label;
      html += '</span>';
    }
    html += '</div>';
    root.innerHTML = html;
  }
})();`;

export async function GET() {
  return new NextResponse(JS, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
