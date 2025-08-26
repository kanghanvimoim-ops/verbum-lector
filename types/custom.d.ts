declare module 'shimmer' {
  function wrap(module: any, name: string, wrapper: (original: any) => any): void;
  function massWrap(modules: any[], names: string[], wrapper: (original: any) => any): void;
  function unwrap(module: any, name: string): boolean;
  function massUnwrap(modules: any[], names: string[]): void;
}

declare module 'triple-beam' {
  const LEVEL: symbol;
  const MESSAGE: symbol;
  const SPLAT: symbol;
}
