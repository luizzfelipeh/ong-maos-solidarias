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
  initDropdownAria();
  initModalEvents();
  initFormEvents();
}

/* --------------------------------------------------------------------
   DROPDOWN — sincroniza aria-expanded com o estado visual real.
   O dropdown abre por CSS (:hover / :focus-within), mas leitores de tela
   dependem do atributo aria-expanded para anunciar corretamente se o
   submenu está aberto ou fechado — por isso replicamos os mesmos gatilhos
   (mouseenter/mouseleave e focusin/focusout) em JavaScript.
   -------------------------------------------------------------------- */
function initDropdownAria() {
  const dropdown = document.querySelector('.dropdown');
  const toggle = dropdown ? dropdown.querySelector('.dropdown-toggle') : null;

  if (!dropdown || !toggle) return;

  const abrir = function () { toggle.setAttribute('aria-expanded', 'true'); };
  const fechar = function () { toggle.setAttribute('aria-expanded', 'false'); };

  dropdown.addEventListener('mouseenter', abrir);
  dropdown.addEventListener('mouseleave', fechar);
  dropdown.addEventListener('focusin', abrir);
  dropdown.addEventListener('focusout', function (event) {
    // só fecha se o novo foco saiu de todo o bloco do dropdown
    if (!dropdown.contains(event.relatedTarget)) fechar();
  });
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
   MODAIS — delegação de clique + GERENCIAMENTO DE FOCO
   (funciona para modais de QUALQUER rota, mesmo os que ainda nem
   existiam quando a página carregou)

   Sem isso, um modal abrir "visualmente" não ajuda quem usa teclado ou
   leitor de tela: o foco continua no botão que abriu o modal, atrás do
   fundo escurecido, e um Tab poderia levar o usuário para links da
   página por trás do modal, que deveriam estar inacessíveis enquanto
   ele está aberto (WCAG 2.4.3 - Focus Order / 2.1.2 - No Keyboard Trap,
   ao contrário: aqui queremos UM trap controlado e intencional).
   -------------------------------------------------------------------- */

// Guarda qual elemento tinha o foco antes de abrir o modal, para devolver
// o foco a ele quando o modal for fechado
let elementoComFocoAntesDoModal = null;

function abrirModal(modal, gatilho) {
  elementoComFocoAntesDoModal = gatilho || document.activeElement;

  modal.classList.add('is-open');

  // Move o foco para dentro do modal — priorizando o botão de fechar,
  // já que geralmente é o primeiro elemento útil a ser anunciado
  const botaoFechar = modal.querySelector('[data-close-modal]');
  if (botaoFechar) botaoFechar.focus();
}

function fecharModal(modal) {
  modal.classList.remove('is-open');

  // Devolve o foco para onde o usuário estava antes de abrir o modal,
  // em vez de deixá-lo "perdido" no topo da página
  if (elementoComFocoAntesDoModal) {
    elementoComFocoAntesDoModal.focus();
    elementoComFocoAntesDoModal = null;
  }
}

/**
 * Retorna a lista de elementos focáveis visíveis dentro de um container,
 * usada para calcular o início/fim do "trap" de Tab dentro do modal.
 */
function getFocaveis(container) {
  const seletor = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll(seletor));
}

function initModalEvents() {
  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('.modal-trigger');
    if (trigger) {
      const modal = document.getElementById(trigger.dataset.modal);
      if (modal) abrirModal(modal, trigger);
      return;
    }

    const closeBtn = event.target.closest('[data-close-modal]');
    if (closeBtn) {
      const overlay = closeBtn.closest('.modal-overlay');
      if (overlay) fecharModal(overlay);
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
      fecharModal(event.target);
    }
  });

  // Escape fecha o modal aberto E devolve o foco (reaproveita fecharModal)
  document.addEventListener('keydown', function (event) {
    const modalAberto = document.querySelector('.modal-overlay.is-open');
    if (!modalAberto) return;

    if (event.key === 'Escape') {
      fecharModal(modalAberto);
      return;
    }

    // Focus trap: enquanto o modal estiver aberto, Tab/Shift+Tab não
    // deve deixar o foco "escapar" para elementos da página por trás dele
    if (event.key === 'Tab') {
      const focaveis = getFocaveis(modalAberto);
      if (focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro.focus();
      }
    }
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