// js/init.js
// Ponto de entrada principal do aplicativo

import { showPage } from './navigation.js';
import { aplicarConfiguracoesSalvas } from './pages/configuracoes.js'; // Importa a função de configurações

document.addEventListener('DOMContentLoaded', async () => {
    // Aplica as configurações salvas (tema, cores) antes de renderizar a página
    await aplicarConfiguracoesSalvas();

    showPage('calendar');
    
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
});
