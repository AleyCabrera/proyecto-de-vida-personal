// ============================================
// MÓDULO DE GESTIÓN DE PRIORIDADES
// ============================================

// Data inicial
let prioritiesList = [
    { id: 1, name: "Inglés Técnico", hours: 1, color: "#dc2626", description: "Clases, listening, speaking, vocabulario técnico" },
    { id: 2, name: "Redes CCNA", hours: 1, color: "#3b82f6", description: "Estudio de routing, switching, subnetting" },
    { id: 3, name: "Linux LPIC", hours: 1, color: "#f59e0b", description: "Administración de sistemas, comandos, scripts" },
    { id: 4, name: "Python/React", hours: 1, color: "#10b981", description: "Desarrollo de aplicaciones y portafolio" },
    { id: 5, name: "Emprendimiento IoT", hours: 1, color: "#8b5cf6", description: "Proyectos electrónicos, negocio propio" }
];

let currentEditPriorityId = null;
let priorityChart = null;

// Clave específica para prioridades en localStorage
const PRIORITIES_STORAGE_KEY = 'aley_priorities_data';

// Función para guardar prioridades en localStorage
function savePrioritiesToLocal() {
    try {
        localStorage.setItem(PRIORITIES_STORAGE_KEY, JSON.stringify(prioritiesList));
        console.log('✅ Prioridades guardadas en localStorage');
    } catch (e) {
        console.error('Error guardando prioridades:', e);
    }
}

// Función para cargar prioridades desde localStorage
function loadPrioritiesFromLocal() {
    try {
        const saved = localStorage.getItem(PRIORITIES_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                prioritiesList = parsed;
                console.log('📂 Prioridades cargadas desde localStorage');
            } else if (parsed && parsed.length === 0) {
                prioritiesList = [];
                console.log('📂 Lista de prioridades vacía');
            }
        }
    } catch (e) {
        console.error('Error cargando prioridades:', e);
    }
}

// Función para mostrar toast
function showToastMessage(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Función para actualizar estadísticas
function updatePriorityStats() {
    const totalHours = prioritiesList.reduce((sum, p) => sum + p.hours, 0);
    const activeCount = prioritiesList.length;
    const productivity = Math.min(100, Math.round((totalHours / 8) * 100));
    
    const activeCountEl = document.getElementById('activePrioritiesCount');
    const totalHoursEl = document.getElementById('totalHoursStat');
    const productivityEl = document.getElementById('productivityScore');
    const totalHoursDisplay = document.getElementById('totalHoursDisplay');
    
    if (activeCountEl) activeCountEl.innerText = activeCount;
    if (totalHoursEl) totalHoursEl.innerText = totalHours;
    if (productivityEl) productivityEl.innerText = productivity;
    if (totalHoursDisplay) totalHoursDisplay.innerHTML = `Total: ${totalHours}h`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderPrioritiesList() {
    const container = document.getElementById('priorities-list');
    if (!container) return;
    
    if (prioritiesList.length === 0) {
        container.innerHTML = `
            <div class="empty-priorities">
                <i class="fas fa-clipboard-list"></i>
                <p>No hay prioridades agregadas</p>
                <small>Haz clic en "Nueva Prioridad" para comenzar</small>
            </div>
        `;
        return;
    }
    
    // Ordenar por horas (de mayor a menor) para mejor visualización
    const sortedList = [...prioritiesList].sort((a, b) => b.hours - a.hours);
    
    container.innerHTML = sortedList.map(priority => `
        <div class="priority-item" style="border-left-color: ${priority.color}">
            <div class="priority-color" style="background: ${priority.color};"></div>
            <div class="priority-info">
                <div class="priority-name">${escapeHtml(priority.name)}</div>
                <div class="priority-hours">
                    <i class="fas fa-hourglass-half"></i> ${priority.hours} hora${priority.hours !== 1 ? 's' : ''}/día
                </div>
                ${priority.description ? `<div class="priority-description">${escapeHtml(priority.description)}</div>` : ''}
            </div>
            <div class="priority-actions">
                <button class="priority-edit" onclick="openEditPriorityModal(${priority.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="priority-delete" onclick="deletePriority(${priority.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    updatePriorityStats();
}

function renderPrioritiesChart() {
    const ctx = document.getElementById("priorities-chart")?.getContext('2d');
    if (!ctx) return;
    
    if (priorityChart) priorityChart.destroy();
    
    const labels = prioritiesList.map(p => p.name);
    const data = prioritiesList.map(p => p.hours);
    const colors = prioritiesList.map(p => p.color);
    
    if (labels.length === 0) {
        // Mostrar gráfico vacío
        priorityChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: ['Sin datos'], datasets: [{ label: 'Horas diarias', data: [0], backgroundColor: '#2d3a5e' }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
        });
        return;
    }
    
    priorityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Horas diarias',
                data: data,
                backgroundColor: colors,
                borderRadius: 12,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} hora(s) por día`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(8, ...data, 1) + 1,
                    title: { display: true, text: 'Horas / día', color: '#94a3b8' },
                    ticks: { color: '#94a3b8', stepSize: 1 },
                    grid: { color: '#2d3a5e' }
                },
                x: {
                    ticks: { color: '#cbd5e1', maxRotation: 45, minRotation: 35 },
                    grid: { display: false }
                }
            }
        }
    });
}

