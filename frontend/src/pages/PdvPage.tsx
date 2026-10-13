import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  ShieldAlert,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  ShoppingBag,
  X,
} from 'lucide-react';
import {
  IProduto,
  ICliente,
  ICarrinhoItem,
  FormaPagamento,
  IVendaCompleta,
} from '../types';
import { produtosApi, clientesApi, vendasApi } from '../services/api';
import { formatarMoeda } from '../utils/formatters';
import { formatarCPF } from '../utils/cpf.validator';
import { obterImagemProduto } from '../utils/productImages';
import { useToast } from '../contexts/ToastContext';
import { ManagerApprovalModal } from '../components/ManagerApprovalModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { Meteors } from '../components/ui/meteors';
import { ButtonMovingBorder } from '../components/ui/moving-border';

export const PdvPage: React.FC = () => {
  const { adicionarToast } = useToast();

  // Estados de Produtos e Catálogo
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS');
  const [buscaProduto, setBuscaProduto] = useState<string>('');
  const [codigoBarrasInput, setCodigoBarrasInput] = useState<string>('');
  const [carregandoProdutos, setCarregandoProdutos] = useState<boolean>(true);

  // Estados do Carrinho
  const [carrinho, setCarrinho] = useState<ICarrinhoItem[]>([]);
  const [descontoPercentual, setDescontoPercentual] = useState<number>(0);

  // Estados de Cliente
  const [identificarCliente, setIdentificarCliente] = useState<boolean>(false);
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<ICliente | null>(null);

  // Estados de Pagamento e Fechamento
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState<boolean>(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [valorRecebidoDinheiro, setValorRecebidoDinheiro] = useState<string>('');
  const [finalizandoVenda, setFinalizandoVenda] = useState<boolean>(false);

  // Estados de Alçada Gerencial (RN-02)
  const [modalAlcadaAberto, setModalAlcadaAberto] = useState<boolean>(false);
  const [gerenteAprovadorId, setGerenteAprovadorId] = useState<number | null>(null);
  const [gerenteAprovadorNome, setGerenteAprovadorNome] = useState<string | null>(null);

  // Estado do Comprovante de Venda Concluída
  const [vendaConcluida, setVendaConcluida] = useState<IVendaCompleta | null>(null);
  const [modalComprovanteAberto, setModalComprovanteAberto] = useState<boolean>(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Carregar produtos e clientes ativos
  useEffect(() => {
    carregarProdutos();
    carregarClientes();
    barcodeInputRef.current?.focus();
  }, []);

  const carregarProdutos = async () => {
    try {
      setCarregandoProdutos(true);
      const lista = await produtosApi.listar({ ativo: true });
      setProdutos(lista);
    } catch (err: any) {
      adicionarToast('error', 'Erro ao carregar produtos', err.message);
    } finally {
      setCarregandoProdutos(false);
    }
  };

  const carregarClientes = async () => {
    try {
      const lista = await clientesApi.listar();
      setClientes(lista);
    } catch {
      // Ignora erro inicial
    }
  };

  // Adição ao carrinho
  const adicionarAoCarrinho = (produto: IProduto) => {
    if (!produto.ativo) {
      adicionarToast('warning', 'Produto Inativo', 'Este produto não está ativo para venda');
      return;
    }

    setCarrinho((prev) => {
      const itemExistente = prev.find((item) => item.produto.id === produto.id);
      if (itemExistente) {
        return prev.map((item) =>
          item.produto.id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
                subtotal: (item.quantidade + 1) * item.preco_unitario,
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            produto,
            quantidade: 1,
            preco_unitario: Number(produto.preco),
            subtotal: Number(produto.preco),
          },
        ];
      }
    });

    adicionarToast('info', 'Item Adicionado', `${produto.descricao} adicionado ao carrinho`);
  };

  // Busca rápida por código de barras / SKU
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoBarrasInput.trim()) return;

    const encontrado = produtos.find(
      (p) =>
        p.codigo.toLowerCase() === codigoBarrasInput.trim().toLowerCase() ||
        String(p.id) === codigoBarrasInput.trim()
    );

    if (encontrado) {
      adicionarAoCarrinho(encontrado);
      setCodigoBarrasInput('');
    } else {
      adicionarToast('warning', 'Não encontrado', `Nenhum produto com código "${codigoBarrasInput}"`);
    }
  };

  const alterarQuantidade = (produtoId: number, delta: number) => {
    setCarrinho((prev) =>
      prev
        .map((item) => {
          if (item.produto.id === produtoId) {
            const novaQtd = item.quantidade + delta;
            return novaQtd > 0
              ? {
                  ...item,
                  quantidade: novaQtd,
                  subtotal: novaQtd * item.preco_unitario,
                }
              : null;
          }
          return item;
        })
        .filter(Boolean) as ICarrinhoItem[]
    );
  };

  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho((prev) => prev.filter((item) => item.produto.id !== produtoId));
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setDescontoPercentual(0);
    setGerenteAprovadorId(null);
    setGerenteAprovadorNome(null);
    setClienteSelecionado(null);
  };

  // Cálculos financeiros do carrinho
  const subtotal = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  const valorDesconto = (subtotal * (descontoPercentual || 0)) / 100;
  const valorTotalLiquido = Math.max(0, subtotal - valorDesconto);
  const requerAlcadaDesconto = descontoPercentual > 10;

  // Alteração de desconto com verificação de RN-02
  const handleDescontoChange = (novoPercentual: number) => {
    const valor = Math.max(0, Math.min(100, novoPercentual));
    setDescontoPercentual(valor);

    if (valor <= 10) {
      setGerenteAprovadorId(null);
      setGerenteAprovadorNome(null);
    } else if (!gerenteAprovadorId) {
      // Abre modal para alçada gerencial
      setModalAlcadaAberto(true);
    }
  };

  const handleGerenteAutorizado = (id: number, nome: string) => {
    setGerenteAprovadorId(id);
    setGerenteAprovadorNome(nome);
    setModalAlcadaAberto(false);
  };

  // Abrir Modal de Pagamento
  const iniciarPagamento = () => {
    if (carrinho.length === 0) {
      adicionarToast('warning', 'Carrinho Vazio', 'Adicione ao menos um item ao carrinho');
      return;
    }

    if (requerAlcadaDesconto && !gerenteAprovadorId) {
      setModalAlcadaAberto(true);
      return;
    }

    setModalPagamentoAberto(true);
  };

  // Finalizar a Venda no Backend
  const handleFinalizarVenda = async () => {
    try {
      setFinalizandoVenda(true);

      const payload = {
        cliente_id: clienteSelecionado ? clienteSelecionado.id : null,
        gerente_aprovador_id: requerAlcadaDesconto ? gerenteAprovadorId : null,
        desconto: Number(valorDesconto.toFixed(2)),
        forma_pagamento: formaPagamento,
        itens: carrinho.map((item) => ({
          produto_id: item.produto.id,
          quantidade: item.quantidade,
        })),
      };

      const vendaRealizada = await vendasApi.criar(payload);

      setVendaConcluida(vendaRealizada);
      setModalPagamentoAberto(false);
      setModalComprovanteAberto(true);
      limparCarrinho();
      adicionarToast('success', 'Venda Realizada!', `Venda #${vendaRealizada.id} finalizada com sucesso`);
    } catch (err: any) {
      adicionarToast('error', 'Falha ao Finalizar Venda', err.message);
    } finally {
      setFinalizandoVenda(false);
    }
  };

  // Filtragem de catálogo
  const produtosFiltrados = produtos.filter((p) => {
    const matchCat =
      filtroCategoria === 'TODOS' ||
      (p.categoria && p.categoria.toUpperCase() === filtroCategoria.toUpperCase());
    const matchBusca =
      !buscaProduto ||
      p.descricao.toLowerCase().includes(buscaProduto.toLowerCase()) ||
      p.codigo.toLowerCase().includes(buscaProduto.toLowerCase());
    return matchCat && matchBusca;
  });

  // Troco para dinheiro
  const valorRecebidoNum = parseFloat(valorRecebidoDinheiro) || 0;
  const trocoCalculado = Math.max(0, valorRecebidoNum - valorTotalLiquido);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar: Código de Barras / SKU com resposta instantânea e Meteors Aceternity */}
      <div className="glass-card rounded-2xl p-4 border border-slate-700/60 shadow-xl flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
        <Meteors number={10} />
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Barcode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Leitor de Código / SKU
            </h2>
            <p className="text-[11px] text-emerald-400 font-medium">Bipagem Expressa (&lt; 300ms)</p>
          </div>
        </div>

        <form onSubmit={handleBarcodeSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={barcodeInputRef}
              type="text"
              value={codigoBarrasInput}
              onChange={(e) => setCodigoBarrasInput(e.target.value)}
              placeholder="Bipe ou digite o código de barras (Ex: 101, 102, 103) e pressione ENTER..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl glass-input text-sm text-white placeholder-slate-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-glow-emerald shrink-0"
          >
            Lançar Item
          </button>
        </form>
      </div>

      {/* Grid Principal: Catálogo Visual à Esquerda & Carrinho à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Catálogo Interativo */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-700/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filtro de Categorias */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
                {['TODOS', 'Vestuário', 'Acessórios'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFiltroCategoria(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filtroCategoria === cat
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Busca textual de produtos */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  placeholder="Filtrar catálogo..."
                  className="w-full px-3 py-1.5 pl-8 rounded-lg glass-input text-xs text-white placeholder-slate-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Grid de Cards de Produtos */}
            {carregandoProdutos ? (
              <div className="py-12 text-center text-slate-400 text-sm">Carregando catálogo...</div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Nenhum produto encontrado com os filtros aplicados.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {produtosFiltrados.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => adicionarAoCarrinho(prod)}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-brand-500/50 text-left transition-all duration-200 flex flex-col justify-between group hover:shadow-lg overflow-hidden"
                  >
                    <div className="relative w-full h-24 mb-2 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/40">
                      <img
                        src={obterImagemProduto(prod.codigo)}
                        alt={prod.descricao}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-1.5 left-1.5 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-200 border border-white/10">
                        #{prod.codigo}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">{prod.categoria}</span>
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
                        {prod.descricao}
                      </h4>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-400">
                        {formatarMoeda(Number(prod.preco))}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-brand-600/30 group-hover:bg-brand-600 text-brand-300 group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel Direito: Carrinho de Compras & Fechamento */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-700/60 shadow-xl flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Header do Carrinho */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-base">Itens da Venda</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {carrinho.reduce((a, b) => a + b.quantidade, 0)} un
                  </span>
                </div>
                {carrinho.length > 0 && (
                  <button
                    onClick={limparCarrinho}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>

              {/* Lista de Itens no Carrinho */}
              {carrinho.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Carrinho vazio</p>
                  <p className="text-xs mt-1">Bipe um código ou selecione produtos no catálogo</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto my-2 pr-1">
                  {carrinho.map((item) => (
                    <div key={item.produto.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {item.produto.descricao}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {item.quantidade}x {formatarMoeda(item.preco_unitario)}
                        </p>
                      </div>

                      {/* Controle de quantidade */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => alterarQuantidade(item.produto.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-100 w-5 text-center">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => alterarQuantidade(item.produto.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right shrink-0 min-w-16">
                        <p className="text-xs font-bold text-slate-100">
                          {formatarMoeda(item.subtotal)}
                        </p>
                      </div>

                      <button
                        onClick={() => removerDoCarrinho(item.produto.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Seção de Identificação de Cliente (RN-01 & RN-06) */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    Cliente Vinculado (RN-06):
                  </span>
                  <button
                    onClick={() => {
                      setIdentificarCliente(!identificarCliente);
                      if (identificarCliente) setClienteSelecionado(null);
                    }}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    {identificarCliente ? 'Remover (Consumidor Final)' : 'Identificar por CPF'}
                  </button>
                </div>

                {identificarCliente && (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <select
                      value={clienteSelecionado ? clienteSelecionado.id : ''}
                      onChange={(e) => {
                        const c = clientes.find((cli) => cli.id === Number(e.target.value));
                        setClienteSelecionado(c || null);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white"
                    >
                      <option value="">Selecione o Cliente Cadastrado...</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} ({formatarCPF(c.cpf)})
                        </option>
                      ))}
                    </select>
                    {clienteSelecionado && (
                      <p className="text-[11px] text-emerald-400 font-medium">
                        Cliente vinculado: {clienteSelecionado.nome} (CPF: {formatarCPF(clienteSelecionado.cpf)})
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Controle de Desconto com Alçada Gerencial (RN-02) */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Desconto Promocional (%):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={descontoPercentual}
                      onChange={(e) => handleDescontoChange(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg glass-input text-xs text-center font-bold text-white"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>

                {requerAlcadaDesconto && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[11px] text-amber-300 font-semibold leading-tight">
                        Desconto acima de 10% requer aprovação de Gerente (RN-02)
                      </p>
                      {gerenteAprovadorNome ? (
                        <p className="text-[10px] text-emerald-400 font-bold mt-1">
                          ✓ Alçada autorizada por: {gerenteAprovadorNome}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setModalAlcadaAberto(true)}
                          className="mt-1.5 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider"
                        >
                          Solicitar Autorização de Gerência
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Totais e Botão de Finalizar */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatarMoeda(subtotal)}</span>
                </div>
                {valorDesconto > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>Desconto ({descontoPercentual}%):</span>
                    <span>- {formatarMoeda(valorDesconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-extrabold text-emerald-400 pt-1 border-t border-slate-800">
                  <span>TOTAL A PAGAR:</span>
                  <span>{formatarMoeda(valorTotalLiquido)}</span>
                </div>
              </div>

              <ButtonMovingBorder
                borderRadius="0.85rem"
                duration={2500}
                containerClassName="w-full"
                borderClassName="bg-[radial-gradient(var(--emerald-500)_40%,transparent_60%)]"
                className="w-full py-3.5 px-4 bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-100 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-emerald-500/40 shadow-glow-emerald disabled:opacity-40"
                disabled={carrinho.length === 0}
                onClick={iniciarPagamento}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Receber / Finalizar Venda
              </ButtonMovingBorder>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {modalPagamentoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-card border border-emerald-500/30 shadow-glow-emerald overflow-hidden">
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-base">Fechamento & Pagamento</h3>
              </div>
              <button
                onClick={() => setModalPagamentoAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-center p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Total a Pagar</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {formatarMoeda(valorTotalLiquido)}
                </p>
              </div>

              {/* Seletor de Métodos de Pagamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PIX', label: 'PIX Instantâneo', icon: QrCode },
                    { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
                    { id: 'CARTAO_DEBITO', label: 'Cartão Débito', icon: CreditCard },
                    { id: 'CARTAO_CREDITO', label: 'Cartão Crédito', icon: CreditCard },
                  ].map((metodo) => {
                    const Icon = metodo.icon;
                    return (
                      <button
                        key={metodo.id}
                        type="button"
                        onClick={() => setFormaPagamento(metodo.id as FormaPagamento)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          formaPagamento === metodo.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-glow-emerald'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{metodo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Se DINHEIRO: Calculadora de Troco */}
              {formaPagamento === 'DINHEIRO' && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Valor Entregue pelo Cliente (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorRecebidoDinheiro}
                      onChange={(e) => setValorRecebidoDinheiro(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-2 rounded-lg glass-input text-sm text-white font-mono"
                    />
                  </div>
                  {valorRecebidoNum > 0 && (
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                      <span className="text-slate-400">Troco a Devolver:</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          trocoCalculado > 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {formatarMoeda(trocoCalculado)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Se PIX: QR Code simulado */}
              {formaPagamento === 'PIX' && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">Chave PIX Dinâmica Gerada</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Aguardando confirmação bancária instantânea...
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalPagamentoAberto(false)}
                  disabled={finalizandoVenda}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleFinalizarVenda}
                  disabled={finalizandoVenda}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-emerald disabled:opacity-50"
                >
                  {finalizandoVenda ? 'Processando...' : 'Confirmar e Imprimir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Autorização de Alçada do Gerente (RN-02) */}
      <ManagerApprovalModal
        aberto={modalAlcadaAberto}
        titulo="Autorização de Alçada - Desconto Especial"
        motivo={`Desconto solicitado de ${descontoPercentual}% excede o limite operacional de 10% (RN-02). É obrigatória a validação de um Gerente ou Administrador.`}
        onConfirmar={handleGerenteAutorizado}
        onCancelar={() => {
          setModalAlcadaAberto(false);
          // Volta o desconto para 10% caso cancelado
          setDescontoPercentual(10);
        }}
      />

      {/* Modal de Comprovante Não-Fiscal da Venda (RN-04) */}
      <ReceiptModal
        aberto={modalComprovanteAberto}
        venda={vendaConcluida}
        onFechar={() => setModalComprovanteAberto(false)}
      />
    </div>
  );
};
