export const bgMap: Record<string, string> = {
  transparent: 'bg-transparent',
  white: 'bg-white',
  black: 'bg-black',
  slate50: 'bg-slate-50',
  slate100: 'bg-slate-100',
  slate900: 'bg-slate-900',
  primary: 'bg-blue-600',
};

export const alignMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export const spacingMap: Record<string, string> = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
  12: '3rem',
  16: '4rem',
  none: '0',
  sm: '0.5rem',
  md: '1rem',
  lg: '2rem',
  xl: '4rem',
};

export const containerPaddingMap: Record<string, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-8',
  lg: 'p-12',
  xl: 'p-16',
};

export function mergeProjectTokens(defaultTokens: any, projectTokens: any) {
  return { ...defaultTokens, ...projectTokens };
}

export function generateCSSVariables(tokens: Record<string, any>) {
  return Object.entries(tokens).reduce((acc, [key, value]) => {
    acc[`--${key}`] = value;
    return acc;
  }, {} as Record<string, string>);
}
