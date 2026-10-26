import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FolderTree,
  Tag,
  Layers,
  Sparkles,
  ChevronRight,
  FolderPlus,
} from 'lucide-react';
import { ICategoria, ISubcategoria } from '../types';
import { categoriasApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface ICategoriasManagerModalProps {
  aberto: boolean;
  onClose: () => void;
  categorias: ICategoria[];
  onAtualizarCategorias: () => Promise<void>;
}

export const CategoriasManagerModal: React.FC<ICategoriasManagerModalProps> = ({
  aberto,
  onClose,
  categorias,
  onAtualizarCategorias,
}) => {
  const { adicionarToast } = useToast();

  const [categoriaAtivaId, setCategoriaAtivaId] = useState<number | null>(
    categorias.length > 0 ? categorias[0].id : null
  );

  // Form Nova Categoria
  const [mostrarNovoForm, setMostrarNovoForm] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCor, setNovaCor] = useState('#4f46e5');
  const [salvandoCat, setSalvandoCat] = useState(false);

  // Form Nova Subcategoria
  const [novaSubNome, setNovaSubNome] = useState('');
  const [novaSubDesc, setNovaSubDesc] = useState('');
  const [salvandoSub, setSalvandoSub] = useState(false);

  if (!aberto) return null;

  const categoriaAtiva = categorias.find((c) => c.id === categoriaAtivaId) || categorias[0];

  const handleCriarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    try {
      setSalvandoCat(true);
      const criada = await categoriasApi.criar({
        nome: novoNome.trim(),
        descricao: novaDescricao.trim() || undefined,
        cor: novaCor,
        icone: 'Tag',
      });
      adicionarToast('success', 'Categoria Criada!', `"${criada.nome}" foi cadastrada com sucesso.`);
      setNovoNome('');
      setNovaDescricao('');
      setMostrarNovoForm(false);
      await onAtualizarCategorias();
      setCategoriaAtivaId(criada.id);
    } catch (err: any) {
      adicionarToast('error', 'Erro ao Criar Categoria', err.message);
    } finally {
      setSalvandoCat(false);
    }
  };

  const handleExcluirCategoria = async (cat: ICategoria) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir a categoria "${cat.nome}" e todas as suas subcategorias?`
    );
    if (!confirmar) return;

    try {
      await categoriasApi.excluir(cat.id);
      adicionarToast('info', 'Categoria Removida', `"${cat.nome}" foi excluída.`);
      await onAtualizarCategorias();
      const restante = categorias.filter((c) => c.id !== cat.id);
      setCategoriaAtivaId(restante.length > 0 ? restante[0].id : null);
    } catch (err: any) {
      adicionarToast('error', 'Falha ao Excluir', err.message);
    }
  };

  const handleCriarSubcategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaAtiva || !novaSubNome.trim()) return;

    try {
      setSalvandoSub(true);
      await categoriasApi.criarSubcategoria({
        categoria_id: categoriaAtiva.id,
        nome: novaSubNome.trim(),
        descricao: novaSubDesc.trim() || undefined,
      });
      adicionarToast(
        'success',
        'Subcategoria Criada!',
        `"${novaSubNome}" adicionada em ${categoriaAtiva.nome}.`
      );
      setNovaSubNome('');
      setNovaSubDesc('');
      await onAtualizarCategorias();
    } catch (err: any) {
      adicionarToast('error', 'Erro ao Criar Subcategoria', err.message);
    } finally {
      setSalvandoSub(false);
    }
  };

  const handleExcluirSubcategoria = async (sub: ISubcategoria) => {
    try {
      await categoriasApi.excluirSubcategoria(sub.id);
      adicionarToast('info', 'Subcategoria Removida', `"${sub.nome}" foi removida.`);
      await onAtualizarCategorias();
    } catch (err: any) {
      adicionarToast('error', 'Falha ao Excluir', err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl glass-card border border-indigo-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Header do Modal */}
        <div className="px-6 py-4 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Gestão Universal de Categorias & Subcategorias
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize seu catálogo para qualquer ramo: vestuário, informática, calçados, confeitaria, padaria e mais.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Bento Grid em Duas Colunas */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Coluna Esquerda: Lista de Categorias Pai (5 cols) */}
          <div className="md:col-span-5 p-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Categorias Principais ({categorias.length})
              </span>
              <button
                type="button"
                onClick={() => setMostrarNovoForm(!mostrarNovoForm)}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all btn-interactive"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova</span>
              </button>
            </div>

            {/* Formulário de Criação de Categoria */}
            {mostrarNovoForm && (
              <form
                onSubmit={handleCriarCategoria}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-500/40 shadow-sm space-y-2.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Cadastrar Nova Categoria
                  </span>
                  <button
                    type="button"
                    onClick={() => setMostrarNovoForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Fechar
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nome (ex: Informática, Bebidas...)"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                />
                <input
                  type="text"
                  placeholder="Descrição breve (opcional)"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Cor:</span>
                    <input
                      type="color"
                      value={novaCor}
                      onChange={(e) => setNovaCor(e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={salvandoCat}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {salvandoCat ? 'Salvando...' : 'Salvar Categoria'}
                  </button>
                </div>
              </form>
            )}

            {/* Lista Rolável de Categorias */}
            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {categorias.map((cat) => {
                const ativa = categoriaAtiva?.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategoriaAtivaId(cat.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      ativa
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.cor || '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold truncate block">{cat.nome}</span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {cat.subcategorias?.length || 0} subcategorias &bull; {cat.total_produtos || 0} produtos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExcluirCategoria(cat);
                        }}
                        title="Excluir Categoria"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight
                        className={`w-4 h-4 ${ativa ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita: Subcategorias da Categoria Selecionada (7 cols) */}
          <div className="md:col-span-7 p-5 space-y-4 flex flex-col justify-between">
            {categoriaAtiva ? (
              <div className="space-y-4">
                {/* Cabeçalho da Categoria Ativa */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full shadow-xs"
                      style={{ backgroundColor: categoriaAtiva.cor || '#6366f1' }}
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {categoriaAtiva.nome}
                      </h4>
                      {categoriaAtiva.descricao && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {categoriaAtiva.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                    Slug: #{categoriaAtiva.slug}
                  </span>
                </div>

                {/* Subcategorias Listadas */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    Subcategorias Vinculadas ({categoriaAtiva.subcategorias?.length || 0})
                  </span>

                  {(!categoriaAtiva.subcategorias || categoriaAtiva.subcategorias.length === 0) ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                      Nenhuma subcategoria cadastrada para {categoriaAtiva.nome}. Crie a primeira abaixo!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[35vh] overflow-y-auto pr-1">
                      {categoriaAtiva.subcategorias.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {sub.nome}
                            </span>
                            {sub.descricao && (
                              <span className="text-[10px] text-slate-400 block truncate">
                                {sub.descricao}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleExcluirSubcategoria(sub)}
                            title="Remover Subcategoria"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulário para Adicionar Nova Subcategoria */}
                <form
                  onSubmit={handleCriarSubcategoria}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2.5"
                >
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
                    Adicionar Subcategoria em {categoriaAtiva.nome}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Nome da subcategoria..."
                      value={novaSubNome}
                      onChange={(e) => setNovaSubNome(e.target.value)}
                      className="sm:col-span-7 px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Descrição (opcional)..."
                      value={novaSubDesc}
                      onChange={(e) => setNovaSubDesc(e.target.value)}
                      className="sm:col-span-5 px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={salvandoSub || !novaSubNome.trim()}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50 btn-interactive"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{salvandoSub ? 'Salvando...' : 'Adicionar Subcategoria'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Selecione uma categoria à esquerda para gerenciar suas subcategorias.
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Informativo Multi-Ramo */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Estrutura universal adaptável para varejo geral, vestuário, calçados, informática, padaria, confeitaria e mais.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all text-xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
