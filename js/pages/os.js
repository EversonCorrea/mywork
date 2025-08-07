// js/pages/os.js
// Lógica e renderização da página de Ordens de Serviço e seu modal

import { db } from '../db.js';
import { showPage } from '../navigation.js';
import { loadAppointmentsForCalendar } from './calendar.js'; // Para atualizar o calendário

export function renderOSPage() {
    const page = document.createElement('div');
    page.className = 'bg-white p-6 rounded-xl shadow-lg';
    page.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Ordens de Serviço do Mês</h2>
            <button onclick="window.showOSModal()" class="bg-theme-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-theme-primary-dark">Abrir Nova Ordem de Serviço</button>
        </div>
        <button onclick="window.showPage('relatorio')" class="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition duration-200 mb-4">Fechar Caixa e Gerar Relatório</button>
        <div id="os-list" class="space-y-2 text-gray-700"></div>
    `;
    loadOS(page.querySelector('#os-list'));
    return page;
}

export async function showOSModal(preselectedYear = null, preselectedMonth = null, preselectedDay = null) {
    const clients = await db.clientes.toArray();
    const services = await db.servicos.toArray();
    
    const clientOptions = clients.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    const serviceOptions = services.map(s => `<option value="${s.id}" data-price="${s.preco}" data-name="${s.nome}">${s.nome}</option>`).join('');

    let defaultDate = new Date();
    if (preselectedYear !== null && preselectedMonth !== null && preselectedDay !== null) {
        defaultDate = new Date(preselectedYear, preselectedMonth, preselectedDay);
    }
    const dateInput = `<input type="date" id="os-date" value="${defaultDate.toISOString().slice(0,10)}" class="w-full p-3 rounded-lg border focus:outline-none">`;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-y-auto modal-overlay';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl my-8">
            <h3 class="text-xl font-bold mb-4">Abrir Nova Ordem de Serviço</h3>
            
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Data do Atendimento</label>
                ${dateInput}
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Cliente</label>
                <select id="os-client-select" class="w-full p-3 rounded-lg border focus:outline-none mb-2">
                    <option value="">Selecione o Cliente</option>
                    ${clientOptions}
                </select>
                <div class="text-sm text-gray-500 text-right">
                   <span class="mr-2">ou</span>
                   <button onclick="window.showNewClientForm(this)" class="text-theme-primary hover:underline">Cadastrar Novo Cliente</button>
                </div>
                <div id="new-client-form" class="hidden mt-2 p-4 bg-gray-100 rounded-lg">
                    <input type="text" id="os-new-client-name" placeholder="Nome do Novo Cliente" class="w-full p-2 rounded-lg border mb-2">
                    <button onclick="window.addClientToOS()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">Salvar Cliente</button>
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Serviços</label>
                <div id="os-services-container" class="space-y-2 mb-2">
                    <!-- Serviços serão adicionados aqui -->
                </div>
                <button onclick="window.addServiceRow('${serviceOptions}')" class="bg-theme-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-theme-primary-dark">+ Adicionar Serviço</button>
            </div>

            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <label class="text-gray-700 font-semibold">Valor Total:</label>
                    <span id="os-total-value" class="text-xl font-bold text-green-600">R$ 0,00</span>
                </div>
                <label class="block text-gray-700 font-semibold mb-2">Desconto:</label>
                <input type="number" id="os-discount" value="0" min="0" oninput="window.calculateOSValue()" class="w-full p-3 rounded-lg border focus:outline-none">
            </div>

            <div class="flex justify-end space-x-4 mt-6">
                <button onclick="this.closest('.fixed').remove()" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold">Fechar</button>
                <button onclick="window.handleOSSubmit()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">Salvar OS</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    addServiceRow(serviceOptions);
}

export function showNewClientForm(button) {
    document.getElementById('new-client-form').classList.remove('hidden');
    button.classList.add('hidden');
}

export async function addClientToOS() {
    const name = document.getElementById('os-new-client-name').value;
    if (!name) {
        alert('Por favor, insira o nome do cliente.');
        return;
    }
    try {
        const newClientId = await db.clientes.add({ nome: name, data_cadastro: new Date().toISOString() });
        const clientSelect = document.getElementById('os-client-select');
        const option = document.createElement('option');
        option.value = newClientId;
        option.textContent = name;
        option.selected = true;
        clientSelect.appendChild(option);
        document.getElementById('new-client-form').classList.add('hidden');
    } catch (error) {
        alert('Erro ao cadastrar cliente: ' + error.message);
    }
}

export function addServiceRow(serviceOptions) {
    const container = document.getElementById('os-services-container');
    const newRow = document.createElement('div');
    newRow.className = 'flex flex-col md:flex-row gap-2 items-center';
    newRow.innerHTML = `
        <select onchange="window.updateServicePrice(this)" class="flex-grow p-2 rounded-lg border">
            <option value="">Selecione um serviço</option>
            ${serviceOptions}
        </select>
        <input type="text" placeholder="Ou digite o nome do serviço" class="flex-grow p-2 rounded-lg border">
        <input type="number" placeholder="Preço" value="0" min="0" oninput="window.calculateOSValue()" class="w-24 p-2 rounded-lg border">
        <button onclick="window.removeServiceRow(this)" class="text-red-500 hover:text-red-700 transition duration-200">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
        </button>
    `;
    container.appendChild(newRow);
}

export function removeServiceRow(button) {
    const container = document.getElementById('os-services-container');
    if (container.children.length > 1) {
        button.closest('.flex').remove();
        calculateOSValue();
    } else {
        alert('A OS deve ter pelo menos um serviço.');
    }
}

export function updateServicePrice(selectElement) {
    const price = selectElement.options[selectElement.selectedIndex].dataset.price;
    const textInput = selectElement.closest('.flex').querySelector('input[type="text"]');
    const priceInput = selectElement.closest('.flex').querySelector('input[type="number"]');
    
    if (selectElement.value) { // Se um serviço foi selecionado do dropdown
        priceInput.value = price;
        textInput.value = '';
        textInput.disabled = true; // Desabilita o campo de texto manual
    } else { // Se "Selecione um serviço" ou opção vazia
        priceInput.value = 0;
        textInput.disabled = false; // Habilita o campo de texto manual
    }
    
    calculateOSValue();
}

export function calculateOSValue() {
    let total = 0;
    const serviceRows = document.querySelectorAll('#os-services-container .flex');
    serviceRows.forEach(row => {
        const priceInput = row.querySelector('input[type="number"]');
        total += parseFloat(priceInput.value) || 0;
    });

    const discount = parseFloat(document.getElementById('os-discount').value) || 0;
    const finalValue = Math.max(0, total - discount);
    document.getElementById('os-total-value').textContent = `R$ ${finalValue.toFixed(2).replace('.', ',')}`;
}

export async function handleOSSubmit() {
    const clientID = document.getElementById('os-client-select').value;
    const osDate = document.getElementById('os-date').value;
    const finalValue = parseFloat(document.getElementById('os-total-value').textContent.replace('R$', '').replace(',', '.'));
    
    if (!clientID || !osDate) {
        alert('Por favor, selecione um cliente e uma data.');
        return;
    }
    
    const serviceRows = document.querySelectorAll('#os-services-container .flex');
    const servicesRealizados = [];
    let isValid = true;
    
    serviceRows.forEach(row => {
        const select = row.querySelector('select');
        const textInput = row.querySelector('input[type="text"]');
        const priceInput = row.querySelector('input[type="number"]');
        
        let serviceId = parseInt(select.value) || null;
        let serviceName = select.options[select.selectedIndex]?.dataset.name;

        if (!serviceId && textInput.value) { 
            serviceName = textInput.value;
        } else if (serviceId && !serviceName) {
            serviceName = select.options[select.selectedIndex]?.text;
        }
        
        let servicePrice = parseFloat(priceInput.value);

        if (!serviceName || isNaN(servicePrice)) {
            isValid = false;
        } else {
            servicesRealizados.push({ id: serviceId, name: serviceName, price: servicePrice });
        }
    });

    if (!isValid) {
        alert('Todos os serviços devem ter um nome e um preço válido.');
        return;
    }
    
    try {
        const appointmentId = await db.agendamentos.add({
            id_cliente: parseInt(clientID),
            id_servico: servicesRealizados[0].id,
            data_hora_inicio: `${osDate}T09:00:00Z`,
            data_hora_fim: `${osDate}T10:00:00Z`,
            status: 'concluido'
        });

        await db.ordens_de_servico.add({
            id_agendamento: appointmentId,
            id_cliente: parseInt(clientID),
            valor_total: finalValue,
            servicos_realizados: JSON.stringify(servicesRealizados),
            data_hora_os: new Date().toISOString(),
            status_os: 'aberta'
        });
        
        alert('Ordem de Serviço criada com sucesso!');
        const modal = document.querySelector('.fixed.modal-overlay');
        if (modal) {
            modal.remove();
        }
        showPage('os');
    } catch (error) {
        alert('Erro ao salvar OS: ' + error.message);
    }
}

export async function loadOS(listElement) {
    listElement.innerHTML = '';
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const osList = await db.ordens_de_servico.where('data_hora_os').between(startOfMonth.toISOString(), endOfMonth.toISOString()).toArray();

    if (osList.length === 0) {
        listElement.innerHTML = '<li class="text-gray-500">Nenhuma OS encontrada para este mês.</li>';
        return;
    }

    for (const os of osList) {
        const client = await db.clientes.get(os.id_cliente);
        const servicesRealizados = JSON.parse(os.servicos_realizados);
        const li = document.createElement('li');
        li.className = `bg-gray-100 p-3 rounded-lg shadow-sm flex justify-between items-center ${os.status_os === 'cancelado' ? 'opacity-60 line-through' : ''}`;
        li.innerHTML = `
            <span>
                <p class="font-semibold">OS #${os.id} - Cliente: ${client ? client.nome : 'Cliente excluído'}</p>
                <p class="text-sm">Serviços: ${servicesRealizados.map(s => s.name).join(', ')}</p>
                <p class="text-sm">Valor Total: R$${os.valor_total.toFixed(2).replace('.', ',')}</p>
                <p class="text-xs text-gray-500">Data: ${new Date(os.data_hora_os).toLocaleDateString('pt-BR')} - Status: ${os.status_os === 'cancelado' ? 'Cancelada' : 'Aberta'}</p>
            </span>
            <div>
                <button onclick="window.editOS(${os.id})" class="text-blue-500 hover:text-blue-700 transition duration-200 mr-2">
                    <svg class="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.828z"></path></svg>
                    Editar
                </button>
                ${os.status_os !== 'cancelado' ? `<button onclick="window.cancelOS(${os.id})" class="text-red-500 hover:text-red-700 transition duration-200">
                    <svg class="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    Cancelar
                </button>` : ''}
            </div>
        `;
        listElement.appendChild(li);
    }
}

window.showOSModal = showOSModal;
window.showNewClientForm = showNewClientForm;
window.addClientToOS = addClientToOS;
window.addServiceRow = addServiceRow;
window.removeServiceRow = removeServiceRow;
window.updateServicePrice = updateServicePrice;
window.calculateOSValue = calculateOSValue;
window.handleOSSubmit = handleOSSubmit;
window.editOS = editOS;
window.handleEditOSSubmit = handleEditOSSubmit;
window.cancelOS = cancelOS;
