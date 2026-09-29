import { defineConfig } from 'vite';

export default defineConfig({
  // O GitHub Pages serve projetos em /nome-do-repositorio/, não na raiz
  // do domínio. Sem isso, os caminhos de css/js/imagens quebrariam em
  // produção (funcionariam só em localhost, onde a base é "/").
  base: '/ong-maos-solidarias/',

  build: {
    outDir: 'dist',
    // esbuild é o minificador padrão do Vite (usado também internamente
    // pelo bundler) — não precisa de configuração adicional para já
    // minificar JS, CSS e HTML na build de produção.
    minify: 'esbuild',
    cssMinify: true,
  },
});