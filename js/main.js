// ============================================
// MAIN.JS - SISTEMA PRINCIPAL DEPURADO
// (Sin interferencias con módulos independientes)
// ============================================

// Función global para mostrar toast
window.showToastMessageGlobal = function(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
};

// ===== VIDEO MOTIVACIONAL =====
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('motivationalVideoContainer');
    const thumbnail = document.getElementById('videoThumbnail');
    const playBtn = document.getElementById('playButton');

    if (container && thumbnail && playBtn) {
        function loadVideo() {
            if (container.querySelector('iframe')) return;
            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'https://www.youtube.com/embed/aJvOPtYUj1o?autoplay=1&rel=0&modestbranding=1');
            iframe.setAttribute('title', 'Jordi Sierra i Fabra - Leer me salvó la vida');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', true);
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            
            thumbnail.style.opacity = '0';
            playBtn.style.opacity = '0';
            
            setTimeout(() => {
                thumbnail.style.display = 'none';
                playBtn.style.display = 'none';
                container.appendChild(iframe);
            }, 300);
        }
        container.addEventListener('click', loadVideo);
    }
});

// ===== CONFIGURACIÓN HORARIO 24h =====
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

let scheduleMatrix = {};

function initDefaultSchedule() {
    for (let h of hours) scheduleMatrix[h] = Array(7).fill("");
    scheduleMatrix["00:00"] = ["Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep"];
    scheduleMatrix["01:00"] = ["Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep"];
    scheduleMatrix["02:00"] = ["Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep"];
    scheduleMatrix["03:00"] = ["Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep"];
    scheduleMatrix["04:00"] = ["Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep"];
    scheduleMatrix["05:00"] = ["Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep", "Sleep"];
    scheduleMatrix["06:00"] = ["Work", "Work", "Work", "Work", "Work", "Work", ""];
    scheduleMatrix["07:00"] = ["Work", "Work", "Work", "Work", "Programación", "Work", ""];
    scheduleMatrix["08:00"] = ["Work", "Work", "Work", "Work", "Programación", "Work", ""];
    scheduleMatrix["09:00"] = ["Work", "Work", "Work", "Work", "Programación", "Work", ""];
    scheduleMatrix["10:00"] = ["Work", "Work", "Work", "Work", "Programación", "Work", ""];
    scheduleMatrix["11:00"] = ["Work", "Work", "Work", "Work", "Work", "Work", ""];
    scheduleMatrix["12:00"] = ["Work", "Work", "Work", "Work", "Work", "Work", ""];
    scheduleMatrix["13:00"] = ["", "Mant. Máquinas", "", "", "", "Work", ""];
    scheduleMatrix["14:00"] = ["Pensamiento Crítico II", "Mant. Máquinas", "Proy. Integrador I", "", "Work", "Work", ""];
    scheduleMatrix["15:00"] = ["Pensamiento Crítico II", "Mant. Máquinas", "Proy. Integrador I", "", "Work", "Work", ""];
    scheduleMatrix["16:00"] = ["Sostenibilidad", "Mant. Máquinas", "", "", "Work", "Work", ""];
    scheduleMatrix["17:00"] = ["Sostenibilidad", "", "Inst. Controles", "Mant. Máquinas Eléc.", "Work", "Work", ""];
    scheduleMatrix["18:00"] = ["English", "", "Inst. Controles", "Mant. Máquinas Eléc.", "", "", ""];
    scheduleMatrix["19:00"] = ["English", "", "Inst. Controles", "Mant. Máquinas Eléc.", "", "", ""];
    scheduleMatrix["20:00"] = ["English", "", "Inst. Controles", "Mant. Máquinas Eléc.", "", "", ""];
    scheduleMatrix["21:00"] = ["English", "", "", "Mant. Máquinas Eléc.", "", "", ""];
}
initDefaultSchedule();

// Clave para horario en localStorage
const SCHEDULE_STORAGE_KEY = 'aley_schedule_data';

