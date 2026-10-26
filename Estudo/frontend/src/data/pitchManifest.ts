export interface IPalavraPitch {
  w: string;
  s: number;
  e: number;
  accent: 'gold' | 'emerald' | 'rose' | null;
}

export interface ICenaPitch {
  id: number;
  arquivo: string;
  audioUrl: string;
  rotulo: string;
  tag: string;
  title: string;
  themeColor: 'gold' | 'emerald' | 'rose' | 'indigo';
  duracao: number;
  palavras: IPalavraPitch[];
}

export const PITCH_CENAS: ICenaPitch[] = [
  {
    "id": 1,
    "arquivo": "cena-01.mp3",
    "audioUrl": "/pitch/audio/cena-01.mp3",
    "rotulo": "Abertura",
    "tag": "MS² VESTUÁRIO",
    "title": "Abertura Cinemática",
    "themeColor": "gold",
    "duracao": 6.8,
    "palavras": [
      {
        "w": "Moda",
        "s": 0,
        "e": 0.32,
        "accent": null
      },
      {
        "w": "é",
        "s": 0.48,
        "e": 0.64,
        "accent": null
      },
      {
        "w": "emoção.",
        "s": 0.72,
        "e": 1.36,
        "accent": "gold"
      },
      {
        "w": "Mas,",
        "s": 1.68,
        "e": 2.48,
        "accent": null
      },
      {
        "w": "por",
        "s": 2.56,
        "e": 2.72,
        "accent": null
      },
      {
        "w": "trás",
        "s": 2.8,
        "e": 3.04,
        "accent": null
      },
      {
        "w": "de",
        "s": 3.16,
        "e": 3.28,
        "accent": "rose"
      },
      {
        "w": "cada",
        "s": 3.36,
        "e": 3.52,
        "accent": null
      },
      {
        "w": "vitrine,",
        "s": 3.6,
        "e": 4.24,
        "accent": "gold"
      },
      {
        "w": "existe",
        "s": 4.32,
        "e": 4.64,
        "accent": null
      },
      {
        "w": "uma",
        "s": 4.72,
        "e": 4.8,
        "accent": null
      },
      {
        "w": "operação",
        "s": 4.88,
        "e": 5.36,
        "accent": "emerald"
      },
      {
        "w": "que",
        "s": 5.44,
        "e": 5.52,
        "accent": null
      },
      {
        "w": "não",
        "s": 5.68,
        "e": 5.84,
        "accent": "rose"
      },
      {
        "w": "pode",
        "s": 5.92,
        "e": 6.16,
        "accent": "rose"
      },
      {
        "w": "parar.",
        "s": 6.24,
        "e": 6.8,
        "accent": "rose"
      }
    ]
  },
  {
    "id": 2,
    "arquivo": "cena-02.mp3",
    "audioUrl": "/pitch/audio/cena-02.mp3",
    "rotulo": "O Problema",
    "tag": "DIAGNÓSTICO",
    "title": "O Gargalo do Varejo",
    "themeColor": "rose",
    "duracao": 11.76,
    "palavras": [
      {
        "w": "Filas",
        "s": 0,
        "e": 0.48,
        "accent": "rose"
      },
      {
        "w": "que",
        "s": 0.56,
        "e": 0.64,
        "accent": null
      },
      {
        "w": "travam",
        "s": 0.72,
        "e": 1.12,
        "accent": "rose"
      },
      {
        "w": "no",
        "s": 1.16,
        "e": 1.2,
        "accent": null
      },
      {
        "w": "horário",
        "s": 1.28,
        "e": 1.6,
        "accent": "gold"
      },
      {
        "w": "de",
        "s": 1.68,
        "e": 1.76,
        "accent": null
      },
      {
        "w": "pico.",
        "s": 1.8,
        "e": 2.6,
        "accent": "gold"
      },
      {
        "w": "Descontos",
        "s": 2.64,
        "e": 3.28,
        "accent": null
      },
      {
        "w": "aplicados",
        "s": 3.36,
        "e": 4,
        "accent": null
      },
      {
        "w": "sem",
        "s": 4.08,
        "e": 4.16,
        "accent": "rose"
      },
      {
        "w": "controle.",
        "s": 4.24,
        "e": 5.16,
        "accent": "rose"
      },
      {
        "w": "Cadastros",
        "s": 5.2,
        "e": 5.84,
        "accent": null
      },
      {
        "w": "duplicados",
        "s": 6,
        "e": 6.64,
        "accent": null
      },
      {
        "w": "e",
        "s": 6.72,
        "e": 6.8,
        "accent": "rose"
      },
      {
        "w": "notas",
        "s": 6.92,
        "e": 7.2,
        "accent": null
      },
      {
        "w": "rejeitadas.",
        "s": 7.28,
        "e": 8.44,
        "accent": "rose"
      },
      {
        "w": "Cada",
        "s": 8.48,
        "e": 8.72,
        "accent": null
      },
      {
        "w": "minuto",
        "s": 8.84,
        "e": 9.12,
        "accent": null
      },
      {
        "w": "de",
        "s": 9.2,
        "e": 9.28,
        "accent": null
      },
      {
        "w": "caixa",
        "s": 9.36,
        "e": 9.68,
        "accent": null
      },
      {
        "w": "parado",
        "s": 9.8,
        "e": 10.24,
        "accent": null
      },
      {
        "w": "é",
        "s": 10.32,
        "e": 10.4,
        "accent": null
      },
      {
        "w": "venda",
        "s": 10.48,
        "e": 10.72,
        "accent": null
      },
      {
        "w": "perdida.",
        "s": 10.8,
        "e": 11.76,
        "accent": "rose"
      }
    ]
  },
  {
    "id": 3,
    "arquivo": "cena-03.mp3",
    "audioUrl": "/pitch/audio/cena-03.mp3",
    "rotulo": "A Solução",
    "tag": "SOLUÇÃO",
    "title": "Os Três Pilares Integrados",
    "themeColor": "gold",
    "duracao": 10.56,
    "palavras": [
      {
        "w": "Por",
        "s": 0,
        "e": 0.16,
        "accent": null
      },
      {
        "w": "isso",
        "s": 0.24,
        "e": 0.48,
        "accent": null
      },
      {
        "w": "nasceu",
        "s": 0.56,
        "e": 0.96,
        "accent": null
      },
      {
        "w": "o",
        "s": 1,
        "e": 1.04,
        "accent": "gold"
      },
      {
        "w": "MS²",
        "s": 1.2,
        "e": 1.68,
        "accent": "gold"
      },
      {
        "w": "Vestuário:",
        "s": 1.76,
        "e": 3.24,
        "accent": "gold"
      },
      {
        "w": "um",
        "s": 3.28,
        "e": 3.36,
        "accent": null
      },
      {
        "w": "sistema",
        "s": 3.44,
        "e": 3.84,
        "accent": null
      },
      {
        "w": "de",
        "s": 3.92,
        "e": 4,
        "accent": null
      },
      {
        "w": "PDV",
        "s": 4.08,
        "e": 4.64,
        "accent": "emerald"
      },
      {
        "w": "e",
        "s": 4.72,
        "e": 4.76,
        "accent": "gold"
      },
      {
        "w": "gestão",
        "s": 4.8,
        "e": 5.2,
        "accent": "emerald"
      },
      {
        "w": "comercial",
        "s": 5.28,
        "e": 5.76,
        "accent": "emerald"
      },
      {
        "w": "pensado,",
        "s": 5.84,
        "e": 6.68,
        "accent": null
      },
      {
        "w": "do",
        "s": 6.72,
        "e": 6.8,
        "accent": null
      },
      {
        "w": "primeiro",
        "s": 6.96,
        "e": 7.28,
        "accent": null
      },
      {
        "w": "pixel",
        "s": 7.52,
        "e": 7.76,
        "accent": null
      },
      {
        "w": "ao",
        "s": 7.84,
        "e": 8,
        "accent": null
      },
      {
        "w": "último",
        "s": 8.04,
        "e": 8.4,
        "accent": null
      },
      {
        "w": "byte,",
        "s": 8.64,
        "e": 8.92,
        "accent": null
      },
      {
        "w": "para",
        "s": 8.96,
        "e": 9.04,
        "accent": null
      },
      {
        "w": "o",
        "s": 9.08,
        "e": 9.12,
        "accent": "gold"
      },
      {
        "w": "varejo",
        "s": 9.16,
        "e": 9.52,
        "accent": "gold"
      },
      {
        "w": "de",
        "s": 9.6,
        "e": 9.68,
        "accent": null
      },
      {
        "w": "moda.",
        "s": 9.8,
        "e": 10.56,
        "accent": "gold"
      }
    ]
  },
  {
    "id": 4,
    "arquivo": "cena-04.mp3",
    "audioUrl": "/pitch/audio/cena-04.mp3",
    "rotulo": "Arquitetura",
    "tag": "ENGENHARIA",
    "title": "Arquitetura Full-Stack ACID",
    "themeColor": "indigo",
    "duracao": 14.4,
    "palavras": [
      {
        "w": "A",
        "s": 0,
        "e": 0.08,
        "accent": "gold"
      },
      {
        "w": "arquitetura",
        "s": 0.16,
        "e": 0.8,
        "accent": null
      },
      {
        "w": "é",
        "s": 0.84,
        "e": 0.88,
        "accent": null
      },
      {
        "w": "moderna",
        "s": 0.96,
        "e": 1.44,
        "accent": null
      },
      {
        "w": "e",
        "s": 1.48,
        "e": 1.52,
        "accent": "gold"
      },
      {
        "w": "segura:",
        "s": 1.64,
        "e": 2.48,
        "accent": null
      },
      {
        "w": "React",
        "s": 2.72,
        "e": 2.96,
        "accent": "gold"
      },
      {
        "w": "com",
        "s": 3.08,
        "e": 3.2,
        "accent": null
      },
      {
        "w": "TypeScript",
        "s": 3.36,
        "e": 3.84,
        "accent": "gold"
      },
      {
        "w": "no",
        "s": 3.92,
        "e": 4,
        "accent": "gold"
      },
      {
        "w": "front-end,",
        "s": 4.16,
        "e": 4.96,
        "accent": null
      },
      {
        "w": "uma",
        "s": 5.04,
        "e": 5.28,
        "accent": null
      },
      {
        "w": "API",
        "s": 5.36,
        "e": 5.76,
        "accent": null
      },
      {
        "w": "REST",
        "s": 5.84,
        "e": 6.24,
        "accent": null
      },
      {
        "w": "em",
        "s": 6.36,
        "e": 6.48,
        "accent": null
      },
      {
        "w": "Node",
        "s": 6.64,
        "e": 6.8,
        "accent": "gold"
      },
      {
        "w": "e",
        "s": 6.88,
        "e": 6.92,
        "accent": "gold"
      },
      {
        "w": "Express,",
        "s": 6.96,
        "e": 8,
        "accent": "gold"
      },
      {
        "w": "validação",
        "s": 8.08,
        "e": 8.64,
        "accent": null
      },
      {
        "w": "com",
        "s": 8.76,
        "e": 8.88,
        "accent": null
      },
      {
        "w": "Zod,",
        "s": 8.96,
        "e": 9.48,
        "accent": "emerald"
      },
      {
        "w": "autenticação",
        "s": 9.52,
        "e": 10.32,
        "accent": null
      },
      {
        "w": "JWT",
        "s": 10.4,
        "e": 11.36,
        "accent": "emerald"
      },
      {
        "w": "e",
        "s": 11.44,
        "e": 11.48,
        "accent": "gold"
      },
      {
        "w": "um",
        "s": 11.52,
        "e": 11.6,
        "accent": null
      },
      {
        "w": "banco",
        "s": 11.68,
        "e": 11.92,
        "accent": null
      },
      {
        "w": "relacional",
        "s": 12,
        "e": 12.56,
        "accent": null
      },
      {
        "w": "com",
        "s": 12.64,
        "e": 12.72,
        "accent": null
      },
      {
        "w": "transações",
        "s": 12.84,
        "e": 13.44,
        "accent": "emerald"
      },
      {
        "w": "ACID.",
        "s": 13.52,
        "e": 14.4,
        "accent": "emerald"
      }
    ]
  },
  {
    "id": 5,
    "arquivo": "cena-05.mp3",
    "audioUrl": "/pitch/audio/cena-05.mp3",
    "rotulo": "PDV ao Vivo",
    "tag": "PERFORMANCE",
    "title": "Frente de Caixa Sub-300ms",
    "themeColor": "emerald",
    "duracao": 13.28,
    "palavras": [
      {
        "w": "No",
        "s": 0,
        "e": 0.16,
        "accent": null
      },
      {
        "w": "caixa,",
        "s": 0.24,
        "e": 0.8,
        "accent": null
      },
      {
        "w": "a",
        "s": 0.84,
        "e": 0.88,
        "accent": "gold"
      },
      {
        "w": "velocidade",
        "s": 0.96,
        "e": 1.52,
        "accent": "emerald"
      },
      {
        "w": "é",
        "s": 1.6,
        "e": 1.68,
        "accent": null
      },
      {
        "w": "absoluta.",
        "s": 1.84,
        "e": 2.8,
        "accent": "emerald"
      },
      {
        "w": "O",
        "s": 2.88,
        "e": 2.92,
        "accent": "gold"
      },
      {
        "w": "produto",
        "s": 2.96,
        "e": 3.44,
        "accent": null
      },
      {
        "w": "é",
        "s": 3.52,
        "e": 3.6,
        "accent": null
      },
      {
        "w": "bipado",
        "s": 3.707,
        "e": 4.24,
        "accent": null
      },
      {
        "w": "e",
        "s": 4.32,
        "e": 4.4,
        "accent": "gold"
      },
      {
        "w": "entra",
        "s": 4.48,
        "e": 4.72,
        "accent": null
      },
      {
        "w": "no",
        "s": 4.8,
        "e": 4.88,
        "accent": null
      },
      {
        "w": "carrinho",
        "s": 4.96,
        "e": 5.36,
        "accent": null
      },
      {
        "w": "em",
        "s": 5.44,
        "e": 5.6,
        "accent": null
      },
      {
        "w": "menos",
        "s": 5.72,
        "e": 5.92,
        "accent": null
      },
      {
        "w": "de",
        "s": 6,
        "e": 6.08,
        "accent": "emerald"
      },
      {
        "w": "trezentos",
        "s": 6.16,
        "e": 6.72,
        "accent": "emerald"
      },
      {
        "w": "milissegundos.",
        "s": 6.8,
        "e": 7.96,
        "accent": "emerald"
      },
      {
        "w": "O",
        "s": 8,
        "e": 8.08,
        "accent": "gold"
      },
      {
        "w": "total",
        "s": 8.32,
        "e": 8.56,
        "accent": null
      },
      {
        "w": "é",
        "s": 8.64,
        "e": 8.72,
        "accent": null
      },
      {
        "w": "recalculado",
        "s": 8.84,
        "e": 9.36,
        "accent": null
      },
      {
        "w": "em",
        "s": 9.44,
        "e": 9.52,
        "accent": null
      },
      {
        "w": "centavos,",
        "s": 9.72,
        "e": 10.44,
        "accent": null
      },
      {
        "w": "e",
        "s": 10.48,
        "e": 10.64,
        "accent": "gold"
      },
      {
        "w": "cada",
        "s": 10.68,
        "e": 10.88,
        "accent": null
      },
      {
        "w": "ação",
        "s": 11.12,
        "e": 11.36,
        "accent": null
      },
      {
        "w": "tem",
        "s": 11.44,
        "e": 11.52,
        "accent": null
      },
      {
        "w": "a",
        "s": 11.6,
        "e": 11.68,
        "accent": "gold"
      },
      {
        "w": "sua",
        "s": 11.72,
        "e": 11.92,
        "accent": null
      },
      {
        "w": "tecla",
        "s": 12,
        "e": 12.24,
        "accent": "gold"
      },
      {
        "w": "de",
        "s": 12.32,
        "e": 12.453,
        "accent": "emerald"
      },
      {
        "w": "atalho.",
        "s": 12.587,
        "e": 13.28,
        "accent": "gold"
      }
    ]
  },
  {
    "id": 6,
    "arquivo": "cena-06.mp3",
    "audioUrl": "/pitch/audio/cena-06.mp3",
    "rotulo": "Código · RN-01",
    "tag": "REGRA RN-01",
    "title": "Validação Oficial de CPF (Módulo 11)",
    "themeColor": "gold",
    "duracao": 11.84,
    "palavras": [
      {
        "w": "A",
        "s": 0,
        "e": 0.08,
        "accent": "gold"
      },
      {
        "w": "identificação",
        "s": 0.24,
        "e": 0.88,
        "accent": null
      },
      {
        "w": "do",
        "s": 0.96,
        "e": 1.04,
        "accent": "emerald"
      },
      {
        "w": "cliente",
        "s": 1.32,
        "e": 1.6,
        "accent": null
      },
      {
        "w": "segue",
        "s": 1.68,
        "e": 1.92,
        "accent": null
      },
      {
        "w": "o",
        "s": 1.96,
        "e": 2,
        "accent": "gold"
      },
      {
        "w": "algoritmo",
        "s": 2.08,
        "e": 2.56,
        "accent": null
      },
      {
        "w": "oficial",
        "s": 2.64,
        "e": 3.2,
        "accent": null
      },
      {
        "w": "da",
        "s": 3.24,
        "e": 3.28,
        "accent": null
      },
      {
        "w": "Receita",
        "s": 3.4,
        "e": 3.76,
        "accent": "gold"
      },
      {
        "w": "Federal.",
        "s": 3.84,
        "e": 4.827,
        "accent": "gold"
      },
      {
        "w": "O",
        "s": 4.853,
        "e": 4.88,
        "accent": "gold"
      },
      {
        "w": "Módulo",
        "s": 4.96,
        "e": 5.28,
        "accent": "gold"
      },
      {
        "w": "onze",
        "s": 5.36,
        "e": 5.76,
        "accent": "gold"
      },
      {
        "w": "calcula",
        "s": 5.96,
        "e": 6.2,
        "accent": null
      },
      {
        "w": "os",
        "s": 6.24,
        "e": 6.4,
        "accent": "emerald"
      },
      {
        "w": "dois",
        "s": 6.44,
        "e": 6.64,
        "accent": "emerald"
      },
      {
        "w": "dígitos",
        "s": 6.72,
        "e": 7.12,
        "accent": "emerald"
      },
      {
        "w": "verificadores",
        "s": 7.2,
        "e": 8.16,
        "accent": "emerald"
      },
      {
        "w": "e",
        "s": 8.24,
        "e": 8.32,
        "accent": "gold"
      },
      {
        "w": "bloqueia",
        "s": 8.44,
        "e": 8.8,
        "accent": "rose"
      },
      {
        "w": "qualquer",
        "s": 8.92,
        "e": 9.28,
        "accent": null
      },
      {
        "w": "CPF",
        "s": 9.36,
        "e": 9.84,
        "accent": null
      },
      {
        "w": "inválido",
        "s": 9.92,
        "e": 10.56,
        "accent": "rose"
      },
      {
        "w": "ou",
        "s": 10.64,
        "e": 10.72,
        "accent": null
      },
      {
        "w": "duplicado.",
        "s": 10.8,
        "e": 11.84,
        "accent": null
      }
    ]
  },
  {
    "id": 7,
    "arquivo": "cena-07.mp3",
    "audioUrl": "/pitch/audio/cena-07.mp3",
    "rotulo": "Clientes",
    "tag": "ERGONOMIA",
    "title": "Gestão Ágil de Clientes no PDV",
    "themeColor": "emerald",
    "duracao": 9.52,
    "palavras": [
      {
        "w": "O",
        "s": 0,
        "e": 0.08,
        "accent": "gold"
      },
      {
        "w": "operador",
        "s": 0.2,
        "e": 0.64,
        "accent": null
      },
      {
        "w": "decide",
        "s": 0.72,
        "e": 1.12,
        "accent": "emerald"
      },
      {
        "w": "em",
        "s": 1.2,
        "e": 1.28,
        "accent": null
      },
      {
        "w": "segundos:",
        "s": 1.4,
        "e": 2.4,
        "accent": "emerald"
      },
      {
        "w": "seleciona",
        "s": 2.48,
        "e": 3.04,
        "accent": null
      },
      {
        "w": "um",
        "s": 3.08,
        "e": 3.12,
        "accent": "gold"
      },
      {
        "w": "cliente",
        "s": 3.2,
        "e": 3.6,
        "accent": null
      },
      {
        "w": "fidelizado,",
        "s": 3.64,
        "e": 4.68,
        "accent": "emerald"
      },
      {
        "w": "cadastra",
        "s": 4.72,
        "e": 5.2,
        "accent": null
      },
      {
        "w": "um",
        "s": 5.28,
        "e": 5.36,
        "accent": "gold"
      },
      {
        "w": "novo",
        "s": 5.44,
        "e": 5.76,
        "accent": null
      },
      {
        "w": "sem",
        "s": 5.84,
        "e": 6,
        "accent": null
      },
      {
        "w": "sair",
        "s": 6.08,
        "e": 6.32,
        "accent": null
      },
      {
        "w": "da",
        "s": 6.4,
        "e": 6.48,
        "accent": null
      },
      {
        "w": "venda,",
        "s": 6.52,
        "e": 7.16,
        "accent": null
      },
      {
        "w": "ou",
        "s": 7.2,
        "e": 7.36,
        "accent": null
      },
      {
        "w": "segue",
        "s": 7.44,
        "e": 7.68,
        "accent": null
      },
      {
        "w": "como",
        "s": 7.76,
        "e": 7.92,
        "accent": null
      },
      {
        "w": "consumidor",
        "s": 8,
        "e": 8.56,
        "accent": "gold"
      },
      {
        "w": "final.",
        "s": 8.64,
        "e": 9.52,
        "accent": "gold"
      }
    ]
  },
  {
    "id": 8,
    "arquivo": "cena-08.mp3",
    "audioUrl": "/pitch/audio/cena-08.mp3",
    "rotulo": "Perfis de Acesso",
    "tag": "SEGURANÇA",
    "title": "Matriz Hierárquica RBAC",
    "themeColor": "indigo",
    "duracao": 13.28,
    "palavras": [
      {
        "w": "Cada",
        "s": 0,
        "e": 0.24,
        "accent": null
      },
      {
        "w": "perfil",
        "s": 0.32,
        "e": 0.8,
        "accent": null
      },
      {
        "w": "tem",
        "s": 0.88,
        "e": 0.96,
        "accent": null
      },
      {
        "w": "o",
        "s": 1,
        "e": 1.04,
        "accent": "gold"
      },
      {
        "w": "seu",
        "s": 1.12,
        "e": 1.28,
        "accent": null
      },
      {
        "w": "poder.",
        "s": 1.36,
        "e": 2.16,
        "accent": null
      },
      {
        "w": "O",
        "s": 2.24,
        "e": 2.32,
        "accent": "gold"
      },
      {
        "w": "caixa",
        "s": 2.4,
        "e": 2.8,
        "accent": "gold"
      },
      {
        "w": "opera",
        "s": 2.88,
        "e": 3.12,
        "accent": null
      },
      {
        "w": "o",
        "s": 3.16,
        "e": 3.2,
        "accent": "gold"
      },
      {
        "w": "PDV,",
        "s": 3.28,
        "e": 4.08,
        "accent": null
      },
      {
        "w": "o",
        "s": 4.16,
        "e": 4.24,
        "accent": "gold"
      },
      {
        "w": "gerente",
        "s": 4.36,
        "e": 4.72,
        "accent": "gold"
      },
      {
        "w": "autoriza",
        "s": 4.88,
        "e": 5.2,
        "accent": null
      },
      {
        "w": "alçadas,",
        "s": 5.28,
        "e": 6.08,
        "accent": null
      },
      {
        "w": "e",
        "s": 6.16,
        "e": 6.24,
        "accent": "gold"
      },
      {
        "w": "o",
        "s": 6.267,
        "e": 6.293,
        "accent": "gold"
      },
      {
        "w": "administrador",
        "s": 6.32,
        "e": 7.12,
        "accent": "gold"
      },
      {
        "w": "controla",
        "s": 7.32,
        "e": 7.6,
        "accent": null
      },
      {
        "w": "equipe,",
        "s": 7.72,
        "e": 8.32,
        "accent": null
      },
      {
        "w": "empresa",
        "s": 8.6,
        "e": 8.88,
        "accent": null
      },
      {
        "w": "e",
        "s": 9.04,
        "e": 9.08,
        "accent": "gold"
      },
      {
        "w": "dados",
        "s": 9.12,
        "e": 9.44,
        "accent": null
      },
      {
        "w": "fiscais.",
        "s": 9.52,
        "e": 10.48,
        "accent": null
      },
      {
        "w": "Tudo",
        "s": 10.52,
        "e": 10.72,
        "accent": null
      },
      {
        "w": "protegido",
        "s": 10.8,
        "e": 11.44,
        "accent": null
      },
      {
        "w": "por",
        "s": 11.52,
        "e": 11.6,
        "accent": null
      },
      {
        "w": "middleware",
        "s": 11.68,
        "e": 12.16,
        "accent": "emerald"
      },
      {
        "w": "de",
        "s": 12.2,
        "e": 12.24,
        "accent": null
      },
      {
        "w": "acesso.",
        "s": 12.32,
        "e": 13.28,
        "accent": "emerald"
      }
    ]
  },
  {
    "id": 9,
    "arquivo": "cena-09.mp3",
    "audioUrl": "/pitch/audio/cena-09.mp3",
    "rotulo": "Alçada · RN-02",
    "tag": "REGRA RN-02",
    "title": "Alçada Gerencial de Desconto (> 10%)",
    "themeColor": "rose",
    "duracao": 11.68,
    "palavras": [
      {
        "w": "Desconto",
        "s": 0,
        "e": 0.48,
        "accent": "rose"
      },
      {
        "w": "acima",
        "s": 0.6,
        "e": 0.88,
        "accent": "rose"
      },
      {
        "w": "de",
        "s": 0.96,
        "e": 1.04,
        "accent": "rose"
      },
      {
        "w": "dez",
        "s": 1.12,
        "e": 1.2,
        "accent": "rose"
      },
      {
        "w": "por",
        "s": 1.28,
        "e": 1.44,
        "accent": null
      },
      {
        "w": "cento?",
        "s": 1.52,
        "e": 2.32,
        "accent": "rose"
      },
      {
        "w": "O",
        "s": 2.36,
        "e": 2.4,
        "accent": "emerald"
      },
      {
        "w": "sistema",
        "s": 2.44,
        "e": 2.88,
        "accent": null
      },
      {
        "w": "bloqueia",
        "s": 2.96,
        "e": 3.44,
        "accent": "rose"
      },
      {
        "w": "a",
        "s": 3.493,
        "e": 3.547,
        "accent": "emerald"
      },
      {
        "w": "venda",
        "s": 3.6,
        "e": 4,
        "accent": null
      },
      {
        "w": "e",
        "s": 4.08,
        "e": 4.16,
        "accent": "emerald"
      },
      {
        "w": "exige",
        "s": 4.28,
        "e": 4.56,
        "accent": null
      },
      {
        "w": "a",
        "s": 4.64,
        "e": 4.72,
        "accent": "emerald"
      },
      {
        "w": "senha",
        "s": 4.8,
        "e": 5.04,
        "accent": "emerald"
      },
      {
        "w": "do",
        "s": 5.08,
        "e": 5.12,
        "accent": null
      },
      {
        "w": "gerente.",
        "s": 5.2,
        "e": 6.12,
        "accent": "emerald"
      },
      {
        "w": "A",
        "s": 6.16,
        "e": 6.267,
        "accent": "emerald"
      },
      {
        "w": "aprovação",
        "s": 6.373,
        "e": 6.88,
        "accent": null
      },
      {
        "w": "fica",
        "s": 6.92,
        "e": 7.12,
        "accent": null
      },
      {
        "w": "gravada,",
        "s": 7.28,
        "e": 8,
        "accent": null
      },
      {
        "w": "com",
        "s": 8.08,
        "e": 8.16,
        "accent": null
      },
      {
        "w": "nome,",
        "s": 8.4,
        "e": 8.72,
        "accent": null
      },
      {
        "w": "data",
        "s": 8.8,
        "e": 9.2,
        "accent": null
      },
      {
        "w": "e",
        "s": 9.28,
        "e": 9.32,
        "accent": "emerald"
      },
      {
        "w": "valor,",
        "s": 9.36,
        "e": 10.053,
        "accent": null
      },
      {
        "w": "pronta",
        "s": 10.107,
        "e": 10.4,
        "accent": null
      },
      {
        "w": "para",
        "s": 10.48,
        "e": 10.56,
        "accent": null
      },
      {
        "w": "auditoria.",
        "s": 10.64,
        "e": 11.68,
        "accent": "emerald"
      }
    ]
  },
  {
    "id": 10,
    "arquivo": "cena-10.mp3",
    "audioUrl": "/pitch/audio/cena-10.mp3",
    "rotulo": "Histórico · RN-03/04",
    "tag": "AUDITORIA",
    "title": "Snapshot Imutável de Preço (RN-04)",
    "themeColor": "gold",
    "duracao": 10.72,
    "palavras": [
      {
        "w": "E",
        "s": 0,
        "e": 0.08,
        "accent": "gold"
      },
      {
        "w": "o",
        "s": 0.12,
        "e": 0.16,
        "accent": "gold"
      },
      {
        "w": "histórico",
        "s": 0.24,
        "e": 0.88,
        "accent": "gold"
      },
      {
        "w": "é",
        "s": 0.96,
        "e": 1.04,
        "accent": null
      },
      {
        "w": "imutável.",
        "s": 1.12,
        "e": 2.12,
        "accent": "gold"
      },
      {
        "w": "O",
        "s": 2.16,
        "e": 2.24,
        "accent": "gold"
      },
      {
        "w": "preço",
        "s": 2.32,
        "e": 2.64,
        "accent": null
      },
      {
        "w": "de",
        "s": 2.72,
        "e": 2.8,
        "accent": null
      },
      {
        "w": "cada",
        "s": 2.84,
        "e": 3.12,
        "accent": null
      },
      {
        "w": "item",
        "s": 3.2,
        "e": 3.52,
        "accent": null
      },
      {
        "w": "é",
        "s": 3.6,
        "e": 3.68,
        "accent": null
      },
      {
        "w": "congelado",
        "s": 3.8,
        "e": 4.32,
        "accent": "gold"
      },
      {
        "w": "no",
        "s": 4.4,
        "e": 4.48,
        "accent": null
      },
      {
        "w": "momento",
        "s": 4.68,
        "e": 4.933,
        "accent": null
      },
      {
        "w": "da",
        "s": 4.987,
        "e": 5.04,
        "accent": null
      },
      {
        "w": "venda,",
        "s": 5.12,
        "e": 5.787,
        "accent": null
      },
      {
        "w": "e",
        "s": 5.813,
        "e": 5.84,
        "accent": "gold"
      },
      {
        "w": "um",
        "s": 5.92,
        "e": 6,
        "accent": null
      },
      {
        "w": "estorno",
        "s": 6.16,
        "e": 6.64,
        "accent": null
      },
      {
        "w": "só",
        "s": 6.72,
        "e": 6.84,
        "accent": null
      },
      {
        "w": "acontece",
        "s": 6.88,
        "e": 7.44,
        "accent": null
      },
      {
        "w": "com",
        "s": 7.52,
        "e": 7.6,
        "accent": null
      },
      {
        "w": "motivo",
        "s": 7.68,
        "e": 8.16,
        "accent": null
      },
      {
        "w": "formal",
        "s": 8.32,
        "e": 8.72,
        "accent": null
      },
      {
        "w": "e",
        "s": 8.8,
        "e": 8.84,
        "accent": "gold"
      },
      {
        "w": "autorização",
        "s": 8.88,
        "e": 9.6,
        "accent": "emerald"
      },
      {
        "w": "gerencial.",
        "s": 9.68,
        "e": 10.72,
        "accent": "emerald"
      }
    ]
  },
  {
    "id": 11,
    "arquivo": "cena-11.mp3",
    "audioUrl": "/pitch/audio/cena-11.mp3",
    "rotulo": "Dashboard",
    "tag": "BUSINESS INTELLIGENCE",
    "title": "Dashboard Executivo em Tempo Real",
    "themeColor": "emerald",
    "duracao": 9.68,
    "palavras": [
      {
        "w": "Para",
        "s": 0,
        "e": 0.24,
        "accent": null
      },
      {
        "w": "a",
        "s": 0.267,
        "e": 0.293,
        "accent": "gold"
      },
      {
        "w": "gestão,",
        "s": 0.32,
        "e": 1.04,
        "accent": null
      },
      {
        "w": "um",
        "s": 1.12,
        "e": 1.2,
        "accent": null
      },
      {
        "w": "painel",
        "s": 1.32,
        "e": 1.6,
        "accent": "emerald"
      },
      {
        "w": "em",
        "s": 1.68,
        "e": 1.76,
        "accent": "emerald"
      },
      {
        "w": "tempo",
        "s": 1.88,
        "e": 2.04,
        "accent": "emerald"
      },
      {
        "w": "real:",
        "s": 2.08,
        "e": 2.8,
        "accent": "emerald"
      },
      {
        "w": "faturamento,",
        "s": 2.84,
        "e": 3.84,
        "accent": "emerald"
      },
      {
        "w": "ticket",
        "s": 4,
        "e": 4.16,
        "accent": "gold"
      },
      {
        "w": "médio,",
        "s": 4.24,
        "e": 4.88,
        "accent": "gold"
      },
      {
        "w": "ranking",
        "s": 4.96,
        "e": 5.28,
        "accent": "gold"
      },
      {
        "w": "de",
        "s": 5.32,
        "e": 5.36,
        "accent": null
      },
      {
        "w": "produtos",
        "s": 5.44,
        "e": 6.08,
        "accent": null
      },
      {
        "w": "e",
        "s": 6.12,
        "e": 6.16,
        "accent": "gold"
      },
      {
        "w": "formas",
        "s": 6.24,
        "e": 6.64,
        "accent": null
      },
      {
        "w": "de",
        "s": 6.68,
        "e": 6.72,
        "accent": null
      },
      {
        "w": "pagamento,",
        "s": 6.8,
        "e": 7.6,
        "accent": null
      },
      {
        "w": "atualizados",
        "s": 7.68,
        "e": 8.4,
        "accent": null
      },
      {
        "w": "a",
        "s": 8.48,
        "e": 8.56,
        "accent": "gold"
      },
      {
        "w": "cada",
        "s": 8.6,
        "e": 8.8,
        "accent": null
      },
      {
        "w": "venda.",
        "s": 8.88,
        "e": 9.68,
        "accent": null
      }
    ]
  },
  {
    "id": 12,
    "arquivo": "cena-12.mp3",
    "audioUrl": "/pitch/audio/cena-12.mp3",
    "rotulo": "Fiscal · NFC-e",
    "tag": "CONFORMIDADE",
    "title": "Emissão Fiscal NFC-e Modelo 65",
    "themeColor": "gold",
    "duracao": 11.28,
    "palavras": [
      {
        "w": "No",
        "s": 0,
        "e": 0.08,
        "accent": null
      },
      {
        "w": "fiscal,",
        "s": 0.24,
        "e": 0.96,
        "accent": null
      },
      {
        "w": "a",
        "s": 1.04,
        "e": 1.12,
        "accent": "gold"
      },
      {
        "w": "NFC-e",
        "s": 1.28,
        "e": 2.16,
        "accent": null
      },
      {
        "w": "modelo",
        "s": 2.36,
        "e": 2.56,
        "accent": null
      },
      {
        "w": "sessenta",
        "s": 2.68,
        "e": 3.04,
        "accent": "gold"
      },
      {
        "w": "e",
        "s": 3.12,
        "e": 3.2,
        "accent": "gold"
      },
      {
        "w": "cinco",
        "s": 3.32,
        "e": 3.6,
        "accent": "gold"
      },
      {
        "w": "é",
        "s": 3.68,
        "e": 3.76,
        "accent": null
      },
      {
        "w": "gerada",
        "s": 3.84,
        "e": 4.24,
        "accent": null
      },
      {
        "w": "com",
        "s": 4.32,
        "e": 4.4,
        "accent": null
      },
      {
        "w": "chave",
        "s": 4.48,
        "e": 4.72,
        "accent": null
      },
      {
        "w": "de",
        "s": 4.8,
        "e": 4.88,
        "accent": "emerald"
      },
      {
        "w": "quarenta",
        "s": 4.92,
        "e": 5.333,
        "accent": "gold"
      },
      {
        "w": "e",
        "s": 5.387,
        "e": 5.44,
        "accent": "gold"
      },
      {
        "w": "quatro",
        "s": 5.48,
        "e": 5.68,
        "accent": "gold"
      },
      {
        "w": "dígitos,",
        "s": 5.76,
        "e": 6.6,
        "accent": "gold"
      },
      {
        "w": "QR",
        "s": 6.64,
        "e": 7.04,
        "accent": "emerald"
      },
      {
        "w": "Code",
        "s": 7.12,
        "e": 7.44,
        "accent": "emerald"
      },
      {
        "w": "de",
        "s": 7.48,
        "e": 7.52,
        "accent": "emerald"
      },
      {
        "w": "consulta",
        "s": 7.6,
        "e": 8.08,
        "accent": null
      },
      {
        "w": "pública",
        "s": 8.16,
        "e": 8.72,
        "accent": null
      },
      {
        "w": "e",
        "s": 8.8,
        "e": 8.84,
        "accent": "gold"
      },
      {
        "w": "os",
        "s": 8.88,
        "e": 8.96,
        "accent": "gold"
      },
      {
        "w": "tributos",
        "s": 9.04,
        "e": 9.52,
        "accent": null
      },
      {
        "w": "da",
        "s": 9.6,
        "e": 9.68,
        "accent": null
      },
      {
        "w": "Lei",
        "s": 9.76,
        "e": 9.88,
        "accent": "emerald"
      },
      {
        "w": "da",
        "s": 9.92,
        "e": 9.96,
        "accent": null
      },
      {
        "w": "Transparência.",
        "s": 10,
        "e": 11.28,
        "accent": "emerald"
      }
    ]
  },
  {
    "id": 13,
    "arquivo": "cena-13.mp3",
    "audioUrl": "/pitch/audio/cena-13.mp3",
    "rotulo": "Relatórios",
    "tag": "CONTABILIDADE",
    "title": "Exportação Executiva: PDF, Excel e CSV",
    "themeColor": "emerald",
    "duracao": 11.04,
    "palavras": [
      {
        "w": "Relatórios",
        "s": 0,
        "e": 0.64,
        "accent": "gold"
      },
      {
        "w": "executivos",
        "s": 0.72,
        "e": 1.52,
        "accent": "gold"
      },
      {
        "w": "saem",
        "s": 1.6,
        "e": 1.84,
        "accent": null
      },
      {
        "w": "com",
        "s": 1.92,
        "e": 2.08,
        "accent": null
      },
      {
        "w": "um",
        "s": 2.12,
        "e": 2.16,
        "accent": "emerald"
      },
      {
        "w": "clique:",
        "s": 2.24,
        "e": 2.96,
        "accent": "emerald"
      },
      {
        "w": "PDF",
        "s": 3.04,
        "e": 3.68,
        "accent": "emerald"
      },
      {
        "w": "com",
        "s": 3.76,
        "e": 3.84,
        "accent": null
      },
      {
        "w": "identidade",
        "s": 4,
        "e": 4.48,
        "accent": null
      },
      {
        "w": "visual,",
        "s": 4.92,
        "e": 5.44,
        "accent": null
      },
      {
        "w": "planilha",
        "s": 5.52,
        "e": 5.84,
        "accent": "emerald"
      },
      {
        "w": "Excel",
        "s": 5.92,
        "e": 6.32,
        "accent": "emerald"
      },
      {
        "w": "formatada",
        "s": 6.4,
        "e": 7.28,
        "accent": null
      },
      {
        "w": "e",
        "s": 7.36,
        "e": 7.44,
        "accent": "gold"
      },
      {
        "w": "CSV",
        "s": 7.52,
        "e": 8.24,
        "accent": "emerald"
      },
      {
        "w": "pronto",
        "s": 8.32,
        "e": 8.56,
        "accent": null
      },
      {
        "w": "para",
        "s": 8.64,
        "e": 8.8,
        "accent": null
      },
      {
        "w": "qualquer",
        "s": 8.88,
        "e": 9.28,
        "accent": null
      },
      {
        "w": "ferramenta",
        "s": 9.36,
        "e": 9.88,
        "accent": null
      },
      {
        "w": "de",
        "s": 9.92,
        "e": 9.96,
        "accent": null
      },
      {
        "w": "análise.",
        "s": 10,
        "e": 11.04,
        "accent": null
      }
    ]
  },
  {
    "id": 14,
    "arquivo": "cena-14.mp3",
    "audioUrl": "/pitch/audio/cena-14.mp3",
    "rotulo": "Qualidade",
    "tag": "QUALIDADE",
    "title": "18 Testes Automatizados E2E Homologados",
    "themeColor": "gold",
    "duracao": 10.56,
    "palavras": [
      {
        "w": "Qualidade",
        "s": 0,
        "e": 0.64,
        "accent": "emerald"
      },
      {
        "w": "não",
        "s": 0.8,
        "e": 0.96,
        "accent": "emerald"
      },
      {
        "w": "é",
        "s": 1.04,
        "e": 1.12,
        "accent": null
      },
      {
        "w": "promessa,",
        "s": 1.24,
        "e": 1.92,
        "accent": "emerald"
      },
      {
        "w": "é",
        "s": 2,
        "e": 2.08,
        "accent": null
      },
      {
        "w": "evidência.",
        "s": 2.16,
        "e": 3.36,
        "accent": "emerald"
      },
      {
        "w": "Dezoito",
        "s": 3.48,
        "e": 3.84,
        "accent": "emerald"
      },
      {
        "w": "testes",
        "s": 3.92,
        "e": 4.4,
        "accent": "emerald"
      },
      {
        "w": "de",
        "s": 4.48,
        "e": 4.64,
        "accent": "emerald"
      },
      {
        "w": "ponta",
        "s": 4.68,
        "e": 4.88,
        "accent": null
      },
      {
        "w": "a",
        "s": 4.96,
        "e": 5.04,
        "accent": "gold"
      },
      {
        "w": "ponta",
        "s": 5.08,
        "e": 5.28,
        "accent": null
      },
      {
        "w": "aprovados,",
        "s": 5.36,
        "e": 6.32,
        "accent": null
      },
      {
        "w": "build",
        "s": 6.48,
        "e": 6.8,
        "accent": null
      },
      {
        "w": "sem",
        "s": 6.88,
        "e": 7.12,
        "accent": null
      },
      {
        "w": "erros",
        "s": 7.2,
        "e": 7.6,
        "accent": null
      },
      {
        "w": "e",
        "s": 7.72,
        "e": 7.84,
        "accent": "emerald"
      },
      {
        "w": "todas",
        "s": 7.92,
        "e": 8.16,
        "accent": null
      },
      {
        "w": "as",
        "s": 8.24,
        "e": 8.32,
        "accent": "gold"
      },
      {
        "w": "regras",
        "s": 8.4,
        "e": 8.72,
        "accent": null
      },
      {
        "w": "de",
        "s": 8.76,
        "e": 8.8,
        "accent": "emerald"
      },
      {
        "w": "negócio",
        "s": 8.92,
        "e": 9.28,
        "accent": null
      },
      {
        "w": "homologadas.",
        "s": 9.36,
        "e": 10.56,
        "accent": "gold"
      }
    ]
  },
  {
    "id": 15,
    "arquivo": "cena-15.mp3",
    "audioUrl": "/pitch/audio/cena-15.mp3",
    "rotulo": "Encerramento",
    "tag": "GABARITO SENAI",
    "title": "Encerramento Oficial",
    "themeColor": "gold",
    "duracao": 9.84,
    "palavras": [
      {
        "w": "MS²",
        "s": 0,
        "e": 1.2,
        "accent": "gold"
      },
      {
        "w": "Vestuário.",
        "s": 1.28,
        "e": 2.32,
        "accent": "gold"
      },
      {
        "w": "Moda,",
        "s": 2.4,
        "e": 2.987,
        "accent": "gold"
      },
      {
        "w": "estilo",
        "s": 3.093,
        "e": 3.52,
        "accent": "gold"
      },
      {
        "w": "e",
        "s": 3.56,
        "e": 3.6,
        "accent": "gold"
      },
      {
        "w": "você,",
        "s": 3.64,
        "e": 4.36,
        "accent": "gold"
      },
      {
        "w": "com",
        "s": 4.4,
        "e": 4.48,
        "accent": null
      },
      {
        "w": "a",
        "s": 4.56,
        "e": 4.64,
        "accent": "gold"
      },
      {
        "w": "tecnologia",
        "s": 4.72,
        "e": 5.36,
        "accent": null
      },
      {
        "w": "que",
        "s": 5.44,
        "e": 5.52,
        "accent": null
      },
      {
        "w": "o",
        "s": 5.56,
        "e": 5.6,
        "accent": "gold"
      },
      {
        "w": "seu",
        "s": 5.68,
        "e": 5.84,
        "accent": null
      },
      {
        "w": "varejo",
        "s": 5.88,
        "e": 6.24,
        "accent": null
      },
      {
        "w": "merece.",
        "s": 6.44,
        "e": 7.24,
        "accent": null
      },
      {
        "w": "Projeto",
        "s": 7.28,
        "e": 7.76,
        "accent": null
      },
      {
        "w": "Integrador",
        "s": 7.84,
        "e": 8.48,
        "accent": null
      },
      {
        "w": "Firjan",
        "s": 8.56,
        "e": 8.96,
        "accent": "emerald"
      },
      {
        "w": "SENAI.",
        "s": 9.04,
        "e": 9.84,
        "accent": "emerald"
      }
    ]
  }
];
