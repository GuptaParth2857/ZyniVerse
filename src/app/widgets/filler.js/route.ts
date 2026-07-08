import { NextResponse } from "next/server";

const JS = `(function(){
  var s = document.currentScript;
  if (!s) return;
  var id = s.getAttribute('data-anime-id');
  var theme = s.getAttribute('data-theme') || 'dark';

  var isDark = theme === 'dark';
  var bg = isDark ? '#0a0a0f' : '#ffffff';
  var text = isDark ? '#f0eef8' : '#1a1a2e';
  var mute = isDark ? '#807ba3' : '#94a3b8';
  var line = isDark ? '#1f1d33' : '#e2e8f0';
  var accent = '#29f2e0';
  var magenta = '#ff2d78';

  var root = document.createElement('div');
  root.style.cssText = 'font-family:Inter,system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.5;color:' + text + ';background:' + bg + ';border:1px solid ' + line + ';border-radius:10px;overflow:hidden;';
  root.innerHTML = '<div style="padding:12px;text-align:center;color:' + mute + ';font-size:12px;">Loading filler data...</div>';
  s.parentNode.insertBefore(root, s);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/filler/' + id + '?t=' + Date.now(), true);
  xhr.onload = function() {
    try {
      var data = JSON.parse(xhr.responseText);
      if (!data.found) {
        root.innerHTML = '<div style="padding:16px;text-align:center;color:' + mute + ';font-size:12px;">No filler data available</div>';
        return;
      }
      renderCard(data);
    } catch(e) {
      root.innerHTML = '<div style="padding:16px;text-align:center;color:' + magenta + ';font-size:12px;">Failed to load filler data</div>';
    }
  };
  xhr.onerror = function() {
    root.innerHTML = '<div style="padding:16px;text-align:center;color:' + magenta + ';font-size:12px;">Network error</div>';
  };
  xhr.send();

  function renderCard(data) {
    var html = '';
    html += '<div style="padding:12px;border-bottom:1px solid ' + line + ';">';
    html += '<div style="font-size:10px;color:' + mute + ';text-transform:uppercase;letter-spacing:0.15em;margin-bottom:2px;font-family:JetBrains Mono,monospace;">Filler Guide</div>';
    html += '<div style="font-size:15px;font-weight:700;line-height:1.3;">' + esc(data.title) + '</div>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:12px;">';
    html += statBox('Filler', data.fillerPercent + '%', magenta);
    html += statBox('Canon', (100 - data.fillerPercent) + '%', accent);
    html += statBox('Mixed', data.mixed, '#ffb020');
    html += '</div>';
    html += '<div style="border-top:1px solid ' + line + ';padding:8px 12px;">';
    html += '<div style="font-size:10px;color:' + mute + ';text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;font-family:JetBrains Mono,monospace;">Quick List</div>';
    var labels = {filler:'Filler', 'mixed-manga':'Mixed', 'anime-canon':'Anime Canon', 'manga-canon':'Manga Canon'};
    var types = ['filler','mixed-manga','anime-canon','manga-canon'];
    for (var i = 0; i < types.length; i++) {
      var eps = data.quickList && data.quickList[types[i]];
      if (eps && eps.length) {
        html += '<div style="font-size:11px;margin-bottom:2px;display:flex;gap:4px;">';
        html += '<span style="color:' + mute + ';min-width:70px;text-transform:capitalize;font-family:JetBrains Mono,monospace;">' + (labels[types[i]] || types[i]) + ':</span>';
        html += '<span>' + esc(eps.join(', ')) + '</span>';
        html += '</div>';
      }
    }
    html += '</div>';
    html += '<a href="https://zyniverse.app/anime/' + id + '" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;padding:8px;background:' + accent + '15;color:' + accent + ';font-size:12px;font-weight:600;text-decoration:none;">View on ZyniVerse →</a>';
    root.innerHTML = html;
  }

  function statBox(label, value, color) {
    return '<div style="background:' + bg + ';border:1px solid ' + line + ';border-radius:6px;padding:6px 4px;text-align:center;"><div style="font-size:18px;font-weight:700;color:' + color + ';font-family:JetBrains Mono,monospace;">' + value + '</div><div style="font-size:9px;color:' + mute + ';margin-top:1px;">' + label + '</div></div>';
  }

  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
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
