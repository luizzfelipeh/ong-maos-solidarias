// ==========================================================================
// ui.js — Componentes de interface reutilizáveis
//
// Reescrito para usar EVENT DELEGATION: em vez de buscar cada elemento
// (.modal-trigger, [data-close-modal], #form-cadastro) e anexar um
// addEventListener em cada um — o que precisaria ser refeito a cada troca
// de rota, já que router.js substitui o conteúdo de #app via innerHTML —
// os listeners são anexados UMA ÚNICA VEZ em document (ou no <header>,
// que nunca é destruído). Eventos disparados em elementos dentro de #app
// sobem (bubbling) até o document, onde são interceptados e roteados para
// o elemento certo via event.target.closest(seletor).
//
// Vantagem prática: elimina o bindViewEvents() chamado a cada renderRoute()
// e evita o bug de listeners duplicados/acumulados (ex.: um listener de
// 'keydown' em document sendo religado repetidamente a cada navegação).
// ==========================================================================

import { validarCampo, validarFormulario } from './validacao.js';
import { salvarCadastro, removerCadastro } from './storage.js';
import { renderRoute } from './router.js';

export function initGlobalUI() {
  initMenu();
  initModalEvents();
  initFormEvents();
}

/* --------------------------------------------------------------------
   MENU (hambúrguer + dropdown) — elementos fixos do <header>, fora de #app
   -------------------------------------------------------------------- */
function initMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');

  if (!hamburger || !nav) return;

  const toggleMenu = function () {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  };

  hamburger.addEventListener('click', toggleMenu);

  // Fecha o menu mobile ao clicar em qualquer link de navegação
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a') && nav.classList.contains('is-open')) {
      toggleMenu();
    }
  });
}

/* --------------------------------------------------------------------
   MODAIS — delegação de clique (funciona para modais de QUALQUER rota,
   mesmo os que ainda nem existiam quando a página carregou)
   -------------------------------------------------------------------- */
function initModalEvents() {
  // Um único listener de 'click' cobre: abrir modal, fechar pelo "x" e
  // fechar clicando fora (no fundo escurecido)
  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('.modal-trigger');
    if (trigger) {
      const modal = document.getElementById(trigger.dataset.modal);
      if (modal) modal.classList.add('is-open');
      return;
    }

    const closeBtn = event.target.closest('[data-close-modal]');
    if (closeBtn) {
      const overlay = closeBtn.closest('.modal-overlay');
      if (overlay) overlay.classList.remove('is-open');
      return;
    }

    const removerBtn = event.target.closest('.cadastro-remover');
    if (removerBtn) {
      removerCadastro(Number(removerBtn.dataset.id));
      renderRoute(); // re-renderiza a view atual para refletir a lista atualizada
      return;
    }

    // Clique no próprio overlay (fora da caixa .modal) também fecha
    if (event.target.classList.contains('modal-overlay')) {
      event.target.classList.remove('is-open');
    }
  });

  // Listener de teclado anexado apenas UMA VEZ (não a cada renderização)
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay.is-open').forEach(function (overlay) {
      overlay.classList.remove('is-open');
    });
  });
}

/* --------------------------------------------------------------------
   FORMULÁRIO DE CADASTRO — delegação de 'submit'
   -------------------------------------------------------------------- */
function initFormEvents() {
  // 'focusout' é usado (em vez de 'blur') porque 'blur' não faz bubbling —
  // sem isso, a delegação em document não conseguiria capturar o evento
  document.addEventListener('focusout', function (event) {
    if (event.target.closest('#form-cadastro') && event.target.tagName === 'INPUT') {
      validarCampo(event.target);
    }
  });

  document.addEventListener('submit', function (event) {
    if (event.target.id !== 'form-cadastro') return;

    // Impede o comportamento padrão do navegador (reload/navegação),
    // devolvendo o controle total do fluxo para a lógica da SPA
    event.preventDefault();

    const formularioValido = validarFormulario(event.target);

    if (!formularioValido) {
      return; // interrompe o fluxo: não mostra toast, não salva nada
    }

    handleCadastroSubmit(event.target);
  });
}

function handleCadastroSubmit(form) {
  // 1) Coleta os valores do formulário em um objeto simples
  const dados = {
    id: Date.now(), // identificador único simples, suficiente para remover depois
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
    nascimento: form.nascimento.value,
    cpf: form.cpf.value.trim(),
    telefone: form.telefone.value.trim(),
    cep: form.cep.value.trim(),
    endereco: form.endereco.value.trim(),
    cidade: form.cidade.value.trim(),
    estado: form.estado.value.trim(),
  };

  // 2) Persiste no localStorage (serialização feita dentro de storage.js)
  salvarCadastro(dados);

  // 3) Re-renderiza a rota atual: isso recria o <form> vazio (efeito de
  //    "limpar" automaticamente) e atualiza a lista de cadastros salvos
  //    lendo o localStorage novamente
  renderRoute();

  // 4) Feedback visual de que a ação foi concluída
  const toast = document.getElementById('toast-sucesso');
  if (toast) {
    toast.classList.add('is-visible');
    setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 4000);
  }
}