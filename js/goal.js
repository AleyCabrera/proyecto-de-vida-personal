// ===== SISTEMA DE GESTIÓN DE METAS =====
let goalsList = [];      // Metas activas
let completedGoals = []; // Metas completadas (historial)
let currentEditId = null;

// ===== DATOS INICIALES CON AÑOS ORDENADOS =====
function loadGoalsData() {
    const savedGoals = localStorage.getItem('aley_goals_active');
    const savedCompleted = localStorage.getItem('aley_goals_completed');
    
    if (savedGoals) {
        goalsList = JSON.parse(savedGoals);
    } else {
        // Metas de ejemplo iniciales (ya ordenadas cronológicamente)
        goalsList = [
            { id: Date.now() + 1, title: "Completar Tecnólogo en Software", year: "2025", description: "Finalizar el programa con éxito y obtener el título", completed: false, completedDate: null, createdAt: new Date().toISOString() },
            { id: Date.now() + 2, title: "Obtener certificación CCNA", year: "2025", description: "Cisco Certified Network Associate", completed: false, completedDate: null, createdAt: new Date().toISOString() },
            { id: Date.now() + 3, title: "Comenzar Ingeniería Mecatrónica", year: "2026", description: "Iniciar la carrera universitaria", completed: false, completedDate: null, createdAt: new Date().toISOString() },
            { id: Date.now() + 4, title: "Especialización en Automatización", year: "2027", description: "Profundizar en control industrial", completed: false, completedDate: null, createdAt: new Date().toISOString() },
            { id: Date.now() + 5, title: "Finalizar Maestría en Ciberseguridad", year: "2030", description: "Obtener el título de magíster", completed: false, completedDate: null, createdAt: new Date().toISOString() },
            { id: Date.now() + 6, title: "Alcanzar posición CISO", year: "2032", description: "Chief Information Security Officer en empresa tecnológica", completed: false, completedDate: null, createdAt: new Date().toISOString() },
            { id: Date.now() + 7, title: "Doctorado en Tecnologías de la Información", year: "2035", description: "Investigación en ciberseguridad avanzada", completed: false, completedDate: null, createdAt: new Date().toISOString() }
        ];
    }
    
    if (savedCompleted) {
        completedGoals = JSON.parse(savedCompleted);
    } else {
        completedGoals = [];
    }
}

// Guardar datos en localStorage
function saveGoalsData() {
    localStorage.setItem('aley_goals_active', JSON.stringify(goalsList));
    localStorage.setItem('aley_goals_completed', JSON.stringify(completedGoals));
}

