// js/pages/clients.js
// Lógica e renderização da página de clientes

import { db } from '../db.js';

export function renderClientsPage() {
    const page = document.createElement('div');
    page.className = 'bg-white p-6 rounded-xl shadow-lg';
    page.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Gerenciamento de Clientes</h2>
        <div class="mb-6">
            <h3 class="text-xl font-semibold mb-2">Cadastro de Cliente</h3>
            <input type="text" id="client-name" placeholder="Nome" class="w-full p-2 mb-2 rounded-lg border">
            <input type="tel" id="client-phone" placeholder="Telefone" class="w-full p-2 mb-2 rounded-lg border">
            <input type="email" id="client-email" placeholder="Email" class="w-full p-2 mb-2 rounded-lg border">
            <textarea id="client-obs" placeholder="Observações" class="w-full p-2 mb-4 rounded-lg border h-20"></textarea>
            <button onclick="window.addClient()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">Cadastrar</button>
        </div>
        <div>
            <h3 class="text-xl font-semibold mb-2">Clientes Cadastrados</h3>
            <ul id="clients-list" class="space-y-2 text-gray-700"></ul>
        </div>
    `;
    loadClients(page.querySelector('#clients-list'));
    return page;
}

export async function addClient() {
    const nome = document.getElementById('client-name').value;
    const telefone = document.getElementById('client-phone').value;
    const email = document.getElementById('client-email').value;
    const observacoes = document.getElementById('client-obs').value;
    
    if (!nome) {
        alert('O nome do cliente é obrigatório!');
        return;
    }

    try {
        await db.clientes.add({ nome, telefone, email, observacoes, data_cadastro: new Date().toISOString() });
        alert('Cliente cadastrado com sucesso!');
        document.getElementById('client-name').value = '';
        document.getElementById('client-phone').value = '';
        document.getElementById('client-email').value = '';
        document.getElementById('client-obs').value = '';
        loadClients(document.getElementById('clients-list'));
    } catch (error) {
        alert('Erro ao cadastrar cliente: ' + error.message);
    }
}

export async function loadClients(listElement) {
    listElement.innerHTML = '';
    const clients = await db.clientes.toArray();
    if (clients.length === 0) {
        listElement.innerHTML = '<li class="text-gray-500">Nenhum cliente cadastrado.</li>';
        return;
    }
    clients.forEach(client => {
        const li = document.createElement('li');
        li.className = 'bg-gray-100 p-3 rounded-lg shadow-sm flex justify-between items-center';
        li.innerHTML = `
            <span>
                <span class="font-semibold">${client.nome}</span> - ${client.telefone || 'N/A'}
                ${client.email ? `<br><span class="text-xs text-gray-500">${client.email}</span>` : ''}
                ${client.observacoes ? `<br><span class="text-xs text-gray-500">Obs: ${client.observacoes}</span>` : ''}
            </span>
            <div>
                <button onclick="window.editClient(${client.id})" class="text-blue-500 hover:text-blue-700 transition duration-200 mr-2">
                    <svg class="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.828z"></path></svg>
                    Editar
                </button>
                <button onclick="window.deleteClient(${client.id})" class="text-red-500 hover:text-red-700 transition duration-200">
                    <svg class="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    Excluir
                </button>
            </div>
        `;
        listElement.appendChild(li);
    });
}

export async function deleteClient(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
        await db.clientes.delete(id);
        alert('Cliente excluído com sucesso!');
        loadClients(document.getElementById('clients-list'));
    } catch (error) {
        alert('Erro ao excluir cliente: ' + error.message);
    }
}

export async function editClient(id) {
    const client = await db.clientes.get(id);
    if (!client) {
        alert('Cliente não encontrado.');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-y-auto modal-overlay';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-md my-8">
            <h3 class="text-xl font-bold mb-4">Editar Cliente</h3>
            <input type="text" id="edit-client-name" placeholder="Nome" value="${client.nome}" class="w-full p-2 mb-2 rounded-lg border">
            <input type="tel" id="edit-client-phone" placeholder="Telefone" value="${client.telefone || ''}" class="w-full p-2 mb-2 rounded-lg border">
            <input type="email" id="edit-client-email" placeholder="Email" value="${client.email || ''}" class="w-full p-2 mb-2 rounded-lg border">
            <textarea id="edit-client-obs" placeholder="Observações" class="w-full p-2 mb-4 rounded-lg border h-20">${client.observacoes || ''}</textarea>
            <div class="flex justify-end space-x-4">
                <button onclick="this.closest('.fixed').remove()" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold">Cancelar</button>
                <button onclick="window.handleEditClientSubmit(${client.id})" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">Salvar Edições</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

export async function handleEditClientSubmit(id) {
    const nome = document.getElementById('edit-client-name').value;
    const telefone = document.getElementById('edit-client-phone').value;
    const email = document.getElementById('edit-client-email').value;
    const observacoes = document.getElementById('edit-client-obs').value;

    if (!nome) {
        alert('O nome do cliente é obrigatório!');
        return;
    }

    try {
        await db.clientes.update(id, { nome, telefone, email, observacoes });
        alert('Cliente atualizado com sucesso!');
        document.querySelector('.fixed').remove(); // Fecha o modal
        loadClients(document.getElementById('clients-list')); // Recarrega a lista
    } catch (error) {
        alert('Erro ao atualizar cliente: ' + error.message);
    }
}

window.addClient = addClient;
window.loadClients = loadClients;
window.deleteClient = deleteClient;
window.editClient = editClient;
window.handleEditClientSubmit = handleEditClientSubmit;