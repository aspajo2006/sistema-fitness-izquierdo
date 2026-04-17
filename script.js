// ─── Constantes ──────────────────────────────────────────────────────────────
const NIVELES = [
    "INICIANTE",
    "ESTUDIANTE ACTIVO",
    "GUERRERO F.I.",
    "ATLETA MORALINO",
    "ELITE SALUDABLE"
];

const TIPS = [
    "Bebe al menos 2 litros de agua al día.",
    "Evita estar sentado más de 2 horas seguidas.",
    "El ejercicio mejora tu concentración en clases.",
    "¡Invita a un compañero de 5to año a entrenar!"
];

const XP_POR_NIVEL = 200;

// ─── Estado de sesión ────────────────────────────────────────────────────────
let currentUser = null;
let stats = { xp: 0 };

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ─── Control de tareas completadas por día ────────────────────────────────────
function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function getCompletedToday() {
    const key = 'fi_completed_' + getTodayKey();
    return JSON.parse(localStorage.getItem(key)) || [];
}

function markTaskDone(taskId) {
    const key  = 'fi_completed_' + getTodayKey();
    const done = getCompletedToday();
    if (!done.includes(taskId)) {
        done.push(taskId);
        localStorage.setItem(key, JSON.stringify(done));
    }
}

function isTaskDone(taskId) {
    return getCompletedToday().includes(taskId);
}

// ─── Actualizar UI ────────────────────────────────────────────────────────────
function updateUI() {
    document.getElementById('points-val').textContent = stats.xp;

    const nivelIndex = Math.min(Math.floor(stats.xp / XP_POR_NIVEL), NIVELES.length - 1);
    const nextIndex  = Math.min(nivelIndex + 1, NIVELES.length - 1);

    document.getElementById('rank-name').textContent = NIVELES[nivelIndex];
    document.getElementById('next-rank').textContent = NIVELES[nextIndex];

    const progress = ((stats.xp % XP_POR_NIVEL) / XP_POR_NIVEL) * 100;
    const bar = document.getElementById('xp-bar');
    bar.style.width = progress + '%';
    bar.closest('[role="progressbar"]').setAttribute('aria-valuenow', Math.round(progress));

    refreshTaskButtons();
}

function refreshTaskButtons() {
    document.querySelectorAll('.task-card[data-task-id]').forEach(btn => {
        const taskId = btn.dataset.taskId;
        if (isTaskDone(taskId)) {
            btn.classList.add('task-done');
            btn.setAttribute('aria-disabled', 'true');
            btn.querySelector('.task-xp').textContent = '✓ Hecho';
        } else {
            btn.classList.remove('task-done');
            btn.removeAttribute('aria-disabled');
            btn.querySelector('.task-xp').textContent = '+' + btn.dataset.xp + ' XP';
        }
    });
}

// ─── Guardar XP en Supabase ───────────────────────────────────────────────────
async function saveXP() {
    if (!currentUser) return;
    await supabaseClient
        .from('profiles')
        .update({ xp: stats.xp })
        .eq('id', currentUser.id);
}

// ─── Completar tarea ──────────────────────────────────────────────────────────
async function completeTask(btn) {
    const taskId = btn.dataset.taskId;
    const xp     = parseInt(btn.dataset.xp, 10);
    const name   = btn.dataset.name;

    if (isTaskDone(taskId)) {
        showToast('Ya completaste "' + name + '" hoy. ¡Vuelve mañana!');
        return;
    }

    stats.xp += xp;
    markTaskDone(taskId);
    showToast('¡Excelente! +' + xp + ' XP por: ' + name);
    updateUI();
    await saveXP(); // sincronizar con la base de datos
}

// ─── Consejo ──────────────────────────────────────────────────────────────────
function showTip() {
    const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    showToast('💡 ' + tip);
}

// ─── Logout ───────────────────────────────────────────────────────────────────
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}

// ─── Inicialización ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar sesión activa
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = session.user;

    // Cargar perfil y XP desde Supabase
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('xp, full_name')
        .eq('id', currentUser.id)
        .single();

    if (profile) {
        stats.xp = profile.xp || 0;
        const name = profile.full_name || currentUser.email;
        document.getElementById('user-greeting').textContent = '¡Hola, ' + name + '! Sigue entrenando.';
    }

    // Mostrar botón de salir
    document.getElementById('btn-logout').style.display = 'block';

    // Event listeners
    document.querySelectorAll('.task-card[data-task-id]').forEach(btn => {
        btn.addEventListener('click', () => completeTask(btn));
    });
    document.getElementById('btn-tip').addEventListener('click', showTip);

    updateUI();
});