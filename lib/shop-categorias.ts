export const CATEGORIAS_SHOP = [
  'Álbuns',
  'Maquiagem',
  'Skincare',
  'Roupas',
  'Acessórios',
  'Itens usados',
  'K-pop',
  'Outros',
] as const

export type CategoriaShop = (typeof CATEGORIAS_SHOP)[number]