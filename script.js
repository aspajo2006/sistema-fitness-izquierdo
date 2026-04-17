// ─── Datos del sistema ───────────────────────────────────────────────────────

const NIVELES = ["INICIANTE","ESTUDIANTE ACTIVO","GUERRERO F.I.","ATLETA MORALINO","ELITE SALUDABLE"];
const XP_POR_NIVEL = 200;

const TIPS = [
    "Bebe al menos 2 litros de agua al día.",
    "Evita estar sentado más de 2 horas seguidas.",
    "El ejercicio mejora tu concentración en clases.",
    "¡Invita a un compañero de 5to año a entrenar!",
    "Dormir 8 horas mejora tu rendimiento físico.",
    "Comer frutas antes de entrenar te da energía natural.",
    "Estirar después del ejercicio previene lesiones.",
    "Caminar 30 minutos al día reduce el sedentarismo."
];

// Tareas según condición física del usuario
const TAREAS_POR_CONDICION = {
    sedentario: [
        { id:"caminata",   name:"Caminata ligera",        xp:40,  desc:"10 minutos a paso tranquilo",    icon:"fa-walking" },
        { id:"estirar",    name:"Estiramientos básicos",  xp:30,  desc:"5 minutos de elongación suave",  icon:"fa-child" },
        { id:"respirar",   name:"Ejercicios de respiración", xp:20, desc:"Técnica diafragmática 5 min", icon:"fa-lungs" },
    ],
    poco_activo: [
        { id:"movilidad",  name:"Movilidad Articular",    xp:50,  desc:"Calentamiento preventivo 10 min", icon:"fa-running" },
        { id:"circuito1",  name:"Circuito básico",        xp:80,  desc:"15 min ejercicios funcionales",   icon:"fa-dumbbell" },
        { id:"cardio",     name:"Cardio moderado",        xp:60,  desc:"Trote suave 15 minutos",          icon:"fa-heartbeat" },
    ],
    activo: [
        { id:"circuito2",  name:"Circuito de Fuerza",     xp:100, desc:"Ejercicios funcionales 25 min",  icon:"fa-dumbbell" },
        { id:"hiit",       name:"HIIT Express",           xp:120, desc:"20 min alta intensidad",         icon:"fa-bolt" },
        { id:"resistencia",name:"Resistencia muscular",   xp:90,  desc:"Series y repeticiones 20 min",   icon:"fa-medal" },
    ]
};

// Retos semanales automáticos por nivel de XP
const RETOS_SEMANALES = [
    { minXP:0,   title:"Primera semana activo",    desc:"Completa 5 actividades esta semana",       meta:5,  xp:150 },
    { minXP:200, title:"Guerrero en entrenamiento",desc:"Acumula 400 XP en 7 días",                 meta:400,xp:200, tipo:"xp" },
    { minXP:400, title:"Sin un día de descanso",   desc:"Completa al menos 1 actividad por 5 días", meta:5,  xp:250 },
    { minXP:600, title:"Máquina de ejercicio",     desc:"Completa 10 actividades esta semana",      meta:10, xp:300 },
    { minXP:800, title:"Élite del 5to año",        desc:"Completa todas las tareas 5 días seguidos",meta:5,  xp:400 },
];

// Videos por condición / nivel
const VIDEOS = {
    sedentario: [
        { title:"Caminata para principiantes",    id:"b-5vFPBfNqE", desc:"10 min · Nivel básico" },
        { title:"Estiramientos matutinos",        id:"L_xrDAtykMI", desc:"8 min · Sin equipo"    },
        { title:"Yoga suave para sedentarios",    id:"v7AYKMP6rOE", desc:"15 min · Relajante"    },
    ],
    poco_activo: [
        { title:"Rutina de movilidad articular",  id:"g_tea8ZNk5A", desc:"12 min · Todo el cuerpo" },
        { title:"Cardio sin saltar",              id:"ml6cT4AZdqI", desc:"20 min · Moderado"       },
        { title:"Circuito funcional básico",      id:"oAPCPjy99bo", desc:"15 min · Sin equipo"     },
    ],
    activo: [
        { title:"HIIT de 20 minutos",             id:"ml6cT4AZdqI", desc:"20 min · Alta intensidad" },
        { title:"Fuerza funcional completa",      id:"U9kq9qYEfNc", desc:"25 min · Cuerpo completo" },
        { title:"Cardio y resistencia",           id:"cbKkB3POqaY", desc:"20 min · Quema grasa"     },
    ]
};