function saveScheduleToLocal() {
    try {
        localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(scheduleMatrix));
        console.log('✅ Horario guardado en localStorage');
    } catch (e) {
        console.error('Error guardando horario:', e);
    }
}

function loadScheduleFromLocal() {
    try {
        const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
        if (saved) {
            scheduleMatrix = JSON.parse(saved);
            console.log('📂 Horario cargado desde localStorage');
        }
    } catch (e) {
        console.error('Error cargando horario:', e);
    }
}

function getCurrentColombiaDateTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * -5));
}

function getCurrentHighlightCell() {
    const colombiaDate = getCurrentColombiaDateTime();
    const dayOfWeek = colombiaDate.getDay();
    let targetCol = -1;
    switch (dayOfWeek) {
        case 1: targetCol = 0; break;
        case 2: targetCol = 1; break;
        case 3: targetCol = 2; break;
        case 4: targetCol = 3; break;
        case 5: targetCol = 4; break;
        case 6: targetCol = 5; break;
        case 0: targetCol = 6; break;
    }
    const currentHour = colombiaDate.getHours();
    const matchedHour = `${String(currentHour).padStart(2, '0')}:00`;
    if (scheduleMatrix[matchedHour] && scheduleMatrix[matchedHour][targetCol] !== undefined) {
        return { dayIndex: targetCol, hourStr: matchedHour };
    }
    return null;
}

let currentEditCell = null;

function renderScheduleTable() {
    const thead = document.getElementById("schedule-head");
    const tbody = document.getElementById("schedule-body");
    if (!thead || !tbody) return;
    thead.innerHTML = "<tr><th>Hora</th>" + days.map(d => `<th>${d}</th>`).join("") + "</tr>";
    const highlight = getCurrentHighlightCell();
    let bodyHtml = "";
    for (let h of hours) {
        bodyHtml += `<tr><td style="font-weight:700; background:#0f172f;">${h}</td>`;
        for (let i = 0; i < 7; i++) {
            let activity = scheduleMatrix[h]?.[i] || "—";
            let isCurrent = (highlight && highlight.hourStr === h && highlight.dayIndex === i);
            let additionalClass = isCurrent ? "current-moment-cell" : "";
            bodyHtml += `<td class="${additionalClass}" data-hour="${h}" data-day="${i}" onclick="openEditModal('${h}', ${i}, '${activity.replace(/'/g, "\\'")}')">${activity}</td>`;
        }
        bodyHtml += "</tr>";
    }
    tbody.innerHTML = bodyHtml;
}

window.openEditModal = function(hour, day, currentActivity) {
    currentEditCell = { hour, dayIndex: day };
    document.getElementById("modalDay").textContent = days[day];
    document.getElementById("modalHour").textContent = hour;
    document.getElementById("activityName").value = currentActivity !== "—" ? currentActivity : "";
    document.getElementById("activityDesc").value = "";

    let selectedType = "personal";
    const lowAct = currentActivity.toLowerCase();
    if (lowAct.includes("work") || lowAct.includes("💼")) selectedType = "work";
    else if (lowAct.includes("📚") || lowAct.includes("estudio") || lowAct.includes("programación") || lowAct.includes("english")) selectedType = "class";
    else if (lowAct.includes("sleep") || lowAct.includes("😴") || lowAct.includes("descanso")) selectedType = "rest";
    else selectedType = "personal";

    document.querySelectorAll(".type-option").forEach(opt => {
        opt.classList.remove("selected");
        if (opt.getAttribute("data-type") === selectedType) opt.classList.add("selected");
    });
    window.selectedType = selectedType;
    document.getElementById("editModal").classList.add("active");
}

function closeModal() {
    document.getElementById("editModal").classList.remove("active");
    currentEditCell = null;
}

