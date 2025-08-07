// js/globals.js
// Variáveis de estado global do aplicativo

export let currentPage = 'calendar';
export let selectedDay = null;
export let selectedMonth = new Date().getMonth();
export let selectedYear = new Date().getFullYear();

export function updateSelectedDate(day, month, year) {
    selectedDay = day;
    selectedMonth = month;
    selectedYear = year;
}

export function updateCurrentPage(pageName) {
    currentPage = pageName;
}
