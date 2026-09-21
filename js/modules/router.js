// ==========================================================================
// router.js — Controle de navegação da SPA (sem reload de página)
//
// Estratégia adotada: HASH ROUTING (URLs no formato "#/projetos"), em vez
// de History API (pushState/popstate). Motivo: o History API exige que o
// servidor devolva sempre o mesmo index.html para qualquer rota (rewrite),
// o que só existe em servidores configurados para SPA. Como este projeto
// roda localmente via file://, hash routing é a opção que funciona sem
// nenhuma configuração de servidor — o navegador nunca tenta buscar uma
// "página" nova no disco ao mudar o hash, só dispara o evento 'hashchange'.
// ==========================================================================

import { getTemplate } from './templates.js';

const APP_ROOT = document.getElementById('app');
const VALID_ROUTES = ['/', '/projetos', '/cadastro'];

/**
 * Lê o hash atual da URL e valida contra as rotas conhecidas.
 * Ex.: "#/projetos" -> "/projetos"
 */
function getCurrentRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  return VALID_ROUTES.includes(hash) ? hash : '/';
}

/**
 * Marca visualmente o link de navegação correspondente à rota ativa.
 */
function setActiveLink(route) {
  document.querySelectorAll('nav a[data-route]').forEach(function (link) {
    link.classList.toggle('active', link.dataset.route === route);
  });
}

/**
 * Função principal: limpa o contêiner alvo (#app) e injeta o fragmento
 * HTML correspondente à rota atual.
 *
 * Não é preciso reconectar listeners aqui: os eventos dos elementos
 * gerados (modais, formulário) são tratados por delegação em ui.js,
 * anexados uma única vez em `document` — eles continuam funcionando
 * mesmo depois do innerHTML trocar todo o conteúdo de #app.
 */
export function renderRoute() {
  const route = getCurrentRoute();
  const html = getTemplate(route);

  APP_ROOT.innerHTML = html;
  setActiveLink(route);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Inicializa o roteador: escuta mudanças de hash e faz a primeira
 * renderização assim que o módulo é carregado.
 */
export function initRouter() {
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}