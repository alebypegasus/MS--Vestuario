// ============================================================================
// CLIENTE HTTP E SERVIÇOS DE INTEGRAÇÃO COM A API BACKEND
// ============================================================================

import {
  IUsuarioLoginDTO,
  IUsuarioRespostaLogin,
  IGerenteValidacaoResposta,
  IUsuario,
  IUsuarioCriacaoDTO,
  IUsuarioAtualizacaoDTO,
  ICliente,
  IClienteCriacaoDTO,
  IClienteAtualizacaoDTO,
  IProduto,
  IProdutoCriacaoDTO,
  IProdutoAtualizacaoDTO,
  IVendaCriacaoDTO,
  IVendaCompleta,
  IVenda,
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  status: number;
  detalhes?: any;

  constructor(mensagem: string, status: number, detalhes?: any) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.erro || data?.message || `Erro na requisição: ${response.statusText}`;
    throw new ApiError(errorMsg, response.status, data?.detalhes || data);
  }

  return data as T;
}

// 1. Serviços de Autenticação
export const authApi = {
  login: (dados: IUsuarioLoginDTO) =>
    request<IUsuarioRespostaLogin>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  validarGerente: (email: string, senha: string) =>
    request<IGerenteValidacaoResposta>('/auth/validar-gerente', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),
};

// 2. Serviços de Usuários / Equipe (Restrito a ADMIN)
export const usuariosApi = {
  listar: () => request<IUsuario[]>('/usuarios'),
  obterPorId: (id: number) => request<IUsuario>(`/usuarios/${id}`),
  criar: (dados: IUsuarioCriacaoDTO) =>
    request<IUsuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
  atualizar: (id: number, dados: IUsuarioAtualizacaoDTO) =>
    request<IUsuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),
  desativar: (id: number) =>
    request<{ mensagem: string }>(`/usuarios/${id}`, {
      method: 'DELETE',
    }),
};

// 3. Serviços de Produtos
export const produtosApi = {
  listar: (filtros?: { categoria?: string; ativo?: boolean; busca?: string }) => {
    const params = new URLSearchParams();
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));
    if (filtros?.busca) params.append('busca', filtros.busca);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<IProduto[]>(`/produtos${query}`);
  },
  obterPorCodigo: (codigo: string) => request<IProduto>(`/produtos/codigo/${codigo}`),
  obterPorId: (id: number) => request<IProduto>(`/produtos/${id}`),
  criar: (dados: IProdutoCriacaoDTO) =>
    request<IProduto>('/produtos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
  atualizar: (id: number, dados: IProdutoAtualizacaoDTO) =>
    request<IProduto>(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),
  alternarStatus: (id: number) =>
    request<{ mensagem: string }>(`/produtos/${id}/status`, {
      method: 'PATCH',
    }),
  excluir: (id: number) =>
    request<{ mensagem: string }>(`/produtos/${id}`, {
      method: 'DELETE',
    }),
};

// 4. Serviços de Clientes
export const clientesApi = {
  listar: (busca?: string) => {
    const query = busca ? `?busca=${encodeURIComponent(busca)}` : '';
    return request<ICliente[]>(`/clientes${query}`);
  },
  obterPorCpf: (cpf: string) => request<ICliente>(`/clientes/cpf/${cpf}`),
  obterPorId: (id: number) => request<ICliente>(`/clientes/${id}`),
  criar: (dados: IClienteCriacaoDTO) =>
    request<ICliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
  atualizar: (id: number, dados: IClienteAtualizacaoDTO) =>
    request<ICliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),
};

// 5. Serviços de Vendas
export const vendasApi = {
  listar: (filtros?: { status?: string; data_inicio?: string; data_fim?: string }) => {
    const params = new URLSearchParams();
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<IVendaCompleta[]>(`/vendas${query}`);
  },
  obterPorId: (id: number) => request<IVendaCompleta>(`/vendas/${id}`),
  criar: (dados: IVendaCriacaoDTO) =>
    request<IVendaCompleta>('/vendas', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
  cancelar: (id: number, dados: { motivo_cancelamento: string; gerente_aprovador_id: number }) =>
    request<IVenda>(`/vendas/${id}/cancelar`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),
};

// 6. Serviços de Configuração da Empresa (Fiscal & Nota)
export const empresaApi = {
  obter: () => request<import('../types').IEmpresa>('/empresa'),
  atualizar: (dados: import('../types').IEmpresaAtualizacaoDTO) =>
    request<import('../types').IEmpresa>('/empresa', {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),
};
