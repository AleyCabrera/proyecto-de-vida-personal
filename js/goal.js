// ===== SISTEMA DE GESTIÓN DE METAS =====

let goalsList = [];
let completedGoals = [];
let currentEditingGoalId = null;

// ===== CONSTANTES =====
const STORAGE_KEYS = {
    ACTIVE: 'aley_goals_active',
    COMPLETED: 'aley_goals_completed'
};

const DEFAULT_GOALS = [
    { title: "Completar Tecnólogo en Software", year: "2025", description: "Finalizar el programa con éxito y obtener el título" },
    { title: "Obtener certificación CCNA", year: "2025", description: "Cisco Certified Network Associate" },
    { title: "Comenzar Ingeniería Mecatrónica", year: "2026", description: "Iniciar la carrera universitaria" },
    { title: "Especialización en Automatización", year: "2027", description: "Profundizar en control industrial" },
    { title: "Finalizar Maestría en Ciberseguridad", year: "2030", description: "Obtener el título de magíster" },
    { title: "Alcanzar posición CISO", year: "2032", description: "Chief Information Security Officer en empresa tecnológica" },
    { title: "Doctorado en Tecnologías de la Información", year: "2035", description: "Investigación en ciberseguridad avanzada" }
];

// ===== FUNCIONES DE UTILIDAD =====
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function extractYearNumber(yearStr) {
    if (!yearStr) return 9999;
    const match = String(yearStr).match(/\d+/);
    return match ? parseInt(match[0]) : 9999;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate() {
    return new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isValidYear(year) {
    const num = parseInt(year);
    return !isNaN(num) && num >= 1900 && num <= 2100;
}

// ===== MANEJO DE DATOS =====
function loadGoalsData() {
    try {
        const savedGoals = localStorage.getItem(STORAGE_KEYS.ACTIVE);
        const savedCompleted = localStorage.getItem(STORAGE_KEYS.COMPLETED);
        
        goalsList = savedGoals ? JSON.parse(savedGoals) : createDefaultGoals();
        completedGoals = savedCompleted ? JSON.parse(savedCompleted) : [];
    } catch (error) {
        console.error('Error al cargar datos:', error);
        goalsList = createDefaultGoals();
        completedGoals = [];
    }
}

function createDefaultGoals() {
    return DEFAULT_GOALS.map(goal => ({
        ...goal,
        id: generateId(),
        completed: false,
        completedDate: null,
        createdAt: new Date().toISOString()
    }));
}

function saveGoalsData() {
    try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE, JSON.stringify(goalsList));
        localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completedGoals));
    } catch (error) {
        console.error('Error al guardar datos:', error);
        showToastMessage('❌ Error al guardar los datos');
    }
}

// ===== ORDENAMIENTO =====
function sortGoalsByYear(goals) {
    return [...goals].sort((a, b) => extractYearNumber(a.year) - extractYearNumber(b.year));
}

function sortCompletedByDate(completed) {
    return [...completed].sort((a, b) => {
        if (!a.completedDate && !b.completedDate) return 0;
        if (!a.completedDate) return 1;
        if (!b.completedDate) return -1;
        return new Date(b.completedDate) - new Date(a.completedDate);
    });
}

// ===== RENDERIZADO =====
function renderGoals() {
    const activeContainer = document.getElementById('activeGoalsList');
    const completedContainer = document.getElementById('completedGoalsList');
    const completedCountSpan = document.getElementById('completedCount');
    
    if (!activeContainer) return;
    
    renderActiveGoals(activeContainer);
    renderCompletedGoals(completedContainer, completedCountSpan);
}

