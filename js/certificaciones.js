// ============================================
// MÓDULO DE GESTIÓN DE CERTIFICACIONES - VERSIÓN CON IIFE
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

    // ===== DATOS INICIALES (AHORA SON PRIVADOS) =====
    let certificationsList = [
        {
            id: 1,
            name: "Cisco CCNA",
            entity: "Cisco",
            level: "Junior",
            startDate: "2025-01-01",
            endDate: "2025-06-30",
            status: "En curso",
            progress: 40,
            description: "Certificación en redes y routing/switching",
            examCode: "200-301",
            credentialId: "CSCO-001"
        },
        {
            id: 2,
            name: "AWS Cloud Practitioner",
            entity: "AWS",
            level: "Fundamentos",
            startDate: "2025-02-01",
            endDate: "2025-04-15",
            status: "Completado",
            progress: 100,
            description: "Fundamentos de la nube AWS",
            examCode: "CLF-C02",
            credentialId: "AWS-CP-001"
        }
    ];

    // Variables privadas del módulo
    let currentEditCertId = null;
    let progressEditingId = null;

    const CERTIFICATIONS_STORAGE_KEY = 'aley_certifications_data';

    // ===== PERSISTENCIA =====
    function saveCertificationsToLocal() {
        try {
            localStorage.setItem(CERTIFICATIONS_STORAGE_KEY, JSON.stringify(certificationsList));
        } catch (error) {
            console.error('Error guardando certificaciones:', error);
            showToast('❌ Error al guardar los datos');
        }
    }

    function loadCertificationsFromLocal() {
        try {
            const saved = localStorage.getItem(CERTIFICATIONS_STORAGE_KEY);
            if (saved) {
                certificationsList = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error cargando certificaciones:', error);
        }
    }

    // ===== TOAST (usa la función global si existe) =====
    function showToast(msg) {
        if (typeof window.showToastMessageGlobal === 'function') {
            window.showToastMessageGlobal(msg);
        } else {
            // Eliminar toasts existentes
            document.querySelectorAll('.toast').forEach(t => t.remove());
            
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = msg;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
                setTimeout(() => toast.remove(), 300);
            }, 2500);
        }
    }

    // ===== BADGES =====
    function getLevelBadge(level) {
        const badges = {
            'Fundamentos': '<span class="cert-level-badge level-fundamentos">📘 Fundamentos</span>',
            'Junior': '<span class="cert-level-badge level-junior">📙 Junior</span>',
            'Intermedia': '<span class="cert-level-badge level-intermedia">📕 Intermedia</span>',
            'Senior': '<span class="cert-level-badge level-senior">🚀 Senior</span>',
            'Experto': '<span class="cert-level-badge level-experto">🏆 Experto</span>'
        };
        return badges[level] || `<span class="cert-level-badge">${level}</span>`;
    }

    function getStatusBadge(status) {
        const badges = {
            'Planificado': '<span class="cert-status-badge status-planned">📋 Planificado</span>',
            'En curso': '<span class="cert-status-badge status-progress">⚡ En curso</span>',
            'Completado': '<span class="cert-status-badge status-completed">✅ Completado</span>'
        };
        return badges[status] || `<span class="cert-status-badge">${status}</span>`;
    }

    // ===== RENDERIZADO =====
    function renderCertifications() {
        const container = document.getElementById('certifications-list');
        if (!container) return;
        
        if (certificationsList.length === 0) {
            container.innerHTML = `
                <div class="empty-certifications">
                    <i class="fas fa-certificate"></i>
                    <p>No hay certificaciones agregadas</p>
                    <small>Haz clic en "Agregar Certificación" para comenzar</small>
                </div>
            `;
            return;
        }
        
        // Ordenar por estado (En curso primero, luego Planificado, luego Completado)
        const statusOrder = { 'En curso': 0, 'Planificado': 1, 'Completado': 2 };
        const sortedList = [...certificationsList].sort((a, b) => 
            (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3)
        );
        
        container.innerHTML = sortedList.map(cert => `
            <div class="cert-item" data-id="${cert.id}">
                <div class="cert-header">
                    <div class="cert-title-section">
                        <h4 class="cert-name">${escapeHtml(cert.name)}</h4>
                        <div class="cert-badges">
                            ${getLevelBadge(cert.level)}
                            ${getStatusBadge(cert.status)}
                        </div>
                    </div>
                    <div class="cert-actions">
                        <button class="cert-btn-edit" onclick="window.openEditCertModal(${cert.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="cert-btn-delete" onclick="window.deleteCertification(${cert.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cert-body">
                    <div class="cert-info">
                        <span class="cert-entity"><i class="fas fa-building"></i> ${escapeHtml(cert.entity)}</span>
                        ${cert.description ? `<p class="cert-description">${escapeHtml(cert.description)}</p>` : ''}
                    </div>
                    <div class="cert-dates">
                        ${cert.startDate ? `<span><i class="fas fa-calendar-alt"></i> Inicio: ${formatDate(cert.startDate)}</span>` : ''}
                        ${cert.endDate ? `<span><i class="fas fa-flag-checkered"></i> Fin: ${formatDate(cert.endDate)}</span>` : ''}
                    </div>
                    ${cert.examCode ? `<div class="cert-exam-code"><i class="fas fa-barcode"></i> ${escapeHtml(cert.examCode)}</div>` : ''}
                    ${cert.credentialId ? `<div class="cert-credential-id"><i class="fas fa-id-card"></i> ${escapeHtml(cert.credentialId)}</div>` : ''}
                    <div class="cert-progress-section">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${cert.progress}%"></div>
                        </div>
                        <div class="progress-info">
                            <span class="progress-text">${cert.progress}% completado</span>
                            <button class="btn-update-progress" onclick="window.updateProgress(${cert.id})">
                                <i class="fas fa-chart-line"></i> Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        updateCertStats();
    }

    // ===== ESTADÍSTICAS =====
    function updateCertStats() {
        const total = certificationsList.length;
        const completed = certificationsList.filter(c => c.status === 'Completado').length;
        const inProgress = certificationsList.filter(c => c.status === 'En curso').length;
        const planned = certificationsList.filter(c => c.status === 'Planificado').length;
        const avgProgress = certificationsList.length ? 
            Math.round(certificationsList.reduce((s, c) => s + c.progress, 0) / certificationsList.length) : 0;
        
        const elements = {
            certsTotalDisplay: total,
            certsProgressCount: inProgress,
            certsPlannedCount: planned,
            certsCompletedCount: completed,
            certsAvgProgress: avgProgress
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        });
    }

    // ===== FUNCIONES DEL MODAL PRINCIPAL =====
    function openAddCertModal() {
        currentEditCertId = null;
        const titleEl = document.getElementById('certModalTitle');
        if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Nueva Certificación';
        
        const fields = ['certName', 'certEntity', 'certDescription', 'certStartDate', 'certEndDate', 'certExamCode', 'certCredentialId'];
        fields.forEach(f => { 
            const el = document.getElementById(f); 
            if (el) el.value = ''; 
        });
        
        const levelSelect = document.getElementById('certLevel');
        if (levelSelect) levelSelect.value = 'Fundamentos';
        
        const statusSelect = document.getElementById('certStatus');
        if (statusSelect) statusSelect.value = 'Planificado';
        
        const progressInput = document.getElementById('certProgress');
        if (progressInput) progressInput.value = '0';
        
        const modal = document.getElementById('certModal');
        if (modal) {
            modal.classList.add('active');
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) modalBody.scrollTop = 0;
        }
    }

    function openEditCertModal(id) {
        const cert = certificationsList.find(c => c.id === id);
        if (!cert) {
            showToast('❌ Certificación no encontrada');
            return;
        }
        
        currentEditCertId = id;
        const titleEl = document.getElementById('certModalTitle');
        if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit"></i> Editar Certificación';
        
        const nameInput = document.getElementById('certName');
        if (nameInput) nameInput.value = cert.name;
        
        const entityInput = document.getElementById('certEntity');
        if (entityInput) entityInput.value = cert.entity;
        
        const levelSelect = document.getElementById('certLevel');
        if (levelSelect) levelSelect.value = cert.level;
        
        const descInput = document.getElementById('certDescription');
        if (descInput) descInput.value = cert.description || '';
        
        const startDateInput = document.getElementById('certStartDate');
        if (startDateInput) startDateInput.value = cert.startDate || '';
        
        const endDateInput = document.getElementById('certEndDate');
        if (endDateInput) endDateInput.value = cert.endDate || '';
        
        const statusSelect = document.getElementById('certStatus');
        if (statusSelect) statusSelect.value = cert.status;
        
        const progressInput = document.getElementById('certProgress');
        if (progressInput) progressInput.value = cert.progress;
        
        const examCodeInput = document.getElementById('certExamCode');
        if (examCodeInput) examCodeInput.value = cert.examCode || '';
        
        const credentialIdInput = document.getElementById('certCredentialId');
        if (credentialIdInput) credentialIdInput.value = cert.credentialId || '';
        
        const modal = document.getElementById('certModal');
        if (modal) {
            modal.classList.add('active');
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) modalBody.scrollTop = 0;
        }
    }

    function closeCertModal() {
        const modal = document.getElementById('certModal');
        if (modal) modal.classList.remove('active');
        currentEditCertId = null;
    }

    function saveCertification() {
        const name = document.getElementById('certName')?.value.trim();
        const entity = document.getElementById('certEntity')?.value.trim();
        const level = document.getElementById('certLevel')?.value;
        const description = document.getElementById('certDescription')?.value.trim();
        const startDate = document.getElementById('certStartDate')?.value;
        const endDate = document.getElementById('certEndDate')?.value;
        const status = document.getElementById('certStatus')?.value;
        let progress = parseInt(document.getElementById('certProgress')?.value) || 0;
        const examCode = document.getElementById('certExamCode')?.value.trim();
        const credentialId = document.getElementById('certCredentialId')?.value.trim();
        
        if (!name) { 
            showToast('⚠️ El nombre es requerido'); 
            return; 
        }
        
        if (!entity) { 
            showToast('⚠️ La entidad es requerida'); 
            return; 
        }
        
        if (status === 'Completado') progress = 100;
        
        if (currentEditCertId) {
            const index = certificationsList.findIndex(c => c.id === currentEditCertId);
            if (index !== -1) {
                certificationsList[index] = { 
                    ...certificationsList[index], 
                    name, 
                    entity, 
                    level, 
                    description, 
                    startDate, 
                    endDate, 
                    status, 
                    progress, 
                    examCode, 
                    credentialId 
                };
                showToast('✏️ Certificación actualizada');
            }
        } else {
            certificationsList.push({ 
                id: generateId(), 
                name, 
                entity, 
                level, 
                description, 
                startDate, 
                endDate, 
                status, 
                progress, 
                examCode, 
                credentialId 
            });
            showToast('✅ Certificación agregada');
        }
        
        saveCertificationsToLocal();
        renderCertifications();
        closeCertModal();
        
        const event = new CustomEvent('certificationsUpdated');
        document.dispatchEvent(event);
    }

    // ===== ELIMINAR CERTIFICACIÓN (CON MODAL PERSONALIZADO) =====
    function deleteCertification(id) {
        const cert = certificationsList.find(c => c.id === id);
        if (!cert) return;
        
        // Usar showConfirmModal (ya no hay fallback)
        window.showConfirmModal(
            `¿Estás seguro de eliminar la certificación "${cert.name}"?`,
            () => {
                certificationsList = certificationsList.filter(c => c.id !== id);
                saveCertificationsToLocal();
                renderCertifications();
                showToast('🗑️ Certificación eliminada');
                
                const event = new CustomEvent('certificationsUpdated');
                document.dispatchEvent(event);
            }
        );
    }

    // ===== FUNCIONES DEL MODAL DE PROGRESO =====
    function openProgressModal(id) {
        const cert = certificationsList.find(c => c.id === id);
        if (!cert) {
            showToast('❌ Certificación no encontrada');
            return;
        }
        
        progressEditingId = id;
        
        const nameEl = document.getElementById('progressCertName');
        const currentEl = document.getElementById('progressCurrentValue');
        if (nameEl) nameEl.textContent = cert.name;
        if (currentEl) currentEl.textContent = cert.progress;
        
        const slider = document.getElementById('progressSlider');
        const display = document.getElementById('progressSliderValue');
        if (slider) slider.value = cert.progress;
        if (display) display.textContent = cert.progress;
        
        const commentEl = document.getElementById('progressComment');
        if (commentEl) commentEl.value = '';
        
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.classList.add('active');
            const modalBody = modal.querySelector('.modal-body');
            if (modalBody) modalBody.scrollTop = 0;
        }
    }

    function closeProgressModal() {
        const modal = document.getElementById('progressModal');
        if (modal) modal.classList.remove('active');
        progressEditingId = null;
    }

    function saveProgressUpdate() {
        if (!progressEditingId) return;
        
        const cert = certificationsList.find(c => c.id === progressEditingId);
        if (!cert) {
            showToast('❌ Certificación no encontrada');
            closeProgressModal();
            return;
        }
        
        const slider = document.getElementById('progressSlider');
        const newProgress = slider ? parseInt(slider.value) : 0;
        
        if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
            showToast('⚠️ El progreso debe estar entre 0 y 100');
            return;
        }
        
        cert.progress = newProgress;
        
        if (cert.progress >= 100) {
            cert.status = 'Completado';
            showToast('🏆 ¡Felicidades! Certificación completada');
        } else if (cert.progress > 0 && cert.status === 'Planificado') {
            cert.status = 'En curso';
        }
        
        saveCertificationsToLocal();
        renderCertifications();
        closeProgressModal();
        
        const event = new CustomEvent('certificationsUpdated');
        document.dispatchEvent(event);
        
        showToast(`📊 Progreso actualizado a ${cert.progress}%`);
    }

    // ===== FUNCIÓN UPDATE PROGRESS (PUNTO DE ENTRADA) =====
    function updateProgress(id) {
        const modal = document.getElementById('progressModal');
        if (modal) {
            openProgressModal(id);
        } else {
            // Si el modal no existe, usar prompt como fallback
            const cert = certificationsList.find(c => c.id === id);
            if (!cert) return;
            
            const newProgress = prompt(`Progreso actual: ${cert.progress}%`, cert.progress);
            if (newProgress !== null) {
                const progress = parseInt(newProgress);
                if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                    cert.progress = progress;
                    if (cert.progress >= 100) cert.status = 'Completado';
                    else if (cert.progress > 0 && cert.status === 'Planificado') cert.status = 'En curso';
                    
                    saveCertificationsToLocal();
                    renderCertifications();
                    showToast(`📊 Progreso: ${cert.progress}%`);
                    
                    const event = new CustomEvent('certificationsUpdated');
                    document.dispatchEvent(event);
                }
            }
        }
    }

    // ===== INICIALIZACIÓN DEL MODAL DE PROGRESO =====
    function initProgressModal() {
        const slider = document.getElementById('progressSlider');
        const display = document.getElementById('progressSliderValue');
        
        if (slider) {
            slider.addEventListener('input', () => {
                if (display) display.textContent = slider.value;
            });
        }
        
        document.querySelectorAll('.quick-progress-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseInt(btn.dataset.value);
                if (slider) {
                    slider.value = value;
                    if (display) display.textContent = value;
                }
            });
        });
        
        const saveBtn = document.getElementById('saveProgressBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveProgressUpdate);
        }
        
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeProgressModal();
            });
        }
    }

    // ===== INICIALIZACIÓN PRINCIPAL =====
    function initCertificationsModule() {
        loadCertificationsFromLocal();
        renderCertifications();
        
        const addBtn = document.getElementById('add-cert-btn');
        if (addBtn) {
            addBtn.addEventListener('click', openAddCertModal);
        }
        
        const saveBtn = document.getElementById('saveCertBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveCertification);
        }
        
        const modal = document.getElementById('certModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeCertModal();
            });
        }
        
        initProgressModal();
        
        console.log('✅ Módulo de certificaciones inicializado correctamente');
    }

    // ===== EXPORTAR FUNCIONES GLOBALES =====
    // Solo las funciones que necesitan ser llamadas desde HTML
    window.openAddCertModal = openAddCertModal;
    window.openEditCertModal = openEditCertModal;
    window.closeCertModal = closeCertModal;
    window.saveCertification = saveCertification;
    window.deleteCertification = deleteCertification;
    window.updateProgress = updateProgress;
    window.renderCertifications = renderCertifications;
    window.closeProgressModal = closeProgressModal;

    // ===== INICIAR =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCertificationsModule);
    } else {
        initCertificationsModule();
    }

})(); // <- Fin de la IIFE