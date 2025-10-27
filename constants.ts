interface AccentColor {
  rgb: string;
  textColor: 'black' | 'white';
}

export const ACCENT_COLORS: Record<string, AccentColor> = {
  yellow: { rgb: '251 191 36', textColor: 'black' },
  orange: { rgb: '249 115 22', textColor: 'white' },
  red: { rgb: '239 68 68', textColor: 'white' },
  pink: { rgb: '236 72 153', textColor: 'white' },
  purple: { rgb: '168 85 247', textColor: 'white' },
  indigo: { rgb: '99 102 241', textColor: 'white' },
  blue: { rgb: '59 130 246', textColor: 'white' },
  sky: { rgb: '56 189 248', textColor: 'black' },
  teal: { rgb: '20 184 166', textColor: 'white' },
  green: { rgb: '34 197 94', textColor: 'white' },
  lime: { rgb: '163 230 53', textColor: 'black' },
  gray: { rgb: '107 114 128', textColor: 'white' },
};

interface BackgroundColor {
  name: string;
  className: string; // Inclui variantes claro/escuro
  lightClass: string; // Apenas para a amostra de cor
}

export const BACKGROUND_COLORS: Record<string, BackgroundColor> = {
  default: { name: 'Padrão', className: 'bg-gray-100 dark:bg-zinc-900', lightClass: 'bg-gray-100' },
  slate: { name: 'Ardósia', className: 'bg-slate-200 dark:bg-slate-900', lightClass: 'bg-slate-200' },
  red: { name: 'Vermelho', className: 'bg-red-200 dark:bg-red-950', lightClass: 'bg-red-200' },
  orange: { name: 'Laranja', className: 'bg-orange-200 dark:bg-orange-950', lightClass: 'bg-orange-200' },
  amber: { name: 'Âmbar', className: 'bg-amber-200 dark:bg-amber-950', lightClass: 'bg-amber-200' },
  emerald: { name: 'Esmeralda', className: 'bg-emerald-200 dark:bg-emerald-950', lightClass: 'bg-emerald-200' },
  teal: { name: 'Verde-azulado', className: 'bg-teal-200 dark:bg-teal-950', lightClass: 'bg-teal-200' },
  blue: { name: 'Azul', className: 'bg-blue-200 dark:bg-blue-950', lightClass: 'bg-blue-200' },
  violet: { name: 'Violeta', className: 'bg-violet-200 dark:bg-violet-950', lightClass: 'bg-violet-200' },
  fuchsia: { name: 'Fúcsia', className: 'bg-fuchsia-200 dark:bg-fuchsia-950', lightClass: 'bg-fuchsia-200' },
};