# SPRINT 6: PITCH TÉCNICO & APRESENTAÇÃO EM MOTION DESIGN

**Projeto:** Sistema de Gestão Comercial e Ponto de Venda (PDV) — MS² Vestuário  
**Instituição:** Firjan SENAI — Curso Técnico em Desenvolvimento de Sistemas  
**Stack Tecnológica:** React 18, Vite 6, TypeScript 5.7, Tailwind CSS 3.4, Node.js 20+, Express, SQLite/MySQL, Aceternity UI  
**Metodologia de Apresentação:** Motion Design em Código (`render(t)` determinístico) + Live Demo  

---

## 1. Visão Geral e Objetivo da Sprint 6

A **Sprint 6** consolida o encerramento do projeto através da criação de uma experiência imersiva de **Motion Design** para a banca examinadora da Firjan SENAI. Em vez de slides estáticos convencionais de PowerPoint, a apresentação da MS² Vestuário é um **artefato de motion design construído em código puro**, sincronizado com narração de alto impacto e demonstração prática ao vivo.

### Formatos Disponibilizados:
1. **Modo 16:9 (Widescreen Full HD):** Projetado para telões, TVs e apresentação presencial ou remota perante a banca examinadora.
2. **Modo 9:16 (Vertical Reels/Shorts):** Otimizado para gravação de vídeo vertical para redes sociais e portfólio profissional (seguindo a metodologia de @fabiowinck_).
3. **Player Interativo Integrado no Sistema:** Acessível diretamente pela rota `/pitch` do frontend ou pelo arquivo standalone executável `documentação/s06/motion-pitch-player.html`.

---

## 2. Roteiro em 6 Blocos (Metodologia Motion)

### Cena 1 · [0.0s – 7.0s] · Gancho: O Gargalo do Varejo
- **Fala da Narração:**  
  *"No varejo de moda, filas lentas, descontos sem controle e erros de estoque custam milhares de reais todos os dias."*  
  `<break time="0.8s" />`
- **Visual na Tela:**  
  Gráfico de perdas em queda livre, alertas vermelhos piscando ("Fila no Caixa > 15min", "Desconto não autorizado -35%", "Furo de Estoque"), tipografia de urgência com desfoque de entrada e desaceleração exponencial.
- **Palavras de Destaque:** `filas lentas`, `descontos sem controle`, `custam milhares`.

---

### Cena 2 · [7.5s – 15.0s] · Revelação: A Solução MS² Vestuário
- **Fala da Narração:**  
  *"Apresentamos o MS² Vestuário: um ecossistema completo de gestão comercial e ponto de venda de altíssima performance."*  
  `<break time="0.8s" />`
- **Visual na Tela:**  
  O logotipo dourado oficial da MS² Vestuário surge livre no centro da tela com brilho metálico e partículas de luz. Transição fluida revelando os três pilares: **PDV Ágil**, **Catálogo Visual** e **Conformidade Fiscal**.
- **Palavras de Destaque:** `MS² Vestuário`, `gestão comercial`, `altíssima performance`.

---

### Cena 3 · [15.5s – 25.0s] · Prova: Velocidade e Experiência do Cliente
- **Fala da Narração:**  
  *"Bipagem instantânea em menos de trezentos milissegundos, catálogo com fotos reais e cadastro com validação oficial de CPF na Receita Federal."*  
  `<break time="0.8s" />`
- **Visual na Tela:**  
  Interface dinâmica do PDV simulando o bipe de código de barras (`#103 - Calça Jeans Slim`), cálculo instantâneo do subtotal e modal de cliente validando o algoritmo do **Módulo 11 (RN-01)** com selo verde de autenticação.
- **Palavras de Destaque:** `menos de trezentos milissegundos`, `validação oficial de CPF`.

---

### Cena 4 · [25.5s – 35.0s] · Governança: Alçadas e Segurança Imutável
- **Fala da Narração:**  
  *"Chega de fraudes. Descontos acima de dez por cento exigem autorização gerencial imediata, e os preços históricos ficam gravados para sempre."*  
  `<break time="0.8s" />`
- **Visual na Tela:**  
  Modal âmbar de **Alçada Gerencial (RN-02)** sendo ativado na tela, autenticação do Gerente e snapshot imutável do preço unitário registrado no item da venda **(RN-04)**.
