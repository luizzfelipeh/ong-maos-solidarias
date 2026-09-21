// ==========================================================================
// templates.js — Sistema de templates dinâmicos
//
// Duas técnicas combinadas:
//
// 1) Views inteiras (home, cadastro) ficam como template literals fixos,
//    já que não têm conteúdo repetitivo — não faria sentido "iterar" algo
//    que só existe uma vez na tela.
//
// 2) A view de Projetos é montada dinamicamente: os cards e os modais são
//    gerados a partir do array `projetosData` (data.js) usando .map() +
//    template literals, evitando reescrever a mesma marcação três vezes
//    e garantindo que adicionar um 4º projeto seja só adicionar um objeto
//    no array — nenhum HTML novo precisa ser escrito à mão.
//
// Os templates não são buscados via fetch() de arquivos .html separados:
// como o projeto pode ser aberto via file://, o fetch() de arquivos locais
// é bloqueado por CORS. Guardar tudo como strings/funções JS elimina essa
// dependência de rede ou servidor.
// ==========================================================================

import { projetosData } from './data.js';
import { obterCadastros } from './storage.js';

/* --------------------------------------------------------------------
   Geração dinâmica: 1 card por item do array projetosData
   -------------------------------------------------------------------- */
function buildCard(projeto) {
  // Lista de tarefas (só existe no projeto "Voluntariado")
  const listaHtml = projeto.lista
    ? `<ul>${projeto.lista.map(function (item) { return `<li>${item}</li>`; }).join('')}</ul>`
    : '';

  // Botão "Saiba mais" (só existe em projetos que têm modal associado)
  const botaoHtml = projeto.modal
    ? `<button type="button" class="modal-trigger" data-modal="${projeto.modal.id}">Saiba mais</button>`
    : '';

  return `
    <article class="card" id="${projeto.id}">
      <span class="badge ${projeto.badgeClass}">${projeto.badge}</span>
      <h3>${projeto.titulo}</h3>
      <p>${projeto.descricao}</p>
      ${listaHtml}
      ${botaoHtml}
    </article>
  `;
}

/* --------------------------------------------------------------------
   Geração dinâmica: 1 modal por item do array que possuir "modal"
   -------------------------------------------------------------------- */
function buildModal(projeto) {
  if (!projeto.modal) return '';

  return `
    <div class="modal-overlay" id="${projeto.modal.id}">
      <div class="modal" role="dialog" aria-labelledby="${projeto.modal.id}-title" aria-modal="true">
        <button type="button" class="modal-close" data-close-modal aria-label="Fechar">&times;</button>
        <h3 id="${projeto.modal.id}-title">${projeto.titulo}</h3>
        <p>${projeto.modal.texto}</p>
        <span class="badge ${projeto.modal.badgeClass}">${projeto.modal.badge}</span>
      </div>
    </div>
  `;
}

/**
 * Monta a view completa de Projetos: itera o array de dados uma vez para
 * gerar os cards e outra vez para gerar os modais correspondentes.
 */
function buildProjetosView() {
  const cardsHtml = projetosData.map(buildCard).join('');
  const modaisHtml = projetosData.map(buildModal).join('');

  return `
    <section>
      <h2>Nossos Projetos</h2>
      <p>
        Conheça algumas das iniciativas desenvolvidas pela ONG Mãos
        Solidárias para apoiar famílias e comunidades em situação de
        vulnerabilidade social.
      </p>
    </section>

    <div class="container">
      <div class="grid">
        ${cardsHtml}
      </div>
    </div>

    ${modaisHtml}
  `;
}

/* --------------------------------------------------------------------
   Views estáticas (sem repetição de componentes)
   -------------------------------------------------------------------- */
const homeTemplate = `
    <section>
        <h2>Quem Somos</h2>
        <img src="imagens/ong.jpg" alt="Voluntários participando de ação social">
        <p>
            A ONG Mãos Solidárias promove ações sociais destinadas ao apoio de
            famílias em situação de vulnerabilidade social.
        </p>
    </section>

    <section>
        <h2>Nossa Missão</h2>
        <p>
            Contribuir para a inclusão social por meio de ações solidárias,
            educação e participação comunitária.
        </p>
    </section>

    <section>
        <h2>Contato</h2>
        <p>Email: contato@maossolidarias.org.br</p>
        <p>Telefone: (21) 99999-9999</p>
        <p>Endereço: Rua Exemplo, 100 - Rio de Janeiro/RJ</p>
    </section>
`;