// Funciones principales de CRUD
function openAddPriorityModal() {
    currentEditPriorityId = null;
    const titleEl = document.getElementById('priorityModalTitle');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Prioridad';
    
    const nameInput = document.getElementById('priorityName');
    const hoursInput = document.getElementById('priorityHours');
    const colorInput = document.getElementById('priorityColor');
    const descInput = document.getElementById('priorityDescription');
    
    if (nameInput) nameInput.value = '';
    if (hoursInput) hoursInput.value = '1';
    if (colorInput) colorInput.value = '#dc2626';
    if (descInput) descInput.value = '';
    
    const modal = document.getElementById('priorityModal');
    if (modal) modal.classList.add('active');
}

function openEditPriorityModal(id) {
    const priority = prioritiesList.find(p => p.id === id);
    if (!priority) return;
    
    currentEditPriorityId = id;
    const titleEl = document.getElementById('priorityModalTitle');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit"></i> Editar Prioridad';
    
    const nameInput = document.getElementById('priorityName');
    const hoursInput = document.getElementById('priorityHours');
    const colorInput = document.getElementById('priorityColor');
    const descInput = document.getElementById('priorityDescription');
    
    if (nameInput) nameInput.value = priority.name;
    if (hoursInput) hoursInput.value = priority.hours;
    if (colorInput) colorInput.value = priority.color;
    if (descInput) descInput.value = priority.description || '';
    
    const modal = document.getElementById('priorityModal');
    if (modal) modal.classList.add('active');
}

function closePriorityModal() {
    const modal = document.getElementById('priorityModal');
    if (modal) modal.classList.remove('active');
    currentEditPriorityId = null;
}

function savePriority() {
    const nameInput = document.getElementById('priorityName');
    const hoursInput = document.getElementById('priorityHours');
    const colorInput = document.getElementById('priorityColor');
    const descInput = document.getElementById('priorityDescription');
    
    const name = nameInput?.value.trim() || '';
    const hours = parseFloat(hoursInput?.value || '0');
    const color = colorInput?.value || '#dc2626';
    const description = descInput?.value.trim() || '';
    
    if (!name) {
        showToastMessage('⚠️ El nombre de la prioridad es requerido');
        return;
    }
    
    if (isNaN(hours) || hours <= 0 || hours > 24) {
        showToastMessage('⚠️ Las horas deben ser entre 0.5 y 24');
        return;
    }
    
    if (currentEditPriorityId) {
        // Editar prioridad existente
        const index = prioritiesList.findIndex(p => p.id === currentEditPriorityId);
        if (index !== -1) {
            prioritiesList[index] = {
                ...prioritiesList[index],
                name: name,
                hours: hours,
                color: color,
                description: description
            };
            showToastMessage('✏️ Prioridad actualizada');
        }
    } else {
        // Agregar nueva prioridad
        const newId = Date.now();
        prioritiesList.push({
            id: newId,
            name: name,
            hours: hours,
            color: color,
            description: description
        });
        showToastMessage('✅ Prioridad agregada');
    }
    
    // Guardar en localStorage
    savePrioritiesToLocal();
    
    // Disparar evento personalizado para notificar al main.js
    const event = new CustomEvent('prioritiesUpdated', { detail: { priorities: prioritiesList } });
    document.dispatchEvent(event);
    
    // Actualizar UI
    renderPrioritiesList();
    renderPrioritiesChart();
    closePriorityModal();
}

function deletePriority(id) {
    const priority = prioritiesList.find(p => p.id === id);
    if (confirm(`¿Eliminar la prioridad "${priority?.name}"?`)) {
        prioritiesList = prioritiesList.filter(p => p.id !== id);
        
        // Guardar en localStorage
        savePrioritiesToLocal();
        
        // Disparar evento
        const event = new CustomEvent('prioritiesUpdated', { detail: { priorities: prioritiesList } });
        document.dispatchEvent(event);
        
        // Actualizar UI
        renderPrioritiesList();
        renderPrioritiesChart();
        showToastMessage('🗑️ Prioridad eliminada');
    }
}

// Función principal de renderizado
function renderPriorities() {
    renderPrioritiesList();
    renderPrioritiesChart();
}

// Función para obtener la lista de prioridades (para compatibilidad)
function getPrioritiesList() {
    return prioritiesList;
}

// Función para cargar prioridades desde datos externos
function loadPriorities(data) {
    if (data && Array.isArray(data)) {
        if (data.length > 0) {
            prioritiesList = data;
        } else {
            prioritiesList = [];
        }
        renderPriorities();
        savePrioritiesToLocal();
    }
}

// Inicializar eventos del módulo
function initPrioritiesModule() {
    // Cargar datos guardados
    loadPrioritiesFromLocal();
    
    // Renderizar UI
    renderPriorities();
    
    // Configurar eventos
    const openBtn = document.getElementById('openAddPriorityModalBtn');
    if (openBtn) openBtn.addEventListener('click', openAddPriorityModal);
    
    const saveBtn = document.getElementById('savePriorityBtn');
    if (saveBtn) saveBtn.addEventListener('click', savePriority);
    
    // Presets de colores
    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.getAttribute('data-color');
            const colorInput = document.getElementById('priorityColor');
            if (colorInput) colorInput.value = color;
        });
    });
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('priorityModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePriorityModal();
        });
    }
    
    console.log('🚀 Módulo de prioridades inicializado');
}

// Exportar funciones globales
window.openAddPriorityModal = openAddPriorityModal;
window.openEditPriorityModal = openEditPriorityModal;
window.closePriorityModal = closePriorityModal;
window.savePriority = savePriority;
window.deletePriority = deletePriority;
window.renderPriorities = renderPriorities;
window.getPrioritiesList = getPrioritiesList;
window.loadPriorities = loadPriorities;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrioritiesModule);
} else {
    initPrioritiesModule();
}