// Recompensas virtuales
const RECOMPENSAS = [
    { id:"r1", xp:50,   icon:"🥉", title:"Primera actividad",    desc:"Completaste tu primer ejercicio",        color:"#cd7f32" },
    { id:"r2", xp:200,  icon:"🥈", title:"Estudiante Activo",     desc:"Alcanzaste 200 XP",                     color:"#c0c0c0" },
    { id:"r3", xp:400,  icon:"🥇", title:"Guerrero F.I.",         desc:"Alcanzaste 400 XP",                     color:"#ffd700" },
    { id:"r4", xp:600,  icon:"🏆", title:"Atleta Moralino",       desc:"Alcanzaste 600 XP",                     color:"#e63946" },
    { id:"r5", xp:1000, icon:"⚡", title:"Elite Saludable",       desc:"Alcanzaste 1000 XP. ¡Leyenda!",         color:"#9c27b0" },
    { id:"r6", xp:0,    icon:"💧", title:"Hidratación perfecta",  desc:"Registraste 8+ vasos de agua un día",   color:"#2196F3", especial:true },
    { id:"r7", xp:0,    icon:"🔥", title:"Racha de 3 días",       desc:"Activo 3 días consecutivos",            color:"#ff5722", especial:true },
];

// ─── Estado ──────────────────────────────────────────────────────────────────
let currentUser = null;
let userProfile = null;
let stats       = { xp: 0 };

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(message) {
    const t = document.getElementById('toast');
    t.textContent = message;
    t.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('visible'), 3200);
}

// ─── Tareas completadas hoy ───────────────────────────────────────────────────
function getTodayKey()      { return new Date().toISOString().slice(0,10); }
function getCompletedToday(){ return JSON.parse(localStorage.getItem('fi_done_'+getTodayKey())) || []; }
function markTaskDone(id)   { const d=getCompletedToday(); if(!d.includes(id)){d.push(id);localStorage.setItem('fi_done_'+getTodayKey(),JSON.stringify(d));} }
function isTaskDone(id)     { return getCompletedToday().includes(id); }

// ─── Renderizar tareas ────────────────────────────────────────────────────────
function renderTasks(condition) {
    const tareas = TAREAS_POR_CONDICION[condition] || TAREAS_POR_CONDICION['poco_activo'];
    const container = document.getElementById('tasks-container');
    container.innerHTML = tareas.map(t => `
        <button class="task-card ${isTaskDone(t.id)?'task-done':''}"
                data-xp="${t.xp}" data-name="${t.name}" data-task-id="${t.id}">
            <div class="task-info">
                <h4><i class="fas ${t.icon}" style="color:var(--primary);margin-right:6px;"></i>${t.name}</h4>
                <small>${t.desc}</small>
            </div>
            <div class="task-xp">${isTaskDone(t.id)?'✓ Hecho':'+'+t.xp+' XP'}</div>
        </button>
    `).join('');

    container.querySelectorAll('.task-card').forEach(btn => {
        btn.addEventListener('click', () => completeTask(btn));
    });
}

// ─── Completar tarea ──────────────────────────────────────────────────────────
async function completeTask(btn) {
    const id   = btn.dataset.taskId;
    const xp   = parseInt(btn.dataset.xp, 10);
    const name = btn.dataset.name;

    if (isTaskDone(id)) { showToast('Ya completaste "'+name+'" hoy. ¡Vuelve mañana!'); return; }

    stats.xp += xp;
    markTaskDone(id);
    showToast('¡Excelente! +'+xp+' XP por: '+name);
    updateUI();
    await saveXP();
    checkRecompensas();
    updateWeeklyProgress();
}

