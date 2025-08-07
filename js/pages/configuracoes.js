// js/pages/configuracoes.js
// Lógica e renderização da página de configurações

import { db } from '../db.js';

// Cores pré-definidas para o tema principal
const themeColors = [
    '#3B82F6', // Azul padrão
    '#EF4444', // Vermelho
    '#10B981', // Verde
    '#F59E0B', // Amarelo
    '#6366F1', // Índigo
    '#EC4899', // Rosa
    '#06B6D4', // Ciano
    '#8B5CF6', // Violeta
    '#F97316', // Laranja
    '#6B7280'  // Cinza
];

// Cores pré-definidas para o marcador do calendário
const markerColors = [
    '#22C55E', // Verde padrão
    '#3B82F6', // Azul
    '#F97316', // Laranja
    '#EF4444', // Vermelho
    '#A855F7', // Roxo
    '#FACC15', // Amarelo
    '#6EE7B7', // Verde menta
    '#94A3B8', // Cinza claro
    '#0EA5E9', // Azul claro
    '#D946EF'  // Magenta
];


export function renderConfiguracoesPage() {
    const page = document.createElement('div');
    page.className = 'bg-white p-6 rounded-xl shadow-lg';

    // Gera os botões de seleção de cor do tema
    const themeColorOptions = themeColors.map(color => `
        <input type="radio" name="theme-color" id="theme-color-${color.slice(1)}" value="${color}" class="hidden color-picker-input">
        <label for="theme-color-${color.slice(1)}" class="color-picker-label block w-8 h-8 rounded-full cursor-pointer border border-gray-300" style="background-color: ${color};"></label>
    `).join('');

    // Gera os botões de seleção de cor do marcador do calendário
    const markerColorOptions = markerColors.map(color => `
        <input type="radio" name="marker-color" id="marker-color-${color.slice(1)}" value="${color}" class="hidden color-picker-input">
        <label for="marker-color-${color.slice(1)}" class="color-picker-label block w-8 h-8 rounded-full cursor-pointer border border-gray-300" style="background-color: ${color};"></label>
    `).join('');

    page.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Configurações</h2>
        
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-xl font-semibold mb-3">Tema do Sistema</h3>
            <label class="block text-gray-700 font-semibold mb-2">Cor Principal (Header e Botões):</label>
            <div id="theme-color-picker" class="flex flex-wrap gap-2 mb-4">
                ${themeColorOptions}
            </div>
            <label class="block text-gray-700 font-semibold mb-2">Cor do Marcador do Calendário:</label>
            <div id="marker-color-picker" class="flex flex-wrap gap-2 mb-4">
                ${markerColorOptions}
            </div>
            <button id="save-colors-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Salvar Cores</button>
        </div>

        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-xl font-semibold mb-3">Modo de Visualização</h3>
            <button id="toggle-dark-mode-btn" class="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800">Ativar/Desativar Modo Noturno</button>
        </div>
    `;

    // Adiciona event listeners para salvar as configurações
    page.querySelector('#save-colors-btn').addEventListener('click', saveColors);
    page.querySelector('#toggle-dark-mode-btn').addEventListener('click', toggleDarkMode);

    // Carrega as configurações salvas para pré-selecionar os radios
    loadConfiguracoes();

    return page;
}

async function saveConfig(key, value) {
    await db.configuracoes.put({ key, value });
}

async function getConfig(key) {
    const config = await db.configuracoes.get(key);
    return config ? config.value : null;
}

async function saveColors() {
    const selectedThemeColor = document.querySelector('input[name="theme-color"]:checked')?.value;
    const selectedMarkerColor = document.querySelector('input[name="marker-color"]:checked')?.value;

    if (selectedThemeColor) {
        await saveConfig('themePrimaryColor', selectedThemeColor);
    }
    if (selectedMarkerColor) {
        await saveConfig('markerColor', selectedMarkerColor);
    }
    
    aplicarConfiguracoesSalvas(); // Aplica as cores imediatamente
    alert('Cores salvas com sucesso!');
}

export async function aplicarConfiguracoesSalvas() {
    const themePrimaryColor = await getConfig('themePrimaryColor');
    const markerColor = await getConfig('markerColor');
    const darkModeEnabled = await getConfig('darkModeEnabled');

    const root = document.documentElement; // O elemento <html>

    if (themePrimaryColor) {
        root.style.setProperty('--theme-primary', themePrimaryColor);
        // Calcula uma versão mais escura para o hover
        const darkColor = darkenColor(themePrimaryColor, 20); // Escurece em 20%
        root.style.setProperty('--theme-primary-dark', darkColor);

        // Atualiza a cor da navbar e botões dinamicamente
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.style.backgroundColor = themePrimaryColor;
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) mobileMenu.style.backgroundColor = themePrimaryColor;
        
        // Atualiza a cor dos botões principais (Agendar OS, Abrir OS)
        document.querySelectorAll('.bg-theme-primary').forEach(btn => {
            btn.style.backgroundColor = themePrimaryColor;
        });
        document.querySelectorAll('.hover\\:bg-theme-primary-dark').forEach(btn => {
            btn.style.setProperty('--tw-bg-opacity', '1'); // Garante que a cor de fundo seja aplicada
            btn.style.backgroundColor = themePrimaryColor; // Define a cor base para o hover
            btn.onmouseover = () => btn.style.backgroundColor = darkColor;
            btn.onmouseout = () => btn.style.backgroundColor = themePrimaryColor;
        });
        document.querySelectorAll('.text-theme-primary').forEach(el => {
            el.style.color = themePrimaryColor;
        });
    }

    if (markerColor) {
        root.style.setProperty('--marker-color', markerColor);
    }

    if (darkModeEnabled === true) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Marca os radio buttons selecionados
    if (themePrimaryColor) {
        const radio = document.getElementById(`theme-color-${themePrimaryColor.slice(1)}`);
        if (radio) radio.checked = true;
    }
    if (markerColor) {
        const radio = document.getElementById(`marker-color-${markerColor.slice(1)}`);
        if (radio) radio.checked = true;
    }
}

async function toggleDarkMode() {
    const body = document.body;
    const isDarkMode = body.classList.contains('dark-mode');
    if (isDarkMode) {
        body.classList.remove('dark-mode');
        await saveConfig('darkModeEnabled', false);
    } else {
        body.classList.add('dark-mode');
        await saveConfig('darkModeEnabled', true);
    }
}

// Função auxiliar para escurecer uma cor hexadecimal
function darkenColor(hex, percent) {
    var f=parseInt(hex.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=(f>>8)&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

async function loadConfiguracoes() {
    // Esta função é chamada ao renderizar a página de configurações para marcar os radios
    // A aplicação das configs já é feita em init.js
    aplicarConfiguracoesSalvas(); // Garante que os radios estejam marcados corretamente
}

window.aplicarConfiguracoesSalvas = aplicarConfiguracoesSalvas; // Torna global para init.js
window.saveColors = saveColors;
window.toggleDarkMode = toggleDarkMode;
window.loadConfiguracoes = loadConfiguracoes;
