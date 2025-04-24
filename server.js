// Handle all requests
export default {
  async fetch(request, env, ctx) {
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://baserow.io',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    // Route requests
    if (url.pathname === '/api/matters' && request.method === 'GET') {
      return handleGetMatters(env);
    } else if (url.pathname === '/api/matters-overview' && request.method === 'GET') {
      return handleGetMattersOverview(env);
    } else if (url.pathname.startsWith('/api/matter/') && request.method === 'GET') {
      const id = url.pathname.split('/')[3];
      return handleGetMatterDetails(id, env);
    } else if (url.pathname.endsWith('/history') && request.method === 'GET') {
      const id = url.pathname.split('/')[3];
      return handleGetMatterHistory(id, env);
    }

    // 404 for unknown routes
    return new Response('Not found', { 
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  },
};

// Handler functions
async function handleGetMatters(env) {
  try {
    const response = await fetch(
      `https://api.baserow.io/api/database/rows/table/${env.BASEROW_TABLE_ID}/?user_field_names=true`,
      {
        headers: {
          'Authorization': `Token ${env.BASEROW_TOKEN}`
        }
      }
    );
    const data = await response.json();
    return new Response(JSON.stringify(data.results), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://baserow.io'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://baserow.io'
      }
    });
  }
}

async function handleGetMattersOverview(env) {
  try {
    const response = await fetch(
      `https://api.baserow.io/api/database/rows/table/${env.BASEROW_TABLE_ID}/?user_field_names=true`,
      {
        headers: {
          'Authorization': `Token ${env.BASEROW_TOKEN}`
        }
      }
    );
    const data = await response.json();
    
    // Filter only "In Progress" matters
    const inProgressMatters = data.results.filter(matter => {
      const status = matter.Status && (matter.Status.value || matter.Status);
      return status === 'In Progress';
    });
    
    return new Response(JSON.stringify(inProgressMatters), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://baserow.io'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch matters overview' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://baserow.io'
      }
    });
  }
}

async function handleGetMatterDetails(id, env) {
  try {
    const response = await fetch(
      `https://api.baserow.io/api/database/rows/table/${env.BASEROW_TABLE_ID}/${id}/?user_field_names=true`,
      {
        headers: {
          'Authorization': `Token ${env.BASEROW_TOKEN}`
        }
      }
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://baserow.io'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch matter details' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://baserow.io'
      }
    });
  }
}

async function handleGetMatterHistory(id, env) {
  try {
    const response = await fetch(
      `https://api.baserow.io/api/database/rows/table/${env.HISTORY_TABLE_ID}/?user_field_names=true&filter__Matter__link_row_contains=${id}`,
      {
        headers: {
          'Authorization': `Token ${env.BASEROW_TOKEN}`
        }
      }
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://baserow.io'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch matter history' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://baserow.io'
      }
    });
  }
}
