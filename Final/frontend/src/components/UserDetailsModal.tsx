import React from 'react';
import {
  X,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Lock,
  UserCheck,
  UserX,
  KeyRound,
} from 'lucide-react';
import { IUsuario, IVendaCompleta } from '../types';
import { getRoleBadgeConfig, formatarMoeda, formatarDataHora } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface UserDetailsModalProps {
  aberto?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  usuario: IUsuario | null;
  vendas?: IVendaCompleta[];
  onVerVendas?: (usuarioId: number) => void;
  onAlternarStatus?: (usuario: IUsuario) => void;
  onToggleStatus?: (usuario: IUsuario) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  aberto,
  isOpen,
  onClose,
  usuario,
  vendas = [],
  onVerVendas,
  onAlternarStatus,
  onToggleStatus,
}) => {
  const modalAberto = aberto ?? isOpen ?? false;
  const alternar = onAlternarStatus || onToggleStatus;
  const { usuario: usuarioLogado, isAdmin } = useAuth();

  if (!modalAberto || !usuario) return null;

  const badge = getRoleBadgeConfig(usuario.cargo);

  // Vendas associadas a este usuário
  const vendasUsuario = vendas.filter(
    (v) => v.usuario_id === usuario.id && v.status === 'CONCLUIDA'
  );
  const totalVendas = vendasUsuario.length;
  const faturamentoTotal = vendasUsuario.reduce((acc, v) => acc + Number(v.valor_total || 0), 0);
  const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;
  const totalDescontos = vendasUsuario.reduce((acc, v) => acc + Number(v.desconto || 0), 0);

  // Matriz de Permissões RBAC baseada no cargo
  const permissoes = [
    {
      nome: 'Operação do PDV & Abertura de Caixa',
      descricao: 'Realizar vendas, lançar produtos e receber pagamentos',
      permitido: true,
    },
    {
      nome: 'Desconto Autônomo até 10%',
      descricao: 'Conceder desconto comercial de até 10% sem aprovação',
      permitido: true,
    },
    {
      nome: 'Alçada Gerencial para Descontos > 10%',
      descricao: 'Aprovar descontos superiores a 10% via senha de autorização (Alçada Gerencial)',
      permitido: usuario.cargo === 'ADMIN' || usuario.cargo === 'GERENTE',
    },
    {
      nome: 'Cancelamento de Vendas Homologadas',
      descricao: 'Autorizar estorno de vendas com justificativa auditável (Estorno de Venda)',
      permitido: usuario.cargo === 'ADMIN' || usuario.cargo === 'GERENTE',
    },
    {
      nome: 'Cadastro & Edição de Produtos',
      descricao: 'Adicionar novas peças ao catálogo e ajustar preços de tabela',
      permitido: usuario.cargo === 'ADMIN' || usuario.cargo === 'GERENTE',
    },
    {
      nome: 'Pausar e Reativar Produtos no PDV',
      descricao: 'Retirar ou devolver temporariamente produtos ao terminal do caixa',
      permitido: usuario.cargo === 'ADMIN' || usuario.cargo === 'GERENTE',
    },
    {
      nome: 'Exclusão Permanente de Produtos',
      descricao: 'Deletar registros de produtos do catálogo (Exclusivo Administrador)',
      permitido: usuario.cargo === 'ADMIN',
    },
    {
      nome: 'Cadastro & Consulta de Clientes',
      descricao: 'Cadastrar novos clientes com validação Módulo 11 da Receita Federal',
      permitido: true,
    },
    {
      nome: 'Gestão da Equipe & Permissões',
      descricao: 'Cadastrar colaboradores, atribuir cargos e desativar acessos',
      permitido: usuario.cargo === 'ADMIN',
    },
    {
      nome: 'Configurações Fiscais & NFC-e/SAT',
      descricao: 'Modificar CNPJ, Inscrição Estadual, CSC e dados tributários',
      permitido: usuario.cargo === 'ADMIN',
    },
    {
      nome: 'Painel Executivo de BI & Relatórios',
      descricao: 'Visualizar faturamento total, rankings de produtos e auditoria gerencial',
      permitido: usuario.cargo === 'ADMIN' || usuario.cargo === 'GERENTE',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl glass-card border border-purple-500/30 shadow-2xl overflow-hidden my-auto">
        {/* Header do Modal com Avatar e Status */}
        <div className="bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-transparent border-b border-purple-500/20 px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                {usuario.nome.substring(0, 2).toUpperCase()}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                  usuario.ativo ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={usuario.ativo ? 'Usuário Ativo' : 'Usuário Inativo'}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                  {usuario.nome}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badge.badgeClass}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-purple-500" />
                {usuario.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal com Bento Grid de Desempenho & RBAC */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Métricas de Desempenho do Colaborador */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span>Desempenho Comercial & Operacional</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Vendas Fechadas</span>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                  {totalVendas}
                </p>
              </div>

              <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Faturamento Gerado</span>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {formatarMoeda(faturamentoTotal)}
                </p>
              </div>

              <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Ticket Médio</span>
                <p className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                  {formatarMoeda(ticketMedio)}
                </p>
              </div>

              <div className="glass-card rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Descontos Totais</span>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                  {formatarMoeda(totalDescontos)}
                </p>
              </div>
            </div>
          </div>

          {/* Dados Cadastrais & Identificação */}
          <div className="glass-card rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-500" />
                <span>Identificador no Sistema:</span>
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                ID #{usuario.id}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Data de Cadastro / Admissão:</span>
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {usuario.criado_em ? formatarDataHora(usuario.criado_em) : 'Cadastro inicial homologado'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Status da Conta:</span>
              </span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  usuario.ativo
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {usuario.ativo ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ativo & Habilitado
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Acesso Desativado
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Matriz Detalhada de Permissões RBAC */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500" />
              <span>Matriz de Permissões do Perfil ({usuario.cargo})</span>
            </h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {permissoes.map((p, index) => (
                <div
                  key={index}
                  className="p-3 flex items-start justify-between gap-3 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{p.nome}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {p.descricao}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                      p.permitido
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {p.permitido ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Permitido
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" /> Restrito
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {onVerVendas && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerVendas(usuario.id);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs btn-interactive"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Ver Vendas deste Colaborador</span>
              </button>
            )}

            {isAdmin && alternar && usuario.id !== usuarioLogado?.id && (
              <button
                type="button"
                onClick={() => alternar(usuario)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all btn-interactive ${
                  usuario.ativo
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100'
                }`}
              >
                {usuario.ativo ? (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    <span>Desativar Acesso</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reativar Acesso</span>
                  </>
                )}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all btn-interactive ml-auto"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
