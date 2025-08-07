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

export function showPage(pageName) {
    updateCurrentPage(pageName);
    renderPage();
}

export function renderPage() {
    const container = document.getElementById('app-container');
    if (!container) {
        console.error("Erro: #app-container não encontrado no DOM!");
        alert("Erro crítico: Container principal do aplicativo não encontrado.");
        return;
    }
    container.innerHTML = '';
    try {
        switch (currentPage) {
            case 'calendar':
                container.appendChild(renderCalendarPage());
                break;
            case 'clients':
                container.appendChild(renderClientsPage());
                break;
            case 'services':
                container.appendChild(renderServicesPage());
                break;
            case 'os':
                container.appendChild(renderOSPage());
                break;
            case 'caixa':
                container.appendChild(renderCaixaPage());
                break;
            case 'relatorio':
                container.appendChild(renderRelatorioPage());
                break;
            case 'configuracoes':
                container.appendChild(renderConfiguracoesPage());
                break;
            default:
                showPage('calendar');
                break;
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

// Torna as funções acessíveis globalmente para o HTML
window.showPage = showPage;
window.toggleMobileMenu = toggleMobileMenu;
