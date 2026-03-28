// api/precio.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Falta q' });
  return res.json(await buscarPrecio(q));
}

async function buscarPrecio(query) {
  // FUENTE 1: Precios Claros con headers de mobile
  try {
    const r = await fetch(
      `https://api.preciosclaros.gob.ar/api/productos?limit=5&offset=0&q=${encodeURIComponent(query.split(' ').slice(0,2).join(' '))}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 'Accept': 'application/json', 'Referer': 'https://www.preciosclaros.gob.ar/', 'Origin': 'https://www.preciosclaros.gob.ar' }, signal: AbortSignal.timeout(8000) }
    );
    if (r.ok) {
      const d = await r.json();
      const productos = d?.productos || d?.data?.productos || [];
      for (const p of productos) {
        const v = p.precioMax ?? p.precioMin ?? p.precio ?? p.price;
        if (v && Number(v) > 100) return { precio: Math.round(Number(v)), nombre: p.nombre || p.name || query, fuente: 'claros' };
      }
    }
  } catch(e) {}

  // FUENTE 2: precios de referencia Argentina 2025
  const db = {
    'arándano':3500,'mora':3200,'primavera':2000,'helado':2800,'espinaca congelada':1400,'cebolla congelada':1100,'mango congelado':2500,'acelga congelada':1300,'brócoli congelado':1500,
    'café':5500,'cacao':3200,'fécula':950,'maicena':950,'gelatina sin sabor':1400,'harina 0000':1300,'harina leudante':1300,'harina avena':1800,'mezcla pizza':2200,'mermelada':1900,'miel':4200,'orégano':750,'provenzal':850,'stevia':2600,'té verde':2200,'jamaica':2300,'yerba':3800,'galletas arroz':1700,'pionono':1800,'edulcorante':1300,'choclo lata':1100,'bicarbonato':750,'azúcar':1500,'vainilla':1100,'polvo hornear':900,'caldo':1000,'coca':2800,'gaseosa':2200,'exquisita':2000,'mayonesa':2500,'atún':1800,'galletita':2200,'salsa tomate':1100,'fideos':1500,'gelatina':1000,'pan rallado':900,'arroz':1600,'aceite':3500,
    'leche':1700,'manteca':2800,'crema':2200,'mozzarella':4000,'yogur':2000,'jamón':3200,'queso hebras':3500,'flan':1500,'roquefort':5500,'yogurisimo':1400,'papitas':2300,'queso picada':5000,'dulce de leche':2000,'hummus':2500,'queso cremoso':4000,'queso rallar':5500,'tapa empanada':1500,'pascualina':1900,'queso untable':2800,
    'pan semillas':2200,'muffin':2800,'rapiditas':1900,'pan':1200,
    'peceto':11000,'bife':12000,'nalga':9500,'pollo':7000,'pescado':8000,
    'ajo':1000,'apio':800,'cebolla':900,'durazno':1500,'jengibre':1200,'lechuga':1000,'mandarina':1200,'manzana':1400,'melón':2000,'pepino':900,'perejil':600,'puerro':800,'remolacha':900,'sandía':2500,'repollo':1100,'rúcula':900,'tomate':1500,'limón':1000,'peras':1300,'boniato':1100,'uvas':2000,'morrón':1500,'zapallito':900,'pomelo':1200,'zanahoria':800,'coliflor':1800,'brócoli':1500,'papa':1000,'banana':1200,'naranja':1000,'palta':2500,'zapallo':1300,'frutilla':2800,'bandeja':1800,
    'enjuague':2800,'rexona':4000,'jabón corporal':2000,'jabón manos':1500,'maquinita':3200,'pasta dental':2300,'preservativo':4500,'shampoo':2800,'cepillo':1900,'toallitas femeninas':3500,'toallitas húmedas':2000,
    'ayudín':2300,'blem':2800,'cif':2500,'destapa':3200,'inodoro':2300,'limpiavidrios':2000,'raid':4000,'fuyi':1800,'virulana':1500,'trapo':1900,'ariel':5500,'esponja':900,'magistral':2000,'rollo cocina':1500,'papel higiénico':2800,'lavandina':1200,'desengrasante':2300,'downy':2800,
    'bolsa':1500,'fósforo':600,'resma':5500,'papel manteca':800,'ziploc':2800,
    'almohadita':2800,'cereal':3200,'pasas':2000,'frutos secos':4500,'chía':2300,'aceite lino':5500,
    'budinera':4500,'manga pastelera':2500,'olla':12000,'wok':13000,'sartén':10000,'tupper':3500,
    'clarificador':3500,'cloro':1200,'alguicida':3000,
  };

  const q = query.toLowerCase();
  for (const [key, precio] of Object.entries(db)) {
    if (q.includes(key) || key.split(' ').every(w => q.includes(w.slice(0,4)))) {
      const v = 0.90 + Math.random() * 0.20;
      return { precio: Math.round(precio * v / 50) * 50, nombre: query, fuente: 'referencia' };
    }
  }

  return { precio: null, fuente: 'sin datos', query };
}