function saveActivityFromModal() {
    if (!currentEditCell) return;
    let newAct = document.getElementById("activityName").value.trim();
    if (newAct === "") { window.showToastMessageGlobal("⚠️ Ingresa una actividad"); return; }
    const type = window.selectedType;
    if (type === "work") newAct = "💼 " + newAct;
    else if (type === "class") newAct = "📚 " + newAct;
    else if (type === "rest") newAct = "😴 " + newAct;
    else newAct = "🌟 " + newAct;

    if (!scheduleMatrix[currentEditCell.hour]) scheduleMatrix[currentEditCell.hour] = Array(7).fill("");
    scheduleMatrix[currentEditCell.hour][currentEditCell.dayIndex] = newAct;
    renderScheduleTable();
    saveScheduleToLocal();
    closeModal();
    window.showToastMessageGlobal("✅ Actividad guardada");
}

function deleteCurrentCell() {
    if (!currentEditCell) return;
    if (scheduleMatrix[currentEditCell.hour]) scheduleMatrix[currentEditCell.hour][currentEditCell.dayIndex] = "";
    renderScheduleTable();
    saveScheduleToLocal();
    closeModal();
    window.showToastMessageGlobal("🗑️ Actividad eliminada");
}

function updateDateTimeDisplay() {
    const colombiaDate = getCurrentColombiaDateTime();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Bogota' };
    const displayEl = document.getElementById("currentDateTimeDisplay");
    if (displayEl) {
        displayEl.innerHTML = `<i class="fas fa-calendar-alt"></i> ${colombiaDate.toLocaleDateString('es-CO', options)} <i class="fas fa-map-marker-alt"></i> Colombia`;
    }
}

// ===== CERTIFICACIONES =====
let certificationsList = [
    { name: "Cisco CCNA", entity: "Cisco", level: "Junior", startDate: "2025-01-01", endDate: "2025-06-30", status: "En curso", progress: 40 },
    { name: "AWS Cloud Practitioner", entity: "AWS", level: "Fundamentos", status: "Completado", progress: 100 }
];

// ===== PLAN DE ESTUDIO =====
let studyPlanList = [
    { name: "Maestría Ciberseguridad", institution: "UNIR", duration: "2026-2027", status: "Planificado" }
];

// ===== CV Y HABILIDADES =====
let skillsList = ["Pentesting", "Python", "React", "AWS", "PLC/SCADA"];
let toolsList = ["Nmap", "Wireshark", "Metasploit", "Kali Linux"];

// ===== FUNCIONES DE PERSISTENCIA =====
function saveOtherDataToLocal() {
    const otherData = {
        certifications: certificationsList,
        studyPlan: studyPlanList,
        skills: skillsList,
        tools: toolsList
    };
    localStorage.setItem('aley_other_data', JSON.stringify(otherData));
}

function loadOtherDataFromLocal() {
    const saved = localStorage.getItem('aley_other_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.certifications) certificationsList = data.certifications;
            if (data.studyPlan) studyPlanList = data.studyPlan;
            if (data.skills) skillsList = data.skills;
            if (data.tools) toolsList = data.tools;
        } catch (e) {}
    }
}

// ===== RENDERIZADO DE SECCIONES =====
function renderCertifications() {
    const container = document.getElementById("certifications-list");
    if (container) {
        container.innerHTML = certificationsList.map((c, i) => `
            <div class="tracking-item">
                <div><strong>${escapeHtml(c.name)}</strong><br><small>${c.entity} | ${c.level}</small>
                <div class="progress-bar"><div class="progress-fill" style="width:${c.progress}%"></div></div></div>
                <div>${c.status}<button class="btn-secondary" style="margin-left:12px;" onclick="editCert(${i})">Editar</button></div>
            </div>
        `).join("");
    }
}

function renderStudyPlan() {
    const container = document.getElementById("studyplan-list");
    if (container) {
        container.innerHTML = studyPlanList.map((s, i) => `
            <div class="tracking-item">
                <div><strong>${escapeHtml(s.name)}</strong><br><small>${s.institution} | ${s.duration}</small></div>
                <div>${s.status}<button class="btn-secondary" style="margin-left:12px;" onclick="editStudyPlan(${i})">Editar</button></div>
            </div>
        `).join("");
    }
}

