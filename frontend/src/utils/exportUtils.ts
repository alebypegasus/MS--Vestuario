/**
 * Utilitários de Exportação de Relatórios da MS² Vestuário
 * Suporta Excel (CSV UTF-8 com BOM e separador de ponto-e-vírgula para abertura direta no Microsoft Excel),
 * PDF com layout profissional A4 e cabeçalho fiscal, e JSON para auditoria.
 */

export interface IExportColuna {
  header: string;
  key: string;
}

export interface IRelatorioPDFParams {
  titulo: string;
  subtitulo?: string;
  colunas: string[];
  linhas: (string | number)[][];
  totais?: { label: string; valor: string }[];
  empresa?: {
    razao_social?: string | null;
    nome_fantasia?: string | null;
    cnpj?: string | null;
    inscricao_estadual?: string | null;
    cidade?: string | null;
    uf?: string | null;
    telefone?: string | null;
  } | null;
}

/**
 * Exporta dados para CSV compatível diretamente com o Microsoft Excel (UTF-8 BOM + separador ';')
 */
export const exportarParaCSV = (
  nomeArquivo: string,
  colunas: string[],
  linhas: (string | number)[][]
): void => {
  const sanitize = (val: string | number): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = colunas.map(sanitize).join(';');
  const dataRows = linhas.map((linha) => linha.map(sanitize).join(';'));
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${nomeArquivo}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exporta para arquivo formatado para Excel (Spreadsheet XML) com formatação de células e tipos de dados
 */
export const exportarParaExcel = (
  nomeArquivo: string,
  titulo: string,
  colunas: string[],
  linhas: (string | number)[][],
  totais?: { label: string; valor: string }[]
): void => {
  // Gera formato XML do Excel 2003+ (SpreadsheetML) reconhecido nativamente pelo Microsoft Excel
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D97706"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="16" ss:Color="#B45309" ss:Bold="1"/>
  </Style>
  <Style ss:ID="TotalStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Relatorio">
  <Table>
   <Row ss:Height="30">
    <Cell ss:StyleID="TitleStyle" ss:MergeAcross="${colunas.length - 1}">
     <Data ss:Type="String">${titulo} - MS² Vestuário</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="${colunas.length - 1}">
     <Data ss:Type="String">Emitido em: ${new Date().toLocaleString('pt-BR')}</Data>
    </Cell>
   </Row>
   <Row ss:Height="24">
    ${colunas
      .map(
        (col) =>
          `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${col}</Data></Cell>`
      )
      .join('')}
   </Row>
   ${linhas
     .map(
       (linha) =>
         `<Row ss:Height="20">
      ${linha
        .map((celula) => {
          const isNum = typeof celula === 'number';
          return `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${
            celula !== null && celula !== undefined ? String(celula).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
          }</Data></Cell>`;
        })
        .join('')}
     </Row>`
     )
     .join('')}
   ${
     totais && totais.length > 0
       ? totais
           .map(
             (t) => `
    <Row ss:Height="22">
     <Cell ss:StyleID="TotalStyle" ss:MergeAcross="${Math.max(0, colunas.length - 2)}">
      <Data ss:Type="String">${t.label}</Data>
     </Cell>
     <Cell ss:StyleID="TotalStyle">
      <Data ss:Type="String">${t.valor}</Data>
     </Cell>
    </Row>`
           )
           .join('')
       : ''
   }
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${nomeArquivo}_${new Date().toISOString().slice(0, 10)}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exporta para arquivo JSON estruturado (Auditoria Fiscal / Integração SPED)
 */
export const exportarParaJSON = (nomeArquivo: string, dados: any): void => {
  const jsonContent = JSON.stringify(dados, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${nomeArquivo}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Abre janela de impressão formatada em A4 com design executivo para emissão de PDF nativo
 */
export const exportarRelatorioPDF = (params: IRelatorioPDFParams): void => {
  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para gerar e imprimir o relatório em PDF.');
    return;
  }

  const { titulo, subtitulo, colunas, linhas, totais, empresa } = params;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${titulo} - MS² Vestuário</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { color: #1e293b; background: #fff; font-size: 11px; line-height: 1.4; padding: 15px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .header-logo { display: flex; align-items: center; gap: 12px; }
    .header-logo img { width: 50px; height: 50px; object-fit: contain; }
    .company-title { font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
    .company-meta { font-size: 10px; color: #64748b; margin-top: 2px; }
    .doc-info { text-align: right; }
    .doc-title { font-size: 14px; font-weight: 800; color: #b45309; text-transform: uppercase; }
    .doc-date { font-size: 9px; color: #64748b; margin-top: 3px; font-family: monospace; }
    .subtitle { font-size: 11px; color: #475569; margin-bottom: 14px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px; }
    th { background: #0f172a; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals-box { margin-top: 15px; border-top: 2px solid #cbd5e1; padding-top: 10px; display: flex; justify-content: flex-end; }
    .totals-table { width: auto; min-width: 300px; border-collapse: collapse; }
    .totals-table td { padding: 5px 12px; border: none; font-size: 11px; }
    .totals-table tr.total-final td { font-weight: 800; font-size: 13px; color: #0f172a; border-top: 1px solid #0f172a; }
    .footer { margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; font-family: monospace; }
    .stamp { border: 1px dashed #b45309; color: #b45309; padding: 4px 8px; font-weight: 800; font-size: 9px; text-transform: uppercase; display: inline-block; border-radius: 4px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-logo">
      <img src="${window.location.origin}/logo.png" alt="MS² Vestuário" onerror="this.style.display='none'">
      <div>
        <div class="company-title">${empresa?.razao_social || 'MS² VESTUÁRIO LTDA'}</div>
        <div class="company-meta">
          CNPJ: ${empresa?.cnpj || '12.345.678/0001-90'} • IE: ${empresa?.inscricao_estadual || 'ISENTO'}<br>
          ${empresa?.cidade || 'Rio de Janeiro'} - ${empresa?.uf || 'RJ'} • Tel: ${empresa?.telefone || '(21) 3456-7890'}
        </div>
      </div>
    </div>
    <div class="doc-info">
      <div class="doc-title">${titulo}</div>
      <div class="doc-date">Emissão: ${new Date().toLocaleString('pt-BR')}</div>
      <div style="margin-top: 5px;"><span class="stamp">Relatório Homologado</span></div>
    </div>
  </div>

  ${subtitulo ? `<div class="subtitle">${subtitulo}</div>` : ''}

  <table>
    <thead>
      <tr>
        ${colunas.map((c) => `<th>${c}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${linhas
        .map(
          (linha) => `
        <tr>
          ${linha.map((cel, idx) => {
            const isLast = idx >= linha.length - 2;
            return `<td class="${isLast ? 'text-right' : ''}">${cel ?? '-'}</td>`;
          }).join('')}
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  ${
    totais && totais.length > 0
      ? `
  <div class="totals-box">
    <table class="totals-table">
      ${totais
        .map(
          (t, i) => `
        <tr class="${i === totais.length - 1 ? 'total-final' : ''}">
          <td class="text-right"><strong>${t.label}:</strong></td>
          <td class="text-right font-mono">${t.valor}</td>
        </tr>
      `
        )
        .join('')}
    </table>
  </div>
  `
      : ''
  }

  <div class="footer">
    <div>Sistema MS² Vestuário • Controle de Ponto de Venda & Homologação Fiscal</div>
    <div>Página 1 de 1 • Autenticador: MS2-${Math.random().toString(36).substring(2, 9).toUpperCase()}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
