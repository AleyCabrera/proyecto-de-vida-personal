// ============================================
// MÓDULO DE PLAN DE ESTUDIO - VERSIÓN DEFINITIVA
// ============================================

(function() {
    'use strict';
    
    // Función para escapar HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // DATOS INICIALES (con prefijo único)
    let studyPlanData = [
        {
            id: 1,
            name: "Tecnólogo en Análisis y Desarrollo de Software",
            institution: "SENA",
            level: "tecnologo",
            startDate: "2025-01-15",
            endDate: "2026-06-30",
            status: "En curso",
            progress: 45,
            description: "Formación en desarrollo de software, bases de datos y metodologías ágiles"
        },
        {
            id: 2,
            name: "Técnico en Mantenimiento Electrónico Industrial",
            institution: "SENA",
            level: "tecnico",
            startDate: "2025-05-01",
            endDate: "2025-12-15",
            status: "En curso",
            progress: 30,
            description: "Electrónica industrial, PLC, sensores y sistemas de control"
        },
        {
            id: 3,
            name: "Ingeniería Mecatrónica",
            institution: "Universidad Nacional",
            level: "pregrado",
            startDate: "2026-08-01",
            endDate: "2030-06-30",
            status: "Planificado",
            progress: 0,
            description: "Formación integral en mecánica, electrónica y control"
        },
        {
            id: 4,
            name: "Especialización en Ciberseguridad",
            institution: "Universidad",
            level: "especializacion",
            startDate: "2030-08-01",
            endDate: "2031-06-30",
            status: "Planificado",
            progress: 0,
            description: "Seguridad informática, hacking ético y análisis forense"
        },
        {
            id: 5,
            name: "Maestría en Ciberseguridad",
            institution: "Universidad",
            level: "maestria",
            startDate: "2031-08-01",
            endDate: "2033-06-30",
            status: "Planificado",
            progress: 0,
            description: "Especialización avanzada en seguridad digital"
        },
        {
            id: 6,
            name: "Doctorado en Tecnologías de la Información",
            institution: "Universidad",
            level: "doctorado",
            startDate: "2033-08-01",
            endDate: "2036-06-30",
            status: "Planificado",
            progress: 0,
            description: "Investigación en ciberseguridad e inteligencia artificial"
        }
    ];

    // Variables únicas para este módulo
    let studyEditingId = null;
    let studyFilterValue = 'all';
    let studySortField = 'date';
    let studySortOrderValue = 'asc';

    const STUDY_STORAGE_KEY = 'aley_studyplan_data_v2';

    // Persistencia
    function saveStudyData() {
        localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(studyPlanData));
    }

    function loadStudyData() {
        const saved = localStorage.getItem(STUDY_STORAGE_KEY);
        if (saved) {
            studyPlanData = JSON.parse(saved);
        }
    }

    // Toast
    function showStudyMessage(msg) {
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

    // Formateo de fechas
    function formatDateSpanish(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Badges
    function getLevelBadgeStyle(level) {
        const badgesMap = {
            'tecnico': '<span class="study-level-badge level-tecnico">🔧 Técnico</span>',
            'tecnologo': '<span class="study-level-badge level-tecnologo">💻 Tecnólogo</span>',
            'pregrado': '<span class="study-level-badge level-pregrado">🎓 Pregrado</span>',
            'especializacion': '<span class="study-level-badge level-especializacion">📚 Especialización</span>',
            'maestria': '<span class="study-level-badge level-maestria">🏆 Maestría</span>',
            'doctorado': '<span class="study-level-badge level-doctorado">🥇 Doctorado</span>'
        };
        return badgesMap[level] || '<span class="study-level-badge">' + level + '</span>';
    }

    function getStatusBadgeStyle(status) {
        const badgesMap = {
            'Planificado': '<span class="study-status-badge status-planificado">📋 Planificado</span>',
            'En curso': '<span class="study-status-badge status-progreso">⚡ En curso</span>',
            'Completado': '<span class="study-status-badge status-completado">✅ Completado</span>',
            'Pausado': '<span class="study-status-badge status-pausado">⏸️ Pausado</span>'
        };
        return badgesMap[status] || '<span class="study-status-badge">' + status + '</span>';
    }

    // Filtrado y ordenamiento
    function filterStudyItems() {
        let result = [...studyPlanData];
        if (studyFilterValue === 'progress') {
            result = result.filter(item => item.status === 'En curso');
        } else if (studyFilterValue === 'planned') {
            result = result.filter(item => item.status === 'Planificado');
        } else if (studyFilterValue === 'completed') {
            result = result.filter(item => item.status === 'Completado');
        }
        return result;
    }

    function sortStudyItems(items) {
        const sorted = [...items];
        if (studySortField === 'date') {
            sorted.sort((a, b) => {
                const dateA = a.startDate || '9999-12-31';
                const dateB = b.startDate || '9999-12-31';
                return studySortOrderValue === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
            });
        } else if (studySortField === 'level') {
            const levelRank = { 'doctorado': 0, 'maestria': 1, 'especializacion': 2, 'pregrado': 3, 'tecnologo': 4, 'tecnico': 5 };
            sorted.sort((a, b) => {
                const rankA = levelRank[a.level] || 6;
                const rankB = levelRank[b.level] || 6;
                return studySortOrderValue === 'asc' ? rankA - rankB : rankB - rankA;
            });
        } else if (studySortField === 'name') {
            sorted.sort((a, b) => {
                return studySortOrderValue === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            });
        }
        return sorted;
    }

    // Renderizado de filtros
    function renderStudyFilters() {
        const container = document.getElementById('studyplan-list');
        if (!container) return;
        
        const filterBar = document.createElement('div');
        filterBar.className = 'certs-filter-bar';
        filterBar.innerHTML = `
            <div class="filter-group">
                <span class="filter-label"><i class="fas fa-filter"></i> Filtrar:</span>
                <div class="filter-buttons">
                    <button class="filter-chip ${studyFilterValue === 'all' ? 'active' : ''}" data-filter="all">📊 Todos (${studyPlanData.length})</button>
                    <button class="filter-chip ${studyFilterValue === 'progress' ? 'active' : ''}" data-filter="progress">⚡ En curso (${studyPlanData.filter(i => i.status === 'En curso').length})</button>
                    <button class="filter-chip ${studyFilterValue === 'planned' ? 'active' : ''}" data-filter="planned">📋 Planificados (${studyPlanData.filter(i => i.status === 'Planificado').length})</button>
                    <button class="filter-chip ${studyFilterValue === 'completed' ? 'active' : ''}" data-filter="completed">✅ Completados (${studyPlanData.filter(i => i.status === 'Completado').length})</button>
                </div>
            </div>
            <div class="sort-group">
                <span class="filter-label"><i class="fas fa-sort"></i> Ordenar:</span>
                <div class="sort-buttons">
                    <button class="sort-chip ${studySortField === 'date' ? 'active' : ''}" data-sort="date">📅 Fecha</button>
                    <button class="sort-chip ${studySortField === 'level' ? 'active' : ''}" data-sort="level">🎯 Nivel</button>
                    <button class="sort-chip ${studySortField === 'name' ? 'active' : ''}" data-sort="name">🔤 Nombre</button>
                </div>
                <button class="sort-order-btn" id="studyToggleOrderBtn">
                    <i class="fas fa-arrow-${studySortOrderValue === 'asc' ? 'up' : 'down'}"></i>
                    ${studySortOrderValue === 'asc' ? 'Ascendente' : 'Descendente'}
                </button>
            </div>
        `;
        
        const existingBar = container.parentElement.querySelector('.certs-filter-bar');
        if (existingBar) existingBar.remove();
        container.parentElement.insertBefore(filterBar, container);
        
        document.querySelectorAll('.filter-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                studyFilterValue = btn.dataset.filter;
                renderStudyPlanList();
            });
        });
        
        document.querySelectorAll('.sort-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                studySortField = btn.dataset.sort;
                renderStudyPlanList();
            });
        });
        
        const toggleBtn = document.getElementById('studyToggleOrderBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                studySortOrderValue = studySortOrderValue === 'asc' ? 'desc' : 'asc';
                renderStudyPlanList();
            });
        }
    }

    // Renderizado principal
    function renderStudyPlanList() {
        const container = document.getElementById('studyplan-list');
        if (!container) return;
        
        const filtered = filterStudyItems();
        const sorted = sortStudyItems(filtered);
        
        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="empty-studyplan">
                    <i class="fas fa-graduation-cap"></i>
                    <p>No hay estudios planificados</p>
                    <small>Haz clic en "Agregar Estudio" para comenzar</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="timeline-container">
                ${sorted.map(study => `
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <div class="timeline-title-section">
                                <h4 class="timeline-name">${escapeHtml(study.name)}</h4>
                                <div class="timeline-badges">
                                    ${getLevelBadgeStyle(study.level)}
                                    ${getStatusBadgeStyle(study.status)}
                                </div>
                            </div>
                            <div class="timeline-actions">
                                <button class="study-btn-edit" onclick="window.editStudyItem(${study.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="study-btn-delete" onclick="window.deleteStudyItem(${study.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="timeline-body">
                            <div class="timeline-institution">
                                <i class="fas fa-university"></i> ${escapeHtml(study.institution)}
                            </div>
                            ${study.description ? `<p class="timeline-description">${escapeHtml(study.description)}</p>` : ''}
                            <div class="timeline-dates">
                                ${study.startDate ? `<span><i class="fas fa-calendar-alt"></i> Inicio: ${formatDateSpanish(study.startDate)}</span>` : ''}
                                ${study.endDate ? `<span><i class="fas fa-flag-checkered"></i> Fin: ${formatDateSpanish(study.endDate)}</span>` : ''}
                            </div>
                            <div class="study-progress-section">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${study.progress}%"></div>
                                </div>
                                <div class="progress-info">
                                    <span class="progress-text">${study.progress}% completado</span>
                                    <button class="btn-update-progress" onclick="window.updateStudyProgress(${study.id})">Actualizar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        renderStudyFilters();
        updateStudyStats();
    }

    // Estadísticas
    function updateStudyStats() {
        const total = studyPlanData.length;
        const completed = studyPlanData.filter(i => i.status === 'Completado').length;
        const inProgress = studyPlanData.filter(i => i.status === 'En curso').length;
        const planned = studyPlanData.filter(i => i.status === 'Planificado').length;
        
        const elements = {
            studyTotalCount: total,
            studyProgressCount: inProgress,
            studyPlannedCount: planned,
            studyCompletedCount: completed,
            studyTotalDisplay: total
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        }
    }

    // Funciones del MODAL
    function openAddStudyModal() {
        studyEditingId = null;
        const titleEl = document.getElementById('studyModalTitle');
        if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Estudio';
        
        const fields = ['studyName', 'studyInstitution', 'studyDescription', 'studyStartDate', 'studyEndDate'];
        fields.forEach(f => { const el = document.getElementById(f); if (el) el.value = ''; });
        
        const levelSelect = document.getElementById('studyLevel');
        if (levelSelect) levelSelect.value = 'pregrado';
        const statusSelect = document.getElementById('studyStatus');
        if (statusSelect) statusSelect.value = 'Planificado';
        const progressInput = document.getElementById('studyProgress');
        if (progressInput) progressInput.value = '0';
        
        const modal = document.getElementById('studyModal');
        if (modal) modal.classList.add('active');
    }

    function openEditStudyModal(id) {
        const study = studyPlanData.find(i => i.id === id);
        if (!study) return;
        
        studyEditingId = id;
        const titleEl = document.getElementById('studyModalTitle');
        if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit"></i> Editar Estudio';
        
        const nameInput = document.getElementById('studyName');
        if (nameInput) nameInput.value = study.name;
        const institutionInput = document.getElementById('studyInstitution');
        if (institutionInput) institutionInput.value = study.institution;
        const levelSelect = document.getElementById('studyLevel');
        if (levelSelect) levelSelect.value = study.level;
        const descInput = document.getElementById('studyDescription');
        if (descInput) descInput.value = study.description || '';
        const startDateInput = document.getElementById('studyStartDate');
        if (startDateInput) startDateInput.value = study.startDate || '';
        const endDateInput = document.getElementById('studyEndDate');
        if (endDateInput) endDateInput.value = study.endDate || '';
        const statusSelect = document.getElementById('studyStatus');
        if (statusSelect) statusSelect.value = study.status;
        const progressInput = document.getElementById('studyProgress');
        if (progressInput) progressInput.value = study.progress;
        
        const modal = document.getElementById('studyModal');
        if (modal) modal.classList.add('active');
    }

    function closeStudyModal() {
        const modal = document.getElementById('studyModal');
        if (modal) modal.classList.remove('active');
        studyEditingId = null;
    }

    function saveStudyItem() {
        const name = document.getElementById('studyName')?.value.trim();
        const institution = document.getElementById('studyInstitution')?.value.trim();
        const level = document.getElementById('studyLevel')?.value;
        const description = document.getElementById('studyDescription')?.value.trim();
        const startDate = document.getElementById('studyStartDate')?.value;
        const endDate = document.getElementById('studyEndDate')?.value;
        const status = document.getElementById('studyStatus')?.value;
        let progress = parseInt(document.getElementById('studyProgress')?.value) || 0;
        
        if (!name) { showStudyMessage('⚠️ El nombre del estudio es requerido'); return; }
        if (!institution) { showStudyMessage('⚠️ La institución es requerida'); return; }
        
        if (status === 'Completado') progress = 100;
        
        if (studyEditingId) {
            const index = studyPlanData.findIndex(i => i.id === studyEditingId);
            if (index !== -1) {
                studyPlanData[index] = { ...studyPlanData[index], name, institution, level, description, startDate, endDate, status, progress };
                showStudyMessage('✏️ Estudio actualizado');
            }
        } else {
            studyPlanData.push({ id: Date.now(), name, institution, level, description, startDate, endDate, status, progress });
            showStudyMessage('✅ Estudio agregado');
        }
        
        saveStudyData();
        renderStudyPlanList();
        closeStudyModal();
        document.dispatchEvent(new CustomEvent('studyplanUpdated'));
    }

    function deleteStudyItem(id) {
        const study = studyPlanData.find(i => i.id === id);
        if (confirm(`¿Eliminar "${study?.name}"?`)) {
            studyPlanData = studyPlanData.filter(i => i.id !== id);
            saveStudyData();
            renderStudyPlanList();
            showStudyMessage('🗑️ Estudio eliminado');
            document.dispatchEvent(new CustomEvent('studyplanUpdated'));
        }
    }

    function updateStudyProgress(id) {
        const study = studyPlanData.find(i => i.id === id);
        if (!study) return;
        const newProgress = prompt(`Progreso actual: ${study.progress}%`, study.progress);
        if (newProgress !== null) {
            const progress = parseInt(newProgress);
            if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                study.progress = progress;
                if (study.progress >= 100) study.status = 'Completado';
                else if (study.progress > 0 && study.status === 'Planificado') study.status = 'En curso';
                saveStudyData();
                renderStudyPlanList();
                showStudyMessage(`📊 Progreso: ${study.progress}%`);
                document.dispatchEvent(new CustomEvent('studyplanUpdated'));
            }
        }
    }

    // Inicialización
    function initStudyPlan() {
        console.log('🚀 Inicializando Plan de Estudio...');
        loadStudyData();
        renderStudyPlanList();
        
        const addBtn = document.getElementById('add-studyplan-btn');
        if (addBtn) {
            addBtn.addEventListener('click', openAddStudyModal);
        }
        
        const saveBtn = document.getElementById('saveStudyBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveStudyItem);
        }
        
        const modal = document.getElementById('studyModal');
        if (modal) {
            modal.addEventListener('click', (e) => { if (e.target === modal) closeStudyModal(); });
        }
        
        console.log('✅ Plan de Estudio inicializado');
    }

    // Exportar funciones al objeto global window
    window.openAddStudyModal = openAddStudyModal;
    window.editStudyItem = openEditStudyModal;
    window.closeStudyModal = closeStudyModal;
    window.saveStudyItem = saveStudyItem;
    window.deleteStudyItem = deleteStudyItem;
    window.updateStudyProgress = updateStudyProgress;

    // Iniciar módulo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStudyPlan);
    } else {
        initStudyPlan();
    }
})();