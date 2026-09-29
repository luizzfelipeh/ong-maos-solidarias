// ==========================================================================
// validacao.js — Validação de formulários via JavaScript
//
// Complementa a validação nativa do HTML5 (required, pattern, type) com:
//   1) Mensagens de erro específicas por campo (o navegador só diz
//      "Preencha este campo", sem explicar o formato esperado);
//   2) Feedback em tempo real, ao sair do campo (evento 'focusout'),
//      e não apenas no momento do submit;
//   3) Injeção de um elemento <span class="field-error"> no DOM,
//      logo após o input, com a mensagem específica do problema.
// ==========================================================================

/**
 * Um validador por campo, identificado pelo id do <input>.
 * Cada função recebe o valor atual e retorna:
 *   - uma string com a mensagem de erro, se o valor for inválido;
 *   - null, se o valor for válido.
 */
const validators = {
  nome: function (v) {
    return v.trim().length >= 3
      ? null
      : 'Informe o nome completo (mínimo 3 caracteres).';
  },
  email: function (v) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(v) ? null : 'Informe um e-mail válido (ex: nome@dominio.com).';
  },
  nascimento: function (v) {
    if (!v) return 'Informe a data de nascimento.';
    const hoje = new Date();
    const data = new Date(v);
    return data <= hoje ? null : 'A data de nascimento não pode ser no futuro.';
  },
  cpf: function (v) {
    const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return regex.test(v) ? null : 'CPF deve seguir o formato 000.000.000-00.';
  },
  telefone: function (v) {
    const regex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    return regex.test(v) ? null : 'Telefone deve seguir o formato (21) 99999-9999.';
  },
  cep: function (v) {
    const regex = /^\d{5}-\d{3}$/;
    return regex.test(v) ? null : 'CEP deve seguir o formato 00000-000.';
  },
  endereco: function (v) {
    return v.trim().length > 0 ? null : 'Informe o endereço.';
  },
  cidade: function (v) {
    return v.trim().length > 0 ? null : 'Informe a cidade.';
  },
  estado: function (v) {
    return v.trim().length > 0 ? null : 'Informe o estado.';
  },
};

/**
 * Exibe (ou atualiza) a mensagem de erro logo após o campo, e marca o
 * input com a classe de estado inválido.
 *
 * Além do estilo visual (que já existia), agora vincula o erro ao campo
 * via ARIA:
 *   - aria-invalid="true": informa tecnologias assistivas que o valor
 *     atual não é válido (WCAG 3.3.1 - Error Identification);
 *   - aria-describedby apontando para o id da mensagem: faz o leitor de
 *     tela ler a mensagem de erro logo depois do rótulo/valor do campo,
 *     e não só quem consegue VER o texto vermelho abaixo do input;
 *   - role="alert" no próprio <span>: anuncia a mensagem imediatamente,
 *     de forma assíncrona, no momento em que ela é inserida no DOM.
 */
function exibirErro(input, mensagem) {
  input.classList.remove('input-valido');
  input.classList.add('input-invalido');
  input.setAttribute('aria-invalid', 'true');

  const idErro = input.id + '-erro';

  let erroEl = input.nextElementSibling;
  if (!erroEl || !erroEl.classList.contains('field-error')) {
    erroEl = document.createElement('span');
    erroEl.className = 'field-error';
    erroEl.id = idErro;
    erroEl.setAttribute('role', 'alert');
    input.insertAdjacentElement('afterend', erroEl);
  }
  erroEl.textContent = mensagem;

  input.setAttribute('aria-describedby', idErro);
}

/**
 * Remove a mensagem de erro e marca o input como válido.
 */
function limparErro(input) {
  input.classList.remove('input-invalido');
  input.classList.add('input-valido');
  input.setAttribute('aria-invalid', 'false');
  input.removeAttribute('aria-describedby');

  const erroEl = input.nextElementSibling;
  if (erroEl && erroEl.classList.contains('field-error')) {
    erroEl.remove();
  }
}

/**
 * Valida um único campo e reflete o resultado visualmente no DOM.
 * Retorna true se o campo for válido, false caso contrário.
 */
export function validarCampo(input) {
  const validator = validators[input.id];
  if (!validator) return true; // campo sem regra específica (ex: submit) — ignora

  const mensagem = validator(input.value);

  if (mensagem) {
    exibirErro(input, mensagem);
    return false;
  }

  limparErro(input);
  return true;
}

/**
 * Valida o formulário inteiro (chamado no submit). Percorre todos os
 * inputs que possuem uma regra em `validators` e retorna true somente
 * se todos passarem.
 */
export function validarFormulario(form) {
  const inputs = form.querySelectorAll('input[id]');
  let formularioValido = true;
  let primeiroCampoInvalido = null;

  inputs.forEach(function (input) {
    const campoValido = validarCampo(input);
    if (!campoValido) {
      formularioValido = false;
      if (!primeiroCampoInvalido) primeiroCampoInvalido = input;
    }
  });

  // Leva o foco automaticamente para o primeiro campo com erro
  if (primeiroCampoInvalido) primeiroCampoInvalido.focus();

  return formularioValido;
}