// ============================================
// MÓDULO DE GESTIÓN DE PROYECTOS - ENCAPSULADO
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

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }

    function generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    function showProjectToast(msg) {
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
    let currentFilter = 'all';
    let currentSortBy = 'status';
    let currentSortOrder = 'asc';
    let currentEditProjectId = null;
    let tempTechnologies = [];

    // ===== DATOS INICIALES =====
    let projectsList = [
        { 
            id: 1, 
            name: "Auditoría IoT ISO 27002", 
            level: "Pro", 
            area: "Ciberseguridad", 
            status: "En progreso",
            description: "Auditoría de seguridad para dispositivos IoT siguiendo estándar ISO 27002",
            startDate: "2025-01-15",
            endDate: "2025-06-30",
            technologies: ["Python", "Nmap", "Wireshark"],
            priority: "alta",
            progress: 65,
            createdAt: "2025-01-10"
        },
        { 
            id: 2, 
            name: "Sistema seguridad ESP32", 
            level: "Medio", 
            area: "Hardware", 
            status: "Planificado",
            description: "Sistema de seguridad perimetral con ESP32, sensores y alertas",
            startDate: "2025-03-01",
            endDate: "2025-08-31",
            technologies: ["C++", "ESP32", "MQTT"],
            priority: "media",
            progress: 0,
            createdAt: "2025-02-15"
        },
        { 
            id: 3, 
            name: "SIEM Lite con Python", 
            level: "Medio", 
            area: "Ciberseguridad", 
            status: "En progreso",
            description: "Sistema de gestión de logs y análisis de seguridad",
            startDate: "2025-02-01",
            endDate: "2025-07-31",
            technologies: ["Python", "Elasticsearch", "Kibana"],
            priority: "alta",
            progress: 45,
            createdAt: "2025-01-20"
        },
        { 
            id: 4, 
            name: "Dashboard IoT Industrial", 
            level: "Pro", 
            area: "IoT", 
            status: "Planificado",
            description: "Dashboard en tiempo real para monitoreo industrial",
            startDate: "2025-04-01",
            endDate: "2025-09-30",
            technologies: ["React", "Node.js", "WebSocket"],
            priority: "media",
            progress: 0,
            createdAt: "2025-03-01"
        }
    ];

    const PROJECTS_STORAGE_KEY = 'aley_projects_data';

    // ===== PERSISTENCIA =====
    function saveProjectsToLocal() {
        try {
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projectsList));
            console.log('✅ Proyectos guardados en localStorage');
        } catch (e) {
            console.error('Error guardando proyectos:', e);
        }
    }

    function loadProjectsFromLocal() {
        try {
            const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    projectsList = parsed;
                    console.log('📂 Proyectos cargados desde localStorage');
                } else if (parsed && parsed.length === 0) {
                    projectsList = [];
                    console.log('📂 Lista de proyectos vacía');
                }
            }
        } catch (e) {
            console.error('Error cargando proyectos:', e);
        }
    }

    // ===== BADGES =====
    function getLevelBadge(level) {
        const badges = {
            'Básico': '<span class="level-badge level-basico">📘 Básico</span>',
            'Medio': '<span class="level-badge level-medio">📙 Medio</span>',
            'Pro': '<span class="level-badge level-pro">🚀 Pro</span>'
        };
        return badges[level] || '<span class="level-badge">📌 ' + level + '</span>';
    }

    function getStatusBadge(status) {
        const badges = {
            'Planificado': '<span class="status-badge status-planificado">📋 Planificado</span>',
            'En progreso': '<span class="status-badge status-progreso">⚡ En progreso</span>',
            'Completado': '<span class="status-badge status-completado">✅ Completado</span>',
            'Pausado': '<span class="status-badge status-pausado">⏸️ Pausado</span>'
        };
        return badges[status] || '<span class="status-badge">' + status + '</span>';
    }

    function getPriorityBadge(priority) {
        const badges = {
            'alta': '<span class="priority-badge priority-alta">🔴 Alta</span>',
            'media': '<span class="priority-badge priority-media">🟡 Media</span>',
            'baja': '<span class="priority-badge priority-baja">🟢 Baja</span>'
        };
        return badges[priority] || '<span class="priority-badge">⚪ Normal</span>';
    }

    function getProgressBar(progress) {
        return `
            <div class="project-progress">
                <div class="progress-bar-small">
                    <div class="progress-fill-small" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${progress}%</span>
            </div>
        `;
    }

    function getDaysRemaining(endDate) {
        if (!endDate) return null;
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    // ===== FILTRADO Y ORDENAMIENTO =====
    function filterProjects() {
        let filtered = [...projectsList];
        
        switch(currentFilter) {
            case 'progress':
                filtered = filtered.filter(p => p.status === 'En progreso');
                break;
            case 'planned':
                filtered = filtered.filter(p => p.status === 'Planificado');
                break;
            case 'completed':
                filtered = filtered.filter(p => p.status === 'Completado');
                break;
            case 'paused':
                filtered = filtered.filter(p => p.status === 'Pausado');
                break;
            default:
                break;
        }
        
        return filtered;
    }

    function sortProjects(projects) {
        const sorted = [...projects];
        
        switch(currentSortBy) {
            case 'status':
                const statusOrder = { 'En progreso': 0, 'Planificado': 1, 'Completado': 2, 'Pausado': 3 };
                sorted.sort((a, b) => {
                    const result = (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
                    return currentSortOrder === 'asc' ? result : -result;
                });
                break;
                
            case 'date':
                sorted.sort((a, b) => {
                    const dateA = a.startDate || a.createdAt || '9999-12-31';
                    const dateB = b.startDate || b.createdAt || '9999-12-31';
                    const result = dateA.localeCompare(dateB);
                    return currentSortOrder === 'asc' ? result : -result;
                });
                break;
                
            case 'level':
                const levelOrder = { 'Pro': 0, 'Medio': 1, 'Básico': 2 };
                sorted.sort((a, b) => {
                    const result = (levelOrder[a.level] || 3) - (levelOrder[b.level] || 3);
                    return currentSortOrder === 'asc' ? result : -result;
                });
                break;
                
            case 'name':
                sorted.sort((a, b) => {
                    const result = a.name.localeCompare(b.name);
                    return currentSortOrder === 'asc' ? result : -result;
                });
                break;
                
            default:
                break;
        }
        
        return sorted;
    }

    // ===== RENDERIZADO =====
    function renderFiltersAndSorting() {
        const container = document.getElementById('projects-list');
        if (!container) return;
        
        const filterBar = document.createElement('div');
        filterBar.className = 'projects-filter-bar';
        filterBar.innerHTML = `
            <div class="filter-group">
                <span class="filter-label"><i class="fas fa-filter"></i> Filtrar:</span>
                <div class="filter-buttons">
                    <button class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">📊 Todos</button>
                    <button class="filter-chip ${currentFilter === 'progress' ? 'active' : ''}" data-filter="progress">⚡ En progreso</button>
                    <button class="filter-chip ${currentFilter === 'planned' ? 'active' : ''}" data-filter="planned">📋 Planificados</button>
                    <button class="filter-chip ${currentFilter === 'completed' ? 'active' : ''}" data-filter="completed">✅ Completados</button>
                    <button class="filter-chip ${currentFilter === 'paused' ? 'active' : ''}" data-filter="paused">⏸️ Pausados</button>
                </div>
            </div>
            <div class="sort-group">
                <span class="filter-label"><i class="fas fa-sort"></i> Ordenar:</span>
                <div class="sort-buttons">
                    <button class="sort-chip ${currentSortBy === 'status' ? 'active' : ''}" data-sort="status">📌 Estado</button>
                    <button class="sort-chip ${currentSortBy === 'date' ? 'active' : ''}" data-sort="date">📅 Fecha inicio</button>
                    <button class="sort-chip ${currentSortBy === 'level' ? 'active' : ''}" data-sort="level">🎯 Nivel</button>
                    <button class="sort-chip ${currentSortBy === 'name' ? 'active' : ''}" data-sort="name">🔤 Nombre</button>
                </div>
                <button class="sort-order-btn" id="toggleSortOrder" title="Cambiar orden">
                    <i class="fas fa-arrow-${currentSortOrder === 'asc' ? 'up' : 'down'}"></i>
                    ${currentSortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                </button>
            </div>
        `;
        
        const existingFilterBar = container.parentElement.querySelector('.projects-filter-bar');
        if (existingFilterBar) existingFilterBar.remove();
        container.parentElement.insertBefore(filterBar, container);
        
        document.querySelectorAll('.filter-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                currentFilter = btn.dataset.filter;
                renderProjectsList();
            });
        });
        
        document.querySelectorAll('.sort-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                currentSortBy = btn.dataset.sort;
                renderProjectsList();
            });
        });
        
        const toggleBtn = document.getElementById('toggleSortOrder');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
                renderProjectsList();
            });
        }
    }

    function renderProjectsList() {
        const container = document.getElementById('projects-list');
        if (!container) return;
        
        let filteredProjects = filterProjects();
        let sortedProjects = sortProjects(filteredProjects);
        
        if (sortedProjects.length === 0) {
            container.innerHTML = `
                <div class="empty-projects">
                    <i class="fas fa-microchip"></i>
                    <p>No hay proyectos ${currentFilter !== 'all' ? 'con este filtro' : 'agregados'}</p>
                    <small>Haz clic en "Nuevo Proyecto" para comenzar</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = sortedProjects.map(project => {
            const daysRemaining = getDaysRemaining(project.endDate);
            const isOverdue = daysRemaining !== null && daysRemaining < 0 && project.status !== 'Completado';
            
            return `
                <div class="project-item" data-id="${project.id}">
                    <div class="project-header">
                        <div class="project-title-section">
                            <h4 class="project-name">
                                ${escapeHtml(project.name)}
                                ${isOverdue ? '<span class="overdue-badge">⏰ Atrasado</span>' : ''}
                            </h4>
                            <div class="project-badges">
                                ${getPriorityBadge(project.priority || 'media')}
                                ${getLevelBadge(project.level)}
                                ${getStatusBadge(project.status)}
                            </div>
                        </div>
                        <div class="project-actions">
                            <button class="project-btn-edit" onclick="window.openEditProjectModal(${project.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="project-btn-delete" onclick="window.deleteProject(${project.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="project-body">
                        <div class="project-info">
                            <span class="project-area"><i class="fas fa-tag"></i> ${escapeHtml(project.area)}</span>
                            ${project.description ? `<p class="project-description">${escapeHtml(project.description)}</p>` : ''}
                        </div>
                        <div class="project-dates">
                            ${project.startDate ? `<span><i class="fas fa-calendar-alt"></i> Inicio: ${formatDate(project.startDate)}</span>` : ''}
                            ${project.endDate ? `<span><i class="fas fa-flag-checkered"></i> Fin: ${formatDate(project.endDate)}${daysRemaining !== null && project.status !== 'Completado' ? ` (${daysRemaining > 0 ? daysRemaining + ' días restantes' : 'Finalizado'})` : ''}</span>` : ''}
                        </div>
                        ${project.status === 'En progreso' ? getProgressBar(project.progress || 0) : ''}
                        ${project.technologies && project.technologies.length > 0 ? `
                            <div class="project-techs">
                                ${project.technologies.map(tech => `<span class="tech-tag">${escapeHtml(tech)}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        renderFiltersAndSorting();
        updateProjectStats();
    }

    // ===== ESTADÍSTICAS =====
    function updateProjectStats() {
        const totalProjects = projectsList.length;
        const inProgress = projectsList.filter(p => p.status === 'En progreso').length;
        const completed = projectsList.filter(p => p.status === 'Completado').length;
        const planned = projectsList.filter(p => p.status === 'Planificado').length;
        const paused = projectsList.filter(p => p.status === 'Pausado').length;
        
        const elements = {
            projectsTotalCount: totalProjects,
            projectsProgressCount: inProgress,
            projectsCompletedCount: completed,
            projectsPlannedCount: planned,
            projectsTotalDisplay: totalProjects
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        });
        
        // Actualizar badges de filtros
        const filterCounts = { all: totalProjects, progress: inProgress, planned: planned, completed: completed, paused: paused };
        document.querySelectorAll('.filter-chip').forEach(btn => {
            const filter = btn.dataset.filter;
            if (filterCounts[filter] !== undefined) {
                const text = btn.textContent.replace(/\(\d+\)/, '').trim();
                btn.textContent = `${text} (${filterCounts[filter]})`;
            }
        });
    }

    // ===== TECNOLOGÍAS =====
    function addTechnologyToList() {
        const techInput = document.getElementById('projectTechInput');
        const tech = techInput?.value.trim();
        if (tech && !tempTechnologies.includes(tech)) {
            tempTechnologies.push(tech);
            renderTechTags();
            techInput.value = '';
        }
    }

    function removeTechnology(index) {
        tempTechnologies.splice(index, 1);
        renderTechTags();
    }

    function renderTechTags() {
        const container = document.getElementById('projectTechList');
        if (!container) return;
        
        if (tempTechnologies.length === 0) {
            container.innerHTML = '<span style="color:#64748b; font-size:0.7rem;">No hay tecnologías agregadas</span>';
            return;
        }
        
        container.innerHTML = tempTechnologies.map((tech, idx) => `
            <span class="tech-tag temp-tag">
                ${escapeHtml(tech)}
                <i class="fas fa-times" onclick="window.removeTechnology(${idx})"></i>
            </span>
        `).join('');
    }

    // ===== FUNCIONES DEL MODAL =====
    function openAddProjectModal() {
        currentEditProjectId = null;
        tempTechnologies = [];
        
        const titleEl = document.getElementById('projectModalTitle');
        if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Nuevo Proyecto';
        
        const fields = ['projectName', 'projectArea', 'projectDescription', 'projectStartDate', 'projectEndDate'];
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el) el.value = '';
        });
        
        const levelSelect = document.getElementById('projectLevel');
        if (levelSelect) levelSelect.value = 'Medio';
        
        const statusSelect = document.getElementById('projectStatus');
        if (statusSelect) statusSelect.value = 'Planificado';
        
        const prioritySelect = document.getElementById('projectPriority');
        if (prioritySelect) prioritySelect.value = 'media';
        
        const progressInput = document.getElementById('projectProgress');
        if (progressInput) progressInput.value = '0';
        
        const techInput = document.getElementById('projectTechInput');
        if (techInput) techInput.value = '';
        
        renderTechTags();
        
        const modal = document.getElementById('projectModal');
        if (modal) modal.classList.add('active');
    }

    function openEditProjectModal(id) {
        const project = projectsList.find(p => p.id === id);
        if (!project) return;
        
        currentEditProjectId = id;
        tempTechnologies = [...(project.technologies || [])];
        
        const titleEl = document.getElementById('projectModalTitle');
        if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit"></i> Editar Proyecto';
        
        const nameInput = document.getElementById('projectName');
        const areaInput = document.getElementById('projectArea');
        const descInput = document.getElementById('projectDescription');
        const startDateInput = document.getElementById('projectStartDate');
        const endDateInput = document.getElementById('projectEndDate');
        const levelSelect = document.getElementById('projectLevel');
        const statusSelect = document.getElementById('projectStatus');
        const prioritySelect = document.getElementById('projectPriority');
        const progressInput = document.getElementById('projectProgress');
        
        if (nameInput) nameInput.value = project.name;
        if (areaInput) areaInput.value = project.area;
        if (descInput) descInput.value = project.description || '';
        if (startDateInput) startDateInput.value = project.startDate || '';
        if (endDateInput) endDateInput.value = project.endDate || '';
        if (levelSelect) levelSelect.value = project.level;
        if (statusSelect) statusSelect.value = project.status;
        if (prioritySelect) prioritySelect.value = project.priority || 'media';
        if (progressInput) progressInput.value = project.progress || 0;
        
        renderTechTags();
        
        const modal = document.getElementById('projectModal');
        if (modal) modal.classList.add('active');
    }

    function closeProjectModal() {
        const modal = document.getElementById('projectModal');
        if (modal) modal.classList.remove('active');
        currentEditProjectId = null;
        tempTechnologies = [];
    }

    function saveProject() {
        const nameInput = document.getElementById('projectName');
        const areaInput = document.getElementById('projectArea');
        const descInput = document.getElementById('projectDescription');
        const startDateInput = document.getElementById('projectStartDate');
        const endDateInput = document.getElementById('projectEndDate');
        const levelSelect = document.getElementById('projectLevel');
        const statusSelect = document.getElementById('projectStatus');
        const prioritySelect = document.getElementById('projectPriority');
        const progressInput = document.getElementById('projectProgress');
        
        const name = nameInput?.value.trim() || '';
        const area = areaInput?.value.trim() || '';
        const description = descInput?.value.trim() || '';
        const startDate = startDateInput?.value || '';
        const endDate = endDateInput?.value || '';
        const level = levelSelect?.value || 'Medio';
        const status = statusSelect?.value || 'Planificado';
        const priority = prioritySelect?.value || 'media';
        let progress = parseInt(progressInput?.value) || 0;
        
        if (!name) {
            showProjectToast('⚠️ El nombre del proyecto es requerido');
            return;
        }
        
        if (!area) {
            showProjectToast('⚠️ El área del proyecto es requerida');
            return;
        }
        
        const technologies = [...tempTechnologies];
        
        if (currentEditProjectId) {
            const index = projectsList.findIndex(p => p.id === currentEditProjectId);
            if (index !== -1) {
                projectsList[index] = {
                    ...projectsList[index],
                    name: name,
                    area: area,
                    description: description,
                    startDate: startDate,
                    endDate: endDate,
                    level: level,
                    status: status,
                    priority: priority,
                    progress: status === 'Completado' ? 100 : progress,
                    technologies: technologies
                };
                showProjectToast('✏️ Proyecto actualizado');
            }
        } else {
            const newId = generateId();
            projectsList.push({
                id: newId,
                name: name,
                area: area,
                description: description,
                startDate: startDate,
                endDate: endDate,
                level: level,
                status: status,
                priority: priority,
                progress: status === 'Completado' ? 100 : progress,
                technologies: technologies,
                createdAt: new Date().toISOString().split('T')[0]
            });
            showProjectToast('✅ Proyecto agregado');
        }
        
        saveProjectsToLocal();
        
        const event = new CustomEvent('projectsUpdated', { detail: { projects: projectsList } });
        document.dispatchEvent(event);
        
        renderProjectsList();
        closeProjectModal();
    }

    // ===== ELIMINAR PROYECTO (CON MODAL PERSONALIZADO) =====
    function deleteProject(id) {
        const project = projectsList.find(p => p.id === id);
        if (!project) return;
        
        if (typeof window.showConfirmModal === 'function') {
            window.showConfirmModal(
                `¿Estás seguro de eliminar el proyecto "${project.name}"?`,
                () => {
                    projectsList = projectsList.filter(p => p.id !== id);
                    saveProjectsToLocal();
                    renderProjectsList();
                    showProjectToast('🗑️ Proyecto eliminado');
                    document.dispatchEvent(new CustomEvent('projectsUpdated'));
                }
            );
        } else {
            // Fallback
            if (confirm(`¿Eliminar el proyecto "${project.name}"?`)) {
                projectsList = projectsList.filter(p => p.id !== id);
                saveProjectsToLocal();
                renderProjectsList();
                showProjectToast('🗑️ Proyecto eliminado');
                document.dispatchEvent(new CustomEvent('projectsUpdated'));
            }
        }
    }

    // ===== FUNCIONES PARA EXPORTAR =====
    function renderProjects() {
        renderProjectsList();
    }

    function getProjectsList() {
        return projectsList;
    }

    function loadProjectsData(data) {
        if (data && Array.isArray(data)) {
            projectsList = data;
            renderProjects();
            saveProjectsToLocal();
        }
    }

    // ===== INICIALIZACIÓN =====
    function initProjectsModule() {
        console.log('🚀 Inicializando módulo de proyectos...');
        loadProjectsFromLocal();
        renderProjects();
        
        // Botón agregar proyecto
        const addBtn = document.getElementById('add-project-btn');
        if (addBtn) {
            addBtn.addEventListener('click', openAddProjectModal);
        }
        
        // Botón guardar
        const saveBtn = document.getElementById('saveProjectBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveProject);
        }
        
        // Botón agregar tecnología
        const addTechBtn = document.getElementById('addTechBtn');
        if (addTechBtn) {
            addTechBtn.addEventListener('click', addTechnologyToList);
        }
        
        // Enter en input de tecnología
        const techInput = document.getElementById('projectTechInput');
        if (techInput) {
            techInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTechnologyToList();
                }
            });
        }
        
        // Cerrar modal al hacer clic fuera
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeProjectModal();
            });
        }
        
        console.log('✅ Módulo de proyectos inicializado correctamente');
    }

    // ===== EXPORTAR FUNCIONES GLOBALES =====
    window.openAddProjectModal = openAddProjectModal;
    window.openEditProjectModal = openEditProjectModal;
    window.closeProjectModal = closeProjectModal;
    window.saveProject = saveProject;
    window.deleteProject = deleteProject;
    window.renderProjects = renderProjects;
    window.getProjectsList = getProjectsList;
    window.loadProjectsData = loadProjectsData;
    window.addTechnologyToList = addTechnologyToList;
    window.removeTechnology = removeTechnology;
    window.renderProjectsList = renderProjectsList;

    // ===== INICIAR =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectsModule);
    } else {
        initProjectsModule();
    }
})();