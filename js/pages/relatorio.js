// js/pages/relatorio.js
// Lógica e renderização da página de relatório (antigo dashboard)

import { db } from '../db.js';
import { selectedMonth, selectedYear } from '../globals.js';

export function renderRelatorioPage() {
    const page = document.createElement('div');
    page.className = 'bg-white p-6 rounded-xl shadow-lg';
    page.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Relatório Mensal</h2>
        <div id="relatorio-content">
            <p class="text-gray-500">Carregando dados...</p>
        </div>
    `;
    
    const relatorioContent = page.querySelector('#relatorio-content');

    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    loadRelatorioData(relatorioContent, startOfMonth, endOfMonth);
    return page;
}

export async function loadRelatorioData(contentElement, startDate, endDate) {
    const osList = await db.ordens_de_servico.where('data_hora_os').between(startDate.toISOString(), endDate.toISOString()).toArray();
    const caixaEntries = await db.caixa_diario.where('data').between(startDate.toISOString().slice(0,10), endDate.toISOString().slice(0,10)).toArray();
    
    if (osList.length === 0 && caixaEntries.length === 0) {
        contentElement.innerHTML = `<p class="text-gray-500">Nenhum dado para este mês.</p>`;
        return;
    }

    let totalRevenueOS = 0;
    const serviceCount = {};
    const clientVisits = {};
    let totalOSConcluidas = 0;
    let totalOSCanceladas = 0;

    osList.forEach(os => {
        if (os.status_os !== 'cancelado') {
            totalRevenueOS += os.valor_total;
            totalOSConcluidas++;
            const realizados = JSON.parse(os.servicos_realizados);
            realizados.forEach(service => {
                serviceCount[service.name] = (serviceCount[service.name] || 0) + 1;
            });
            clientVisits[os.id_cliente] = (clientVisits[os.id_cliente] || 0) + 1;
        } else {
            totalOSCanceladas++;
        }
    });

    let totalCaixaEntrada = 0;
    let totalCaixaSaida = 0;
    caixaEntries.forEach(entry => {
        totalCaixaEntrada += entry.entrada;
        totalCaixaSaida += entry.saida;
    });

    const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0] || ['Nenhum', 0];
    const topClient = Object.entries(clientVisits).sort((a, b) => b[1] - a[1])[0];
    const topClientName = topClient ? (await db.clientes.get(parseInt(topClient[0]))).nome : 'Nenhum';
    
    contentElement.innerHTML = `
        <div class="space-y-4">
            <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <p class="text-lg font-semibold text-blue-800">Faturamento Total (OS Concluídas):</p>
                <p class="text-3xl font-bold text-blue-900">R$${totalRevenueOS.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
                <p class="text-lg font-semibold text-purple-800">Total de Entradas (Caixa):</p>
                <p class="text-3xl font-bold text-purple-900">R$${totalCaixaEntrada.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <p class="text-lg font-semibold text-red-800">Total de Saídas (Caixa):</p>
                <p class="text-3xl font-bold text-red-900">R$${totalCaixaSaida.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                <p class="text-lg font-semibold text-green-800">Serviço Mais Popular:</p>
                <p class="text-2xl font-bold text-green-900">${topService[0]} (${topService[1]} vezes)</p>
            </div>
            <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                <p class="text-lg font-semibold text-yellow-800">Cliente Mais Frequente:</p>
                <p class="text-2xl font-bold text-yellow-900">${topClientName} (${topClient[1]} visitas)</p>
            </div>
        </div>
    `;
}