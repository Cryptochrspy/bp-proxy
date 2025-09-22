// Netlify Function: / .netlify/functions/chat
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' };

  try {
    const body = JSON.parse(event.body || '{}');
    const messages = body.messages || [];
    const model = body.model || process.env.MODEL || 'gpt-4o-mini';

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 700 })
    });

    if (!r.ok) {
      const text = await r.text();
      return { statusCode: r.status, headers, body: JSON.stringify({ error: 'upstream', detail: text }) };
    }

    const json = await r.json();
    const reply = json.choices?.[0]?.message?.content || '';
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'server', detail: String(err) }) };
  }
};
