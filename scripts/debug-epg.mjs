const url = 'https://www.epgschedule.com/channel/cartoon-network/';

fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0' }
}).then(r=>r.text()).then(html=>{
  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while((m=regex.exec(html))!==null) {
    try {
      const data = JSON.parse(m[1]);
      if (data['@graph']) {
        const tvChannel = data['@graph'].find(g => g['@type'] === 'TVChannel');
        if (tvChannel && tvChannel.hasPart) {
          const events = tvChannel.hasPart;
          console.log(`Found ${events.length} events`);
          console.log('\nFirst event (full):', JSON.stringify(events[0], null, 2));
          console.log('\nLast event:', JSON.stringify(events[events.length-1], null, 2));
          
          // Parse all events to check date structure
          events.forEach(e => {
            const start = new Date(e.startDate);
            const end = new Date(e.endDate);
            const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][start.getDay()];
            console.log(`  ${day} ${e.name.substring(0,35).padEnd(35)} ${e.startDate.substring(11,16)} -> ${e.endDate.substring(11,16)}`);
          });
        }
      }
    } catch(e) {
      console.log('error:', e.message);
    }
  }
}).catch(e=>console.error(e.message));
