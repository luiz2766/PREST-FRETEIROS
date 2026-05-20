# SQL para criação das tabelas no Supabase

-- Tabela de Relatórios (Cabeçalho)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador TEXT NOT NULL,
  perfil_veiculo TEXT NOT NULL,
  placa TEXT NOT NULL,
  data_prestacao DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens do Romaneio
CREATE TABLE report_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  romaneio TEXT,
  regiao TEXT NOT NULL,
  km_saida NUMERIC,
  km_chegada NUMERIC,
  km_rodado NUMERIC,
  retorno_zero NUMERIC DEFAULT 0,
  diarista NUMERIC DEFAULT 0,
  valor_frete NUMERIC DEFAULT 0,
  produtos TEXT,
  quantidade_cx INTEGER DEFAULT 0,
  quantidade_un INTEGER DEFAULT 0,
  vale NUMERIC DEFAULT 0,
  valor_total NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX idx_reports_placa ON reports(placa);
CREATE INDEX idx_reports_data_prestacao ON reports(data_prestacao);
CREATE INDEX idx_report_items_report_id ON report_items(report_id);