// ─── Actualizar UI general ────────────────────────────────────────────────────
function updateUI() {
    document.getElementById('points-val').textContent = stats.xp;
    const ni = Math.min(Math.floor(stats.xp/XP_POR_NIVEL), NIVELES.length-1);
    document.getElementById('rank-name').textContent = NIVELES[ni];
    document.getElementById('next-rank').textContent = NIVELES[Math.min(ni+1, NIVELES.length-1)];
    const pct = ((stats.xp % XP_POR_NIVEL) / XP_POR_NIVEL) * 100;
    const bar = document.getElementById('xp-bar');
    bar.style.width = pct+'%';
    bar.closest('[role="progressbar"]').setAttribute('aria-valuenow', Math.round(pct));
}

// ─── Guardar XP en Supabase ───────────────────────────────────────────────────
async function saveXP() {
    if (!currentUser) return;
    await supabaseClient.from('profiles').update({ xp: stats.xp }).eq('id', currentUser.id);
}

// ─── Registro diario ──────────────────────────────────────────────────────────
async function saveLog() {
    const steps   = parseInt(document.getElementById('log-steps').value)   || 0;
    const minutes = parseInt(document.getElementById('log-minutes').value) || 0;
    const water   = parseInt(document.getElementById('log-water').value)   || 0;

    if (!steps && !minutes && !water) { showToast('Ingresa al menos un valor.'); return; }

    const today = getTodayKey();
    if (currentUser) {
        await supabaseClient.from('activity_logs').upsert({
            user_id: currentUser.id,
            date: today,
            steps, minutes_active: minutes, water_glasses: water
        }, { onConflict: 'user_id,date' });
    }

    // Guardar en localStorage también
    localStorage.setItem('fi_log_'+today, JSON.stringify({ steps, minutes, water }));

    // Bonus XP por actividad
    let bonus = 0;
    if (steps   >= 5000) bonus += 30;
    if (minutes >= 30)   bonus += 20;
    if (water   >= 8)  { bonus += 10; unlockRecompensa('r6'); }

    if (bonus > 0) {
        stats.xp += bonus;
        updateUI();
        await saveXP();
        showToast('¡Actividad guardada! +'+bonus+' XP bonus');
    } else {
        showToast('Actividad del día guardada.');
    }

    document.getElementById('log-saved-msg').style.display = 'block';
    checkRacha();
    checkRecompensas();
}

// ─── Reto semanal ─────────────────────────────────────────────────────────────
function getCurrentReto() {
    const ni = Math.min(Math.floor(stats.xp/XP_POR_NIVEL), NIVELES.length-1);
    return RETOS_SEMANALES[Math.min(ni, RETOS_SEMANALES.length-1)];
}

function updateWeeklyProgress() {
    const reto = getCurrentReto();
    const semKey = 'fi_week_'+getWeekKey();
    let progreso = parseInt(localStorage.getItem(semKey)) || 0;

    if (!reto.tipo || reto.tipo !== 'xp') {
        progreso = getCompletedThisWeek();
    } else {
        progreso = stats.xp % 400; // XP acumulado esta semana aprox.
    }

    const pct = Math.min((progreso / reto.meta) * 100, 100);
    document.getElementById('wc-desc').textContent  = reto.desc;
    document.getElementById('wc-xp').textContent    = '+'+reto.xp+' XP';
    document.getElementById('wc-bar').style.width   = pct+'%';
    document.getElementById('wc-progress-label').textContent = progreso+' / '+reto.meta;

    // Días restantes de la semana
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    document.getElementById('wc-deadline').textContent = daysLeft+' días restantes';
}

function getWeekKey() {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    return d.getFullYear()+'W'+Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7);
}

function getCompletedThisWeek() {
    let total = 0;
    for (let i=0; i<7; i++) {
        const d = new Date(); d.setDate(d.getDate()-i);
        const key = 'fi_done_'+d.toISOString().slice(0,10);
        const done = JSON.parse(localStorage.getItem(key)) || [];
        total += done.length;
    }
    return total;
}

// ─── Racha de días ────────────────────────────────────────────────────────────
function checkRacha() {
    let racha = 0;
    for (let i=0; i<7; i++) {
        const d = new Date(); d.setDate(d.getDate()-i);
        const key = 'fi_done_'+d.toISOString().slice(0,10);
        const done = JSON.parse(localStorage.getItem(key)) || [];
        if (done.length > 0) racha++; else break;
    }
    if (racha >= 3) unlockRecompensa('r7');
}

