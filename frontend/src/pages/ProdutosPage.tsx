import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  X,
  Barcode,
  PauseCircle,
  PlayCircle,
  Trash2,
} from 'lucide-react';
import { IProduto, IProdutoCriacaoDTO, IProdutoAtualizacaoDTO } from '../types';
import { produtosApi } from '../services/api';
import { formatarMoeda } from '../utils/formatters';
import { obterImagemProduto } from '../utils/productImages';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export const ProdutosPage: React.FC = () => {
  const { isAdmin, isGerenteOuAdmin, isCaixa } = useAuth();
  const { adicionarToast } = useToast();

  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');

  // Modal de Criação / Edição
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [produtoEditando, setProdutoEditando] = useState<IProduto | null>(null);
  const [formCodigo, setFormCodigo] = useState<string>('');
  const [formDescricao, setFormDescricao] = useState<string>('');
  const [formCategoria, setFormCategoria] = useState<string>('Vestuário');
  const [formPreco, setFormPreco] = useState<string>('');
  const [formAtivo, setFormAtivo] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      // Para Caixa, traz somente ativos; para Gerente e Admin, traz todos (incluindo pausados)
      const lista = await produtosApi.listar({ ativo: isCaixa ? true : undefined });
      setProdutos(lista);
    } catch (err: any) {
      adicionarToast('error', 'Falha ao buscar produtos', err.message);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalNovo = () => {
    setProdutoEditando(null);
    setFormCodigo('');
    setFormDescricao('');
    setFormCategoria('Vestuário');
    setFormPreco('');
    setFormAtivo(true);
    setModalAberto(true);
  };

  const abrirModalEditar = (produto: IProduto) => {
    setProdutoEditando(produto);
    setFormCodigo(produto.codigo);
    setFormDescricao(produto.descricao);
    setFormCategoria(produto.categoria || 'Vestuário');
    setFormPreco(String(produto.preco));
    setFormAtivo(produto.ativo);
    setModalAberto(true);
  };

  // Gerente e Admin podem pausar/reativar produto
  const handleAlternarPausa = async (produto: IProduto) => {
    try {
      await produtosApi.alternarStatus(produto.id);
      adicionarToast(
        'info',
        produto.ativo ? 'Produto Pausado' : 'Produto Reativado',
        `O item ${produto.descricao} foi ${produto.ativo ? 'pausado e retirado do PDV' : 'reativado para venda'}.`
      );
      carregarProdutos();
    } catch (err: any) {
      adicionarToast('error', 'Erro ao alterar status', err.message);
    }
  };

  // SOMENTE Admin pode excluir produto
  const handleExcluirProduto = async (produto: IProduto) => {
    if (!isAdmin) {
      adicionarToast('warning', 'Acesso Negado', 'Somente o Administrador tem permissão para deletar produtos.');
      return;
    }

    if (!window.confirm(`Confirma a exclusão permanente do produto "${produto.descricao}"?`)) {
      return;
    }

    try {
      await produtosApi.excluir(produto.id);
      adicionarToast('success', 'Produto Excluído', `O produto #${produto.codigo} foi excluído do catálogo.`);
      carregarProdutos();
    } catch (err: any) {
      adicionarToast('error', 'Não foi possível excluir', err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precoNum = parseFloat(formPreco);

    if (isNaN(precoNum) || precoNum <= 0) {
      adicionarToast('warning', 'Preço Inválido', 'Informe um preço unitário maior que zero');
      return;
    }

    try {
      setSalvando(true);

      if (produtoEditando) {
        const dadosAtualizacao: IProdutoAtualizacaoDTO = {
          codigo: formCodigo.trim(),
          descricao: formDescricao.trim(),
          categoria: formCategoria.trim() || null,
          preco: precoNum,
          ativo: formAtivo,
        };
        await produtosApi.atualizar(produtoEditando.id, dadosAtualizacao);
        adicionarToast('success', 'Produto Atualizado', 'As alterações foram salvas com sucesso');
      } else {
        const dadosCriacao: IProdutoCriacaoDTO = {
          codigo: formCodigo.trim(),
          descricao: formDescricao.trim(),
          categoria: formCategoria.trim() || null,
          preco: precoNum,
        };
        await produtosApi.criar(dadosCriacao);
        adicionarToast('success', 'Produto Cadastrado', 'Novo item adicionado ao catálogo');
      }

      setModalAberto(false);
      carregarProdutos();
    } catch (err: any) {
      adicionarToast('error', 'Erro ao salvar', err.message);
    } finally {
      setSalvando(false);
    }
  };

  const produtosFiltrados = produtos.filter((p) => {
    const matchCat =
      filtroCategoria === 'TODAS' ||
      (p.categoria && p.categoria.toUpperCase() === filtroCategoria.toUpperCase());
    const matchBusca =
      !busca ||
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-indigo-400" />
            Catálogo de Produtos & Estoque
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isCaixa
              ? 'Visualização de produtos ativos para consulta no caixa'
              : isAdmin
              ? 'Controle total: cadastrar, editar, pausar e excluir produtos'
              : 'Gestão gerencial: cadastrar, editar e pausar produtos'}
          </p>
        </div>

        {isGerenteOuAdmin && (
          <button
            onClick={abrirModalNovo}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-indigo self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por descrição ou código SKU..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
            {['TODAS', 'Vestuário', 'Acessórios'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filtroCategoria === cat
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Produtos com Fotos Reais */}
      <div className="glass-card rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Foto / SKU</th>
                <th className="py-3 px-4">Descrição do Produto</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-right">Preço Unitário</th>
                <th className="py-3 px-4 text-center">Status</th>
                {!isCaixa && <th className="py-3 px-4 text-center">Permissões & Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {carregando ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Carregando catálogo de produtos...
                  </td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Nenhum produto localizado.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={obterImagemProduto(prod.codigo)}
                        alt={prod.descricao}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="font-mono font-bold text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        #{prod.codigo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{prod.descricao}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                        {prod.categoria || 'Geral'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm">
                      {formatarMoeda(Number(prod.preco))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {prod.ativo ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                          <PauseCircle className="w-3.5 h-3.5" /> Pausado
                        </span>
                      )}
                    </td>

                    {/* Regras Estritas de RBAC */}
                    {!isCaixa && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Editar: Liberado para Gerente e Admin */}
                          <button
                            onClick={() => abrirModalEditar(prod)}
                            title="Editar Dados do Produto"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Pausar/Reativar: Liberado para Gerente e Admin */}
                          <button
                            onClick={() => handleAlternarPausa(prod)}
                            title={prod.ativo ? 'Pausar Produto no PDV' : 'Reativar Produto no PDV'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              prod.ativo
                                ? 'bg-slate-800 hover:bg-amber-950/50 text-slate-400 hover:text-amber-400 border-slate-700/60 hover:border-amber-500/40'
                                : 'bg-amber-950/40 hover:bg-emerald-950/50 text-amber-300 hover:text-emerald-400 border-amber-500/40'
                            }`}
                          >
                            {prod.ativo ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                          </button>

                          {/* Excluir: EXCLUSIVO DO ADMIN */}
                          {isAdmin && (
                            <button
                              onClick={() => handleExcluirProduto(prod)}
                              title="Excluir Produto Permanentemente (Admin)"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição de Produto */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-card border border-indigo-500/30 shadow-glow-indigo overflow-hidden">
            <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-base">
                {produtoEditando ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button onClick={() => setModalAberto(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Código SKU / Barras
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    placeholder="Ex: 109"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-mono"
                  />
                  <Barcode className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descrição Completa
                </label>
                <input
                  type="text"
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: Saia Jeans Evasê M"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Categoria</label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  >
                    <option value="Vestuário">Vestuário</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Calçados">Calçados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formPreco}
                    onChange={(e) => setFormPreco(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-mono"
                  />
                </div>
              </div>

              {produtoEditando && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="chkAtivo"
                    checked={formAtivo}
                    onChange={(e) => setFormAtivo(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="chkAtivo" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Produto Ativo no PDV
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-indigo disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
