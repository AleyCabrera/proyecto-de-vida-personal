// ============================================
// MÓDULO DE GESTIÓN DE CERTIFICACIONES
// ============================================

// Evitar conflictos con main.js
if (typeof window.certificationsModuleLoaded === 'undefined') {
    window.certificationsModuleLoaded = true;
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

    let currentEditCertId = null;
    const CERTIFICATIONS_STORAGE_KEY = 'aley_certifications_data';

    function saveCertificationsToLocal() {
        localStorage.setItem(CERTIFICATIONS_STORAGE_KEY, JSON.stringify(certificationsList));
    }

    function loadCertificationsFromLocal() {
        const saved = localStorage.getItem(CERTIFICATIONS_STORAGE_KEY);
        if (saved) {
            certificationsList = JSON.parse(saved);
        }
    }

    function showToast(msg) {
        // Usar la función global si existe
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

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function getLevelBadge(level) {
        const badges = {
            'Fundamentos': '<span class="cert-level-badge level-fundamentos">📘 Fundamentos</span>',
            'Junior': '<span class="cert-level-badge level-junior">📙 Junior</span>',
            'Intermedia': '<span class="cert-level-badge level-intermedia">📕 Intermedia</span>',
            'Senior': '<span class="cert-level-badge level-senior">🚀 Senior</span>',
            'Experto': '<span class="cert-level-badge level-experto">🏆 Experto</span>'
        };
        return badges[level] || '<span class="cert-level-badge">' + level + '</span>';
    }

    function getStatusBadge(status) {
        const badges = {
            'Planificado': '<span class="cert-status-badge status-planned">📋 Planificado</span>',
            'En curso': '<span class="cert-status-badge status-progress">⚡ En curso</span>',
            'Completado': '<span class="cert-status-badge status-completed">✅ Completado</span>'
        };
        return badges[status] || '<span class="cert-status-badge">' + status + '</span>';
    }

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
        
        container.innerHTML = certificationsList.map(cert => `
            <div class="cert-item">
                <div class="cert-header">
                    <div class="cert-title-section">
                        <h4 class="cert-name">${escapeHtml(cert.name)}</h4>
                        <div class="cert-badges">
                            ${getLevelBadge(cert.level)}
                            ${getStatusBadge(cert.status)}
                        </div>
                    </div>
                    <div class="cert-actions">
                        <button class="cert-btn-edit" onclick="window.openEditCertModal(${cert.id})"><i class="fas fa-edit"></i></button>
                        <button class="cert-btn-delete" onclick="window.deleteCertification(${cert.id})"><i class="fas fa-trash"></i></button>
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
                            <button class="btn-update-progress" onclick="window.updateProgress(${cert.id})">Actualizar</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        updateCertStats();
    }

    function updateCertStats() {
        const total = certificationsList.length;
        const completed = certificationsList.filter(c => c.status === 'Completado').length;
        const inProgress = certificationsList.filter(c => c.status === 'En curso').length;
        const planned = certificationsList.filter(c => c.status === 'Planificado').length;
        const avgProgress = certificationsList.length ? Math.round(certificationsList.reduce((s, c) => s + c.progress, 0) / certificationsList.length) : 0;
        
        const totalEl = document.getElementById('certsTotalDisplay');
        const progressEl = document.getElementById('certsProgressCount');
        const plannedEl = document.getElementById('certsPlannedCount');
        const completedEl = document.getElementById('certsCompletedCount');
        const avgEl = document.getElementById('certsAvgProgress');
        
        if (totalEl) totalEl.innerText = total;
        if (progressEl) progressEl.innerText = inProgress;
        if (plannedEl) plannedEl.innerText = planned;
        if (completedEl) completedEl.innerText = completed;
        if (avgEl) avgEl.innerText = avgProgress;
    }

    // ===== FUNCIONES DEL MODAL =====
    function openAddCertModal() {
        currentEditCertId = null;
        const titleEl = document.getElementById('certModalTitle');
        if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Nueva Certificación';
        
        const fields = ['certName', 'certEntity', 'certDescription', 'certStartDate', 'certEndDate', 'certExamCode', 'certCredentialId'];
        fields.forEach(f => { const el = document.getElementById(f); if (el) el.value = ''; });
        
        const levelSelect = document.getElementById('certLevel');
        if (levelSelect) levelSelect.value = 'Fundamentos';
        const statusSelect = document.getElementById('certStatus');
        if (statusSelect) statusSelect.value = 'Planificado';
        const progressInput = document.getElementById('certProgress');
        if (progressInput) progressInput.value = '0';
        
        const modal = document.getElementById('certModal');
        if (modal) modal.classList.add('active');
        console.log('Modal abierto'); // Depuración
    }

    function openEditCertModal(id) {
        const cert = certificationsList.find(c => c.id === id);
        if (!cert) return;
        
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
        if (modal) modal.classList.add('active');
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
        
        if (!name) { showToast('⚠️ El nombre es requerido'); return; }
        if (!entity) { showToast('⚠️ La entidad es requerida'); return; }
        
        if (status === 'Completado') progress = 100;
        
        if (currentEditCertId) {
            const index = certificationsList.findIndex(c => c.id === currentEditCertId);
            if (index !== -1) {
                certificationsList[index] = { ...certificationsList[index], name, entity, level, description, startDate, endDate, status, progress, examCode, credentialId };
                showToast('✏️ Certificación actualizada');
            }
        } else {
            certificationsList.push({ id: Date.now(), name, entity, level, description, startDate, endDate, status, progress, examCode, credentialId });
            showToast('✅ Certificación agregada');
        }
        
        saveCertificationsToLocal();
        renderCertifications();
        closeCertModal();
        
        // Notificar a main.js
        const event = new CustomEvent('certificationsUpdated');
        document.dispatchEvent(event);
    }

    function deleteCertification(id) {
        const cert = certificationsList.find(c => c.id === id);
        if (confirm(`¿Eliminar "${cert?.name}"?`)) {
            certificationsList = certificationsList.filter(c => c.id !== id);
            saveCertificationsToLocal();
            renderCertifications();
            showToast('🗑️ Certificación eliminada');
            
            const event = new CustomEvent('certificationsUpdated');
            document.dispatchEvent(event);
        }
    }

    function updateProgress(id) {
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

    // Inicialización
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
        
        console.log('✅ Módulo de certificaciones inicializado');
    }

    // Exportar funciones globales
    window.openAddCertModal = openAddCertModal;
    window.openEditCertModal = openEditCertModal;
    window.closeCertModal = closeCertModal;
    window.saveCertification = saveCertification;
    window.deleteCertification = deleteCertification;
    window.updateProgress = updateProgress;
    window.renderCertifications = renderCertifications;

    // Iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCertificationsModule);
    } else {
        initCertificationsModule();
    }
}