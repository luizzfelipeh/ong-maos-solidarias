// ==========================================================================
// storage.js — Camada de persistência (localStorage)
//
// O localStorage só armazena strings. Por isso, sempre que gravamos uma
// estrutura de dados (aqui, um array de objetos de cadastro), ela precisa
// ser convertida com JSON.stringify() antes do setItem(), e reconvertida
// com JSON.parse() depois do getItem() para voltar a ser um array/objeto
// JavaScript utilizável.
// ==========================================================================

const STORAGE_KEY = 'ong_maos_solidarias:cadastros';

/**
 * Lê e desserializa a lista de cadastros salva no navegador.
 * Retorna sempre um array (mesmo que vazio), nunca null/undefined,
 * para que quem consome esta função não precise checar antes de usar .map().
 */
export function obterCadastros() {
  const bruto = localStorage.getItem(STORAGE_KEY);

  if (!bruto) return [];

  try {
    return JSON.parse(bruto);
  } catch (erro) {
    // Protege contra um valor corrompido/manual no localStorage
    console.error('Não foi possível interpretar os cadastros salvos:', erro);
    return [];
  }
}

/**
 * Adiciona um novo cadastro à lista existente e regrava tudo no
 * localStorage já serializado como string JSON.
 */
export function salvarCadastro(dados) {
  const cadastros = obterCadastros();
  cadastros.push(dados);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cadastros));
}

/**
 * Remove um cadastro pelo id e regrava a lista atualizada.
 */
export function removerCadastro(id) {
  const cadastros = obterCadastros().filter(function (cadastro) {
    return cadastro.id !== id;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cadastros));
}