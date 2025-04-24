export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const BASEROW_TABLE_ID = env.BASEROW_TABLE_ID;
    const HISTORY_TABLE_ID = env.HISTORY_TABLE_ID;
    const BASEROW_TOKEN = env.BASEROW_TOKEN;

    const headers = {
      'Authorization': `Token ${BASEROW_TOKEN}`
    };

    if (url.pathname === '/api/matters') {
      const baserowURL = `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true`;
      const response = await fetch(baserowURL, { headers });
      return new Response(await response.text(), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/matters-overview') {
      const baserowURL = `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/?user_field_names=true`;
      const response = await fetch(baserowURL, { headers });
      const data = await response.json();

      const inProgressMatters = data.results.filter(matter => {
        const status = matter.Status && (matter.Status.value || matter.Status);
        return status === 'In Progress';
      });

      return new Response(JSON.stringify(inProgressMatters), { headers: { 'Content-Type': 'application/json' } });
    }

    const matterMatch = url.pathname.match(/^\/api\/matter\/(\d+)$/);
    if (matterMatch) {
      const id = matterMatch[1];
      const baserowURL = `https://api.baserow.io/api/database/rows/table/${BASEROW_TABLE_ID}/${id}/?user_field_names=true`;
      const response = await fetch(baserowURL, { headers });
      return new Response(await response.text(), { headers: { 'Content-Type': 'application/json' } });
    }

    const historyMatch = url.pathname.match(/^\/api\/matter\/(\d+)\/history$/);
    if (historyMatch) {
      const id = historyMatch[1];
      const baserowURL = `https://api.baserow.io/api/database/rows/table/${HISTORY_TABLE_ID}/?user_field_names=true&filter__Matter__link_row_contains=${id}`;
      const response = await fetch(baserowURL, { headers });
      return new Response(await response.text(), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }
}
