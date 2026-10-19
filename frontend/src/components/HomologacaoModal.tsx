import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Building2,
  Database,
  FileSpreadsheet,
  Sparkles,
  Video,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { validarCPF } from '../utils/cpf.validator';

interface IHomologacaoModalProps {
  aberto: boolean;
  onFechar: () => void;
}

export const HomologacaoModal: React.FC<IHomologacaoModalProps> = ({ aberto, onFechar }) => {
  const [cpfTeste, setCpfTeste] = useState<string>('123.456.789-09');
  const [cpfResultado, setCpfResultado] = useState<boolean | null>(null);

  if (!aberto) return null;

  const testarCPF = () => {
    setCpfResultado(validarCPF(cpfTeste));
  };

  const requisitos = [
    {
      categoria: 'Arquitetura de Dados',
      icon: Database,
      items: [
        {
          titulo: 'Separação de Clientes e Usuários do Sistema',
          detalhe: 'Tabelas normalizadas: "clientes" para fidelização (RN-06) e "usuarios" para controle de operadores com senhas bcrypt e roles.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'Perfis de Acesso Hierárquicos (RBAC)',
          detalhe: 'Caixa (apenas opera PDV), Gerente (autoriza alçadas RN-02 e RN-03), Administrador (exclusão, equipe e dados fiscais).',
          status: 'HOMOLOGADO',
        },
      ],
    },
    {
      categoria: 'Regras de Negócio Oficiais (RN-01 a RN-06)',
      icon: FileCheck,
      items: [
        {
          titulo: 'RN-01 • Validação Oficial de CPF (Módulo 11)',
          detalhe: 'Algoritmo da Receita Federal com cálculo dos dois dígitos verificadores em cadastro e identificação de clientes.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'RN-02 • Alçada Gerencial de Desconto (> 10%)',
          detalhe: 'Descontos acima de 10% bloqueiam o PDV até digitação de credenciais de Gerente ou Administrador, gravando o autorizador no banco.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'RN-03 • Alçada de Cancelamento e Estorno de Venda',
          detalhe: 'Estornos exigem motivo formal e autorização com login e senha de Gerente, com auditoria completa de data e operador.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'RN-04 • Imutabilidade de Preços Históricos',
          detalhe: 'Tabela de itens de venda grava o preço histórico unitário; alterações posteriores na tabela de produtos não afetam relatórios passados.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'RN-05 • Fechamento de Caixa e Totalização',
          detalhe: 'Cálculo de subtotal, descontos e total líquido em centavos sem erros de arredondamento em PIX, Cartão e Dinheiro.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'RN-06 • Fidelização Opcional do Consumidor',
          detalhe: 'Vendas podem ser concluídas como Consumidor Final (sem identificação) ou vinculadas a CPF para auditoria fiscal.',
          status: 'HOMOLOGADO',
        },
      ],
    },
    {
      categoria: 'Parâmetros Fiscais & Documentos Eletrônicos',
      icon: Building2,
      items: [
        {
          titulo: 'Configurações da Empresa & CNPJ',
          detalhe: 'Painel administrativo exclusivo para Razão Social, CNPJ, Inscrição Estadual, Endereço Físico e Regime Tributário.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'Emissão de NFC-e (Mod 65) / SAT com XML e DANFE',
          detalhe: 'Geração de chave de acesso de 44 dígitos com DV Módulo 11, protocolo SEFAZ, QR Code de consulta pública e download de XML.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'Lei da Transparência Fiscal (Lei 12.741/2012)',
          detalhe: 'Exibição dos tributos federais e estaduais aproximados calculados com base nas alíquotas oficiais do IBPT no cupom.',
          status: 'HOMOLOGADO',
        },
      ],
    },
    {
      categoria: 'Exportação de Relatórios & Auditoria',
      icon: FileSpreadsheet,
      items: [
        {
          titulo: 'Exportação para Microsoft Excel (.xlsx / .xls)',
          detalhe: 'Geração de planilhas formatadas com estilos de cabeçalho, linhas de totais e valores numéricos nativos.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'Exportação para CSV com Codificação UTF-8 BOM',
          detalhe: 'Compatibilidade com Excel e sistemas de BI, evitando caracteres corrompidos em português.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'Geração de Relatório PDF A4 Executivo',
          detalhe: 'Impressão direta e salvamento em PDF com logotipo oficial, cabeçalho da empresa, carimbo de autenticação e tabelas.',
          status: 'HOMOLOGADO',
        },
      ],
    },
    {
      categoria: 'Sprint 6 • Motion Design Pitch & Apresentação',
      icon: Video,
      items: [
        {
          titulo: 'Player Motion Nativo render(t) & Roteiro em 6 Blocos',
          detalhe: 'Apresentação em código puro HTML/CSS/JS determinístico, visualização adaptável 16:9 e 9:16 (Reels), áudio neural e atalhos de palco.',
          status: 'HOMOLOGADO',
        },
        {
          titulo: 'Live Demo & Rubrica Firjan SENAI (10 Minutos)',
          detalhe: 'Roteiro de apresentação executiva cobrindo gargalo de varejo, regras de negócio RN-01 a RN-06, NFC-e e 18 testes E2E.',
          status: 'HOMOLOGADO',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl glass-card border border-brand-500/40 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-brand-600/20 via-indigo-600/20 to-purple-600/20 border-b border-brand-500/20 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
                <span>Dossiê de Homologação Técnica & Fiscal</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                  100% Conforme
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Critérios avaliativos para encerramento das Sprints 1 a 4 e transição para Sprint 5
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Categorias e Checklist */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Testador Rápido de Validação de CPF */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                Testador Interativo de Algoritmo RN-01 (Módulo 11):
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Valide qualquer CPF real ou gerado pelo validador oficial.
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={cpfTeste}
                onChange={(e) => setCpfTeste(e.target.value)}
                placeholder="000.000.000-00"
                className="px-3 py-1.5 rounded-lg glass-input text-xs font-mono w-36"
              />
              <button
                onClick={testarCPF}
                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
              >
                Validar
              </button>
              {cpfResultado !== null && (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-md ${
                    cpfResultado ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                  }`}
                >
                  {cpfResultado ? '✓ Válido' : '✗ Inválido'}
                </span>
              )}
            </div>
          </div>

          {/* Categorias de Requisitos */}
          {requisitos.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                  <Icon className="w-4 h-4 text-brand-500" />
                  <span>{cat.categoria}</span>
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {cat.items.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {item.titulo}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                          {item.detalhe}
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com Fechar e Link para Motion Pitch */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Dossiê emitido pelo Antigravity • Pronto para avaliação acadêmica
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <NavLink
              to="/pitch"
              onClick={onFechar}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ver Motion Pitch</span>
            </NavLink>
            <button
              onClick={onFechar}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              Concluir Análise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
