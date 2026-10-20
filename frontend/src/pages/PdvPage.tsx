import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  User,
  CreditCard,
  QrCode,
  Banknote,
  ShieldAlert,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { IProduto, ICliente, ICarrinhoItem, FormaPagamento, IVendaCompleta } from '../types';
import { produtosApi, clientesApi, vendasApi } from '../services/api';
import { formatarMoeda } from '../utils/formatters';
import { formatarCPF } from '../utils/cpf.validator';
import { obterImagemProduto } from '../utils/productImages';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

import { Meteors } from '../components/ui/meteors';
import { ButtonMovingBorder } from '../components/ui/moving-border';
import { ManagerApprovalModal } from '../components/ManagerApprovalModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { QuickClienteModal } from '../components/QuickClienteModal';
import { SearchClienteModal } from '../components/SearchClienteModal';

export const PdvPage: React.FC = () => {
  const { usuario } = useAuth();
  const { adicionarToast } = useToast();

  // Estados dos Produtos e Filtros
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState<boolean>(true);
  const [buscaProduto, setBuscaProduto] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS');

  // Estado do Carrinho de Venda
  const [carrinho, setCarrinho] = useState<ICarrinhoItem[]>([]);
  const [codigoBarrasInput, setCodigoBarrasInput] = useState<string>('');

  // Identificação do Cliente (RN-06 - Opcional e Flexível: Consumidor Final, Selecionar Salvo ou Cadastrar Novo)
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<ICliente | null>(null);
  const [modalBuscaClienteAberto, setModalBuscaClienteAberto] = useState<boolean>(false);
  const [modalNovoClienteAberto, setModalNovoClienteAberto] = useState<boolean>(false);

  // Callback de novo cliente cadastrado no balcão (Acesso Caixa, Gerente e Admin)
  const handleClienteCriado = (novoCliente: ICliente) => {
    setClientes((prev) => [novoCliente, ...prev.filter((c) => c.id !== novoCliente.id)]);
    setClienteSelecionado(novoCliente);
    setModalBuscaClienteAberto(false);
  };

  // Desconto e Alçadas (RN-02)
  const [descontoPercentual, setDescontoPercentual] = useState<number>(0);
  const [requerAlcadaDesconto, setRequerAlcadaDesconto] = useState<boolean>(false);

  // Forma de Pagamento e Finalização
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState<boolean>(false);
  const [valorRecebidoDinheiro, setValorRecebidoDinheiro] = useState<string>('');
  const [finalizandoVenda, setFinalizandoVenda] = useState<boolean>(false);

  // Alçada Gerencial (RN-02)
  const [modalAlcadaAberto, setModalAlcadaAberto] = useState<boolean>(false);
  const [gerenteAprovadorId, setGerenteAprovadorId] = useState<number | null>(null);
  const [gerenteAprovadorNome, setGerenteAprovadorNome] = useState<string | null>(null);

  // Estado do Comprovante de Venda Concluída
  const [vendaConcluida, setVendaConcluida] = useState<IVendaCompleta | null>(null);
  const [modalComprovanteAberto, setModalComprovanteAberto] = useState<boolean>(false);

  // Aba Mobile / Tablet: 'catalogo' | 'carrinho'
  const [abaMobile, setAbaMobile] = useState<'catalogo' | 'carrinho'>('catalogo');

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

    adicionarToast('info', 'Produto Adicionado', `${produto.descricao} incluído no carrinho`);
  };

  // Bipagem expressa por código ou leitor de código de barras
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codigoLimpo = codigoBarrasInput.trim().toUpperCase();
    if (!codigoLimpo) return;

    const produtoEncontrado = produtos.find(
      (p) => p.codigo.toUpperCase() === codigoLimpo || p.id.toString() === codigoLimpo
    );

    if (produtoEncontrado) {
      adicionarAoCarrinho(produtoEncontrado);
      setCodigoBarrasInput('');
    } else {
      adicionarToast('error', 'Não Localizado', `Código "${codigoLimpo}" não encontrado no catálogo`);
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
    setRequerAlcadaDesconto(false);
    setGerenteAprovadorId(null);
    setGerenteAprovadorNome(null);
    setClienteSelecionado(null);
  };

  // Cálculos financeiros do carrinho
  const subtotal = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const valorDesconto = (subtotal * descontoPercentual) / 100;
  const valorTotalLiquido = Math.max(0, subtotal - valorDesconto);

  // Monitora alçada de desconto (> 10%)
  const handleDescontoChange = (novoPercentual: number) => {
    const seguro = Math.min(100, Math.max(0, novoPercentual));
    setDescontoPercentual(seguro);

    if (seguro > 10) {
      if (usuario?.cargo === 'GERENTE' || usuario?.cargo === 'ADMIN') {
        setRequerAlcadaDesconto(false);
        setGerenteAprovadorId(usuario.id);
        setGerenteAprovadorNome(usuario.nome);
      } else {
        setRequerAlcadaDesconto(true);
        if (!gerenteAprovadorId) {
          setModalAlcadaAberto(true);
        }
      }
    } else {
      setRequerAlcadaDesconto(false);
      setGerenteAprovadorId(null);
      setGerenteAprovadorNome(null);
    }
  };

  // Callback de aprovação do Gerente
  const handleGerenteAutorizado = (gerenteId: number, nomeGerente: string) => {
    setGerenteAprovadorId(gerenteId);
    setGerenteAprovadorNome(nomeGerente);
    setRequerAlcadaDesconto(false);
    setModalAlcadaAberto(false);
    adicionarToast(
      'success',
      'Alçada Autorizada!',
      `Desconto de ${descontoPercentual}% aprovado por ${nomeGerente}`
    );
  };

  // Filtragem dos produtos
  const produtosFiltrados = produtos.filter((prod) => {
    const matchBusca =
      prod.descricao.toLowerCase().includes(buscaProduto.toLowerCase()) ||
      prod.codigo.toLowerCase().includes(buscaProduto.toLowerCase());
    const matchCat = filtroCategoria === 'TODOS' || prod.categoria === filtroCategoria;
    return matchBusca && matchCat;
  });

  // Abertura do modal de pagamento
  const iniciarPagamento = () => {
    if (carrinho.length === 0) {
      adicionarToast('warning', 'Carrinho Vazio', 'Adicione pelo menos um produto para finalizar');
      return;
    }
    if (requerAlcadaDesconto && !gerenteAprovadorId) {
      adicionarToast(
        'error',
        'Alçada Obrigatória',
        'Descontos acima de 10% precisam ser autorizados pelo Gerente (RN-02)'
      );
      setModalAlcadaAberto(true);
      return;
    }
    setModalPagamentoAberto(true);
  };

  // Atalhos de Teclado Operacionais do PDV (F2, F4, F8, F9, F12, ESC)
  useEffect(() => {
    const handlePdvKeyDown = (e: KeyboardEvent) => {
      // F2: Focar no leitor de código de barras
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
        adicionarToast('info', 'Leitor Ativo [F2]', 'Pronto para bipagem de código');
        return;
      }

      // F4: Abrir Seleção / Cadastro de Cliente
      if (e.key === 'F4') {
        e.preventDefault();
        setModalBuscaClienteAberto(true);
        return;
      }

      // F8: Focar Desconto / Alçada
      if (e.key === 'F8') {
        e.preventDefault();
        const inputDesc = document.getElementById('input-desconto-pdv') as HTMLInputElement;
        if (inputDesc) {
          inputDesc.focus();
          inputDesc.select();
        } else if (requerAlcadaDesconto && !gerenteAprovadorNome) {
          setModalAlcadaAberto(true);
        }
        return;
      }

      // F9: Receber / Finalizar Venda
      if (e.key === 'F9') {
        e.preventDefault();
        if (carrinho.length > 0) {
          iniciarPagamento();
        } else {
          adicionarToast('warning', 'Carrinho Vazio', 'Adicione produtos antes de finalizar [F9]');
        }
        return;
      }

      // F12: Limpar Carrinho
      if (e.key === 'F12') {
        e.preventDefault();
        if (carrinho.length > 0) {
          setCarrinho([]);
          setDescontoPercentual(0);
          setClienteSelecionado(null);
          setGerenteAprovadorId(null);
          setGerenteAprovadorNome(null);
          adicionarToast('info', 'Carrinho Limpo [F12]', 'Todos os itens foram removidos do PDV');
        }
        return;
      }

      // ESC: Fechar modais abertos no PDV
      if (e.key === 'Escape') {
        if (modalPagamentoAberto) setModalPagamentoAberto(false);
        else if (modalBuscaClienteAberto) setModalBuscaClienteAberto(false);
        else if (modalNovoClienteAberto) setModalNovoClienteAberto(false);
        else if (modalAlcadaAberto) setModalAlcadaAberto(false);
        else if (modalComprovanteAberto) setModalComprovanteAberto(false);
      }
    };

    window.addEventListener('keydown', handlePdvKeyDown);
    return () => window.removeEventListener('keydown', handlePdvKeyDown);
  }, [carrinho, modalPagamentoAberto, modalBuscaClienteAberto, modalNovoClienteAberto, modalAlcadaAberto, modalComprovanteAberto, requerAlcadaDesconto, gerenteAprovadorNome]);

  // Conclusão da Venda
  const handleFinalizarVenda = async () => {
    try {
      setFinalizandoVenda(true);

      const payload = {
        cliente_id: clienteSelecionado ? clienteSelecionado.id : null,
        forma_pagamento: formaPagamento,
        desconto: valorDesconto,
        gerente_aprovador_id: gerenteAprovadorId,
        itens: carrinho.map((i) => ({
          produto_id: i.produto.id,
          quantidade: i.quantidade,
        })),
      };

      const vendaRegistrada = await vendasApi.criar(payload);

      setVendaConcluida(vendaRegistrada);
      setModalPagamentoAberto(false);
      setModalComprovanteAberto(true);
      limparCarrinho();
      adicionarToast('success', 'Venda Finalizada com Sucesso!', `Venda #${vendaRegistrada.id} registrada no banco.`);
    } catch (err: any) {
      adicionarToast('error', 'Falha ao Finalizar Venda', err.message || 'Erro de comunicação');
    } finally {
      setFinalizandoVenda(false);
    }
  };

  // Cálculo de troco no dinheiro
  const valorRecebidoNum = parseFloat(valorRecebidoDinheiro) || 0;
  const trocoCalculado = Math.max(0, valorRecebidoNum - valorTotalLiquido);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5 pb-24 lg:pb-8">
      {/* ========================================================================= */}
      {/* 1. TOP BENTO ROW: Comando Rápido, Identificação do Cliente & Status PDV   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Bento 1: Leitor de Código de Barras / SKU Express */}
        <div className="md:col-span-12 lg:col-span-6 glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <Meteors number={8} />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Leitor Express de SKU</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Bipagem instantânea (&lt; 300ms)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              ENTER ou BIP
            </span>
          </div>

          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 relative z-10">
            <div className="relative flex-1">
              <input
                ref={barcodeInputRef}
                type="text"
                value={codigoBarrasInput}
                onChange={(e) => setCodigoBarrasInput(e.target.value)}
                placeholder="Bipe o código de barras ou digite (Ex: 101, 102, 103)..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl glass-input text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-glow-emerald shrink-0"
            >
              Lançar
            </button>
          </form>
        </div>

        {/* Bento 2: Identificação do Cliente (RN-06 - Consumidor Final, Selecionar Salvo ou + Novo Cliente) */}
        <div className="md:col-span-6 lg:col-span-3 glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Cliente (RN-06)
              </span>
            </div>

            {/* Botão de Cadastro Rápido de Novo Cliente (Disponível para Caixa, Gerente e Admin) */}
            <button
              type="button"
              onClick={() => setModalNovoClienteAberto(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-[11px] shadow-xs transition-all btn-interactive"
              title="Cadastrar novo cliente na hora (Caixa, Gerente e Admin)"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Novo Cliente</span>
            </button>
          </div>

          <div className="space-y-2">
            {/* Seletor rápido de tipo de identificação: Consumidor Final vs Salvo */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setClienteSelecionado(null)}
                className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  !clienteSelecionado
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <User className="w-3 h-3 text-slate-400" />
                Consumidor Final
              </button>

              <button
                type="button"
                onClick={() => setModalBuscaClienteAberto(true)}
                className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  clienteSelecionado
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Search className="w-3 h-3" />
                {clienteSelecionado ? 'Trocar Salvo' : 'Buscar Salvo'}
              </button>
            </div>

            {/* Visualização do Estado Atual do Cliente */}
            {!clienteSelecionado ? (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Consumidor Final</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Cliente não quis ser adicionado (Venda sem CPF)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Sem CPF
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalBuscaClienteAberto(true)}
                    className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                    title="Buscar cliente salvo"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-600/40 flex items-center justify-between animate-in fade-in">
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate block">
                      {clienteSelecionado.nome}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 ml-5 block">
                    CPF: {formatarCPF(clienteSelecionado.cpf)}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalBuscaClienteAberto(true)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Trocar
                  </button>
                  <button
                    type="button"
                    onClick={() => setClienteSelecionado(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Desvincular e tornar Consumidor Final"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bento 3: Informações do Caixa & Sessão Ativa */}
        <div className="md:col-span-6 lg:col-span-3 glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Caixa & Terminal
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
              Operando
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                {usuario?.nome || 'Operador'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Terminal #01 &bull; {totalItens} un no carrinho
              </span>
            </div>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatarMoeda(valorTotalLiquido)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Responsivas para Mobile e Tablet (< lg) */}
      <div className="lg:hidden flex items-center p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setAbaMobile('catalogo')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            abaMobile === 'catalogo'
              ? 'bg-white dark:bg-brand-600 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Catálogo ({produtosFiltrados.length})</span>
        </button>
        <button
          onClick={() => setAbaMobile('carrinho')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            abaMobile === 'carrinho'
              ? 'bg-white dark:bg-brand-600 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
          <span>Carrinho ({totalItens} un &bull; {formatarMoeda(valorTotalLiquido)})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRID PRINCIPAL BENTO: Catálogo Amplo à Esquerda & Carrinho à Direita    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Painel Esquerdo: Catálogo Visual Ampliado */}
        <div className={`lg:col-span-7 xl:col-span-8 space-y-4 ${abaMobile === 'carrinho' ? 'hidden lg:block' : 'block'}`}>
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filtro de Categorias */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                {['TODOS', 'Vestuário', 'Acessórios'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFiltroCategoria(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all btn-interactive ${
                      filtroCategoria === cat
                        ? 'bg-brand-600 text-white shadow-sm font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Busca textual de produtos */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  placeholder="Pesquisar por nome ou código..."
                  className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Grid de Cards de Produtos: Total Aproveitamento em Widescreen */}
            {carregandoProdutos ? (
              <div className="py-20 text-center text-slate-400 text-sm">Carregando catálogo com fotos...</div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-sm">
                Nenhum produto encontrado com os filtros aplicados.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-3.5 max-h-[640px] overflow-y-auto pr-1">
                {produtosFiltrados.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => adicionarAoCarrinho(prod)}
                    className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-brand-500/50 text-left transition-all duration-200 flex flex-col justify-between group shadow-xs hover:shadow-md overflow-hidden btn-interactive"
                  >
                    <div className="relative w-full h-28 sm:h-32 mb-2 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/40">
                      <img
                        src={obterImagemProduto(prod.codigo)}
                        alt={prod.descricao}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-1.5 left-1.5 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-white border border-white/10 shadow-sm">
                        #{prod.codigo}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 font-semibold">
                        {prod.categoria}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-white line-clamp-2 leading-snug">
                        {prod.descricao}
                      </h4>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatarMoeda(Number(prod.preco))}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-brand-500/10 group-hover:bg-brand-600 text-brand-600 group-hover:text-white flex items-center justify-center transition-colors">
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
        <div className={`lg:col-span-5 xl:col-span-4 space-y-4 ${abaMobile === 'catalogo' ? 'hidden lg:block' : 'block'}`}>
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 shadow-md flex flex-col justify-between min-h-[620px] xl:sticky xl:top-20">
            <div>
              {/* Header do Carrinho */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-none">
                      Itens da Venda
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Checkout em tempo real</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ml-1">
                    {totalItens} un
                  </span>
                </div>
                {carrinho.length > 0 && (
                  <button
                    onClick={limparCarrinho}
                    className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors btn-interactive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>

              {/* Lista de Itens no Carrinho */}
              {carrinho.length === 0 ? (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Carrinho Vazio</p>
                  <p className="text-xs mt-1">Bipe um código ou selecione produtos no catálogo</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-56 sm:max-h-64 overflow-y-auto my-2 pr-1">
                  {carrinho.map((item) => (
                    <div key={item.produto.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.produto.descricao}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {item.quantidade}x {formatarMoeda(item.preco_unitario)}
                        </p>
                      </div>

                      {/* Controle de quantidade */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => alterarQuantidade(item.produto.id, -1)}
                          className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors btn-interactive"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 w-5 text-center">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => alterarQuantidade(item.produto.id, 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors btn-interactive"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right shrink-0 min-w-16">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {formatarMoeda(item.subtotal)}
                        </p>
                      </div>

                      <button
                        onClick={() => removerDoCarrinho(item.produto.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Resumo do Cliente Vinculado (RN-06) */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Cliente:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {clienteSelecionado ? `${clienteSelecionado.nome} (${formatarCPF(clienteSelecionado.cpf)})` : 'Consumidor Final'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {clienteSelecionado ? (
                    <button
                      type="button"
                      onClick={() => setClienteSelecionado(null)}
                      className="text-[10px] text-rose-500 hover:underline font-bold"
                      title="Voltar para Consumidor Final"
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setModalBuscaClienteAberto(true)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      Buscar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalNovoClienteAberto(true)}
                    className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                    title="Adicionar Novo Cliente no PDV (Caixa, Gerente e Admin)"
                  >
                    <Plus className="w-3 h-3" />
                    Novo
                  </button>
                </div>
              </div>

              {/* Controle de Desconto com Chips Rápidos e Alçada Gerencial (RN-02) */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Desconto Promocional (%):
                  </label>
                  <div className="flex items-center gap-1.5">
                    {/* Chips rápidos de desconto */}
                    {[0, 5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleDescontoChange(pct)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all btn-interactive ${
                          descontoPercentual === pct
                            ? pct > 10
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-brand-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    <input
                      id="input-desconto-pdv"
                      type="number"
                      min="0"
                      max="100"
                      value={descontoPercentual}
                      onChange={(e) => handleDescontoChange(Number(e.target.value))}
                      className="w-14 px-1.5 py-0.5 rounded-md glass-input text-xs text-center font-bold"
                      title="Desconto percentual [F8]"
                    />
                  </div>
                </div>

                {requerAlcadaDesconto && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold leading-tight">
                        Desconto acima de 10% requer autorização gerencial (RN-02)
                      </p>
                      {gerenteAprovadorNome ? (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                          ✓ Alçada autorizada por: {gerenteAprovadorNome}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setModalAlcadaAberto(true)}
                          className="mt-1.5 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider btn-interactive"
                        >
                          Solicitar Autorização do Gerente
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Totais e Botão de Finalizar */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal dos Itens:</span>
                  <span className="font-semibold font-mono">{formatarMoeda(subtotal)}</span>
                </div>
                {valorDesconto > 0 && (
                  <div className="flex justify-between text-rose-500 dark:text-rose-400 font-semibold">
                    <span>Desconto ({descontoPercentual}%):</span>
                    <span className="font-mono">- {formatarMoeda(valorDesconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-800 font-mono">
                  <span>TOTAL A PAGAR:</span>
                  <span>{formatarMoeda(valorTotalLiquido)}</span>
                </div>
              </div>

              {/* Barra de Ajuda Rápida de Teclas de Atalho do Caixa */}
              <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-slate-400 py-1.5 px-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 rounded font-mono font-bold text-slate-700 dark:text-slate-300">F2</kbd> Bipar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 rounded font-mono font-bold text-slate-700 dark:text-slate-300">F4</kbd> Cliente
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 rounded font-mono font-bold text-slate-700 dark:text-slate-300">F8</kbd> Desconto
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 rounded font-mono font-bold text-emerald-600 dark:text-emerald-400">F9</kbd> Pagar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.2 bg-slate-200 dark:bg-slate-800 rounded font-mono font-bold text-rose-500">F12</kbd> Limpar
                </span>
              </div>

              <ButtonMovingBorder
                borderRadius="0.85rem"
                duration={2500}
                containerClassName="w-full"
                borderClassName="bg-[radial-gradient(var(--emerald-500)_40%,transparent_60%)]"
                className="w-full py-3 sm:py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/90 text-white dark:text-emerald-100 font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-emerald-500/40 shadow-glow-emerald disabled:opacity-40 btn-interactive"
                disabled={carrinho.length === 0}
                onClick={iniciarPagamento}
              >
                <CheckCircle2 className="w-5 h-5 text-white dark:text-emerald-400" />
                Receber / Finalizar Venda
              </ButtonMovingBorder>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Pill on Mobile when in Catalog tab and cart has items */}
      {carrinho.length > 0 && abaMobile === 'catalogo' && (
        <div className="lg:hidden fixed bottom-14 left-3 right-3 z-30 animate-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => setAbaMobile('carrinho')}
            className="w-full p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-xl shadow-emerald-900/30 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
                {totalItens}
              </span>
              <span>Ver Carrinho da Venda</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-sm">
              <span>{formatarMoeda(valorTotalLiquido)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Modal de Pagamento */}
      {modalPagamentoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-card border border-emerald-500/40 shadow-2xl overflow-hidden">
            <div className="bg-emerald-500/10 dark:bg-emerald-500/15 border-b border-emerald-500/20 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Fechamento & Pagamento</h3>
              </div>
              <button
                onClick={() => setModalPagamentoAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Total a Pagar
                </span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  {formatarMoeda(valorTotalLiquido)}
                </p>
                {/* Identificação do Cliente na Venda / Nota Fiscal */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-500" />
                    Cliente na Nota:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {clienteSelecionado ? `${clienteSelecionado.nome} (${formatarCPF(clienteSelecionado.cpf)})` : 'Consumidor Final (Sem CPF)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalBuscaClienteAberto(true)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      {clienteSelecionado ? 'Trocar/Novo' : '+ Adicionar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Seletor de Métodos de Pagamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all btn-interactive ${
                          formaPagamento === metodo.id
                            ? 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span>{metodo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Se DINHEIRO: Calculadora de Troco */}
              {formaPagamento === 'DINHEIRO' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Valor Entregue pelo Cliente (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorRecebidoDinheiro}
                      onChange={(e) => setValorRecebidoDinheiro(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-2 rounded-lg glass-input text-sm font-mono"
                    />
                  </div>
                  {valorRecebidoNum > 0 && (
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Troco a Devolver:</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          trocoCalculado > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
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
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center border border-slate-200">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-200">Chave PIX Dinâmica Gerada</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Aguardando confirmação bancária instantânea...
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalPagamentoAberto(false)}
                  disabled={finalizandoVenda}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold btn-interactive"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleFinalizarVenda}
                  disabled={finalizandoVenda}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-emerald disabled:opacity-50 btn-interactive"
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

      {/* Modal de Cadastro Rápido de Cliente no PDV (Caixa, Gerente e Administrador) */}
      <QuickClienteModal
        aberto={modalNovoClienteAberto}
        aoFechar={() => setModalNovoClienteAberto(false)}
        aoClienteCriado={handleClienteCriado}
      />

      {/* Modal de Busca e Seleção de Cliente Salvo (Z-Index 50 Top-Level Overlay) */}
      <SearchClienteModal
        aberto={modalBuscaClienteAberto}
        aoFechar={() => setModalBuscaClienteAberto(false)}
        clientes={clientes}
        clienteSelecionado={clienteSelecionado}
        aoSelecionarCliente={(c) => setClienteSelecionado(c)}
        aoAbrirNovoCliente={() => setModalNovoClienteAberto(true)}
      />
    </div>
  );
};
