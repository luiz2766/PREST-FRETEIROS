import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
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
app.get('/api/health', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('reports').select('count', { count: 'exact', head: true });
    if (error) throw error;
    res.json({ status: 'ok', supabase: 'connected', count: data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/reports', async (req, res) => {
  const { startDate, endDate, placa } = req.query;
  
  try {
    const supabase = getSupabase();
    console.log(`[INFO] Fetching reports... Filters: startDate=${startDate}, endDate=${endDate}, placa=${placa}`);
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

    if (error) {
      console.error('[ERROR] Supabase reports fetch failed:', error);
      throw error;
    }
    console.log(`[INFO] Found ${data?.length || 0} reports.`);
    res.json(data);
  } catch (error: any) {
    console.error('API Error (/api/reports):', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports', async (req, res) => {
  const { header, items } = req.body;
  console.log('[INFO] Saving new report for:', header.prestador);

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

    if (headerError) {
      console.error('[ERROR] Supabase header insert failed:', headerError);
      throw headerError;
    }

    console.log('[INFO] Header saved with ID:', headerData.id);

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

    if (itemsError) {
      console.error('[ERROR] Supabase items insert failed:', itemsError);
      throw itemsError;
    }

    console.log(`[INFO] Saved ${itemsToInsert.length} items successfully.`);
    res.json({ success: true, id: headerData.id });
  } catch (error: any) {
    console.error('API Error (POST /api/reports):', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  const { header, items } = req.body;
  console.log('[INFO] Updating report ID:', id);

  try {
    const supabase = getSupabase();
    
    // 1. Update header
    const { error: headerError } = await supabase
      .from('reports')
      .update({
        prestador: header.prestador,
        perfil_veiculo: header.perfilVeiculo,
        placa: header.placa,
        data_prestacao: header.dataPrestacao
      })
      .eq('id', id);

    if (headerError) {
      console.error('[ERROR] Supabase header update failed:', headerError);
      throw headerError;
    }

    // 2. Delete old items
    const { error: deleteError } = await supabase
      .from('report_items')
      .delete()
      .eq('report_id', id);

    if (deleteError) {
      console.error('[ERROR] Supabase items delete failed:', deleteError);
      throw deleteError;
    }

    // 3. Insert new items
    const itemsToInsert = items.map((item: any) => ({
      report_id: id,
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

    if (itemsError) {
      console.error('[ERROR] Supabase items re-insert failed:', itemsError);
      throw itemsError;
    }

    console.log('[INFO] Update completed successfully.');
    res.json({ success: true });
  } catch (error: any) {
    console.error(`API Error (PUT /api/reports/${id}):`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error(`API Error (DELETE /api/reports/${id}):`, error.message);
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
      mediaFretePorDia: 0
    };

    const uniqueDays = new Set(data.map(i => i.data)).size;
    stats.mediaFretePorDia = uniqueDays > 0 ? stats.totalFretes / uniqueDays : 0;

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

// Production Handlers
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  });

  app.get('*all', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Dev Handler
async function setupDev() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Development server running at http://localhost:${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== 'production') {
  setupDev();
} else if (!process.env.VERCEL) {
  // Direct production run (e.g. Cloud Run)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running at http://localhost:${PORT}`);
  });
}

export default app;
