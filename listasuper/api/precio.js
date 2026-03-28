// api/precio.js — función serverless que corre en Vercel
// Recibe ?q=nombre+producto y devuelve el precio de Precios Claros

export default async function handler(req, res) {
  // Permitir llamadas desde cualquier origen (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Falta el parámetro q' });

  try {
    // Consultar la API oficial de Precios Claros
    const url = `https://api.preciosclaros.gob.ar/api/productos?limit=5&offset=0&q=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Precios Claros respondió ${response.status}` });
    }

    const data = await response.json();
    const productos = data?.productos ?? data?.data?.productos ?? [];

    if (!productos.length) {
      return res.json({ precio: null, fuente: 'claros', query: q });
    }

    // Buscar el primer precio válido
    for (const p of productos) {
      const valor = p.precioMax ?? p.precioMin ?? p.precio ?? p.price ?? p.precioVenta;
      if (valor && Number(valor) > 50) {
        return res.json({
          precio: Math.round(Number(valor)),
          nombre: p.nombre ?? p.name ?? q,
          marca: p.marca ?? '',
          fuente: 'claros',
          query: q,
        });
      }
    }

    return res.json({ precio: null, fuente: 'claros', query: q });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
