// ========== CONFIGURACIÓN HORARIO 24h ==========
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

        // Obtener hora Colombia
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

        // Modal functions
        function openEditModal(hour, day, currentActivity) {
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
            if (newAct === "") { showToastMessage("⚠️ Ingresa una actividad"); return; }
            const type = window.selectedType;
            if (type === "work") newAct = "💼 " + newAct;
            else if (type === "class") newAct = "📚 " + newAct;
            else if (type === "rest") newAct = "😴 " + newAct;
            else newAct = "🌟 " + newAct;

            if (!scheduleMatrix[currentEditCell.hour]) scheduleMatrix[currentEditCell.hour] = Array(7).fill("");
            scheduleMatrix[currentEditCell.hour][currentEditCell.dayIndex] = newAct;
            renderScheduleTable();
            saveAllData();
            closeModal();
            showToastMessage("✅ Actividad guardada");
        }

        function deleteCurrentCell() {
            if (!currentEditCell) return;
            if (scheduleMatrix[currentEditCell.hour]) scheduleMatrix[currentEditCell.hour][currentEditCell.dayIndex] = "";
            renderScheduleTable();
            saveAllData();
            closeModal();
            showToastMessage("🗑️ Actividad eliminada");
        }

        function updateDateTimeDisplay() {
            const colombiaDate = getCurrentColombiaDateTime();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Bogota' };
            document.getElementById("currentDateTimeDisplay").innerHTML = `<i class="fas fa-calendar-alt"></i> ${colombiaDate.toLocaleDateString('es-CO', options)} <i class="fas fa-map-marker-alt"></i> Colombia`;
        }

        function showToastMessage(msg) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }

        // Data storage
        let prioritiesList = [
            { name: "Inglés Técnico", hours: 1, color: "#dc2626" },
            { name: "Redes CCNA", hours: 1, color: "#3b82f6" },
            { name: "Linux LPIC", hours: 1, color: "#f97316" },
            { name: "Python/React", hours: 1, color: "#10b981" },
            { name: "Emprendimiento IoT", hours: 1, color: "#a855f7" }
        ];
        let projectsList = [
            { name: "Auditoría IoT ISO 27002", level: "Pro", area: "Ciberseguridad", status: "En progreso" },
            { name: "Sistema seguridad ESP32", level: "Medio", area: "Hardware", status: "Planificado" }
        ];
        let certificationsList = [
            { name: "Cisco CCNA", entity: "Cisco", level: "Junior", startDate: "2025-01-01", endDate: "2025-06-30", status: "En curso", progress: 40 },
            { name: "AWS Cloud Practitioner", entity: "AWS", level: "Fundamentos", status: "Completado", progress: 100 }
        ];
        let studyPlanList = [
            { name: "Maestría Ciberseguridad", institution: "UNIR", duration: "2026-2027", status: "Planificado" }
        ];
        let skillsList = ["Pentesting", "Python", "React", "AWS", "PLC/SCADA"];
        let toolsList = ["Nmap", "Wireshark", "Metasploit", "Kali Linux"];

        function saveAllData() {
            localStorage.setItem("aley_full_data_v2", JSON.stringify({
                schedule: scheduleMatrix, priorities: prioritiesList, projects: projectsList,
                certifications: certificationsList, studyPlan: studyPlanList, skills: skillsList, tools: toolsList
            }));
        }

        function loadAllData() {
            const saved = localStorage.getItem("aley_full_data_v2");
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.schedule) scheduleMatrix = data.schedule;
                    if (data.priorities) prioritiesList = data.priorities;
                    if (data.projects) projectsList = data.projects;
                    if (data.certifications) certificationsList = data.certifications;
                    if (data.studyPlan) studyPlanList = data.studyPlan;
                    if (data.skills) skillsList = data.skills;
                    if (data.tools) toolsList = data.tools;
                } catch (e) { }
            }
        }

        // Render functions for other pages
        function renderPriorities() {
            const ctx = document.getElementById("priorities-chart")?.getContext('2d');
            if (ctx && window.priorityChart) window.priorityChart.destroy();
            if (ctx) window.priorityChart = new Chart(ctx, { type: 'bar', data: { labels: prioritiesList.map(p => p.name), datasets: [{ label: 'Horas/día', data: prioritiesList.map(p => p.hours), backgroundColor: prioritiesList.map(p => p.color), borderRadius: 12 }] }, options: { responsive: true, plugins: { legend: { labels: { color: 'white' } } } } });
        }

        function renderProjects() { const container = document.getElementById("projects-list"); if (container) container.innerHTML = projectsList.map((p, i) => `<div class="tracking-item"><div><strong>${p.name}</strong><br><small>${p.area} | ${p.level}</small></div><div>${p.status}<button class="btn-secondary" style="margin-left:12px;" onclick="editProject(${i})">Editar</button></div></div>`).join(""); }
        function renderCertifications() { const container = document.getElementById("certifications-list"); if (container) container.innerHTML = certificationsList.map((c, i) => `<div class="tracking-item"><div><strong>${c.name}</strong><br><small>${c.entity} | ${c.level}</small><div class="progress-bar"><div class="progress-fill" style="width:${c.progress}%"></div></div></div><div>${c.status}<button class="btn-secondary" style="margin-left:12px;" onclick="editCert(${i})">Editar</button></div></div>`).join(""); }
        function renderStudyPlan() { const container = document.getElementById("studyplan-list"); if (container) container.innerHTML = studyPlanList.map((s, i) => `<div class="tracking-item"><div><strong>${s.name}</strong><br><small>${s.institution} | ${s.duration}</small></div><div>${s.status}<button class="btn-secondary" style="margin-left:12px;" onclick="editStudyPlan(${i})">Editar</button></div></div>`).join(""); }
        function renderCV() { const skillsDiv = document.getElementById("skills-list"); if (skillsDiv) skillsDiv.innerHTML = skillsList.map((s, i) => `<div class="tracking-item" style="margin-bottom:8px;">${s}<button class="btn-secondary" style="margin-left:auto;" onclick="removeSkill(${i})">🗑️</button></div>`).join(""); const toolsDiv = document.getElementById("tools-list"); if (toolsDiv) toolsDiv.innerHTML = toolsList.map((t, i) => `<div class="tracking-item" style="margin-bottom:8px;">${t}<button class="btn-secondary" style="margin-left:auto;" onclick="removeTool(${i})">🗑️</button></div>`).join(""); }

        window.editProject = function (i) { let newName = prompt("Nombre:", projectsList[i].name); if (newName) projectsList[i].name = newName; renderProjects(); saveAllData(); };
        window.editCert = function (i) { let newProgress = prompt("Progreso (0-100):", certificationsList[i].progress); if (newProgress) { certificationsList[i].progress = parseInt(newProgress); if (certificationsList[i].progress >= 100) certificationsList[i].status = "Completado"; renderCertifications(); saveAllData(); } };
        window.editStudyPlan = function (i) { let newStatus = prompt("Estado:", studyPlanList[i].status); if (newStatus) studyPlanList[i].status = newStatus; renderStudyPlan(); saveAllData(); };
        window.removeSkill = function (i) { skillsList.splice(i, 1); renderCV(); saveAllData(); };
        window.removeTool = function (i) { toolsList.splice(i, 1); renderCV(); saveAllData(); };

        function updateLandingStats() { document.getElementById("landing-projects").innerText = projectsList.length; document.getElementById("landing-certs").innerText = certificationsList.length; }
        function renderGoalsTimeline() { document.getElementById("goals-timeline").innerHTML = `<div class="tracking-item">🎯 2025: Tecnólogo Software + CCNA</div><div class="tracking-item">🎯 2026-2027: Ingeniería Mecatrónica + Especializaciones</div><div class="tracking-item">🎯 2028-2030: Magíster en Ciberseguridad</div><div class="tracking-item">🎯 2032: Doctorado y CISO</div>`; }

        // Event listeners
        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"));
                document.getElementById(`${btn.dataset.page}-page`).classList.add("active-page");
                if (btn.dataset.page === "schedule") { renderScheduleTable(); updateDateTimeDisplay(); }
                if (btn.dataset.page === "priorities") renderPriorities();
                if (btn.dataset.page === "projects") renderProjects();
                if (btn.dataset.page === "certifications") renderCertifications();
                if (btn.dataset.page === "studyplan") renderStudyPlan();
                if (btn.dataset.page === "cv") renderCV();
                if (btn.dataset.page === "home") { updateLandingStats(); renderGoalsTimeline(); }
            });
        });

        document.getElementById("save-schedule-btn")?.addEventListener("click", () => { saveAllData(); showToastMessage("✅ Horario guardado"); });
        document.getElementById("clear-schedule-btn")?.addEventListener("click", () => { if (confirm("¿Eliminar todas las actividades?")) { for (let h of hours) scheduleMatrix[h] = Array(7).fill(""); renderScheduleTable(); saveAllData(); showToastMessage("Horario limpiado"); } });
        document.getElementById("reset-schedule-btn")?.addEventListener("click", () => { if (confirm("Restaurar horario por defecto?")) { initDefaultSchedule(); renderScheduleTable(); saveAllData(); showToastMessage("Horario restaurado"); } });
        document.getElementById("add-priority-btn")?.addEventListener("click", () => { let name = prompt("Nombre:"); if (name) { let hours = parseFloat(prompt("Horas:", 1)); prioritiesList.push({ name, hours: hours || 1, color: "#dc2626" }); renderPriorities(); saveAllData(); } });
        document.getElementById("add-project-btn")?.addEventListener("click", () => { let name = prompt("Nombre proyecto:"); if (name) projectsList.push({ name, level: "Medio", area: "General", status: "Planificado" }); renderProjects(); saveAllData(); });
        document.getElementById("add-cert-btn")?.addEventListener("click", () => { let name = prompt("Nombre certificación:"); if (name) certificationsList.push({ name, entity: "Institución", level: "Básico", startDate: "2025-01-01", endDate: "2025-12-31", status: "En curso", progress: 0 }); renderCertifications(); saveAllData(); });
        document.getElementById("add-studyplan-btn")?.addEventListener("click", () => { let name = prompt("Curso/Materia:"); if (name) studyPlanList.push({ name, institution: "Institución", duration: "2025", status: "Planificado" }); renderStudyPlan(); saveAllData(); });
        document.getElementById("add-skill-btn")?.addEventListener("click", () => { let skill = prompt("Nueva habilidad:"); if (skill) { skillsList.push(skill); renderCV(); saveAllData(); } });
        document.getElementById("add-tool-btn")?.addEventListener("click", () => { let tool = prompt("Nueva herramienta:"); if (tool) { toolsList.push(tool); renderCV(); saveAllData(); } });

        document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
        document.getElementById("cancelModalBtn")?.addEventListener("click", closeModal);
        document.getElementById("saveModalBtn")?.addEventListener("click", saveActivityFromModal);
        document.getElementById("deleteCellBtn")?.addEventListener("click", deleteCurrentCell);
        document.getElementById("editModal")?.addEventListener("click", (e) => { if (e.target === document.getElementById("editModal")) closeModal(); });

        document.querySelectorAll(".type-option").forEach(opt => {
            opt.addEventListener("click", () => {
                document.querySelectorAll(".type-option").forEach(o => o.classList.remove("selected"));
                opt.classList.add("selected");
                window.selectedType = opt.getAttribute("data-type");
            });
        });
        window.selectedType = "personal";

        loadAllData();
        renderScheduleTable();
        updateDateTimeDisplay();
        setInterval(() => { updateDateTimeDisplay(); renderScheduleTable(); }, 10000);

        // Initialize other pages data
        renderPriorities(); renderProjects(); renderCertifications(); renderStudyPlan(); renderCV(); updateLandingStats(); renderGoalsTimeline();