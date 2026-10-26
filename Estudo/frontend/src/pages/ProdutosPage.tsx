import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  AlertTriangle,
  Layers,
  Palette,
  Ruler,
  DollarSign,
  Boxes,
  Sparkles,
  Info,
  Upload,
  Image as ImageIcon,
  FolderTree,
  Calendar,
  Shield,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IProduto, IProdutoCriacaoDTO, IProdutoAtualizacaoDTO, ICategoria } from '../types';
import { produtosApi, categoriasApi } from '../services/api';
import { formatarMoeda } from '../utils/formatters';
import { obterImagemProduto } from '../utils/productImages';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { exportarParaCSV, exportarParaExcel, exportarRelatorioPDF } from '../utils/exportUtils';
import { obterExemploProduto } from '../utils/dataGenerators';
import { CategoriasManagerModal } from '../components/CategoriasManagerModal';

export const ProdutosPage: React.FC = () => {
  const { isAdmin, isGerenteOuAdmin, isCaixa } = useAuth();
  const { adicionarToast } = useToast();

  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [modalCategoriasAberto, setModalCategoriasAberto] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ATIVOS' | 'PAUSADOS' | 'ESTOQUE_BAIXO'>('TODOS');
  const [menuExportarAberto, setMenuExportarAberto] = useState<boolean>(false);
  const [menuSugestaoAberto, setMenuSugestaoAberto] = useState<boolean>(false);

  // Modal de Criação / Edição
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [produtoEditando, setProdutoEditando] = useState<IProduto | null>(null);
  const [formCodigo, setFormCodigo] = useState<string>('');
  const [formDescricao, setFormDescricao] = useState<string>('');
  const [formCategoria, setFormCategoria] = useState<string>('Vestuário & Moda');
  const [formSubcategoria, setFormSubcategoria] = useState<string>('');
  const [formTipo, setFormTipo] = useState<string>('');
  const [formUnidadeMedida, setFormUnidadeMedida] = useState<string>('UN');
  const [formCodigoBarras, setFormCodigoBarras] = useState<string>('');
  const [formMarca, setFormMarca] = useState<string>('');
  const [formModelo, setFormModelo] = useState<string>('');
  const [formGarantia, setFormGarantia] = useState<string>('');
  const [formDataValidade, setFormDataValidade] = useState<string>('');
  const [formLote, setFormLote] = useState<string>('');
  const [formCores, setFormCores] = useState<string>('');
  const [formTamanhos, setFormTamanhos] = useState<string>('');
  const [formDetalhes, setFormDetalhes] = useState<string>('');
  const [formImagens, setFormImagens] = useState<string>('');
  const [formEstoque, setFormEstoque] = useState<number>(50);
  const [formEstoqueMinimo, setFormEstoqueMinimo] = useState<number>(10);
  const [formPrecoCusto, setFormPrecoCusto] = useState<string>('0.00');
  const [formPreco, setFormPreco] = useState<string>('');
  const [formAtivo, setFormAtivo] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const productFileRef = useRef<HTMLInputElement>(null);

  const handleProductImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        adicionarToast('warning', 'Arquivo Grande', 'Recomendamos imagens de até 2MB');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormImagens(base64);
        adicionarToast('success', 'Imagem Carregada', 'Foto do produto anexada.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverImagemProduto = () => {
    setFormImagens('');
    if (productFileRef.current) productFileRef.current.value = '';
    adicionarToast('info', 'Sem Imagem', 'O produto foi configurado sem foto.');
  };

  const handlePreencherExemploProduto = (segmento?: string) => {
    setMenuSugestaoAberto(false);
    const ex = obterExemploProduto(segmento);
    setFormCodigo(ex.codigo);
    setFormDescricao(ex.descricao);
    setFormCategoria(ex.categoria);
    setFormSubcategoria(ex.subcategoria || '');
    setFormTipo(ex.tipo || '');
    setFormUnidadeMedida(ex.unidade_medida || 'UN');
    setFormCodigoBarras(ex.codigo_barras || '');
    setFormMarca(ex.marca || '');
    setFormModelo(ex.modelo || '');
    setFormGarantia(ex.garantia || '');
    setFormDataValidade(ex.data_validade || '');
    setFormLote(ex.lote || '');
    setFormCores(ex.cores || '');
    setFormTamanhos(ex.tamanhos || '');
    setFormDetalhes(ex.detalhes || '');
    setFormPrecoCusto(ex.precoCusto || '0.00');
    setFormPreco(ex.preco);
    setFormEstoque(ex.estoque || 50);
    setFormEstoqueMinimo(ex.estoqueMinimo || 10);
    adicionarToast('success', 'Produto Sugerido!', `Exemplo "${ex.descricao}" preenchido.`);
  };

  useEffect(() => {
    carregarProdutos();
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const lista = await categoriasApi.listar();
      setCategorias(lista);
    } catch {
      // Manter vazio caso offline
    }
  };

  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      const lista = await produtosApi.listar({ ativo: isCaixa ? true : 'todos' });
      setProdutos(lista);
    } catch (err: any) {
      adicionarToast('error', 'Falha ao buscar produtos', err.message);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalNovo = () => {
    setProdutoEditando(null);
    setFormCodigo(String(Math.floor(100 + Math.random() * 900)));
    setFormDescricao('');
    setFormCategoria(categorias.length > 0 ? categorias[0].nome : 'Geral');
    setFormSubcategoria('');
    setFormTipo('');
    setFormUnidadeMedida('UN');
    setFormCodigoBarras('');
    setFormMarca('');
    setFormModelo('');
    setFormGarantia('');
    setFormDataValidade('');
    setFormLote('');
    setFormCores('');
    setFormTamanhos('');
    setFormDetalhes('');
    setFormImagens('');
    setFormEstoque(50);
    setFormEstoqueMinimo(10);
    setFormPrecoCusto('0.00');
    setFormPreco('');
    setFormAtivo(true);
    setModalAberto(true);
  };

  const abrirModalEditar = (produto: IProduto) => {
    setProdutoEditando(produto);
    setFormCodigo(produto.codigo);
    setFormDescricao(produto.descricao);
    setFormCategoria(produto.categoria || 'Geral');
    setFormSubcategoria(produto.subcategoria || '');
    setFormTipo(produto.tipo || '');
    setFormUnidadeMedida(produto.unidade_medida || 'UN');
    setFormCodigoBarras(produto.codigo_barras || '');
    setFormMarca(produto.marca || '');
    setFormModelo(produto.modelo || '');
    setFormGarantia(produto.garantia || '');
    setFormDataValidade(produto.data_validade || '');
    setFormLote(produto.lote || '');
    setFormCores(Array.isArray(produto.cores) ? produto.cores.join(', ') : produto.cores || '');
    setFormTamanhos(Array.isArray(produto.tamanhos) ? produto.tamanhos.join(', ') : produto.tamanhos || '');
    setFormDetalhes(produto.detalhes || '');
    setFormImagens(Array.isArray(produto.imagens) ? produto.imagens.join(', ') : produto.imagens || '');
    setFormEstoque(produto.estoque !== undefined ? produto.estoque : 50);
    setFormEstoqueMinimo(produto.estoque_minimo !== undefined ? produto.estoque_minimo : 10);
    setFormPrecoCusto(produto.preco_custo !== undefined ? String(produto.preco_custo) : '0.00');
    setFormPreco(String(produto.preco));
    setFormAtivo(produto.ativo);
    setModalAberto(true);
  };

  const handleAlternarPausa = async (produto: IProduto) => {
    try {
      const resp = await produtosApi.alternarStatus(produto.id, !produto.ativo);
      const novoStatus = resp.ativo !== undefined ? resp.ativo : !produto.ativo;
      setProdutos((prev) =>
        prev.map((p) => (p.id === produto.id ? { ...p, ativo: novoStatus } : p))
      );
      adicionarToast(
        'info',
        novoStatus ? 'Produto Reativado' : 'Produto Pausado',
        `O item ${produto.descricao} foi ${novoStatus ? 'reativado para venda no PDV' : 'pausado e retirado do PDV'}.`
      );
    } catch (err: any) {
      adicionarToast('error', 'Erro ao alterar status', err.message);
    }
  };

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
    const precoCustoNum = parseFloat(formPrecoCusto.replace(',', '.')) || 0;

    if (isNaN(precoNum) || precoNum <= 0) {
      adicionarToast('warning', 'Preço Inválido', 'Informe um valor numérico positivo para o produto');
      return;
    }

    try {
      setSalvando(true);

      const coresFormatadas = formCores
        ? formCores.split(',').map((s) => s.trim()).filter(Boolean)
        : null;
      const tamanhosFormatados = formTamanhos
        ? formTamanhos.split(',').map((s) => s.trim()).filter(Boolean)
        : null;
      const imagensFormatadas = formImagens
        ? formImagens.split(',').map((s) => s.trim()).filter(Boolean)
        : null;

      if (produtoEditando) {
        const dadosAtualizacao: IProdutoAtualizacaoDTO = {
          codigo: formCodigo.trim(),
          descricao: formDescricao.trim(),
          categoria: formCategoria.trim() || null,
          subcategoria: formSubcategoria.trim() || null,
          tipo: formTipo.trim() || null,
          unidade_medida: formUnidadeMedida.trim() || 'UN',
          codigo_barras: formCodigoBarras.trim() || null,
          marca: formMarca.trim() || null,
          modelo: formModelo.trim() || null,
          garantia: formGarantia.trim() || null,
          data_validade: formDataValidade.trim() || null,
          lote: formLote.trim() || null,
          cores: coresFormatadas,
          tamanhos: tamanhosFormatados,
          detalhes: formDetalhes.trim() || null,
          imagens: imagensFormatadas,
          estoque: formEstoque,
          estoque_minimo: formEstoqueMinimo,
          preco_custo: precoCustoNum,
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
          subcategoria: formSubcategoria.trim() || null,
          tipo: formTipo.trim() || null,
          unidade_medida: formUnidadeMedida.trim() || 'UN',
          codigo_barras: formCodigoBarras.trim() || null,
          marca: formMarca.trim() || null,
          modelo: formModelo.trim() || null,
          garantia: formGarantia.trim() || null,
          data_validade: formDataValidade.trim() || null,
          lote: formLote.trim() || null,
          cores: coresFormatadas,
          tamanhos: tamanhosFormatados,
          detalhes: formDetalhes.trim() || null,
          imagens: imagensFormatadas,
          estoque: formEstoque,
          estoque_minimo: formEstoqueMinimo,
          preco_custo: precoCustoNum,
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

  const getFotoPrincipal = (prod: IProduto): string | null => {
    if (prod.imagens && Array.isArray(prod.imagens) && prod.imagens.length > 0 && prod.imagens[0]) {
      return prod.imagens[0];
    }
    if (typeof prod.imagens === 'string' && prod.imagens.trim().length > 0) {
      return prod.imagens.split(',')[0].trim();
    }
    const codigoNum = parseInt(prod.codigo, 10);
    if (!isNaN(codigoNum) && codigoNum >= 101 && codigoNum <= 108) {
      return obterImagemProduto(prod.codigo);
    }
    return null;
  };

  const produtosFiltrados = produtos.filter((p) => {
    const matchCat =
      filtroCategoria === 'TODAS' ||
      (p.categoria && p.categoria.toUpperCase() === filtroCategoria.toUpperCase());
    const matchBusca =
      !busca ||
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      (p.tipo && p.tipo.toLowerCase().includes(busca.toLowerCase()));
    const matchStatus =
      filtroStatus === 'TODOS' ||
      (filtroStatus === 'ATIVOS' && p.ativo) ||
      (filtroStatus === 'PAUSADOS' && !p.ativo) ||
      (filtroStatus === 'ESTOQUE_BAIXO' && (p.estoque || 0) <= (p.estoque_minimo || 10));
    return matchCat && matchBusca && matchStatus;
  });

  const totalAtivos = produtos.filter((p) => p.ativo).length;
  const totalPausados = produtos.filter((p) => !p.ativo).length;
  const totalEstoqueBaixo = produtos.filter((p) => (p.estoque || 0) <= (p.estoque_minimo || 10)).length;
  const precoMedio = produtos.length > 0 ? produtos.reduce((acc, p) => acc + Number(p.preco), 0) / produtos.length : 0;
  const totalEstoqueUnidades = produtos.reduce((acc, p) => acc + (p.estoque || 0), 0);

  const colunasProdutos = ['Código SKU', 'Descrição', 'Categoria', 'Tipo', 'Estoque', 'Preço Unitário (R$)', 'Status'];
  const obterLinhasProdutos = () =>
    produtosFiltrados.map((p) => [
      `#${p.codigo}`,
      p.descricao,
      p.categoria || 'Geral',
      p.tipo || 'Padrão',
      String(p.estoque || 0),
      formatarMoeda(Number(p.preco)),
      p.ativo ? 'Ativo no PDV' : 'Pausado',
    ]);

  const handleExportarExcel = () => {
    setMenuExportarAberto(false);
    const linhas = obterLinhasProdutos();
    const totais = [
      { label: 'Total de Itens', valor: String(produtosFiltrados.length) },
      { label: 'Itens Ativos no PDV', valor: String(totalAtivos) },
      { label: 'Total Unidades em Estoque', valor: String(totalEstoqueUnidades) },
      { label: 'Preço Médio do Catálogo', valor: formatarMoeda(precoMedio) },
    ];
    exportarParaExcel('catalogo_produtos_ms2', 'Catálogo de Produtos & Estoque', colunasProdutos, linhas, totais);
    adicionarToast('success', 'Excel Gerado!', 'Catálogo baixado em formato Excel.');
  };

  const handleExportarCSV = () => {
    setMenuExportarAberto(false);
    exportarParaCSV('catalogo_produtos_ms2', colunasProdutos, obterLinhasProdutos());
    adicionarToast('success', 'CSV Exportado!', 'Arquivo CSV baixado.');
  };

  const handleExportarPDF = () => {
    setMenuExportarAberto(false);
    const linhas = obterLinhasProdutos();
    const totais = [
      { label: 'Total de Itens', valor: String(produtosFiltrados.length) },
      { label: 'Preço Médio', valor: formatarMoeda(precoMedio) },
      { label: 'Total em Estoque', valor: `${totalEstoqueUnidades} pçs` },
    ];
    exportarRelatorioPDF({
      titulo: 'Catálogo de Produtos & Gestão de Estoque',
      subtitulo: `Filtro: ${filtroCategoria} • Sistema MS² Vestuário`,
      colunas: colunasProdutos,
      linhas,
      totais,
    });
    adicionarToast('info', 'Gerando PDF', 'Janela de impressão A4 aberta.');
  };

  // Cálculo ao vivo de margem no modal
  const precoCustoDigitado = parseFloat(formPrecoCusto.replace(',', '.')) || 0;
  const precoVendaDigitado = parseFloat(formPreco.replace(',', '.')) || 0;
  const margemBrutaPercent =
    precoVendaDigitado > 0
      ? (((precoVendaDigitado - precoCustoDigitado) / precoVendaDigitado) * 100).toFixed(1)
      : '0.0';

  const categoriaSelecionadaObj = categorias.find(
    (c) => c.nome.toLowerCase() === formCategoria.toLowerCase()
  );
  const subcategoriasDisponiveis = categoriaSelecionadaObj?.subcategorias || [];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 lg:pb-8">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Catálogo & Almoxarifado
            </span>
            <span className="text-[10px] font-semibold text-slate-400">RN-03 / Controle de Estoque</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <span>Catálogo de Produtos & Grade Multi-Atributo</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isCaixa
              ? 'Consulta de produtos ativos, grade de cores, tamanhos e estoque no PDV'
              : isAdmin
              ? 'Administração global: SKU, modelagens, cores, tamanhos, fotos, estoque e margens'
              : 'Gestão de catálogo, edição de variantes e controle de disponibilidade'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Dropdown de Exportação */}
          <div className="relative">
            <button
              onClick={() => setMenuExportarAberto(!menuExportarAberto)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold glass-card hover:border-indigo-400 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all btn-interactive"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Exportar</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {menuExportarAberto && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-card border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-30 animate-in fade-in">
                <button
                  onClick={handleExportarExcel}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Planilha Excel (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportarPDF}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Relatório PDF (A4)</span>
                </button>
                <button
                  onClick={handleExportarCSV}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                  <span>Arquivo CSV (UTF-8)</span>
                </button>
              </div>
            )}
          </div>

          {isGerenteOuAdmin && (
            <button
              type="button"
              onClick={() => setModalCategoriasAberto(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all btn-interactive"
              title="Gerenciar Categorias e Subcategorias para qualquer ramo"
            >
              <FolderTree className="w-4 h-4 text-indigo-500" />
              <span>Categorias & Subcategorias</span>
            </button>
          )}

          {isGerenteOuAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={abrirModalNovo}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-glow-indigo"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </motion.button>
          )}
        </div>
      </div>

      {/* Top Bento Metrics Row (Interativo) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => setFiltroStatus('TODOS')}
          className={`glass-card rounded-2xl p-4 text-left flex items-center justify-between transition-all ${
            filtroStatus === 'TODOS'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
              : 'hover:border-indigo-400'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Catálogo
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
              {produtos.length}
            </p>
            <span className="text-[10px] text-slate-400">{totalEstoqueUnidades} pçs totais</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => setFiltroStatus('ATIVOS')}
          className={`glass-card rounded-2xl p-4 text-left flex items-center justify-between transition-all ${
            filtroStatus === 'ATIVOS'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
              : 'hover:border-emerald-400'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ativos no PDV
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              {totalAtivos}
            </p>
            <span className="text-[10px] text-emerald-600/80">Prontos p/ venda</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => setFiltroStatus('ESTOQUE_BAIXO')}
          className={`glass-card rounded-2xl p-4 text-left flex items-center justify-between transition-all ${
            filtroStatus === 'ESTOQUE_BAIXO'
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
              : 'hover:border-rose-400'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Estoque Baixo
            </span>
            <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 font-mono">
              {totalEstoqueBaixo}
            </p>
            <span className="text-[10px] text-rose-600/80">Abaixo do mín.</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          onClick={() => setFiltroStatus('PAUSADOS')}
          className={`glass-card rounded-2xl p-4 text-left flex items-center justify-between transition-all ${
            filtroStatus === 'PAUSADOS'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
              : 'hover:border-amber-400'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pausados
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
              {totalPausados}
            </p>
            <span className="text-[10px] text-amber-600/80">Ocultos no checkout</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <PauseCircle className="w-5 h-5" />
          </div>
        </motion.button>
      </div>

      {/* Barra de Filtros, Categorias e Pesquisa */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição, SKU, modelagem..."
            className="w-full px-3.5 py-2.5 pl-10 rounded-xl glass-input text-xs placeholder-slate-400 dark:placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro de Status */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setFiltroStatus('TODOS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filtroStatus === 'TODOS'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({produtos.length})
            </button>
            <button
              onClick={() => setFiltroStatus('ATIVOS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filtroStatus === 'ATIVOS'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              Ativos ({totalAtivos})
            </button>
            <button
              onClick={() => setFiltroStatus('ESTOQUE_BAIXO')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filtroStatus === 'ESTOQUE_BAIXO'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              Baixo ({totalEstoqueBaixo})
            </button>
            <button
              onClick={() => setFiltroStatus('PAUSADOS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filtroStatus === 'PAUSADOS'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              Pausados ({totalPausados})
            </button>
          </div>

          {/* Filtro Dinâmico de Categorias Multi-Ramo */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-xl">
            {[
              'TODAS',
              ...Array.from(
                new Set([
                  ...categorias.map((c) => c.nome),
                  ...(produtos.map((p) => p.categoria).filter(Boolean) as string[]),
                ])
              ),
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
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
                <th className="py-3.5 px-4">Item & SKU</th>
                <th className="py-3.5 px-4">Descrição & Modelagem</th>
                <th className="py-3.5 px-4">Grade & Variantes</th>
                <th className="py-3.5 px-4 text-center">Estoque Almox.</th>
                <th className="py-3.5 px-4 text-right">Custo / Venda</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {!isCaixa && <th className="py-3.5 px-4 text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {carregando ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>Carregando catálogo de produtos...</span>
                    </div>
                  </td>
                </tr>
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    Nenhum produto localizado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((prod) => {
                  const estoqueAtual = prod.estoque !== undefined ? prod.estoque : 0;
                  const estoqueMin = prod.estoque_minimo !== undefined ? prod.estoque_minimo : 10;
                  const estoqueCritico = estoqueAtual <= estoqueMin;

                  const coresArr = Array.isArray(prod.cores)
                    ? prod.cores
                    : typeof prod.cores === 'string'
                    ? (prod.cores as string).split(',').map((s) => s.trim())
                    : [];

                  const tamanhosArr = Array.isArray(prod.tamanhos)
                    ? prod.tamanhos
                    : typeof prod.tamanhos === 'string'
                    ? (prod.tamanhos as string).split(',').map((s) => s.trim())
                    : [];

                  return (
                    <tr
                      key={prod.id}
                      className={`transition-colors ${
                        !prod.ativo
                          ? 'bg-amber-500/5 hover:bg-amber-500/10'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Foto e SKU */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        {getFotoPrincipal(prod) ? (
                          <img
                            src={getFotoPrincipal(prod)!}
                            alt={prod.descricao}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-5 h-5 opacity-50" />
                          </div>
                        )}
                        <div>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] block w-fit">
                            #{prod.codigo}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {prod.categoria || 'Geral'}{prod.subcategoria ? ` › ${prod.subcategoria}` : ''}
                          </span>
                          {prod.codigo_barras && (
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                              EAN: {prod.codigo_barras}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Descrição e Tipo/Modelagem */}
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{prod.descricao}</span>
                          {!prod.ativo && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Pausado
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {prod.marca && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                              <Tag className="w-2.5 h-2.5 text-indigo-500" />
                              {prod.marca} {prod.modelo && `• ${prod.modelo}`}
                            </span>
                          )}
                          {prod.tipo && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                              <Layers className="w-2.5 h-2.5" />
                              {prod.tipo}
                            </span>
                          )}
                          {prod.garantia && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                              <Shield className="w-2.5 h-2.5" />
                              {prod.garantia}
                            </span>
                          )}
                          {prod.data_validade && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              <Calendar className="w-2.5 h-2.5" />
                              Val: {prod.data_validade} {prod.lote && `(L: ${prod.lote})`}
                            </span>
                          )}
                        </div>
                        {prod.detalhes && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 break-words mt-1 font-normal max-w-sm">
                            {prod.detalhes}
                          </p>
                        )}
                      </td>

                      {/* Grade de Cores e Tamanhos */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          {coresArr.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <Palette className="w-3 h-3 text-slate-400 shrink-0" />
                              {coresArr.map((cor, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                                >
                                  {cor}
                                </span>
                              ))}
                            </div>
                          )}
                          {tamanhosArr.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <Ruler className="w-3 h-3 text-slate-400 shrink-0" />
                              {tamanhosArr.map((tam, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                >
                                  {tam}
                                </span>
                              ))}
                            </div>
                          )}
                          {coresArr.length === 0 && tamanhosArr.length === 0 && (
                            <span className="text-[10px] text-slate-400 italic">Grade única</span>
                          )}
                        </div>
                      </td>

                      {/* Estoque */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono inline-flex items-center gap-1 ${
                              estoqueCritico
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            <Boxes className="w-3 h-3" />
                            {estoqueAtual} {prod.unidade_medida || 'UN'}
                          </span>
                          {estoqueCritico && (
                            <span className="text-[9px] text-rose-500 font-bold mt-0.5 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Mín: {estoqueMin}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Custo e Venda */}
                      <td className="py-3 px-4 text-right font-mono">
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatarMoeda(Number(prod.preco))}
                        </div>
                        {prod.preco_custo !== undefined && Number(prod.preco_custo) > 0 && (
                          <div className="text-[10px] text-slate-400">
                            Custo: {formatarMoeda(Number(prod.preco_custo))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {prod.ativo ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700">
                            <PauseCircle className="w-3.5 h-3.5" /> Pausado
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      {!isCaixa && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => abrirModalEditar(prod)}
                              title="Editar Produto"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-600/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleAlternarPausa(prod)}
                              title={prod.ativo ? 'Pausar (retirar do PDV)' : 'Reativar no PDV'}
                              className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                                prod.ativo
                                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600 font-extrabold shadow-sm'
                              }`}
                            >
                              {prod.ativo ? (
                                <PauseCircle className="w-3.5 h-3.5" />
                              ) : (
                                <>
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  <span>Reativar</span>
                                </>
                              )}
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => handleExcluirProduto(prod)}
                                title="Excluir Produto (Admin)"
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualização em Cards para Mobile e Tablet (< lg) */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {carregando ? (
          <div className="col-span-full py-16 text-center text-slate-400">Carregando catálogo...</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">Nenhum produto localizado.</div>
        ) : (
          produtosFiltrados.map((prod) => {
            const estoqueAtual = prod.estoque !== undefined ? prod.estoque : 0;
            const estoqueMin = prod.estoque_minimo !== undefined ? prod.estoque_minimo : 10;
            const estoqueCritico = estoqueAtual <= estoqueMin;

            return (
              <div
                key={prod.id}
                className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  {getFotoPrincipal(prod) ? (
                    <img
                      src={getFotoPrincipal(prod)!}
                      alt={prod.descricao}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <Package className="w-6 h-6 opacity-50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {prod.categoria || 'Geral'}{prod.subcategoria ? ` › ${prod.subcategoria}` : ''}
                      </span>
                      {prod.marca && (
                        <span className="text-[10px] text-indigo-500 font-medium">
                          • {prod.marca} {prod.modelo ? `(${prod.modelo})` : ''}
                        </span>
                      )}
                    </div>
                    {prod.tipo && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block mt-0.5">
                        {prod.tipo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Estoque</span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        estoqueCritico ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {estoqueAtual} {prod.unidade_medida || 'UN'} {estoqueCritico && '⚠️'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Preço</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatarMoeda(Number(prod.preco))}
                    </span>
                  </div>
                </div>

                {!isCaixa && (
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => abrirModalEditar(prod)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAlternarPausa(prod)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                        prod.ativo
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600 shadow-xs'
                      }`}
                    >
                      {prod.ativo ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                      <span>{prod.ativo ? 'Pausar' : 'Reativar'}</span>
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
            );
          })
        )}
      </div>

      {/* Modal Rico de Criação / Edição de Produto (Liquid Glass) */}
      <AnimatePresence>
        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-3xl rounded-3xl glass-card border border-white/40 dark:border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-500/15 via-blue-500/10 to-teal-500/15 border-b border-indigo-500/20 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {produtoEditando ? 'Editar Produto & Atributos' : 'Cadastrar Novo Produto Multi-Segmento'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Configuração universal: dados cadastrais, variantes, estoque, validade e margem
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Seletor Dropdown de Sugestão por Segmento */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuSugestaoAberto(!menuSugestaoAberto)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      title="Preencher com sugestão de produto para o ramo escolhido"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                      <span className="hidden sm:inline">Sugerir Exemplo</span>
                      <ChevronDown className="w-3 h-3 text-indigo-400" />
                    </button>

                    {menuSugestaoAberto && (
                      <div className="absolute right-0 top-full mt-1.5 w-64 rounded-2xl glass-card border border-white/50 dark:border-slate-700 shadow-2xl p-1.5 z-50 text-xs backdrop-blur-xl">
                        <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                          Escolha o Ramo / Nicho:
                        </div>
                        {[
                          { id: 'VESTUARIO', label: '👗 Vestuário & Moda' },
                          { id: 'INFORMATICA', label: '💻 Informática & Tech' },
                          { id: 'CALCADOS', label: '👟 Calçados & Tênis' },
                          { id: 'CONFEITARIA', label: '🎂 Confeitaria & Padaria' },
                          { id: 'COSMETICOS', label: '✨ Cosméticos & Perfumaria' },
                        ].map((seg) => (
                          <button
                            key={seg.id}
                            type="button"
                            onClick={() => handlePreencherExemploProduto(seg.id)}
                            className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-between transition-colors"
                          >
                            <span>{seg.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setModalAberto(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Body Scrollable */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Seção 1: Identificação Básica & Classificação */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Barcode className="w-4 h-4 text-indigo-500" />
                    <span>Identificação & Classificação de Catálogo</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Código SKU Interno *
                      </label>
                      <input
                        type="text"
                        value={formCodigo}
                        onChange={(e) => setFormCodigo(e.target.value)}
                        placeholder="Ex: 109"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Código de Barras / EAN-13 (Opcional)
                      </label>
                      <input
                        type="text"
                        value={formCodigoBarras}
                        onChange={(e) => setFormCodigoBarras(e.target.value)}
                        placeholder="Ex: 7891234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Unidade de Medida
                      </label>
                      <select
                        value={formUnidadeMedida}
                        onChange={(e) => setFormUnidadeMedida(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-bold"
                      >
                        <option value="UN">UN - Unidade</option>
                        <option value="KG">KG - Quilograma</option>
                        <option value="G">G - Grama</option>
                        <option value="L">L - Litro</option>
                        <option value="ML">ML - Mililitro</option>
                        <option value="MT">MT - Metro</option>
                        <option value="CX">CX - Caixa</option>
                        <option value="PAR">PAR - Par</option>
                        <option value="PCT">PCT - Pacote</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Descrição Comercial Completa *
                    </label>
                    <input
                      type="text"
                      value={formDescricao}
                      onChange={(e) => setFormDescricao(e.target.value)}
                      placeholder="Ex: SSD NVMe 1TB PCIe 4.0 / Vestido Midi Evasê / Tênis Running 41"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Categoria Pai
                        </label>
                        <button
                          type="button"
                          onClick={() => setModalCategoriasAberto(true)}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <FolderTree className="w-3 h-3" />
                          <span>+ Gerenciar Categorias</span>
                        </button>
                      </div>
                      <select
                        value={formCategoria}
                        onChange={(e) => setFormCategoria(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium"
                      >
                        {categorias.length > 0 ? (
                          categorias.map((cat) => (
                            <option key={cat.id} value={cat.nome}>
                              {cat.nome}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Vestuário & Moda">Vestuário & Moda</option>
                            <option value="Informática & Tecnologia">Informática & Tecnologia</option>
                            <option value="Calçados & Sapatos">Calçados & Sapatos</option>
                            <option value="Confeitaria & Panificação">Confeitaria & Panificação</option>
                            <option value="Cosméticos & Beleza">Cosméticos & Beleza</option>
                            <option value="Varejo Geral & Utilidades">Varejo Geral & Utilidades</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Subcategoria
                      </label>
                      <input
                        type="text"
                        list="subcategorias-datalist"
                        value={formSubcategoria}
                        onChange={(e) => setFormSubcategoria(e.target.value)}
                        placeholder="Ex: Hardware, Periféricos, Camisetas, Bolos..."
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                      <datalist id="subcategorias-datalist">
                        {subcategoriasDisponiveis.map((sub) => (
                          <option key={sub.id} value={sub.nome} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Fabricante, Modelo & Garantia */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <span>Fabricante, Linha & Garantia (Ideal para Tech, Calçados e Utilidades)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Marca / Fabricante
                      </label>
                      <input
                        type="text"
                        value={formMarca}
                        onChange={(e) => setFormMarca(e.target.value)}
                        placeholder="Ex: Kingston, Nike, Dell, Nestlé"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Modelo / Linha
                      </label>
                      <input
                        type="text"
                        value={formModelo}
                        onChange={(e) => setFormModelo(e.target.value)}
                        placeholder="Ex: Fury Renegade, Air Zoom, Inspiron"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Garantia Comercial
                      </label>
                      <input
                        type="text"
                        value={formGarantia}
                        onChange={(e) => setFormGarantia(e.target.value)}
                        placeholder="Ex: 12 meses, 90 dias, Sem garantia"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 3: Validade & Lote de Rastreabilidade */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Validade & Rastreabilidade de Lote (Confeitaria, Padaria, Cosméticos, Farmácia)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Data de Validade (Opcional)
                      </label>
                      <input
                        type="date"
                        value={formDataValidade}
                        onChange={(e) => setFormDataValidade(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Lote de Fabricação (Opcional)
                      </label>
                      <input
                        type="text"
                        value={formLote}
                        onChange={(e) => setFormLote(e.target.value)}
                        placeholder="Ex: LT-2026-09A, LOT-994"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 4: Variantes & Atributos Dinâmicos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Palette className="w-4 h-4 text-teal-500" />
                    <span>Grade de Variantes (Separadas por vírgula)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tipo / Modelagem / Especificação Geral
                    </label>
                    <input
                      type="text"
                      value={formTipo}
                      onChange={(e) => setFormTipo(e.target.value)}
                      placeholder="Ex: NVMe M.2 2280, Vestido Midi Evasê, Tênis Corrida, Recheado Tradicional"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Cores, Sabores ou Voltagens
                      </label>
                      <input
                        type="text"
                        value={formCores}
                        onChange={(e) => setFormCores(e.target.value)}
                        placeholder="Ex: Preto, Prata (ou 110V, 220V ou Chocolate, Morango)"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tamanhos, Capacidades ou Pesos
                      </label>
                      <input
                        type="text"
                        value={formTamanhos}
                        onChange={(e) => setFormTamanhos(e.target.value)}
                        placeholder="Ex: PP, P, M, G (ou 39, 40, 41 ou 500GB, 1TB ou 500g, 1kg)"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 5: Estoque e Formação de Preço */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>Estoque & Formação de Preços</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Estoque Atual ({formUnidadeMedida})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formEstoque}
                        onChange={(e) => setFormEstoque(parseInt(e.target.value, 10) || 0)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Estoque Mínimo (Alerta)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formEstoqueMinimo}
                        onChange={(e) => setFormEstoqueMinimo(parseInt(e.target.value, 10) || 0)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Preço Custo (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formPrecoCusto}
                        onChange={(e) => setFormPrecoCusto(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Preço de Venda (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formPreco}
                        onChange={(e) => setFormPreco(e.target.value)}
                        placeholder="0.00"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Card Informativo de Margem Comercial */}
                  <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Margem Bruta Estimada:
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {margemBrutaPercent}%
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Lucro Líquido Unitário: {formatarMoeda(Math.max(0, precoVendaDigitado - precoCustoDigitado))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seção 6: Detalhes Técnicos, Ingredientes ou Composição & Fotos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span>Ficha Técnica, Ingredientes & Galeria de Imagens</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ficha Técnica / Detalhes de Composição / Ingredientes
                    </label>
                    <textarea
                      rows={2}
                      value={formDetalhes}
                      onChange={(e) => setFormDetalhes(e.target.value)}
                      placeholder="Ex: Leitura até 7300 MB/s, dissipador grafeno (Tech) OU 98% Algodão 2% Elastano (Moda) OU Farinha especial e cacau belga (Confeitaria)"
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs resize-none"
                    />
                  </div>

                  {/* Fotos do Produto (Opcional) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                        Foto do Produto (Opcional - a critério do lojista)
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {formImagens ? 'Foto Anexada' : 'Sem Foto'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {formImagens ? (
                          <img
                            src={formImagens.split(',')[0].trim()}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400 opacity-50" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          ref={productFileRef}
                          onChange={handleProductImageFile}
                          accept="image/*"
                          className="hidden"
                        />

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => productFileRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Anexar Foto do Computador</span>
                          </button>

                          {formImagens && (
                            <button
                              type="button"
                              onClick={handleRemoverImagemProduto}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 font-bold text-xs flex items-center gap-1 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remover Imagem</span>
                            </button>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            value={formImagens}
                            onChange={(e) => setFormImagens(e.target.value)}
                            placeholder="Ou cole a URL da imagem (https://...)"
                            className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 block italic">
                      💡 Opcional: Se deixar em branco, o produto será exibido com ícone profissional e funcionará normalmente em vendas e estoque.
                    </span>
                  </div>
                </div>

                {produtoEditando && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <input
                      type="checkbox"
                      id="chkAtivoModal"
                      checked={formAtivo}
                      onChange={(e) => setFormAtivo(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="chkAtivoModal"
                      className="text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                    >
                      Produto Ativo e Disponível para Venda no PDV
                    </label>
                  </div>
                )}

                {/* Footer de Ações do Modal */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    disabled={salvando}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={salvando}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-indigo disabled:opacity-50"
                  >
                    {salvando ? 'Salvando...' : 'Salvar Produto'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Gestão Completa de Categorias & Subcategorias */}
      <CategoriasManagerModal
        aberto={modalCategoriasAberto}
        onClose={() => setModalCategoriasAberto(false)}
        categorias={categorias}
        onAtualizarCategorias={carregarCategorias}
      />
    </div>
  );
};
