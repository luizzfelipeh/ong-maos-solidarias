// ==========================================================================
// main.js — Ponto de entrada da aplicação (SPA)
// ==========================================================================

import { initGlobalUI } from './modules/ui.js';
import { initRouter } from './modules/router.js';

// 1) Liga os componentes fixos do header (hambúrguer, dropdown)
initGlobalUI();

// 2) Liga o roteador — isso já dispara a primeira renderização da rota atual
initRouter();