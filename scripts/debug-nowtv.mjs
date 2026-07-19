async function test() {
  // Animax HK feed from epg.pw
  const url = 'https://epg.pw/api/epg.json?channel_id=410287&lang=en&date=20260717&timezone=Asia%2FKolkata';
  const res = await fetch(url);
  const data = await res.json();
  console.log('Channel:', data.name, '| Country:', data.country);
  console.log('Entries:', data.epg_list?.length || 0);
  if (data.epg_list) {
    data.epg_list.slice(0, 15).forEach(e => {
      console.log(' ', e.start_date, '-', e.title);
    });
  }
}
test().catch(console.error);