// Renderizar listas de metas
function renderGoals() {
    const activeContainer = document.getElementById('activeGoalsList');
    const completedContainer = document.getElementById('completedGoalsList');
    const completedCountSpan = document.getElementById('completedCount');
    
    if (!activeContainer) return;
    
    // Renderizar metas activas
    if (goalsList.length === 0) {
        activeContainer.innerHTML = '<div class="empty-goals"><i class="fas fa-smile-wink"></i> ¡No hay metas activas! Agrega una nueva meta para comenzar.</div>';
    } else {
        activeContainer.innerHTML = goalsList.map(goal => `
            <div class="goal-item" data-id="${goal.id}">
                <input type="checkbox" class="goal-check" onchange="toggleGoalComplete(${goal.id})" ${goal.completed ? 'checked' : ''}>
                <div class="goal-content">
                    <span class="goal-year">🎯 ${goal.year}</span>
                    <div class="goal-title">${escapeHtml(goal.title)}</div>
                    ${goal.description ? `<div class="goal-description">${escapeHtml(goal.description)}</div>` : ''}
                </div>
                <div class="goal-actions">
                    <button class="goal-btn-edit" onclick="openEditGoalModal(${goal.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="goal-btn-delete" onclick="deleteGoal(${goal.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Renderizar metas completadas
    if (completedGoals.length === 0) {
        completedContainer.innerHTML = '<div class="empty-goals" style="text-align:left;"><i class="fas fa-history"></i> Aún no hay metas completadas. ¡Tú puedes lograrlas!</div>';
        if (completedCountSpan) completedCountSpan.textContent = '0';
    } else {
        completedContainer.innerHTML = completedGoals.map(goal => `
            <div class="completed-item">
                <div>
                    <div class="goal-title">✓ ${escapeHtml(goal.title)}</div>
                    <div class="goal-description">🎯 ${goal.year} — ${goal.description || 'Meta cumplida'}</div>
                    <div class="completed-date">✅ Completada: ${goal.completedDate || 'Fecha registrada'}</div>
                </div>
                <button class="btn-restore" onclick="restoreGoal(${goal.id})">
                    <i class="fas fa-undo"></i> Restaurar
                </button>
            </div>
        `).join('');
        if (completedCountSpan) completedCountSpan.textContent = completedGoals.length;
    }
}

// Escapar HTML para seguridad
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== FUNCIÓN DE ORDENAMIENTO CRONOLÓGICO =====
// Función para extraer año numérico (maneja casos como "2033+")
function extractYearNumber(yearStr) {
    if (!yearStr) return 9999;
    // Extraer el primer número del string (ej: "2033+" -> 2033)
    const match = yearStr.match(/\d+/);
    if (match) {
        return parseInt(match[0]);
    }
    return 9999;
}

// Ordenar metas de forma cronológica (más cercano a más lejano)
function sortGoalsByYear(goals) {
    return [...goals].sort((a, b) => {
        const yearA = extractYearNumber(a.year);
        const yearB = extractYearNumber(b.year);
        return yearA - yearB; // Ascendente: 2025, 2026, 2027...
    });
}

// Ordenar historial de logros (más recientemente completados primero)
function sortCompletedByDate(completed) {
    return [...completed].sort((a, b) => {
        if (!a.completedDate && !b.completedDate) return 0;
        if (!a.completedDate) return 1;
        if (!b.completedDate) return -1;
        // Orden descendente (los más nuevos primero)
        return new Date(b.completedDate) - new Date(a.completedDate);
    });
}

// ===== FUNCIONES DE RENDERIZADO ACTUALIZADAS =====
// Renderizar listas de metas (con ordenamiento automático)
function renderGoals() {
    const activeContainer = document.getElementById('activeGoalsList');
    const completedContainer = document.getElementById('completedGoalsList');
    const completedCountSpan = document.getElementById('completedCount');
    
    if (!activeContainer) return;
    
    // Ordenar metas activas cronológicamente
    const sortedActiveGoals = sortGoalsByYear(goalsList);
    
    // Renderizar metas activas
    if (sortedActiveGoals.length === 0) {
        activeContainer.innerHTML = '<div class="empty-goals"><i class="fas fa-smile-wink"></i> ¡No hay metas activas! Agrega una nueva meta para comenzar.</div>';
    } else {
        activeContainer.innerHTML = sortedActiveGoals.map(goal => `
            <div class="goal-item" data-id="${goal.id}">
                <input type="checkbox" class="goal-check" onchange="toggleGoalComplete(${goal.id})" ${goal.completed ? 'checked' : ''}>
                <div class="goal-content">
                    <span class="goal-year">🎯 ${goal.year}</span>
                    <div class="goal-title">${escapeHtml(goal.title)}</div>
                    ${goal.description ? `<div class="goal-description">${escapeHtml(goal.description)}</div>` : ''}
                </div>
                <div class="goal-actions">
                    <button class="goal-btn-edit" onclick="openEditGoalModal(${goal.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="goal-btn-delete" onclick="deleteGoal(${goal.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Ordenar historial por fecha de completado (más reciente primero)
    const sortedCompleted = sortCompletedByDate(completedGoals);
    
    // Renderizar metas completadas
    if (sortedCompleted.length === 0) {
        completedContainer.innerHTML = '<div class="empty-goals" style="text-align:left;"><i class="fas fa-history"></i> Aún no hay metas completadas. ¡Tú puedes lograrlas!</div>';
        if (completedCountSpan) completedCountSpan.textContent = '0';
    } else {
        completedContainer.innerHTML = sortedCompleted.map(goal => `
            <div class="completed-item">
                <div>
                    <div class="goal-title">✓ ${escapeHtml(goal.title)}</div>
                    <div class="goal-description">🎯 ${goal.year} — ${goal.description || 'Meta cumplida'}</div>
                    <div class="completed-date">✅ Completada: ${goal.completedDate || 'Fecha registrada'}</div>
                </div>
                <button class="btn-restore" onclick="restoreGoal(${goal.id})">
                    <i class="fas fa-undo"></i> Restaurar
                </button>
            </div>
        `).join('');
        if (completedCountSpan) completedCountSpan.textContent = sortedCompleted.length;
    }
}

// ===== FUNCIÓN DE AGREGAR META ACTUALIZADA (con ordenamiento automático) =====
function addGoal(title, year, description) {
    if (!title.trim()) {
        showToastMessage('⚠️ El título de la meta es requerido');
        return false;
    }
    
    const newGoal = {
        id: Date.now(),
        title: title.trim(),
        year: year,
        description: description.trim() || '',
        completed: false,
        completedDate: null,
        createdAt: new Date().toISOString() // Guardar fecha de creación
    };
    
    goalsList.push(newGoal);
    saveGoalsData();
    renderGoals(); // El renderizado automáticamente ordenará
    showToastMessage('🎯 Meta agregada exitosamente');
    return true;
}

// ===== FUNCIÓN PARA ALTERNAR COMPLETADO (con orden en historial) =====
function toggleGoalComplete(goalId) {
    const goalIndex = goalsList.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
        const goal = goalsList[goalIndex];
        if (!goal.completed) {
            // Mover a completadas
            goal.completed = true;
            goal.completedDate = new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            completedGoals.unshift(goal); // Agregar al inicio del historial
            goalsList.splice(goalIndex, 1);
            showToastMessage('🏆 ¡Felicidades! Has cumplido una meta');
        }
        saveGoalsData();
        renderGoals(); // El renderizado ordenará automáticamente
    }
}

// Restaurar meta desde completadas
function restoreGoal(goalId) {
    const goalIndex = completedGoals.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
        const goal = completedGoals[goalIndex];
        goal.completed = false;
        goal.completedDate = null;
        goalsList.push(goal);
        completedGoals.splice(goalIndex, 1);
        saveGoalsData();
        renderGoals();
        showToastMessage('🔄 Meta restaurada a activas');
    }
}

// Eliminar meta permanentemente
function deleteGoal(goalId) {
    if (confirm('¿Estás seguro de eliminar esta meta? Esta acción no se puede deshacer.')) {
        goalsList = goalsList.filter(g => g.id !== goalId);
        saveGoalsData();
        renderGoals();
        showToastMessage('🗑️ Meta eliminada');
    }
}

// Limpiar todo el historial de metas completadas
function clearCompletedHistory() {
    if (completedGoals.length > 0 && confirm('¿Eliminar todo el historial de metas completadas? Esta acción no se puede deshacer.')) {
        completedGoals = [];
        saveGoalsData();
        renderGoals();
        showToastMessage('📜 Historial limpiado');
    }
}



// Abrir modal para editar meta
let currentEditingGoalId = null;

function openEditGoalModal(goalId) {
    const goal = goalsList.find(g => g.id === goalId);
    if (!goal) return;
    
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
    if (!currentEditingGoalId) return;
    
    const goalIndex = goalsList.findIndex(g => g.id === currentEditingGoalId);
    if (goalIndex !== -1) {
        const newTitle = document.getElementById('editGoalTitle').value.trim();
        if (!newTitle) {
            showToastMessage('⚠️ El título no puede estar vacío');
            return;
        }
        
        goalsList[goalIndex].title = newTitle;
        goalsList[goalIndex].year = document.getElementById('editGoalYear').value;
        goalsList[goalIndex].description = document.getElementById('editGoalDescription').value;
        
        saveGoalsData();
        renderGoals();
        closeEditModal();
        showToastMessage('✏️ Meta actualizada');
    }
}

// Inicializar formulario de nueva meta
function initGoalsForm() {
    const form = document.getElementById('newGoalForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('goalTitle').value;
            const year = document.getElementById('goalYear').value;
            const description = document.getElementById('goalDescription').value;
            
            if (addGoal(title, year, description)) {
                form.reset();
            }
        });
    }
    
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearCompletedHistory);
    }
    
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditedGoal);
    }
}

// Cargar datos al iniciar
loadGoalsData();
renderGoals();
initGoalsForm();

// Función auxiliar para mostrar toast (si no existe, crearla)
if (typeof showToastMessage !== 'function') {
    window.showToastMessage = function(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };
}

// Exportar funciones globales para los onclick
window.toggleGoalComplete = toggleGoalComplete;
window.deleteGoal = deleteGoal;
window.restoreGoal = restoreGoal;
window.openEditGoalModal = openEditGoalModal;
window.closeEditModal = closeEditModal;
window.saveEditedGoal = saveEditedGoal;