- **Palavras de Destaque:** `Chega de fraudes`, `autorização gerencial`, `preços históricos gravados`.

---

### Cena 5 · [35.5s – 45.0s] · Inteligência Fiscal & Homologação
- **Fala da Narração:**  
  *"Emissão de NFC-e com chave de quarenta e quatro dígitos, cálculo de tributos da Lei da Transparência e relatórios completos em Excel e PDF."*  
  `<break time="0.8s" />`
- **Visual na Tela:**  
  Cupom fiscal térmico DANFE NFC-e / SAT desenhando-se na tela com código de barras SEFAZ, chave de 44 dígitos, QR Code simulado e botões interativos de exportação para Excel (.xlsx) e PDF A4.
- **Palavras de Destaque:** `NFC-e`, `quarenta e quatro dígitos`, `Excel e PDF`.

---

### Cena 6 (CTA) · [45.5s – 55.0s] · Fechamento & Homologação Firjan SENAI
- **Fala da Narração:**  
  *"Cem por cento dos dezoito testes automatizados de ponta a ponta aprovados. MS² Vestuário: moda, estilo e você."*  
  `<break time="1.5s" />`
- **Visual na Tela:**  
  Painel com o selo dourado de **Homologação Concluída**, badge com `18/18 Testes E2E Aprovados`, logotipo oficial com efeito de feixe de luz reluzente (*shimmer light*) e dados de encerramento do projeto.
- **Palavras de Destaque:** `Cem por cento`, `dezoito testes aprovados`, `MS² Vestuário`.

---

## 3. Parâmetros de Áudio para Síntese Vocal (ElevenLabs)

Para quem for utilizar voz neural por inteligência artificial (conforme o Passo 2 do Guia de Motion):

- **Plataforma:** ElevenLabs (Text to Speech)
- **Modelo:** `Eleven Multilingual v2` (reconhece tags de pausa `<break time="..." />`)
- **Voz Recomendada:** Voz brasileira confiante, jovem-adulta e dinâmica (ex: *Daniel*, *Thiago* ou *Gabriel*).
- **Ajustes:**
  - *Stability:* `45%`
  - *Similarity:* `75%`
  - *Style Exaggeration:* `20%`
  - *Speaker Boost:* `Ativado`
- **Tempo Total:** ~55 segundos.

---

## 4. Instruções de Operação do Player de Motion

O player de motion design foi desenvolvido em HTML5 Canvas, CSS3 e JavaScript nativo com relógio único `render(t)` determinístico.

### Controles de Teclado:
| Tecla | Ação | Descrição |
| :---: | :--- | :--- |
| **ESPAÇO** | `Play / Pause` | Inicia a reprodução com contagem 3-2-1 ou congela o quadro atual |
| **R** | `Reiniciar` | Volta ao segundo 0.0 com nova contagem regressiva |
| **←** | `Cena Anterior` | Retrocede instantaneamente para o início da cena anterior |
| **→** | `Próxima Cena` | Avança instantaneamente para a próxima cena |
| **T** | `Timecode` | Exibe / Oculta o contador de segundos no canto da tela |
| **F** | `Tela Cheia` | Ativa o modo Fullscreen para apresentação na TV/Projetor |
| **A** | `Proporção` | Alterna entre o modo **16:9 (Apresentação)** e **9:16 (Reels Vertical)** |

---

## 5. Roteiro da Demonstração Prática ao Vivo (Live Demo - 10 Minutos)

Após a exibição do Motion Design, a banca executará a seguinte validação presencial:

1. **Acesso com Perfil Caixa:**
   - Login instantâneo com `caixa@ms2.com.br`.
   - Bipagem de 2 peças no PDV.
   - Demonstração do validador de CPF Módulo 11 no cadastro rápido de cliente.
2. **Disparo de Alçada Gerencial:**
   - Tentativa de conceder 25% de desconto.
   - Acionamento do modal de alçada âmbar e autenticação com `gerente@ms2.com.br`.
3. **Finalização e E-Nota:**
   - Fechamento com PIX e visualização da DANFE NFC-e com protocolo SEFAZ e XML.
4. **Exportação Gerencial:**
   - Acesso com Administrador, emissão do relatório em Excel e PDF executivo A4.
