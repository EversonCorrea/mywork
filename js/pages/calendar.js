// js/pages/calendar.js
// Lógica e renderização da página do calendário

import { db } from '../db.js';
import { selectedDay, selectedMonth, selectedYear, updateSelectedDate } from '../globals.js';
import { showOSModal } from './os.js';

export function renderCalendarPage() {
    const page = document.createElement('div');
    page.className = 'flex flex-col md:flex-row gap-6 h-full';
    page.innerHTML = `
        <div class="flex-grow bg-white p-6 rounded-xl shadow-lg">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800">Calendário - ${new Date(selectedYear, selectedMonth).toLocaleString('pt-BR', { month: 'long' })} ${selectedYear}</h2>
                <button onclick="window.showOSModal(${selectedYear}, ${selectedMonth}, selectedDay)" class="bg-theme-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-theme-primary-dark">Agendar OS</button>
            </div>
            <div id="calendar-grid" class="grid grid-cols-7 gap-1 text-center font-bold text-gray-600">
                <div class="p-2">Dom</div>
                <div class="p-2">Seg</div>
                <div class="p-2">Ter</div>
                <div class="p-2">Qua</div>
                <div class="p-2">Qui</div>
                <div class="p-2">Sex</div>
                <div class="p-2">Sáb</div>
            </div>
            <div id="calendar-days" class="grid grid-cols-7 gap-1"></div>
        </div>
        <div id="legend-sidebar" class="md:w-1/3 bg-white p-6 rounded-xl shadow-lg md:overflow-y-auto">
            <h3 class="text-lg font-bold mb-4">Selecione um dia</h3>
        </div>
    `;

    const calendarDays = page.querySelector('#calendar-days');
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'p-2';
        calendarDays.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'bg-gray-50 rounded-lg p-2 flex flex-col justify-between calendar-day transition-colors';
        dayDiv.dataset.day = day;
        dayDiv.innerHTML = `<span class="font-bold text-gray-700">${day}</span>`;
        dayDiv.addEventListener('click', (e) => {
            const allDays = document.querySelectorAll('.calendar-day');
            allDays.forEach(d => d.classList.remove('bg-blue-100'));
            dayDiv.classList.add('bg-blue-100');
            updateSelectedDate(day, selectedMonth, selectedYear);
            renderDayLegend(day, selectedMonth, selectedYear);
        });
        dayDiv.addEventListener('dblclick', () => showDayDetails(day, selectedMonth, selectedYear));
        calendarDays.appendChild(dayDiv);
    }
    loadAppointmentsForCalendar(selectedYear, selectedMonth);
    return page;
}

export async function loadAppointmentsForCalendar(year, month) {
    try {
        const calendarDays = document.getElementById('calendar-days');
        if (!calendarDays) return;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startOfMonth = new Date(year, month, 1).toISOString().slice(0, 10);
        const endOfMonth = new Date(year, month, daysInMonth).toISOString().slice(0, 10);

        const osList = await db.ordens_de_servico.where('data_hora_os').between(startOfMonth, endOfMonth, true, true).toArray();
        
        const daysWithAppointments = new Set();
        osList.forEach(os => {
            if (os.status_os !== 'cancelado') {
                const osDay = new Date(os.data_hora_os).getDate();
                daysWithAppointments.add(osDay);
            }
        });

        daysWithAppointments.forEach(day => {
            const dayDiv = calendarDays.querySelector(`[data-day='${day}']`);
            if (dayDiv) {
                dayDiv.classList.add('has-appointment');
            }
        });

    } catch (error) {
        console.error("Erro ao carregar agendamentos para o calendário:", error);
        alert("Erro ao carregar agendamentos do calendário. Verifique o console.");
    }
}

export async function renderDayLegend(day, month, year) {
    const legendSidebar = document.getElementById('legend-sidebar');
    if (!legendSidebar) return;

    const today = new Date(year, month, day);
    const dateStr = today.toISOString().slice(0, 10);
    
    legendSidebar.innerHTML = `<h3 class="text-lg font-bold mb-4 text-gray-800">Agendamentos em ${today.toLocaleDateString('pt-BR')}</h3>`;

    const osListForDay = await db.ordens_de_servico.where('data_hora_os').startsWith(dateStr).toArray();
    
    if (osListForDay.length === 0) {
        legendSidebar.innerHTML += `<p class="text-gray-500">Nenhum agendamento para este dia.</p>`;
        return;
    }

    for (const os of osListForDay) {
        const client = await db.clientes.get(os.id_cliente);
        const servicesRealizados = JSON.parse(os.servicos_realizados);
        
        const apptDiv = document.createElement('div');
        apptDiv.className = `bg-white p-4 rounded-lg shadow-sm mb-2 border-l-4 ${os.status_os === 'cancelado' ? 'opacity-60 line-through' : ''}`;
        apptDiv.style.borderColor = os.status_os === 'cancelado' ? '#EF4444' : 'var(--marker-color, #3B82F6)';
        
        apptDiv.innerHTML = `
            <p class="font-semibold text-gray-800">OS #${os.id}</p>
            <p class="text-sm text-gray-600">Cliente: ${client ? client.nome : 'Cliente excluído'}</p>
            <p class="text-sm text-gray-500">Serviços: ${servicesRealizados.map(s => s.name).join(', ')}</p>
            <p class="text-sm text-gray-500">Valor: R$${os.valor_total.toFixed(2).replace('.', ',')}</p>
            <p class="text-sm text-gray-500">Status: ${os.status_os === 'cancelado' ? 'Cancelada' : 'Aberta'}</p>
        `;
        legendSidebar.appendChild(apptDiv);
    }
}

export function showDayDetails(day, month, year) {
    alert(`Visualização completa do dia ${day}/${month + 1}/${year} (em construção!)`);
}

// Exporta showOSModal para ser acessível globalmente (para o onclick no HTML)
window.showOSModal = showOSModal;
