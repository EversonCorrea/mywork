// js/pages/caixa.js
// Lógica e renderização da página de controle de caixa

import { db } from '../db.js';

export function renderCaixaPage() {
    const page = document.createElement('div');
    page.className = 'bg-white p-6 rounded-xl shadow-lg';
    page.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Controle de Caixa Diário</h2>
        <div class="mb-6">
            <h3 class="text-xl font-semibold mb-2">Registrar Movimento</h3>
            <label class="block text-gray-700 font-semibold mb-1">Data:</label>
            <input type="date" id="caixa-date" value="${new Date().toISOString().slice(0,10)}" class="w-full p-2 mb-2 rounded-lg border">
            <label class="block text-gray-700 font-semibold mb-1">Dinheiro que Entrou:</label>
            <input type="number" id="caixa-entrada" placeholder="0.00" value="0" min="0" class="w-full p-2 mb-2 rounded-lg border">
            <label class="block text-gray-700 font-semibold mb-1">Dinheiro que Saiu:</label>
            <input type="number" id="caixa-saida" placeholder="0.00" value="0" min="0" class="w-full p-2 mb-4 rounded-lg border">
            <button onclick="window.addCaixaEntry()" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Registrar</button>
        </div>
        <div>
            <h3 class="text-xl font-semibold mb-2">Movimentos do Dia</h3>
            <ul id="caixa-list" class="space-y-2 text-gray-700"></ul>
        </div>
    `;
    loadCaixaEntries(page.querySelector('#caixa-list'));
    return page;
}

export async function addCaixaEntry() {
    const data = document.getElementById('caixa-date').value;
    const entrada = parseFloat(document.getElementById('caixa-entrada').value) || 0;
    const saida = parseFloat(document.getElementById('caixa-saida').value) || 0;

    if (!data) {
        alert('A data é obrigatória!');
        return;
    }

    try {
        await db.caixa_diario.add({ data, entrada, saida });
        alert('Movimento de caixa registrado com sucesso!');
        document.getElementById('caixa-entrada').value = '0';
        document.getElementById('caixa-saida').value = '0';
        loadCaixaEntries(document.getElementById('caixa-list'));
    } catch (error) {
        alert('Erro ao registrar movimento de caixa: ' + error.message);
    }
}

export async function loadCaixaEntries(listElement) {
    listElement.innerHTML = '';
    const today = new Date().toISOString().slice(0,10);
    const entries = await db.caixa_diario.where('data').equals(today).toArray();

    if (entries.length === 0) {
        listElement.innerHTML = '<li class="text-gray-500">Nenhum movimento registrado para hoje.</li>';
        return;
    }

    entries.forEach(entry => {
        const li = document.createElement('li');
        li.className = 'bg-gray-100 p-3 rounded-lg shadow-sm';
        li.innerHTML = `
            <p class="font-semibold">Data: ${new Date(entry.data).toLocaleDateString('pt-BR')}</p>
            <p class="text-sm text-green-600">Entrada: R$${entry.entrada.toFixed(2).replace('.', ',')}</p>
            <p class="text-sm text-red-600">Saída: R$${entry.saida.toFixed(2).replace('.', ',')}</p>
        `;
        listElement.appendChild(li);
    });
}

// Exporta funções para serem acessíveis globalmente via window
window.addCaixaEntry = addCaixaEntry;
window.loadCaixaEntries = loadCaixaEntries;
    