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
  Tag,
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
      adicionarToast('success', 'Produto Excluído', `O item ${produto.descricao} foi deletado permanentemente.`);
      carregarProdutos();
    } catch (err: any) {
      adicionarToast('error', 'Falha na Exclusão', err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precoNum = parseFloat(formPreco.replace(',', '.'));

    if (isNaN(precoNum) || precoNum <= 0) {
      adicionarToast('warning', 'Preço Inválido', 'Informe um valor numérico positivo para o produto');
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

  const totalAtivos = produtos.filter((p) => p.ativo).length;
  const totalPausados = produtos.filter((p) => !p.ativo).length;
  const precoMedio = produtos.length > 0 ? produtos.reduce((acc, p) => acc + Number(p.preco), 0) / produtos.length : 0;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 lg:pb-8">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>Catálogo de Produtos & Estoque</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isCaixa
              ? 'Consulta de produtos ativos no terminal do caixa'
              : isAdmin
              ? 'Controle total: cadastrar, editar, pausar e excluir produtos'
              : 'Gestão gerencial: cadastrar, editar e pausar produtos'}
          </p>
        </div>

        {isGerenteOuAdmin && (
          <button
            onClick={abrirModalNovo}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-indigo self-start sm:self-auto btn-interactive"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        )}
      </div>

      {/* Top Bento Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total de Itens</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 font-mono">{produtos.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ativos no PDV</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">{totalAtivos}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pausados</span>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 font-mono">{totalPausados}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <PauseCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preço Médio</span>
            <p className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5 font-mono">{formatarMoeda(precoMedio)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por descrição ou código SKU..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs placeholder-slate-400 dark:placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-full sm:w-auto overflow-x-auto">
            {['TODAS', 'Vestuário', 'Acessórios'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all btn-interactive ${
                  filtroCategoria === cat
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visualização em Tabela para Desktop (>= lg) */}
      <div className="hidden lg:block glass-card rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Foto / SKU</th>
                <th className="py-3.5 px-4">Descrição do Produto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4 text-right">Preço Unitário</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {!isCaixa && <th className="py-3.5 px-4 text-center">Permissões & Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {carregando ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    Carregando catálogo de produtos...
                  </td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    Nenhum produto localizado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={obterImagemProduto(prod.codigo)}
                        alt={prod.descricao}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                        #{prod.codigo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">{prod.descricao}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        {prod.categoria || 'Geral'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                      {formatarMoeda(Number(prod.preco))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {prod.ativo ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
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
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-600/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors btn-interactive"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Pausar/Reativar: Liberado para Gerente e Admin */}
                          <button
                            onClick={() => handleAlternarPausa(prod)}
                            title={prod.ativo ? 'Pausar Produto no PDV' : 'Reativar Produto no PDV'}
                            className={`p-1.5 rounded-lg border transition-colors btn-interactive ${
                              prod.ativo
                                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border-slate-200 dark:border-slate-700/60'
                                : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-amber-700 dark:text-amber-300 hover:text-emerald-600 dark:hover:text-emerald-400 border-amber-200 dark:border-amber-500/40'
                            }`}
                          >
                            {prod.ativo ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                          </button>

                          {/* Excluir: EXCLUSIVO DO ADMIN */}
                          {isAdmin && (
                            <button
                              onClick={() => handleExcluirProduto(prod)}
                              title="Excluir Produto Permanentemente (Admin)"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/60 hover:border-rose-400 dark:hover:border-rose-500/40 transition-colors btn-interactive"
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

      {/* Visualização em Cards Responsivos para Mobile e Tablet (< lg) */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {carregando ? (
          <div className="col-span-full py-16 text-center text-slate-400">Carregando catálogo...</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">Nenhum produto localizado.</div>
        ) : (
          produtosFiltrados.map((prod) => (
            <div
              key={prod.id}
              className="glass-card rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={obterImagemProduto(prod.codigo)}
                  alt={prod.descricao}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      #{prod.codigo}
                    </span>
                    {prod.ativo ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <PauseCircle className="w-3 h-3" /> Pausado
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                    {prod.descricao}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {prod.categoria || 'Geral'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Preço</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatarMoeda(Number(prod.preco))}
                  </span>
                </div>

                {!isCaixa && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => abrirModalEditar(prod)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAlternarPausa(prod)}
                      className={`p-2 rounded-xl border text-xs ${
                        prod.ativo
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      }`}
                      title={prod.ativo ? 'Pausar' : 'Reativar'}
                    >
                      {prod.ativo ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleExcluirProduto(prod)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs"
                        title="Deletar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Criação / Edição de Produto */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-card border border-indigo-500/30 shadow-2xl overflow-hidden">
            <div className="bg-indigo-500/10 dark:bg-indigo-500/15 border-b border-indigo-500/20 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {produtoEditando ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Código SKU / Barras
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    placeholder="Ex: 109"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono"
                  />
                  <Barcode className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Descrição Completa
                </label>
                <input
                  type="text"
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: Saia Jeans Evasê M"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  >
                    <option value="Vestuário">Vestuário</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Calçados">Calçados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formPreco}
                    onChange={(e) => setFormPreco(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono"
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
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="chkAtivo" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    Produto Ativo no PDV
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold btn-interactive"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-glow-indigo disabled:opacity-50 btn-interactive"
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
