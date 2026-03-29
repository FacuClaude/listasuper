// api/foto.js — analiza una foto y devuelve el nombre del producto

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { imagen, tipo } = req.body; // imagen en base64, tipo = 'image/jpeg' etc
    if (!imagen) return res.status(400).json({ error: 'Falta la imagen' });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: tipo || 'image/jpeg',
                data: imagen,
              },
            },
            {
              type: 'text',
              text: 'Identificá qué producto de supermercado aparece en esta foto. Respondé SOLO con el nombre del producto en español, como lo escribirías en una lista de supermercado argentina. Sin explicaciones, sin marcas si no son relevantes, solo el nombre del producto. Ejemplos: "Leche entera", "Queso cremoso", "Arroz", "Shampoo", "Detergente". Si no podés identificar ningún producto, respondé "no identificado".',
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Error de API: ' + err.slice(0, 100) });
    }

    const data = await response.json();
    const nombre = data?.content?.[0]?.text?.trim() || 'no identificado';

    return res.json({ nombre, ok: nombre !== 'no identificado' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
