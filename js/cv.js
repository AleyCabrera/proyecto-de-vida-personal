// ============================================
// MÓDULO DE CV Y HABILIDADES - INDEPENDIENTE
// ============================================

(function() {
    'use strict';

    // Datos iniciales
    let skillsList = ["Pentesting", "Python", "React", "AWS", "PLC/SCADA"];
    let toolsList = ["Nmap", "Wireshark", "Metasploit", "Kali Linux"];
    
    let currentItemType = null; // 'skill' o 'tool'
    let currentEditIndex = null;

    const CV_STORAGE_KEY = 'aley_cv_data';

    // Función para escapar HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Persistencia
    function saveCVData() {
        const cvData = {
            skills: skillsList,
            tools: toolsList
        };
        localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(cvData));
    }

    function loadCVData() {
        const saved = localStorage.getItem(CV_STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.skills) skillsList = data.skills;
                if (data.tools) toolsList = data.tools;
            } catch (e) {}
        }
    }

    // Toast
    function showCVToast(msg) {
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

    // Estadísticas
    function updateCVStats() {
        const totalSkills = skillsList.length;
        const totalTools = toolsList.length;
        
        const skillsEl = document.getElementById('cvSkillsCount');
        const toolsEl = document.getElementById('cvToolsCount');
        const totalEl = document.getElementById('cvTotalCount');
        
        if (skillsEl) skillsEl.innerText = totalSkills;
        if (toolsEl) toolsEl.innerText = totalTools;
        if (totalEl) totalEl.innerText = totalSkills + totalTools;
    }

    // Renderizado de habilidades
    function renderSkills() {
        const container = document.getElementById('skills-list');
        if (!container) return;
        
        if (skillsList.length === 0) {
            container.innerHTML = `
                <div class="empty-cv">
                    <i class="fas fa-brain"></i>
                    <p>No hay habilidades agregadas</p>
                    <small>Haz clic en "Agregar Habilidad"</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = skillsList.map((skill, index) => `
            <div class="cv-item">
                <span class="cv-item-name"><i class="fas fa-check-circle" style="color:#10b981; font-size:0.7rem;"></i> ${escapeHtml(skill)}</span>
                <button class="cv-item-delete" onclick="window.deleteCVItem('skill', ${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // Renderizado de herramientas
    function renderTools() {
        const container = document.getElementById('tools-list');
        if (!container) return;
        
        if (toolsList.length === 0) {
            container.innerHTML = `
                <div class="empty-cv">
                    <i class="fas fa-tools"></i>
                    <p>No hay herramientas agregadas</p>
                    <small>Haz clic en "Agregar Herramienta"</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = toolsList.map((tool, index) => `
            <div class="cv-item">
                <span class="cv-item-name"><i class="fas fa-wrench" style="color:#f59e0b; font-size:0.7rem;"></i> ${escapeHtml(tool)}</span>
                <button class="cv-item-delete" onclick="window.deleteCVItem('tool', ${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // Renderizado principal
    function renderCV() {
        renderSkills();
        renderTools();
        updateCVStats();
    }

    // Abrir modal para agregar
    function openAddCVModal(type) {
        currentItemType = type;
        currentEditIndex = null;
        
        const modal = document.getElementById('cvModal');
        const titleEl = document.getElementById('cvModalTitle');
        const labelEl = document.getElementById('cvModalLabel');
        
        if (type === 'skill') {
            titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Habilidad';
            labelEl.innerHTML = '<i class="fas fa-brain"></i> Nombre de la habilidad';
        } else {
            titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Herramienta';
            labelEl.innerHTML = '<i class="fas fa-tools"></i> Nombre de la herramienta';
        }
        
        const inputEl = document.getElementById('cvItemName');
        if (inputEl) inputEl.value = '';
        
        if (modal) modal.classList.add('active');
    }

    // Abrir modal para editar
    function openEditCVModal(type, index) {
        currentItemType = type;
        currentEditIndex = index;
        
        const modal = document.getElementById('cvModal');
        const titleEl = document.getElementById('cvModalTitle');
        const labelEl = document.getElementById('cvModalLabel');
        const inputEl = document.getElementById('cvItemName');
        
        let currentValue = '';
        if (type === 'skill') {
            titleEl.innerHTML = '<i class="fas fa-edit"></i> Editar Habilidad';
            labelEl.innerHTML = '<i class="fas fa-brain"></i> Nombre de la habilidad';
            currentValue = skillsList[index];
        } else {
            titleEl.innerHTML = '<i class="fas fa-edit"></i> Editar Herramienta';
            labelEl.innerHTML = '<i class="fas fa-tools"></i> Nombre de la herramienta';
            currentValue = toolsList[index];
        }
        
        if (inputEl) inputEl.value = currentValue;
        if (modal) modal.classList.add('active');
    }

    // Cerrar modal
    function closeCVModal() {
        const modal = document.getElementById('cvModal');
        if (modal) modal.classList.remove('active');
        currentItemType = null;
        currentEditIndex = null;
    }

    // Guardar item
    function saveCVItem() {
        const inputEl = document.getElementById('cvItemName');
        const newValue = inputEl?.value.trim();
        
        if (!newValue) {
            showCVToast('⚠️ El campo no puede estar vacío');
            return;
        }
        
        if (currentEditIndex !== null) {
            // Editar existente
            if (currentItemType === 'skill') {
                skillsList[currentEditIndex] = newValue;
                showCVToast('✏️ Habilidad actualizada');
            } else {
                toolsList[currentEditIndex] = newValue;
                showCVToast('✏️ Herramienta actualizada');
            }
        } else {
            // Agregar nuevo
            if (currentItemType === 'skill') {
                skillsList.push(newValue);
                showCVToast('✅ Habilidad agregada');
            } else {
                toolsList.push(newValue);
                showCVToast('✅ Herramienta agregada');
            }
        }
        
        saveCVData();
        renderCV();
        closeCVModal();
        
        // Notificar actualización
        document.dispatchEvent(new CustomEvent('cvUpdated'));
    }

    // Eliminar item
    function deleteCVItem(type, index) {
        let itemName = '';
        if (type === 'skill') {
            itemName = skillsList[index];
            if (confirm(`¿Eliminar la habilidad "${itemName}"?`)) {
                skillsList.splice(index, 1);
                showCVToast('🗑️ Habilidad eliminada');
            }
        } else {
            itemName = toolsList[index];
            if (confirm(`¿Eliminar la herramienta "${itemName}"?`)) {
                toolsList.splice(index, 1);
                showCVToast('🗑️ Herramienta eliminada');
            }
        }
        
        saveCVData();
        renderCV();
        document.dispatchEvent(new CustomEvent('cvUpdated'));
    }

    // Obtener datos (para main.js)
    function getSkillsList() {
        return skillsList;
    }

    function getToolsList() {
        return toolsList;
    }

    // Inicialización
    function initCVModule() {
        loadCVData();
        renderCV();
        
        // Botones de agregar
        const addSkillBtn = document.getElementById('add-skill-btn');
        const addToolBtn = document.getElementById('add-tool-btn');
        
        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', () => openAddCVModal('skill'));
        }
        if (addToolBtn) {
            addToolBtn.addEventListener('click', () => openAddCVModal('tool'));
        }
        
        // Botón guardar del modal
        const saveBtn = document.getElementById('saveCVBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveCVItem);
        }
        
        // Cerrar modal al hacer clic fuera
        const modal = document.getElementById('cvModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeCVModal();
            });
        }
        
        console.log('✅ Módulo de CV inicializado');
    }

    // Exportar funciones globales
    window.deleteCVItem = deleteCVItem;
    window.openAddCVModal = openAddCVModal;
    window.openEditCVModal = openEditCVModal;
    window.closeCVModal = closeCVModal;
    window.saveCVItem = saveCVItem;
    window.getSkillsList = getSkillsList;
    window.getToolsList = getToolsList;

    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCVModule);
    } else {
        initCVModule();
    }
})();