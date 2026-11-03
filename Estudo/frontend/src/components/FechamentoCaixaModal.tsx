import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Printer,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { caixaApi } from '../services/api';
import { IResumoTurnoCaixa, IFechamentoCaixa } from '../types';
import { formatarMoeda } from '../utils/formatters';

interface IFechamentoCaixaModalProps {
  aberto: boolean;
  onFechar: () => void;
  onAbrirAuditoria?: () => void;
}

export const FechamentoCaixaModal: React.FC<IFechamentoCaixaModalProps> = ({
  aberto,
  onFechar,
  onAbrirAuditoria
}) => {
  const { usuario, isCaixa } = useAuth();
  const { adicionarToast } = useToast();

  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [resumo, setResumo] = useState<IResumoTurnoCaixa | null>(null);

  const [fundoInicial, setFundoInicial] = useState<number>(100);
  const [dinheiroInformado, setDinheiroInformado] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  const [fechamentoConcluido, setFechamentoConcluido] = useState<IFechamentoCaixa | null>(null);

  // Carregar dados do turno do vendedor
  useEffect(() => {
    if (aberto && isCaixa) {
      setCarregando(true);
      setFechamentoConcluido(null);
      caixaApi
        .obterResumoTurno()
        .then((res) => {
          setResumo(res);
          setFundoInicial(res.fundo_inicial_padrao || 100);
          setDinheiroInformado('');
          setObservacoes('');
        })
        .catch((err) => {
          adicionarToast('error', 'Erro ao carregar turno', err.message || 'Falha ao consultar vendas.');
        })
        .finally(() => setCarregando(false));
    }
  }, [aberto, isCaixa]);

  if (!aberto) return null;

  // Se o usuário não for Caixa (for Gerente ou Admin), mostra alerta instrutivo
  if (!isCaixa) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Acesso Restrito a Vendedores</span>
            </div>
            <button
              onClick={onFechar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center py-2 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Fechamento de Caixa Exclusivo para Vendedores
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O encerramento do turno de caixa é uma operação executada individualmente por cada vendedor/caixa
              ao final do seu expediente.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Como {usuario?.cargo === 'ADMIN' ? 'Administrador' : 'Gerente'}, você tem acesso ao{' '}
              <strong>Painel de Acompanhamento e Auditoria</strong> para verificar os caixas de todos os vendedores,
              conferir se faltou dinheiro e emitir parecer gerencial.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onFechar}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Fechar
            </button>
            {onAbrirAuditoria && (
              <button
                onClick={() => {
                  onFechar();
                  onAbrirAuditoria();
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-sm"
              >
                Abrir Auditoria de Caixas
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Cálculos dinâmicos em tempo real
  const totalVendasDinheiro = resumo?.total_vendas_dinheiro || 0;
  const saldoEsperadoDinheiro = fundoInicial + totalVendasDinheiro;
  const dinheiroDigitadoNum = parseFloat(dinheiroInformado.replace(',', '.')) || 0;
  const diferenca = dinheiroInformado !== '' ? dinheiroDigitadoNum - saldoEsperadoDinheiro : 0;

  const temFalta = diferenca < -0.01;
  const temSobra = diferenca > 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dinheiroInformado === '') {
      adicionarToast('warning', 'Campo Obrigatório', 'Informe a contagem do dinheiro físico na gaveta.');
      return;
    }

    if (temFalta && observacoes.trim().length < 5) {
      adicionarToast(
        'warning',
        'Justificativa Obrigatória',
        'Houve falta de dinheiro no caixa. Por favor, detalhe a justificativa para o Gerente na auditoria.'
      );
      return;
    }

    try {
      setSalvando(true);
      const res = await caixaApi.fecharCaixa({
        fundo_inicial: fundoInicial,
        dinheiro_informado: dinheiroDigitadoNum,
        observacoes: observacoes.trim() || undefined
      });

      setFechamentoConcluido(res.fechamento);
      adicionarToast(
        temFalta ? 'warning' : 'success',
        'Fechamento Concluído',
        temFalta
          ? `Fechamento registrado com falta de ${formatarMoeda(Math.abs(diferenca))}. Encaminhado para auditoria.`
          : 'Caixa encerrado com sucesso!'
      );
    } catch (err: any) {
      adicionarToast('error', 'Erro ao fechar caixa', err.message || 'Falha ao registrar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* CABEÇALHO */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Fechamento de Caixa</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                  Turno do Vendedor
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Operador: <strong>{usuario?.nome}</strong> &bull; Terminal #01
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {carregando ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
            Carregando movimentações do caixa...
          </div>
        ) : fechamentoConcluido ? (
          /* TELA DE COMPROVANTE APÓS O FECHAMENTO */
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Comprovante de Encerramento de Caixa
              </h3>
              <p className="text-xs text-slate-500">
                Registro imutável #{fechamentoConcluido.id} gravado em {fechamentoConcluido.data_fechamento}
              </p>
            </div>

            {/* Espelho Térmico do Fechamento */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-800 pb-2">
                <span>Vendedor:</span>
                <span className="font-bold">{fechamentoConcluido.usuario_nome}</span>
              </div>
              <div className="flex justify-between">
                <span>Fundo Inicial de Troco:</span>
                <span>{formatarMoeda(fechamentoConcluido.fundo_inicial)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Vendas Dinheiro:</span>
                <span>{formatarMoeda(fechamentoConcluido.total_vendas_dinheiro)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Vendas PIX:</span>
                <span>{formatarMoeda(fechamentoConcluido.total_vendas_pix)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Cartões (Crédito/Débito):</span>
                <span>{formatarMoeda(fechamentoConcluido.total_vendas_cartao_credito + fechamentoConcluido.total_vendas_cartao_debito)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-dashed border-slate-300 dark:border-slate-800 pt-2">
                <span>Total Geral Faturado:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatarMoeda(fechamentoConcluido.total_vendas_geral)} ({fechamentoConcluido.quantidade_vendas} vendas)
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-300 dark:border-slate-800 pt-2">
                <span>Saldo Esperado em Gaveta:</span>
                <span>{formatarMoeda(fechamentoConcluido.saldo_esperado_dinheiro)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Dinheiro Físico Declarado:</span>
                <span>{formatarMoeda(fechamentoConcluido.dinheiro_informado)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-slate-300 dark:border-slate-800 pt-2">
                <span>Diferença Apurada:</span>
                <span
                  className={
                    fechamentoConcluido.status_diferenca === 'FALTA'
                      ? 'text-rose-600 dark:text-rose-400 font-black'
                      : fechamentoConcluido.status_diferenca === 'SOBRA'
                      ? 'text-amber-600 dark:text-amber-400 font-black'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }
                >
                  {fechamentoConcluido.status_diferenca === 'FALTA'
                    ? `FALTA DE ${formatarMoeda(Math.abs(fechamentoConcluido.diferenca))}`
                    : fechamentoConcluido.status_diferenca === 'SOBRA'
                    ? `SOBRA DE ${formatarMoeda(fechamentoConcluido.diferenca)}`
                    : 'CAIXA BATEU (R$ 0,00)'}
                </span>
              </div>
              {fechamentoConcluido.observacoes && (
                <div className="border-t border-dashed border-slate-300 dark:border-slate-800 pt-2 text-[11px] text-slate-500">
                  Obs: {fechamentoConcluido.observacoes}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprovante</span>
              </button>
              <button
                onClick={onFechar}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE FECHAMENTO */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            
            {/* CARDS DE RESUMO DO SISTEMA */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Vendas Turno</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {resumo?.quantidade_vendas || 0} un
                </span>
              </div>

              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">Dinheiro</span>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                  {formatarMoeda(totalVendasDinheiro)}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">PIX</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatarMoeda(resumo?.total_vendas_pix || 0)}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Cartões</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatarMoeda((resumo?.total_vendas_cartao_credito || 0) + (resumo?.total_vendas_cartao_debito || 0))}
                </span>
              </div>
            </div>

            {/* Fundo de Troco e Contagem Física */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fundo Inicial (Troco)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={fundoInicial}
                    onChange={(e) => setFundoInicial(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Saldo esperado em dinheiro: <strong>{formatarMoeda(saldoEsperadoDinheiro)}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contagem Física da Gaveta *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={dinheiroInformado}
                    onChange={(e) => setDinheiroInformado(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-500/60 dark:border-emerald-500 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Some todas as cédulas e moedas físicas.
                </span>
              </div>
            </div>

            {/* CARD DINÂMICO DE APURAÇÃO (BATEU / FALTOU / SOBROU) */}
            {dinheiroInformado !== '' && (
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  temFalta
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-200 animate-pulse'
                    : temSobra
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {temFalta ? (
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                    ) : temSobra ? (
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider block">
                        {temFalta
                          ? 'Divergência: Falta de Dinheiro'
                          : temSobra
                          ? 'Divergência: Sobra de Dinheiro'
                          : 'Conferência Perfeita'}
                      </span>
                      <span className="text-[11px] opacity-80">
                        {temFalta
                          ? 'Faltou dinheiro no caixa em relação ao registro do sistema.'
                          : temSobra
                          ? 'Há dinheiro excedente na gaveta.'
                          : 'O valor contado confere exatamente com o saldo esperado.'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold block opacity-75">Diferença</span>
                    <span className="text-base font-black font-mono">
                      {temFalta
                        ? `- ${formatarMoeda(Math.abs(diferenca))}`
                        : temSobra
                        ? `+ ${formatarMoeda(diferenca)}`
                        : 'R$ 0,00'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Justificativa / Observações */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {temFalta ? 'Justificativa Obrigatória da Falta *' : 'Observações do Fechamento'}
              </label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder={
                  temFalta
                    ? 'Explique o motivo da divergência para a conferência gerencial (ex: troco errado na venda #...)'
                    : 'Alguma ocorrência, sangria ou nota para o próximo operador...'
                }
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onFechar}
                disabled={salvando}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {salvando ? 'Processando...' : 'Confirmar Fechamento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
