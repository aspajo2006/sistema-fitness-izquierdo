let stats = JSON.parse(localStorage.getItem('fi_fitness_data')) || { xp: 0 };

const niveles = ["INICIANTE", "ESTUDIANTE ACTIVO", "GUERRERO F.I.", "ATLETA MORALINO", "ELITE SALUDABLE"];

function updateUI() {
    document.getElementById('points-val').innerText = stats.xp;
    
    // Calcular nivel (cada 200 XP)
    let nivelIndex = Math.floor(stats.xp / 200);
    let currentRank = niveles[Math.min(nivelIndex, niveles.length - 1)];
    let nextRank = niveles[Math.min(nivelIndex + 1, niveles.length - 1)];
    
    document.getElementById('rank-name').innerText = currentRank;
    document.getElementById('next-rank').innerText = nextRank;
    
    // Barra de progreso
    let progress = ((stats.xp % 200) / 200) * 100;
    document.getElementById('xp-bar').style.width = progress + "%";
    
    localStorage.setItem('fi_fitness_data', JSON.stringify(stats));
}

function completeTask(xp, name) {
    stats.xp += xp;
    alert(`¡Excelente! Has sumado ${xp} XP por completar: ${name}`);
    updateUI();
}

function showTip() {
    const tips = [
        "Bebe al menos 2 litros de agua al día.",
        "Evita estar sentado más de 2 horas seguidas.",
        "El ejercicio mejora tu concentración en clases.",
        "¡Invita a un compañero de 5to año a entrenar!"
    ];
    alert("CONSEJO: " + tips[Math.floor(Math.random() * tips.length)]);
}

updateUI();