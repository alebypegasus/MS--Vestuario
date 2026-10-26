export interface IEmpresa {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual: string | null;
  telefone: string | null;
  email: string | null;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  regime_tributario: string | null;
  mensagem_cupom: string | null;
  logo_url?: string | null;
  logo_texto?: string | null;
  favicon_url?: string | null;
  segmento?: string | null;
  atualizado_em?: Date;
}

export interface IEmpresaAtualizacaoDTO {
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_estadual?: string | null;
  telefone?: string | null;
  email?: string | null;
  logradouro?: string;
  numero?: string;
  complemento?: string | null;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  regime_tributario?: string | null;
  mensagem_cupom?: string | null;
  logo_url?: string | null;
  logo_texto?: string | null;
  favicon_url?: string | null;
  segmento?: string | null;
}
