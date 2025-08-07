// js/navigation.js
// Funções para gerenciar a navegação entre as páginas

import { currentPage, updateCurrentPage } from './globals.js';
import { renderCalendarPage } from './pages/calendar.js';
import { renderClientsPage } from './pages/clients.js';
import { renderServicesPage } from './pages/services.js';
import { renderOSPage } from './pages/os.js';
import { renderCaixaPage } from './pages/caixa.js';
import { renderRelatorioPage } from './pages/relatorio.js';
import { renderConfiguracoesPage } from './pages/configuracoes.js';

export async function showPage(pageName) {
    updateCurrentPage(pageName);
    await renderPage();
}

export async function renderPage() { // << CORRIGIDO: A função agora é 'async'
    const container = document.getElementById('app-container');
    if (!container) {
        console.error("Erro: #app-container não encontrado no DOM!");
        alert("Erro crítico: Container principal do aplicativo não encontrado.");
        return;
    }
    container.innerHTML = '';
    try {
        let pageContent; // Variável para armazenar o conteúdo da página
        switch (currentPage) {
            case 'calendar':
                pageContent = await renderCalendarPage(); // << CORRIGIDO: Adicionado 'await'
                break;
            case 'clients':
                pageContent = await renderClientsPage();
                break;
            case 'services':
                pageContent = await renderServicesPage();
                break;
            case 'os':
                pageContent = await renderOSPage();
                break;
            case 'caixa':
                pageContent = await renderCaixaPage();
                break;
            case 'relatorio':
                pageContent = await renderRelatorioPage();
                break;
            case 'configuracoes':
                pageContent = await renderConfiguracoesPage();
                break;
            default:
                await showPage('calendar');
                return; // Adicionado 'return' para evitar a execução do appendChild
        }
        if (pageContent) {
            container.appendChild(pageContent);
        }
    } catch (error) {
        console.error("Erro ao renderizar página:", error);
        alert("Ocorreu um erro ao carregar a página. Verifique o console do navegador para mais detalhes.");
    }
}

export function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

// Torna as funções acessíveis globalmente para o HTML (para os onclicks)
window.showPage = showPage;
window.toggleMobileMenu = toggleMobileMenu;