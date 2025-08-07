// js/db.js
// Configuração e inicialização do IndexedDB com Dexie.js

export const db = new Dexie('GerenciamentoNegociosDB');

db.version(1).stores({
    usuarios: '++id, username, password',
    clientes: '++id, nome, telefone, email, observacoes, data_cadastro',
    servicos: '++id, nome, descricao, preco',
    agendamentos: '++id, id_cliente, id_servico, data_hora_inicio, data_hora_fim, status',
    ordens_de_servico: '++id, id_agendamento, id_cliente, valor_total, servicos_realizados, data_hora_os, status_os', // Adicionado status_os
    caixa_diario: '++id, data, entrada, saida',
    configuracoes: 'key, value' // Nova tabela para configurações
});

db.open().catch(function (e) {
    console.error("Erro ao abrir o banco de dados:", e);
    alert("Erro ao inicializar o banco de dados local. Verifique o console do navegador para mais detalhes.");
});