// ─── Recompensas ──────────────────────────────────────────────────────────────
function getUnlockedRecompensas() {
    return JSON.parse(localStorage.getItem('fi_rewards')) || [];
}

function unlockRecompensa(id) {
    const unlocked = getUnlockedRecompensas();
    if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem('fi_rewards', JSON.stringify(unlocked));
        const r = RECOMPENSAS.find(r => r.id === id);
        if (r) showToast('🏆 ¡Nueva recompensa! '+r.title);
        renderRecompensas();
    }
}

function checkRecompensas() {
    RECOMPENSAS.filter(r => !r.especial && r.xp > 0).forEach(r => {
        if (stats.xp >= r.xp) unlockRecompensa(r.id);
    });
}

function renderRecompensas() {
    const unlocked = getUnlockedRecompensas();
    const grid = document.getElementById('rewards-grid');
    grid.innerHTML = RECOMPENSAS.map(r => {
        const got = unlocked.includes(r.id);
        return `
        <div class="reward-card ${got?'unlocked':'locked'}">
            <div class="reward-icon" style="${got?'filter:none':'filter:grayscale(1) opacity(0.3)'}">${r.icon}</div>
            <div class="reward-title" style="${got?'color:'+r.color:''}">${r.title}</div>
            <div class="reward-desc">${r.desc}</div>
            ${!got && !r.especial ? '<div class="reward-xp-req">'+r.xp+' XP requeridos</div>' : ''}
            ${got ? '<div class="reward-badge" style="background:'+r.color+'20;color:'+r.color+'">✓ Obtenida</div>' : ''}
        </div>`;
    }).join('');
}

// ─── Videos guiados ───────────────────────────────────────────────────────────
function renderVideos(condition) {
    const lista = VIDEOS[condition] || VIDEOS['poco_activo'];
    const grid  = document.getElementById('videos-grid');
    grid.innerHTML = lista.map(v => `
        <div class="video-card">
            <div class="video-thumb" onclick="openVideo('${v.id}')">
                <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="${v.title}" loading="lazy">
                <div class="video-play-btn"><i class="fas fa-play"></i></div>
            </div>
            <div class="video-info">
                <p class="video-title">${v.title}</p>
                <small class="video-desc">${v.desc}</small>
            </div>
        </div>
    `).join('');
}

function openVideo(youtubeId) {
    window.open('https://www.youtube.com/watch?v='+youtubeId, '_blank');
}

// ─── Consejo ──────────────────────────────────────────────────────────────────
function showTip() {
    const tip = TIPS[Math.floor(Math.random()*TIPS.length)];
    document.getElementById('tip-text').textContent = tip;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}

// ─── Cargar log del día guardado ─────────────────────────────────────────────
function loadSavedLog() {
    const saved = JSON.parse(localStorage.getItem('fi_log_'+getTodayKey()));
    if (!saved) return;
    document.getElementById('log-steps').value   = saved.steps   || '';
    document.getElementById('log-minutes').value = saved.minutes || '';
    document.getElementById('log-water').value   = saved.water   || '';
    document.getElementById('log-saved-msg').style.display = 'block';
}

// ─── Inicialización ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return; }

    currentUser = session.user;

    const { data: profile } = await supabaseClient
        .from('profiles').select('*').eq('id', currentUser.id).single();

    if (profile) {
        userProfile = profile;
        stats.xp    = profile.xp || 0;
        const genderIcon = profile.gender === 'femenino' ? '👩' : '👦';
        document.getElementById('user-greeting').textContent =
            genderIcon + ' ¡Hola, ' + (profile.full_name || 'Estudiante') + '! Sigue entrenando.';
    }

    document.getElementById('btn-logout').style.display = 'block';
    document.getElementById('btn-logout').addEventListener('click', logout);
    document.getElementById('btn-tip').addEventListener('click', showTip);

    const condition = userProfile?.condition || 'poco_activo';
    const condLabel = { sedentario:'sedentario', poco_activo:'poco activo', activo:'activo' };
    document.getElementById('videos-subtitle').textContent =
        'Seleccionados para tu nivel: '+condLabel[condition];

    renderTasks(condition);
    renderVideos(condition);
    renderRecompensas();
    updateUI();
    updateWeeklyProgress();
    loadSavedLog();
    showTip();
});