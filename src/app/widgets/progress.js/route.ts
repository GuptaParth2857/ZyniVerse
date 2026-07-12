import { NextResponse } from "next/server";

const JS = `(function(){
  var s = document.currentScript;
  if (!s) return;
  var username = s.getAttribute('data-user');
  var theme = s.getAttribute('data-theme') || 'dark';

  var isDark = theme === 'dark';
  var bg = isDark ? '#0a0a0f' : '#ffffff';
  var text = isDark ? '#f0eef8' : '#1a1a2e';
  var mute = isDark ? '#807ba3' : '#94a3b8';
  var line = isDark ? '#1f1d33' : '#e2e8f0';
  var accent = '#29f2e0';

  var root = document.createElement('div');
  root.style.cssText = 'font-family:Inter,system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.5;color:' + text + ';background:' + bg + ';border:1px solid ' + line + ';border-radius:10px;overflow:hidden;';
  root.innerHTML = '<div style="padding:16px;text-align:center;color:' + mute + ';font-size:12px;">Loading progress...</div>';
  s.parentNode.insertBefore(root, s);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://graphql.anilist.co', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'application/json');

  var query = 'query($name:String){MediaListCollection(userName:$name,type:ANIME){lists{entries{id mediaId status score progress repeat startedAt{year month day} completedAt{year month day} media{id title{english romaji} coverImage{large} format episodes}}}}}';

  xhr.onload = function() {
    try {
      var response = JSON.parse(xhr.responseText);
      if (response.errors) {
        root.innerHTML = '<div style="padding:16px;text-align:center;color:#ff2d78;font-size:12px;">User not found</div>';
        return;
      }
      var lists = response.data.MediaListCollection.lists || [];
      var entries = [];
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].entries) {
          for (var j = 0; j < lists[i].entries.length; j++) {
            entries.push(lists[i].entries[j]);
          }
        }
      }
      var watching = entries.filter(function(e) { return e.status === 'CURRENT'; }).slice(0, 5);
      renderProgress(watching);
    } catch(e) {
      root.innerHTML = '<div style="padding:16px;text-align:center;color:#ff2d78;font-size:12px;">Failed to load progress</div>';
    }
  };
  xhr.onerror = function() {
    root.innerHTML = '<div style="padding:16px;text-align:center;color:#ff2d78;font-size:12px;">Network error</div>';
  };
  xhr.send(JSON.stringify({query: query, variables: {name: username}}));

  function renderProgress(entries) {
    if (entries.length === 0) {
      root.innerHTML = '<div style="padding:16px;text-align:center;color:' + mute + ';">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:block;margin:0 auto 8px;">' +
        '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' +
        '</svg>Not watching anything</div>';
      return;
    }
    var html = '';
    html += '<div style="padding:10px 12px;border-bottom:1px solid ' + line + ';">';
    html += '<div style="font-size:10px;color:' + mute + ';text-transform:uppercase;letter-spacing:0.15em;font-family:JetBrains Mono,monospace;">' + esc(username) + ' &mdash; Watching</div>';
    html += '</div>';
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var progress = e.progress || 0;
      var total = (e.media && e.media.episodes) || progress || 100;
      var pct = Math.min(100, Math.round((progress / total) * 100));
      var title = (e.media && e.media.title && (e.media.title.english || e.media.title.romaji)) || 'Unknown';
      var cover = e.media && e.media.coverImage && e.media.coverImage.large;
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid ' + line + ';">';
      if (cover) {
        html += '<img src="' + cover + '" alt="" style="width:28px;height:40px;border-radius:4px;object-fit:cover;border:1px solid ' + line + ';" loading="lazy" />';
      }
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(title) + '</div>';
      html += '<div style="margin-top:4px;height:4px;border-radius:2px;background:' + line + ';overflow:hidden;"><div style="width:' + pct + '%;height:100%;border-radius:2px;background:' + accent + ';transition:width 0.3s;"></div></div>';
      html += '<div style="font-size:9px;color:' + mute + ';margin-top:2px;font-family:JetBrains Mono,monospace;">' + progress + ' / ' + (total || '?') + ' ep</div>';
      html += '</div></div>';
    }
    html += '<a href="https://zyverse.in/profile/' + encodeURIComponent(username) + '" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;padding:7px;background:' + accent + '10;color:' + accent + ';font-size:11px;font-weight:600;text-decoration:none;">View full profile →</a>';
    root.innerHTML = html;
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