/**
 * Formata uma data usando a biblioteca externa Day.js (window.dayjs).
 * Se a biblioteca não tiver carregado por algum motivo (ex.: falha de rede
 * ao buscar o CDN), devolve o valor original em vez de quebrar a tela —
 * uma integração externa nunca deve derrubar uma funcionalidade essencial.
 */
function formatarData(valor, formato) {
  if (typeof window !== 'undefined' && typeof window.dayjs === 'function') {
    return window.dayjs(valor).format(formato);
  }
  return valor;
}

/**
 * Gera a lista de cadastros salvos a partir do localStorage.
 * Reaproveita o mesmo padrão de .map() + template literal usado nos
 * cards de projetos, aplicado agora a dados que o próprio usuário gerou.
 */
function buildListaCadastros() {
  const cadastros = obterCadastros();

  if (cadastros.length === 0) {
    return '<p class="lista-vazia">Nenhum cadastro salvo neste navegador ainda.</p>';
  }

  const itensHtml = cadastros
    .map(function (cadastro) {
      const nascimentoFormatado = formatarData(cadastro.nascimento, 'DD/MM/YYYY');
      const cadastradoEmFormatado = formatarData(cadastro.id, 'DD/MM/YYYY [às] HH:mm');

      return `
        <li class="cadastro-item">
          <div>
            <strong>${cadastro.nome}</strong>
            <span>${cadastro.email} · ${cadastro.cidade}/${cadastro.estado}</span>
            <span>Nascimento: ${nascimentoFormatado} · Cadastrado em ${cadastradoEmFormatado}</span>
          </div>
          <button type="button" class="cadastro-remover" data-id="${cadastro.id}" aria-label="Remover cadastro">&times;</button>
        </li>
      `;
    })
    .join('');

  return `<ul class="lista-cadastros">${itensHtml}</ul>`;
}

function buildCadastroView() {
  return `
    <div class="alert alert--info">
        <div>
            <strong>Antes de começar</strong>
            Todos os campos marcados são obrigatórios. Seus dados são usados
            apenas para contato da ONG Mãos Solidárias.
        </div>
    </div>

    <form id="form-cadastro">
        <fieldset>
            <legend>Dados Pessoais</legend>

            <div class="form-row">
                <label for="nome">Nome Completo:</label>
                <input type="text" id="nome" name="nome" required>
            </div>

            <div class="form-row">
                <label for="email">E-mail:</label>
                <input type="email" id="email" name="email" required>
            </div>

            <div class="form-row">
                <label for="nascimento">Data de Nascimento:</label>
                <input type="date" id="nascimento" name="nascimento" required>
            </div>

            <div class="form-row">
                <label for="cpf">CPF:</label>
                <input type="text" id="cpf" name="cpf"
                    pattern="[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}"
                    placeholder="000.000.000-00" required>
            </div>

            <div class="form-row">
                <label for="telefone">Telefone:</label>
                <input type="tel" id="telefone" name="telefone"
                    pattern="\\([0-9]{2}\\)\\s[0-9]{5}-[0-9]{4}"
                    placeholder="(21) 99999-9999" required>
            </div>
        </fieldset>

        <br>

        <fieldset>
            <legend>Endereço</legend>

            <div class="form-row">
                <label for="cep">CEP:</label>
                <input type="text" id="cep" name="cep"
                    pattern="[0-9]{5}-[0-9]{3}"
                    placeholder="00000-000" required>
            </div>

            <div class="form-row">
                <label for="endereco">Endereço:</label>
                <input type="text" id="endereco" name="endereco" required>
            </div>

            <div class="form-row">
                <label for="cidade">Cidade:</label>
                <input type="text" id="cidade" name="cidade" required>
            </div>

            <div class="form-row">
                <label for="estado">Estado:</label>
                <input type="text" id="estado" name="estado" required>
            </div>
        </fieldset>

        <br>

        <input type="submit" value="Cadastrar">
    </form>

    <section class="cadastros-salvos">
        <h2>Cadastros salvos neste navegador</h2>
        ${buildListaCadastros()}
    </section>
`;
}

/**
 * Retorna o HTML da rota informada. A view de projetos é gerada sob
 * demanda (a cada chamada), garantindo que qualquer alteração em
 * projetosData seja refletida na próxima renderização.
 */
export function getTemplate(route) {
  if (route === '/projetos') return buildProjetosView();
  if (route === '/cadastro') return buildCadastroView();
  return homeTemplate;
}