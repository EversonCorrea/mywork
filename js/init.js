// js/init.js
// Ponto de entrada principal do aplicativo

import { showPage } from './navigation.js';
import { aplicarConfiguracoesSalvas } from './pages/configuracoes.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Aplica as configurações salvas (tema, cores) antes de renderizar a página
    await aplicarConfiguracoesSalvas();

    // Inicia o aplicativo diretamente na página de calendário
    showPage('calendar');
    
    // Torna o menu principal e mobile visíveis (já que não há login)
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
});