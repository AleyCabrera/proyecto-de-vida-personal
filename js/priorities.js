// ============================================
// MÓDULO DE GESTIÓN DE PRIORIDADES - ENCAPSULADO
// ============================================

(function() {
    'use strict';

    // ===== FUNCIONES DE UTILIDAD =====
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    function showPriorityToast(msg) {
        if (typeof window.showToastMessageGlobal === 'function') {
            window.showToastMessageGlobal(msg);
        } else {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }
    }

    // ===== VARIABLES LOCALES (NO GLOBALES) =====
    let prioritiesList = [
        { id: generateId(), name: "Inglés Técnico", hours: 1, color: "#dc2626", description: "Clases, listening, speaking, vocabulario técnico" },
        { id: generateId(), name: "Redes CCNA", hours: 1, color: "#3b82f6", description: "Estudio de routing, switching, subnetting" },
        { id: generateId(), name: "Linux LPIC", hours: 1, color: "#f59e0b", description: "Administración de sistemas, comandos, scripts" },
        { id: generateId(), name: "Python/React", hours: 1, color: "#10b981", description: "Desarrollo de aplicaciones y portafolio" },
        { id: generateId(), name: "Emprendimiento IoT", hours: 1, color: "#8b5cf6", description: "Proyectos electrónicos, negocio propio" }
    ];

    let currentEditPriorityId = null;
    let priorityChart = null;

    const PRIORITIES_STORAGE_KEY = 'aley_priorities_data';

    // ===== PERSISTENCIA =====
    function savePrioritiesToLocal() {
        try {
            localStorage.setItem(PRIORITIES_STORAGE_KEY, JSON.stringify(prioritiesList));
            console.log('✅ Prioridades guardadas en localStorage');
        } catch (e) {
            console.error('Error guardando prioridades:', e);
        }
    }

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

    // ===== ESTADÍSTICAS =====
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

    // ===== RENDERIZADO DE LISTA =====
    function renderPrioritiesList() {
        const container = document.getElementById('priorities-list');
        if (!container) {
            console.warn('⚠️ Contenedor "priorities-list" no encontrado');
            return;
        }
        
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
                    <button class="priority-edit" onclick="window.openEditPriorityModal(${priority.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="priority-delete" onclick="window.deletePriority(${priority.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        updatePriorityStats();
    }

    // ===== GRÁFICO =====
    function renderPrioritiesChart() {
        const canvas = document.getElementById("priorities-chart");
        if (!canvas) {
            console.warn('⚠️ Canvas "priorities-chart" no encontrado');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (priorityChart) {
            priorityChart.destroy();
        }
        
        const labels = prioritiesList.map(p => p.name);
        const data = prioritiesList.map(p => p.hours);
        const colors = prioritiesList.map(p => p.color);
        
        if (labels.length === 0) {
            priorityChart = new Chart(ctx, {
                type: 'bar',
                data: { 
                    labels: ['Sin datos'], 
                    datasets: [{ 
                        label: 'Horas diarias', 
                        data: [0], 
                        backgroundColor: ['#2d3a5e'],
                        borderRadius: 12
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
                                    return '0 horas';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
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
            return;
        }
        
        const maxValue = Math.max(8, ...data) + 1;
        
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
                        max: maxValue,
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

    // ===== FUNCIONES DEL MODAL =====
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
        if (modal) {
            modal.classList.add('active');
            // Resetear scroll
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) modalBody.scrollTop = 0;
        }
    }

    function openEditPriorityModal(id) {
        const priority = prioritiesList.find(p => p.id === id);
        if (!priority) {
            showPriorityToast('❌ Prioridad no encontrada');
            return;
        }
        
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

    // ===== CRUD OPERACIONES =====
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
            showPriorityToast('⚠️ El nombre de la prioridad es requerido');
            return;
        }
        
        if (isNaN(hours) || hours <= 0 || hours > 24) {
            showPriorityToast('⚠️ Las horas deben ser entre 0.5 y 24');
            return;
        }
        
        if (currentEditPriorityId) {
            const index = prioritiesList.findIndex(p => p.id === currentEditPriorityId);
            if (index !== -1) {
                prioritiesList[index] = {
                    ...prioritiesList[index],
                    name: name,
                    hours: hours,
                    color: color,
                    description: description
                };
                showPriorityToast('✏️ Prioridad actualizada');
            }
        } else {
            prioritiesList.push({
                id: generateId(),
                name: name,
                hours: hours,
                color: color,
                description: description
            });
            showPriorityToast('✅ Prioridad agregada');
        }
        
        savePrioritiesToLocal();
        renderPrioritiesList();
        renderPrioritiesChart();
        closePriorityModal();
        
        const event = new CustomEvent('prioritiesUpdated', { detail: { priorities: prioritiesList } });
        document.dispatchEvent(event);
    }

    // ===== ELIMINAR PRIORIDAD (CON MODAL PERSONALIZADO) =====
    function deletePriority(id) {
        const priority = prioritiesList.find(p => p.id === id);
        if (!priority) return;
        
        if (typeof window.showConfirmModal === 'function') {
            window.showConfirmModal(
                `¿Estás seguro de eliminar la prioridad "${priority.name}"?`,
                () => {
                    prioritiesList = prioritiesList.filter(p => p.id !== id);
                    savePrioritiesToLocal();
                    renderPrioritiesList();
                    renderPrioritiesChart();
                    showPriorityToast('🗑️ Prioridad eliminada');
                    
                    const event = new CustomEvent('prioritiesUpdated', { detail: { priorities: prioritiesList } });
                    document.dispatchEvent(event);
                }
            );
        } else {
            // Fallback solo si showConfirmModal no existe
            if (confirm(`¿Eliminar la prioridad "${priority.name}"?`)) {
                prioritiesList = prioritiesList.filter(p => p.id !== id);
                savePrioritiesToLocal();
                renderPrioritiesList();
                renderPrioritiesChart();
                showPriorityToast('🗑️ Prioridad eliminada');
                
                const event = new CustomEvent('prioritiesUpdated', { detail: { priorities: prioritiesList } });
                document.dispatchEvent(event);
            }
        }
    }

    // ===== FUNCIONES PÚBLICAS =====
    function renderPriorities() {
        renderPrioritiesList();
        renderPrioritiesChart();
    }

    function getPrioritiesList() {
        return prioritiesList;
    }

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

    // ===== INICIALIZACIÓN =====
    function initPrioritiesModule() {
        console.log('🚀 Inicializando módulo de prioridades...');
        
        // Cargar datos guardados
        loadPrioritiesFromLocal();
        
        // Renderizar UI
        renderPriorities();
        
        // Configurar eventos
        const openBtn = document.getElementById('openAddPriorityModalBtn');
        if (openBtn) {
            openBtn.addEventListener('click', openAddPriorityModal);
        } else {
            console.warn('⚠️ Botón "openAddPriorityModalBtn" no encontrado');
        }
        
        const saveBtn = document.getElementById('savePriorityBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', savePriority);
        } else {
            console.warn('⚠️ Botón "savePriorityBtn" no encontrado');
        }
        
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
        
        console.log('✅ Módulo de prioridades inicializado correctamente');
    }

    // ===== EXPORTAR FUNCIONES GLOBALES =====
    window.openAddPriorityModal = openAddPriorityModal;
    window.openEditPriorityModal = openEditPriorityModal;
    window.closePriorityModal = closePriorityModal;
    window.savePriority = savePriority;
    window.deletePriority = deletePriority;
    window.renderPriorities = renderPriorities;
    window.getPrioritiesList = getPrioritiesList;
    window.loadPriorities = loadPriorities;

    // ===== INICIALIZAR =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPrioritiesModule);
    } else {
        initPrioritiesModule();
    }
})();