import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Supabase Client Helper
let supabaseClient: any = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not configured.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

// API Routes
app.get('/api/reports', async (req, res) => {
  const { startDate, endDate, placa } = req.query;
  
  try {
    const supabase = getSupabase();
    let query = supabase
      .from('reports')
      .select(`
        *,
        report_items (*)
      `)
      .order('data_prestacao', { ascending: false });

    if (startDate) query = query.gte('data_prestacao', startDate);
    if (endDate) query = query.lte('data_prestacao', endDate);
    if (placa) query = query.ilike('placa', `%${placa}%`);

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('API Error (/api/reports):', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports', async (req, res) => {
  const { header, items } = req.body;

  try {
    const supabase = getSupabase();
    // 1. Insert header
    const { data: headerData, error: headerError } = await supabase
      .from('reports')
      .insert({
        prestador: header.prestador,
        perfil_veiculo: header.perfilVeiculo,
        placa: header.placa,
        data_prestacao: header.dataPrestacao
      })
      .select()
      .single();

    if (headerError) throw headerError;

    // 2. Insert items
    const itemsToInsert = items.map((item: any) => ({
      report_id: headerData.id,
      data: item.data,
      romaneio: item.romaneio,
      regiao: item.regiao,
      km_saida: item.kmSaida,
      km_chegada: item.kmChegada,
      km_rodado: item.kmRodado,
      retorno_zero: item.retornoZero,
      diarista: item.diarista,
      valor_frete: item.valorFrete,
      produtos: item.produtos,
      quantidade_cx: item.quantidadeCx,
      quantidade_un: item.quantidadeUn,
      vale: item.vale,
      valor_total: item.valorTotal
    }));

    const { error: itemsError } = await supabase
      .from('report_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    res.json({ success: true, id: headerData.id });
  } catch (error: any) {
    console.error('API Error (POST /api/reports):', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('report_items')
      .select(`
        valor_frete,
        diarista,
        vale,
        valor_total,
        regiao,
        data
      `);

    if (error) throw error;

    const stats = {
      totalValorFrete: data.reduce((sum, i) => sum + (Number(i.valor_frete) || 0), 0),
      totalFretes: data.length,
      totalDiarista: data.reduce((sum, i) => sum + (Number(i.diarista) || 0), 0),
      totalVales: data.reduce((sum, i) => sum + (Number(i.vale) || 0), 0),
      totalGeral: data.reduce((sum, i) => sum + (Number(i.valor_total) || 0), 0),
      topRegioes: [] as { regiao: string; total: number }[],
    };

    // Calc average per day
    const uniqueDays = new Set(data.map(i => i.data)).size;
    stats.mediaFretePorDia = uniqueDays > 0 ? stats.totalFretes / uniqueDays : 0;

    // Calc top regions
    const regionMap: Record<string, number> = {};
    data.forEach(i => {
      regionMap[i.regiao] = (regionMap[i.regiao] || 0) + 1;
    });
    stats.topRegioes = Object.entries(regionMap)
      .map(([regiao, total]) => ({ regiao, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for Dev, Static for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
