/* Cálculo de Riesgo de Cáncer y Longevidad — versión vanilla JS con Compartición de Imagen nativa (Corregido) */
(function () {
  "use strict";

  const DEPARTAMENTOS = ["Ahuachapán","Santa Ana","Sonsonate","Chalatenango","La Libertad","San Salvador","Cuscatlán","La Paz","Cabañas","San Vicente","Usulután","San Miguel","Morazán","La Unión"];
  const DEPTOS_RURALES_AGRICOLAS = new Set(["Ahuachapán","Chalatenango","Cabañas","Morazán","La Unión","Usulután","San Vicente"]);

  const QUESTIONS = [
    { id:"genero", label:"¿Cuál es tu sexo?", type:"choice",
      options:[{label:"Femenino",value:"F"},{label:"Masculino",value:"M"}],
      micro:"La prevalencia varía por sexo; según la Política Nacional de Cáncer 2026, el cáncer de mama lidera en mujeres (26.99%) y el de próstata en hombres (13.52%)." },
    { id:"edad", label:"¿Cuántos años tienes?", type:"number", min:1, max:110,
      micro:"El envejecimiento celular es el principal factor de riesgo biológico para el desarrollo de mutaciones oncológicas acumulativas (Fuente: GLOBOCAN)." },
    { id:"actividad", label:"¿Cómo describirías tu actividad física?", type:"choice",
      options:[{label:"Sedentaria",value:"sedentaria"},{label:"Moderada",value:"moderada"},{label:"Activa",value:"activa"}],
      micro:"El sedentarismo crónico incrementa significativamente el riesgo de padecer tumores colorrectales y de mama (Fuente: OPS/OMS)." },
    { id:"tabaco", label:"¿Consumes tabaco?", type:"choice",
      options:[
        {label:"No fumo",value:"no",desc:"No consumo tabaco ni estoy expuesto al humo de otros."},
        {label:"Fumador pasivo",value:"pasivo",desc:"No fumo directamente, pero estoy expuesto al humo de tabaco de personas a mi alrededor (familia, trabajo o espacios cerrados)."},
        {label:"Ocasional",value:"ocasional",desc:"Fumo de forma esporádica, en reuniones sociales o pocas veces al mes."},
        {label:"Frecuente",value:"frecuente",desc:"Fumo diariamente o varias veces por semana."},
      ],
      micro:"El tabaquismo (activo y pasivo) es causante de más del 20% de las muertes globales por enfermedades oncológicas (Fuente: PAHO Burden of Cancer)." },
    { id:"vapeo", label:"¿Usas cigarrillos electrónicos (vapeo)?", type:"choice",
      options:[{label:"No vapeo",value:"no"},{label:"Uso ocasional",value:"ocasional"},{label:"Uso frecuente",value:"frecuente"}],
      micro:"Los aerosoles del vapeo liberan formaldehído y metales pesados que inducen inflamación crónica y daño directo al ADN (Fuente: OPS/OMS)." },
    { id:"alcohol", label:"¿Cuál es tu consumo de alcohol?", type:"choice",
      options:[
        {label:"Nulo",value:"nulo",desc:"No consumo bebidas alcohólicas."},
        {label:"Bajo consumo",value:"bajo",desc:"1 a 2 tragos por semana, de forma esporádica (ej. una copa de vino o una cerveza en eventos sociales)."},
        {label:"Moderado",value:"moderado",desc:"3 a 7 tragos por semana, habitualmente los fines de semana."},
        {label:"Alto",value:"alto",desc:"Más de 7 tragos por semana o episodios frecuentes de consumo intenso."},
      ],
      micro:"El alcohol actúa como un solvente celular que facilita la penetración de agentes carcinógenos externos (Fuente: PAHO Open Data)." },
    { id:"antecedentes", label:"¿Tienes antecedentes familiares de cáncer?", type:"choice",
      options:[
        {label:"Sin antecedentes",value:"no"},
        {label:"Familiar de primer grado con historial de cáncer",value:"si",desc:"Padre, madre, hermano/a o hijo/a con diagnóstico de cáncer."},
        {label:"Familiar de segundo o tercer grado con historial de cáncer",value:"segundo_tercer",desc:"Abuelo/a, tío/a, primo/a o sobrino/a con diagnóstico de cáncer."},
      ],
      micro:"El componente hereditario directo eleva el riesgo relativo, demandando tamizajes médicos a menor edad (Fuente: Política Nacional 2026)." },
    { id:"zona", label:"¿En qué zona resides?", type:"choice",
      options:[{label:"Urbana",value:"urbana"},{label:"Rural",value:"rural"}],
      micro:"Ciertas regiones presentan perfiles de riesgo específicos debido a la exposición ambiental y disponibilidad de servicios médicos (Fuente: MINSAL Transparencia)." },
    { id:"departamento", label:"¿En qué departamento vives?", type:"choice",
      options: DEPARTAMENTOS.map(function(d){return {label:d,value:d};}),
      micro:"Ciertas regiones presentan perfiles de riesgo específicos debido a la exposición ambiental y disponibilidad de servicios médicos (Fuente: MINSAL Transparencia)." },
    { id:"comidaRapida", label:"¿Con qué frecuencia consumes comida rápida y ultraprocesados?", type:"choice",
      options:[
        {label:"Bajo / Ocasional",value:"bajo",desc:"Menos de 1 vez por semana."},
        {label:"Moderado",value:"moderado",desc:"1 a 3 veces por semana."},
        {label:"Frecuente / Alto",value:"frecuente",desc:"Más de 3 veces por semana."},
      ],
      micro:"El consumo frecuente de alimentos ultraprocesados y comida rápida duplica el riesgo de tumores digestivos debido al exceso de sodio, grasas saturadas y su vínculo directo con la obesidad (Fuente: Política Nacional de Cáncer 2026 / OPS)." },
  ];

  function calcular(a) {
    const edad = parseInt(a.edad || "0", 10);
    const genero = a.genero;
    let baseLE = genero === "F" ? 78 : 73;
    if (a.tabaco === "frecuente") baseLE -= 10;
    else if (a.tabaco === "ocasional") baseLE -= 4;
    else if (a.tabaco === "pasivo") baseLE -= 2;
    if (a.vapeo === "frecuente") baseLE -= 6;
    else if (a.vapeo === "ocasional") baseLE -= 2;
    if (a.alcohol === "alto") baseLE -= 5;
    else if (a.alcohol === "moderado") baseLE -= 1;
    else if (a.alcohol === "bajo") baseLE -= 0.5;
    if (a.actividad === "sedentaria") baseLE -= 4;
    else if (a.actividad === "activa") baseLE += 2;
    if (a.antecedentes === "si") baseLE -= 2;
    else if (a.antecedentes === "segundo_tercer") baseLE -= 1;
    if (a.zona === "rural") baseLE -= 1;
    if (a.comidaRapida === "frecuente") baseLE -= 3;
    else if (a.comidaRapida === "moderado") baseLE -= 1;
    if (a.actividad === "sedentaria" && a.comidaRapida === "frecuente") baseLE -= 2;
    else if (a.actividad === "sedentaria" && a.comidaRapida === "moderado") baseLE -= 1;
    const aniosRestantes = Math.max(1, Math.round(baseLE - edad));

    let beta = 1.0;
    if (edad >= 60) beta *= 1.6;
    else if (edad >= 45) beta *= 1.3;
    else if (edad >= 30) beta *= 1.1;
    const tabacoMul = a.tabaco === "frecuente" ? 1.9 : a.tabaco === "ocasional" ? 1.25 : a.tabaco === "pasivo" ? 1.15 : 1;
    const alcoholMul = a.alcohol === "alto" ? 1.7 : a.alcohol === "moderado" ? 1.15 : a.alcohol === "bajo" ? 1.05 : 1;
    beta *= tabacoMul * alcoholMul;
    if (a.tabaco === "frecuente" && a.alcohol === "alto") beta *= 1.25;
    if (a.vapeo === "frecuente") beta *= 1.4;
    else if (a.vapeo === "ocasional") beta *= 1.15;
    if (a.actividad === "sedentaria") beta *= 1.2;
    else if (a.actividad === "activa") beta *= 0.9;
    if (a.antecedentes === "si") beta *= 1.5;
    else if (a.antecedentes === "segundo_tercer") beta *= 1.25;
    if (a.zona === "rural") beta *= 1.08;
    if (DEPTOS_RURALES_AGRICOLAS.has(a.departamento)) beta *= 1.07;
    const comidaMul = a.comidaRapida === "frecuente" ? 1.45 : a.comidaRapida === "moderado" ? 1.18 : 1;
    beta *= comidaMul;
    if (a.zona === "urbana" && a.comidaRapida === "frecuente") beta *= 1.15;
    if (a.actividad === "sedentaria" && a.comidaRapida === "frecuente") beta *= 1.25;
    else if (a.actividad === "sedentaria" && a.comidaRapida === "moderado") beta *= 1.1;

    const nivel = beta < 1.5 ? "Bajo" : beta < 2.5 ? "Moderado" : "Alto";

    let tamizaje = "";
    if (genero === "F") {
      if (edad >= 25) tamizaje += "Citología cervicouterina (Papanicolaou) anual. ";
      if (edad >= 40) tamizaje += "Mamografía bienal de tamizaje. ";
      if (edad >= 50) tamizaje += "Prueba de sangre oculta en heces para tamizaje colorrectal. ";
      if (!tamizaje) tamizaje = "Autoexploración mamaria mensual y consulta ginecológica preventiva anual.";
    } else {
      if (edad >= 45) tamizaje += "Antígeno prostático específico (PSA) anual. ";
      if (edad >= 50) tamizaje += "Tamizaje colorrectal (sangre oculta en heces o colonoscopía). ";
      if (!tamizaje) tamizaje = "Consulta médica preventiva anual y autoexploración testicular mensual.";
    }
    if (DEPTOS_RURALES_AGRICOLAS.has(a.departamento)) {
      tamizaje += " Se recomienda vigilancia adicional para cáncer gástrico y hematológico por exposición agrícola.";
    }
    return { aniosRestantes: aniosRestantes, nivel: nivel, beta: beta.toFixed(2), tamizaje: tamizaje };
  }

  function puntosMejora(a) {
    const items = [];
    if (a.tabaco === "frecuente") items.push("Tabaquismo frecuente: fumar diariamente reduce significativamente tu expectativa de vida.");
    else if (a.tabaco === "ocasional") items.push("Consumo ocasional de tabaco: incluso fumar esporádicamente impacta tu salud.");
    else if (a.tabaco === "pasivo") items.push("Exposición al humo de tabaco (fumador pasivo): evita ambientes con humo.");
    if (a.vapeo === "frecuente") items.push("Vapeo frecuente: los aerosoles dañan tu ADN y pulmones.");
    else if (a.vapeo === "ocasional") items.push("Vapeo ocasional: incluso de forma esporádica genera daño celular.");
    if (a.alcohol === "alto") items.push("Consumo alto de alcohol: reducirlo disminuye el riesgo oncológico.");
    else if (a.alcohol === "moderado") items.push("Consumo moderado de alcohol: considera reducirlo.");
    else if (a.alcohol === "bajo") items.push("Consumo bajo de alcohol: idealmente, evítalo por completo.");
    if (a.actividad === "sedentaria") items.push("Sedentarismo: incorpora al menos 150 min de actividad física semanal.");
    if (a.comidaRapida === "frecuente") items.push("Consumo frecuente de comida rápida y ultraprocesados: prioriza alimentos frescos.");
    else if (a.comidaRapida === "moderado") items.push("Consumo moderado de ultraprocesados: reduce su frecuencia.");
    if (a.zona === "rural") items.push("Zona rural: refuerza tamizajes preventivos por exposición ambiental/agrícola.");
    if (a.antecedentes === "si") items.push("Antecedentes familiares de primer grado: realiza tamizajes a menor edad.");
    else if (a.antecedentes === "segundo_tercer") items.push("Antecedentes familiares de segundo/tercer grado: mantén controles periódicos.");
    return items;
  }

  // ---------- estado ----------
  const root = document.getElementById("app");
  let step = 0;
  let answers = {};
  let showTransition = false;
  let showResults = false;
  let showShare = false;
  let edadInput = "";

  function esc(s) { return String(s).replace(/[&<>"']/g, function(c){
    return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c];
  });}

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function render() {
    const total = QUESTIONS.length;
    const isReady = step === total;
    const q = isReady ? null : QUESTIONS[step];
    const progress = Math.round(((isReady ? total : step) / total) * 100);

    // Mostrar/ocultar header y footer según el modo "compartir limpio"
    document.body.classList.toggle("onc-share-mode", showShare);

    if (showShare) {
      const r = calcular(answers);
      const mejoras = puntosMejora(answers);
      const mejorasHtml = mejoras.length === 0
        ? '<p class="onc-mejoras-empty">¡Excelente! No detectamos hábitos críticos que estén reduciendo tu expectativa de vida.</p>'
        : '<ul>' + mejoras.map(function(m){return '<li>'+esc(m)+'</li>';}).join('') + '</ul>';

      root.innerHTML =
        '<button type="button" class="onc-share-close" id="btn-share-close" aria-label="Volver a comenzar">&times;</button>' +
        '<section class="onc-results onc-results--share">' +
          '<div class="onc-years-block">' +
            '<span class="onc-years-line1">Vivirás</span>' +
            '<span class="onc-years-line2">'+r.aniosRestantes+'</span>' +
            '<span class="onc-years-line3">años</span>' +
          '</div>' +
          '<div class="onc-risk onc-risk--'+r.nivel.toLowerCase()+'">' +
            '<p class="onc-risk-text">Tu probabilidad de cáncer es <strong>'+r.nivel+'</strong>.</p>' +
          '</div>' +
          '<div class="onc-mejoras"><h3>Puntos de mejora</h3>'+mejorasHtml+'</div>' +
        '</section>';

      document.getElementById("btn-share-close").addEventListener("click", reset);
      return;
    }


    if (showTransition) {
      root.innerHTML =
        '<section class="onc-card-wrap"><article class="onc-card onc-transition">' +
        '<div class="onc-spinner" aria-hidden="true"></div>' +
        '<p class="onc-transition-text">Calcularemos cuántos años puedes vivir según tus hábitos y cuál es tu nivel de riesgo de cáncer.</p>' +
        '</article></section>';
      return;
    }

    if (showResults) {
      const r = calcular(answers);
      const mejoras = puntosMejora(answers);
      const mejorasHtml = mejoras.length === 0
        ? '<p class="onc-mejoras-empty">¡Excelente! No detectamos hábitos críticos que estén reduciendo tu expectativa de vida.</p>'
        : '<ul>' + mejoras.map(function(m){return '<li>'+esc(m)+'</li>';}).join('') + '</ul>';

      root.innerHTML =
        '<section class="onc-results" id="onc-results">' +
          '<div class="onc-years-block">' +
            '<span class="onc-years-line1">Vivirás</span>' +
            '<span class="onc-years-line2">'+r.aniosRestantes+'</span>' +
            '<span class="onc-years-line3">años</span>' +
          '</div>' +
          '<div class="onc-risk onc-risk--'+r.nivel.toLowerCase()+'">' +
            '<p class="onc-risk-text">Tu probabilidad de cáncer es <strong>'+r.nivel+'</strong>…</p>' +
          '</div>' +
          '<div class="onc-tamizaje"><p>Te recomendamos '+esc(r.tamizaje)+'…</p></div>' +
          '<div class="onc-mejoras"><h3>Puntos de mejora</h3>'+mejorasHtml+'</div>' +
          '<div class="onc-bib-static">' +
            '<h4>Referencias bibliográficas (APA 7.ª ed.)</h4>' +
            '<ul>' +
              '<li>International Agency for Research on Cancer. (2024). <em>Global Cancer Observatory: El Salvador</em>. WHO. <a href="https://gco.iarc.fr/en" target="_blank" rel="noopener">https://gco.iarc.fr/en</a></li>' +
              '<li>Ministerio de Salud de El Salvador. (2026). <em>Política nacional para la prevención y control del cáncer</em>. Diario Oficial, 450(61), 77-88.</li>' +
              '<li>Ministerio de Salud de El Salvador. (2026). <em>Portal de Transparencia</em>. <a href="https://www.transparencia.gob.sv/institutions/minsal" target="_blank" rel="noopener">transparencia.gob.sv</a></li>' +
              '<li>Pan American Health Organization. (2024). <em>The burden of cancer in the Americas</em>. <a href="https://www.paho.org/en/enlace/burden-cancer" target="_blank" rel="noopener">paho.org</a></li>' +
              '<li>Pan American Health Organization. (2026). <em>PAHO Open Data Portal</em>. <a href="https://opendata.paho.org/en" target="_blank" rel="noopener">opendata.paho.org</a></li>' +
            '</ul>' +
          '</div>' +
        '</section>' +
        '<div class="onc-ctas">' +
          '<button type="button" class="onc-cta onc-cta--share" id="btn-share">Compartir mi resultado</button>' +
          '<a class="onc-cta onc-cta--info" href="https://www.edificandovidas-elsalvador.org/" target="_blank" rel="noopener">Conocer más</a>' +
          '<a class="onc-cta onc-cta--donate" href="https://yomeuno.com/el-salvador/organizaciones/fundacion-edificando-vidas-el-salvador" target="_blank" rel="noopener">Donar</a>' +
        '</div>' +
        '<button class="onc-restart" id="btn-reset">Volver a comenzar</button>';

      document.getElementById("btn-share").addEventListener("click", handleShare);
      document.getElementById("btn-reset").addEventListener("click", reset);
      return;
    }

    let inner = '';
    if (isReady) {
      inner =
        '<h2 class="onc-question">Has completado el cuestionario</h2>' +
        '<p class="onc-micro" style="border-top:none;padding-top:0;font-size:.95rem">Tus respuestas han sido registradas. Pulsa el botón para ver tu estimación personalizada de longevidad y riesgo oncológico.</p>' +
        '<button type="button" class="onc-btn-results" id="btn-show-results">Mostrar resultados</button>' +
        '<button type="button" class="onc-restart" style="margin-top:.75rem;width:100%" id="btn-back">Volver a la pregunta anterior</button>';
    } else if (q.type === "choice") {
      const opts = q.options.map(function(o){
        const sel = answers[q.id] === o.value ? " is-selected" : "";
        const desc = o.desc ? '<span class="onc-option-desc">'+esc(o.desc)+'</span>' : '';
        return '<button type="button" class="onc-option'+sel+'" data-val="'+esc(o.value)+'">' +
          '<span class="onc-option-label">'+esc(o.label)+'</span>'+desc+'</button>';
      }).join('');
      inner =
        '<h2 class="onc-question">'+esc(q.label)+'</h2>' +
        '<div class="onc-options">'+opts+'</div>' +
        '<p class="onc-micro">'+esc(q.micro)+'</p>' +
        (step > 0 ? '<button type="button" class="onc-restart" style="margin-top:1rem;width:100%" id="btn-back">← Volver a la pregunta anterior</button>' : '');
    } else {
      inner =
        '<h2 class="onc-question">'+esc(q.label)+'</h2>' +
        '<form class="onc-number-form" id="num-form">' +
          '<input type="number" min="'+q.min+'" max="'+q.max+'" required placeholder="Ingresa tu edad" value="'+esc(edadInput || answers[q.id] || "")+'" autofocus />' +
          '<button type="submit" class="onc-btn-primary">Continuar</button>' +
        '</form>' +
        '<p class="onc-micro">'+esc(q.micro)+'</p>' +
        (step > 0 ? '<button type="button" class="onc-restart" style="margin-top:1rem;width:100%" id="btn-back">← Volver a la pregunta anterior</button>' : '');
    }

    root.innerHTML =
      '<section class="onc-card-wrap">' +
        '<div class="onc-progress"><div class="onc-progress-bar" style="width:'+progress+'%"></div></div>' +
        '<p class="onc-step-count">'+(isReady ? "Listo para ver resultados" : "Pregunta "+(step+1)+" de "+total)+'</p>' +
        '<article class="onc-card is-entering">'+inner+'</article>' +
      '</section>';

    if (isReady) {
      document.getElementById("btn-show-results").addEventListener("click", handleShowResults);
    } else if (q.type === "choice") {
      root.querySelectorAll(".onc-option").forEach(function(el){
        el.addEventListener("click", function(){ advance(q.id, el.getAttribute("data-val")); });
      });
    } else {
      const form = document.getElementById("num-form");
      const input = form.querySelector("input");
      input.addEventListener("input", function(e){ edadInput = e.target.value; });
      form.addEventListener("submit", function(e){
        e.preventDefault();
        if ((edadInput || "").trim()) { advance(q.id, edadInput.trim()); edadInput = ""; }
      });
    }
    const back = document.getElementById("btn-back");
    if (back) back.addEventListener("click", function(){ step = Math.max(0, step - 1); render(); });
  }

  function advance(id, value) {
    answers[id] = value;
    step = Math.min(step + 1, QUESTIONS.length);
    render();
  }

  function reset() {
    answers = {}; step = 0; showTransition = false; showResults = false; showShare = false; edadInput = "";
    render();
  }

  function handleShowResults() {
    showTransition = true; render();
    setTimeout(function(){ showTransition = false; showResults = true; render(); }, 2200);
  }

  function handleShare() {
    showShare = true;
    window.scrollTo(0, 0);
    render();
  }

  render();
})();