function renderCV() {
    const skillsDiv = document.getElementById("skills-list");
    if (skillsDiv) {
        skillsDiv.innerHTML = skillsList.map((s, i) => `
            <div class="tracking-item" style="margin-bottom:8px;">${escapeHtml(s)}<button class="btn-secondary" style="margin-left:auto;" onclick="removeSkill(${i})">🗑️</button></div>
        `).join("");
    }
    const toolsDiv = document.getElementById("tools-list");
    if (toolsDiv) {
        toolsDiv.innerHTML = toolsList.map((t, i) => `
            <div class="tracking-item" style="margin-bottom:8px;">${escapeHtml(t)}<button class="btn-secondary" style="margin-left:auto;" onclick="removeTool(${i})">🗑️</button></div>
        `).join("");
    }
}

// Home stats
function updateLandingStats() {
    // Los proyectos ahora son manejados por projects-module.js
    // Solo actualizamos certificaciones
    const certsEl = document.getElementById("landing-certs");
    if (certsEl) certsEl.innerText = certificationsList.length;
    
    // El contador de proyectos se actualizará mediante evento
    if (typeof getProjectsList !== 'undefined') {
        const projectsEl = document.getElementById("landing-projects");
        if (projectsEl) projectsEl.innerText = getProjectsList().length;
    }
}

function renderGoalsTimeline() {
    const container = document.getElementById("goals-timeline");
    if (container) {
        container.innerHTML = `
            <div class="tracking-item">🎯 2025: Tecnólogo Software + CCNA</div>
            <div class="tracking-item">🎯 2026-2027: Ingeniería Mecatrónica + Especializaciones</div>
            <div class="tracking-item">🎯 2028-2030: Magíster en Ciberseguridad</div>
            <div class="tracking-item">🎯 2032: Doctorado y CISO</div>
        `;
    }
}

// Función auxiliar escapeHtml
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== FUNCIONES DE EDICIÓN =====
window.editCert = function(i) {
    let newProgress = prompt("Progreso (0-100):", certificationsList[i].progress);
    if (newProgress) {
        certificationsList[i].progress = parseInt(newProgress);
        if (certificationsList[i].progress >= 100) certificationsList[i].status = "Completado";
        renderCertifications();
        saveOtherDataToLocal();
    }
};

window.editStudyPlan = function(i) {
    let newStatus = prompt("Estado:", studyPlanList[i].status);
    if (newStatus) studyPlanList[i].status = newStatus;
    renderStudyPlan();
    saveOtherDataToLocal();
};

window.removeSkill = function(i) {
    skillsList.splice(i, 1);
    renderCV();
    saveOtherDataToLocal();
};

window.removeTool = function(i) {
    toolsList.splice(i, 1);
    renderCV();
    saveOtherDataToLocal();
};

// ===== EVENTOS DE NAVEGACIÓN =====
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"));
        const pageId = `${btn.dataset.page}-page`;
        const pageElement = document.getElementById(pageId);
        if (pageElement) pageElement.classList.add("active-page");
        
        // Renderizar según la página
        if (btn.dataset.page === "schedule") { renderScheduleTable(); updateDateTimeDisplay(); }
        if (btn.dataset.page === "priorities" && typeof renderPriorities !== 'undefined') renderPriorities();
        if (btn.dataset.page === "projects" && typeof renderProjects !== 'undefined') renderProjects();
        if (btn.dataset.page === "certifications") renderCertifications();
        if (btn.dataset.page === "studyplan") renderStudyPlan();
        if (btn.dataset.page === "cv") renderCV();
        if (btn.dataset.page === "home") { updateLandingStats(); renderGoalsTimeline(); }
    });
});

// ===== BOTONES DEL HORARIO =====
const saveScheduleBtn = document.getElementById("save-schedule-btn");
const clearScheduleBtn = document.getElementById("clear-schedule-btn");
const resetScheduleBtn = document.getElementById("reset-schedule-btn");

