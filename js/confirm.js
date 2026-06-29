// ============================================
// MODAL DE CONFIRMACIÓN PERSONALIZADO
// ============================================

// Variables para almacenar la función de callback
let confirmCallback = null;
let confirmCancelCallback = null;

// Función para mostrar el modal de confirmación personalizado
window.showConfirmModal = function(message, onAccept, onCancel) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    
    if (messageEl) messageEl.innerHTML = message;
    
    // Guardar callbacks
    confirmCallback = onAccept;
    confirmCancelCallback = onCancel;
    
    if (modal) modal.classList.add('active');
}

// Cerrar modal de confirmación
window.closeConfirmModal = function() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('active');
    confirmCallback = null;
    confirmCancelCallback = null;
}

// Función para aceptar
function acceptConfirm() {
    if (confirmCallback && typeof confirmCallback === 'function') {
        confirmCallback();
    }
    closeConfirmModal();
}

// Función para cancelar
function cancelConfirm() {
    if (confirmCancelCallback && typeof confirmCancelCallback === 'function') {
        confirmCancelCallback();
    }
    closeConfirmModal();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const acceptBtn = document.getElementById('confirmAcceptBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    
    if (acceptBtn) acceptBtn.addEventListener('click', acceptConfirm);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelConfirm);
});