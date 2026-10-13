// Mapeamento de imagens reais geradas para o catálogo de produtos da MS² Vestuário

export function obterImagemProduto(codigo: string): string {
  // Arquivos em public/products/
  return `/products/${codigo}.jpg`;
}