function renderActiveGoals(container) {
    const sortedActive = sortGoalsByYear(goalsList);
    
    if (sortedActive.length === 0) {
        container.innerHTML = '<div class="empty-goals"><i class="fas fa-smile-wink"></i> ¡No hay metas activas! Agrega una nueva meta para comenzar.</div>';
        return;
    }
    
    container.innerHTML = sortedActive.map(goal => `
        <div class="goal-item" data-id="${goal.id}">
            <input type="checkbox" class="goal-check" onchange="window.toggleGoalComplete(${goal.id})" ${goal.completed ? 'checked' : ''}>
            <div class="goal-content">
                <span class="goal-year">🎯 ${escapeHtml(goal.year)}</span>
                <div class="goal-title">${escapeHtml(goal.title)}</div>
                ${goal.description ? `<div class="goal-description">${escapeHtml(goal.description)}</div>` : ''}
            </div>
            <div class="goal-actions">
                <button class="goal-btn-edit" onclick="window.openEditGoalModal(${goal.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="goal-btn-delete" onclick="window.deleteGoal(${goal.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function renderCompletedGoals(container, countSpan) {
    const sortedCompleted = sortCompletedByDate(completedGoals);
    
    if (sortedCompleted.length === 0) {
        container.innerHTML = '<div class="empty-goals" style="text-align:left;"><i class="fas fa-history"></i> Aún no hay metas completadas. ¡Tú puedes lograrlas!</div>';
        if (countSpan) countSpan.textContent = '0';
        return;
    }
    
    container.innerHTML = sortedCompleted.map(goal => `
        <div class="completed-item">
            <div>
                <div class="goal-title">✓ ${escapeHtml(goal.title)}</div>
                <div class="goal-description">🎯 ${escapeHtml(goal.year)} — ${escapeHtml(goal.description || 'Meta cumplida')}</div>
                <div class="completed-date">✅ Completada: ${goal.completedDate || 'Fecha registrada'}</div>
            </div>
            <button class="btn-restore" onclick="window.restoreGoal(${goal.id})">
                <i class="fas fa-undo"></i> Restaurar
            </button>
        </div>
    `).join('');
    
    if (countSpan) countSpan.textContent = sortedCompleted.length;
}

// ===== CRUD OPERACIONES =====
function addGoal(title, year, description) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
        showToastMessage('⚠️ El título de la meta es requerido');
        return false;
    }
    
    if (!isValidYear(year)) {
        showToastMessage('⚠️ Por favor ingresa un año válido (1900-2100)');
        return false;
    }
    
    const newGoal = {
        id: generateId(),
        title: trimmedTitle,
        year: String(year).trim(),
        description: description?.trim() || '',
        completed: false,
        completedDate: null,
        createdAt: new Date().toISOString()
    };
    
    goalsList.push(newGoal);
    saveGoalsData();
    renderGoals();
    showToastMessage('🎯 Meta agregada exitosamente');
    return true;
}

function toggleGoalComplete(goalId) {
    const goalIndex = goalsList.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;
    
    const goal = goalsList[goalIndex];
    if (goal.completed) {
        // Si ya está completada, no hacer nada (el checkbox está sincronizado)
        return;
    }
    
    // Mover a completadas
    goal.completed = true;
    goal.completedDate = formatDate();
    completedGoals.push(goal);
    goalsList.splice(goalIndex, 1);
    
    saveGoalsData();
    renderGoals();
    showToastMessage('🏆 ¡Felicidades! Has cumplido una meta');
}

function restoreGoal(goalId) {
    const goalIndex = completedGoals.findIndex(g => g.id === goalId);
    if (goalIndex === -1) return;
    
    const goal = completedGoals[goalIndex];
    goal.completed = false;
    goal.completedDate = null;
    goalsList.push(goal);
    completedGoals.splice(goalIndex, 1);
    
    saveGoalsData();
    renderGoals();
    showToastMessage('🔄 Meta restaurada a activas');
}


function deleteGoal(goalId) {
    const goal = goalsList.find(g => g.id === goalId);
    if (!goal) return;
    
    window.showConfirmModal(
        `¿Estás seguro de eliminar la meta "${goal.name}"? Esta acción no se puede deshacer.`,
        () => {
            goalsList = goalsList.filter(g => g.id !== goalId);
            saveGoalsData();
            renderGoals();
            showToastMessage('🗑️ Meta eliminada');
        }
    );
}

function clearCompletedHistory() {
    if (completedGoals.length === 0) {
        showToastMessage('📜 No hay historial para limpiar');
        return;
    }
    
    window.showConfirmModal(
        '¿Eliminar todo el historial de metas completadas? Esta acción no se puede deshacer.',
        () => {
            completedGoals = [];
            saveGoalsData();
            renderGoals();
            showToastMessage('📜 Historial limpiado');
        }
    );
}


function clearCompletedHistory() {
    if (completedGoals.length === 0) {
        showToastMessage('📜 No hay historial para limpiar');
        return;
    }
    
    window.showConfirmModal(
        '¿Eliminar todo el historial de metas completadas? Esta acción no se puede deshacer.',
        () => {
            completedGoals = [];
            saveGoalsData();
            renderGoals();
            showToastMessage('📜 Historial limpiado');
        }
    );
}

// ===== MODAL DE EDICIÓN =====
function openEditGoalModal(goalId) {
    const goal = goalsList.find(g => g.id === goalId);
    if (!goal) {
        showToastMessage('❌ Meta no encontrada');
        return;
    }
    
    currentEditingGoalId = goalId;
    document.getElementById('editGoalTitle').value = goal.title;
    document.getElementById('editGoalYear').value = goal.year;
    document.getElementById('editGoalDescription').value = goal.description || '';
    
    const modal = document.getElementById('editGoalModal');
    if (modal) modal.classList.add('active');
}

function closeEditModal() {
    const modal = document.getElementById('editGoalModal');
    if (modal) modal.classList.remove('active');
    currentEditingGoalId = null;
}

function saveEditedGoal() {
    if (!currentEditingGoalId) {
        showToastMessage('❌ No hay meta seleccionada para editar');
        return;
    }
    
    const goalIndex = goalsList.findIndex(g => g.id === currentEditingGoalId);
    if (goalIndex === -1) {
        showToastMessage('❌ Meta no encontrada');
        return;
    }
    
    const newTitle = document.getElementById('editGoalTitle').value.trim();
    if (!newTitle) {
        showToastMessage('⚠️ El título no puede estar vacío');
        return;
    }
    
    const newYear = document.getElementById('editGoalYear').value;
    if (!isValidYear(newYear)) {
        showToastMessage('⚠️ Por favor ingresa un año válido (1900-2100)');
        return;
    }
    
    const goal = goalsList[goalIndex];
    goal.title = newTitle;
    goal.year = newYear;
    goal.description = document.getElementById('editGoalDescription').value.trim() || '';
    
    saveGoalsData();
    renderGoals();
    closeEditModal();
    showToastMessage('✏️ Meta actualizada');
}

// ===== TOAST NOTIFICATIONS =====
function showToastMessage(message) {
    // Eliminar toasts existentes para evitar acumulación
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger reflow para animación
    toast.offsetHeight;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ===== INICIALIZACIÓN =====
function initGoalsForm() {
    const form = document.getElementById('newGoalForm');
    if (form) {
        // Remover listeners anteriores para evitar duplicados
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('goalTitle').value;
            const year = document.getElementById('goalYear').value;
            const description = document.getElementById('goalDescription').value;
            
            if (addGoal(title, year, description)) {
                newForm.reset();
            }
        });
    }
    
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        const newBtn = clearHistoryBtn.cloneNode(true);
        clearHistoryBtn.parentNode.replaceChild(newBtn, clearHistoryBtn);
        newBtn.addEventListener('click', clearCompletedHistory);
    }
    
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        const newBtn = saveEditBtn.cloneNode(true);
        saveEditBtn.parentNode.replaceChild(newBtn, saveEditBtn);
        newBtn.addEventListener('click', saveEditedGoal);
    }
    
    const closeModalBtn = document.querySelector('#editGoalModal .modal-close');
    if (closeModalBtn) {
        const newBtn = closeModalBtn.cloneNode(true);
        closeModalBtn.parentNode.replaceChild(newBtn, closeModalBtn);
        newBtn.addEventListener('click', closeEditModal);
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('editGoalModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeEditModal();
        });
    }
}

// ===== EXPORTAR FUNCIONES GLOBALES =====
// Solo exportar una vez, evitando redeclaraciones
const globalFunctions = {
    toggleGoalComplete,
    deleteGoal,
    restoreGoal,
    openEditGoalModal,
    closeEditModal,
    saveEditedGoal
};

// Limpiar funciones globales existentes
Object.keys(globalFunctions).forEach(key => {
    if (window[key]) {
        delete window[key];
    }
});

// Asignar nuevas funciones
Object.assign(window, globalFunctions);

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
// Asegurar que showToastMessage esté disponible globalmente
if (typeof window.showToastMessage === 'undefined') {
    window.showToastMessage = showToastMessage;
}

// Cargar datos y renderizar
loadGoalsData();
renderGoals();
initGoalsForm();

console.log('✅ Sistema de Gestión de Metas inicializado correctamente');