if (saveScheduleBtn) saveScheduleBtn.addEventListener("click", () => { saveScheduleToLocal(); window.showToastMessageGlobal("✅ Horario guardado"); });
if (clearScheduleBtn) {
    clearScheduleBtn.addEventListener("click", () => {
        if (confirm("¿Eliminar todas las actividades?")) {
            for (let h of hours) scheduleMatrix[h] = Array(7).fill("");
            renderScheduleTable();
            saveScheduleToLocal();
            window.showToastMessageGlobal("Horario limpiado");
        }
    });
}
if (resetScheduleBtn) {
    resetScheduleBtn.addEventListener("click", () => {
        if (confirm("Restaurar horario por defecto?")) {
            initDefaultSchedule();
            renderScheduleTable();
            saveScheduleToLocal();
            window.showToastMessageGlobal("Horario restaurado");
        }
    });
}

// ===== BOTONES DE AGREGAR (excluyendo proyectos que van por separado) =====
const addCertBtn = document.getElementById("add-cert-btn");
const addStudyplanBtn = document.getElementById("add-studyplan-btn");
const addSkillBtn = document.getElementById("add-skill-btn");
const addToolBtn = document.getElementById("add-tool-btn");

if (addCertBtn) {
    addCertBtn.addEventListener("click", () => {
        let name = prompt("Nombre certificación:");
        if (name) certificationsList.push({ name, entity: "Institución", level: "Básico", startDate: "2025-01-01", endDate: "2025-12-31", status: "En curso", progress: 0 });
        renderCertifications();
        saveOtherDataToLocal();
    });
}
if (addStudyplanBtn) {
    addStudyplanBtn.addEventListener("click", () => {
        let name = prompt("Curso/Materia:");
        if (name) studyPlanList.push({ name, institution: "Institución", duration: "2025", status: "Planificado" });
        renderStudyPlan();
        saveOtherDataToLocal();
    });
}
if (addSkillBtn) {
    addSkillBtn.addEventListener("click", () => {
        let skill = prompt("Nueva habilidad:");
        if (skill) { skillsList.push(skill); renderCV(); saveOtherDataToLocal(); }
    });
}
if (addToolBtn) {
    addToolBtn.addEventListener("click", () => {
        let tool = prompt("Nueva herramienta:");
        if (tool) { toolsList.push(tool); renderCV(); saveOtherDataToLocal(); }
    });
}

// ===== MODAL DE HORARIO =====
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const saveModalBtn = document.getElementById("saveModalBtn");
const deleteCellBtn = document.getElementById("deleteCellBtn");
const editModal = document.getElementById("editModal");

if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);
if (saveModalBtn) saveModalBtn.addEventListener("click", saveActivityFromModal);
if (deleteCellBtn) deleteCellBtn.addEventListener("click", deleteCurrentCell);
if (editModal) editModal.addEventListener("click", (e) => { if (e.target === editModal) closeModal(); });

document.querySelectorAll(".type-option").forEach(opt => {
    opt.addEventListener("click", () => {
        document.querySelectorAll(".type-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        window.selectedType = opt.getAttribute("data-type");
    });
});
window.selectedType = "personal";

// ===== ESCUCHAR EVENTOS DE MÓDULOS EXTERNOS =====
document.addEventListener('prioritiesUpdated', (e) => {
    console.log('📢 Prioridades actualizadas recibido en main.js');
    updateLandingStats();
});

document.addEventListener('projectsUpdated', (e) => {
    console.log('📢 Proyectos actualizados recibido en main.js');
    updateLandingStats();
});

// ===== INICIALIZACIÓN =====
loadScheduleFromLocal();
loadOtherDataFromLocal();
renderScheduleTable();
updateDateTimeDisplay();
setInterval(() => { updateDateTimeDisplay(); renderScheduleTable(); }, 10000);

// Renderizar otras secciones
renderCertifications();
renderStudyPlan();
renderCV();
updateLandingStats();
renderGoalsTimeline();