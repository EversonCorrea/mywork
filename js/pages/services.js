// js/pages/services.js
// Lógica e renderização da página de serviços

import { db } from '../db.js';
import { aplicarConfiguracoesSalvas } from './configuracoes.js'; // Para aplicar as cores do tema

export function renderServicesPage() {
    const page = document.createElement('div');
    page.className = 'bg-white p-6 rounded-xl shadow-lg';
    
    page.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Gerenciamento de Serviços</h2>
        <div class="mb-6">
            <h3 class="text-xl font-semibold mb-2">Cadastro de Serviço</h3>
            <input type="text" id="service-name" placeholder="Nome do Serviço" class="w-full p-2 mb-2 rounded-lg border">
            <input type="text" id="service-desc" placeholder="Descrição" class="w-full p-2 mb-2 rounded-lg border">
            <input type="number" id="service-price" placeholder="Preço" class="w-full p-2 mb-4 rounded-lg border">
            <button onclick="window.addService()" class="bg-theme-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-theme-primary-dark">Cadastrar</button>
        </div>
        <div>
            <h3 class="text-xl font-semibold mb-2">Serviços Cadastrados</h3>
            <ul id="services-list" class="space-y-2 text-gray-700"></ul>
        </div>
    `;
    loadServices(page.querySelector('#services-list'));
    return page;
}

export async function addService() {
    const nome = document.getElementById('service-name').value;
    const descricao = document.getElementById('service-desc').value;
    const preco = parseFloat(document.getElementById('service-price').value);
    
    if (!nome || isNaN(preco)) {
        alert('Preencha o nome e o preço do serviço!');
        return;
    }

    try {
        await db.servicos.add({ nome, descricao, preco });
        alert('Serviço cadastrado com sucesso!');
        document.getElementById('service-name').value = '';
        document.getElementById('service-desc').value = '';
        document.getElementById('service-price').value = '';
        loadServices(document.getElementById('services-list'));
    } catch (error) {
        alert('Erro ao cadastrar serviço: ' + error.message);
    }
}

export async function loadServices(listElement) {
    listElement.innerHTML = '';
    const services = await db.servicos.toArray();
    if (services.length === 0) {
        listElement.innerHTML = '<li class="text-gray-500">Nenhum serviço cadastrado.</li>';
        return;
    }
    services.forEach(service => {
        const li = document.createElement('li');
        li.className = 'bg-gray-100 p-3 rounded-lg shadow-sm flex justify-between items-center';
        li.innerHTML = `
            <span class="flex items-center">
                <span class="font-semibold">${service.nome}</span> - R$${service.preco.toFixed(2).replace('.', ',')}
            </span>
            <button onclick="window.deleteService(${service.id})" class="text-red-500 hover:text-red-700 transition duration-200">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            </button>
        `;
        listElement.appendChild(li);
    });
}

export async function deleteService(id) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
        await db.servicos.delete(id);
        alert('Serviço excluído com sucesso!');
        loadServices(document.getElementById('services-list'));
    } catch (error) {
        alert('Erro ao excluir serviço: ' + error.message);
    }
}

window.addService = addService;
window.loadServices = loadServices;
window.deleteService = deleteService;