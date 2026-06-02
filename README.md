## Calculadora de Riesgo de Cáncer y Longevidad en El Salvador

Esta es una herramienta educativa e interactiva de salud preventiva desarrollada para la **Fundación Edificando Vidas**. El objetivo del proyecto es concientizar a la población salvadoreña sobre el impacto de los hábitos cotidianos en la esperanza de vida y la probabilidad estimada de desarrollar mutaciones oncológicas.

![Interfaz de la calculadora de riesgo](calculadora.png)

Disponible para su uso en:
**[https://juancachavez.github.io/calculadora-vida/](https://juancachavez.github.io/calculo-cancer/)**

---

## Características

* **Algoritmo Basado en Datos Locales:** A diferencia de calculadoras globales, esta herramienta pondera el riesgo según la *Política Nacional para la Prevención y Control del Cáncer (2026)* de El Salvador y datos del Ministerio de Salud (MINSAL).
* **Cálculo del Índice $\beta$ (Beta):** El script evalúa variables multiplicativas basadas en hábitos (tabaquismo, alcohol, sedentarismo y alimentación ultraprocesada) que alteran directamente el factor de riesgo biológico.
* **Geolocalización del Riesgo Agrícola:** El sistema identifica si el usuario reside en departamentos con alta actividad agrícola (como Chalatenango, Morazán o La Unión), activando alertas de tamizaje adicionales por exposición ambiental a agroquímicos.
* **Recomendaciones Oficiales Automatizadas:** Devuelve sugerencias de tamizaje médico (como mamografías o antígeno prostático) personalizadas por edad y género, alineadas estrictamente con las normativas preventivas del MINSAL.

---

## Fuentes Científicas e Institucionales

Para garantizar la rigurosidad de la herramienta, las constantes de cálculo y los textos microinformativos se basan en:

1. **Ministerio de Salud de El Salvador (2026):** *Política nacional para la prevención y control del cáncer*.
2. **GLOBOCAN / International Agency for Research on Cancer (2024):** Datos de envejecimiento celular y mutaciones oncológicas.
3. **Organización Panamericana de la Salud (OPS/OMS):** Datos sobre carga de enfermedad, tabaquismo y sedentarismo.

---

## Lógica de Ponderación

El script calcula de forma dinámica dos indicadores clave: los **Años Restantes de Vida** (Esperanza de Vida Ajustada) y el **Índice $\beta$ de Riesgo Oncológico**.

### Cálculo de Esperanza de Vida Ajustada

El algoritmo inicia con una base demográfica según el género del usuario (Femenino: 78 años | Masculino: 73 años). A partir de este valor, se aplican penalizaciones aritméticas acumulativas directas restando años según las respuestas:

* **Consumo de Tabaco:** Frecuente (-10 años) | Ocasional (-4 años) | Fumador pasivo (-2 años).
* **Uso de Cigarrillos Electrónicos (Vapeo):** Frecuente (-6 años) | Ocasional (-2 años).
* **Consumo de Alcohol:** Alto (-5 años) | Moderado (-1 año) | Bajo (-0.5 años).
* **Actividad Física:** Sedentaria (-4 años) | Activa (+2 años como bonificación).
* **Antecedentes Familiares de Cáncer:** Familiar de primer grado (-2 años) | Familiar de segundo/tercer grado (-1 año).
* **Entorno Geográfico:** Residencia en zona rural (-1 año).
* **Alimentación Ultraprocesada:** Frecuente (-3 años) | Moderada (-1 año).
* **Efecto Multiplicador Crónico:** Si el usuario es sedentario y además consume comida rápida frecuentemente, se restan de forma penalizada 2 años adicionales (1 año si el consumo es moderado).

*Nota: La fórmula ejecuta la resta matemática `baseLE - edad`. El sistema garantiza un suelo mínimo de 1 año restante de vida mediante la función `Math.max(1, ...)` para evitar resultados negativos en edades avanzadas.*

### Determinación del Índice $\beta$ (Riesgo Oncológico)

El Índice $\beta$ (Beta) representa el riesgo relativo acumulado. Inicia con un valor neutro base de $1.0$ y se modifica exponencialmente mediante factores multiplicadores:

| Variable evaluada | Condición del usuario | Factor Multiplicador (Impacto en $\beta$) |
| :--- | :--- | :--- |
| **Edad (Envejecimiento)** | $\ge$ 60 años <br> 45 a 59 años <br> 30 a 44 años | **x 1.60**<br>**x 1.30**<br>**x 1.10** |
| **Tabaquismo** | Frecuente <br> Ocasional <br> Pasivo | **x 1.90**<br>**x 1.25**<br>**x 1.15** |
| **Alcoholismo** | Alto <br> Moderado <br> Bajo | **x 1.70**<br>**x 1.15**<br>**x 1.05** |
| **Cigarrillo Electrónico** | Vapeo Frecuente <br> Vapeo Ocasional | **x 1.40**<br>**x 1.15** |
| **Sedentarismo** | Actividad Sedentaria <br> Actividad Activa | **x 1.20**<br>**x 0.90** *(Factor protector)* |
| **Genética Hereditaria** | Familiar 1.º Grado <br> Familiar 2.º/3.º Grado | **x 1.50**<br>**x 1.25** |
| **Geografía Ambiental** | Zona Rural General <br> Departamento de Alta Exposición Agrícola | **x 1.08**<br>**x 1.07** *(Adicional)* |
| **Nutrición** | Comida Rápida Frecuente <br> Comida Rápida Moderada | **x 1.45**<br>**x 1.18** |

#### Multiplicadores por Sinergia Crítica (Sinérgeticos)
El código evalúa si coinciden múltiples hábitos nocivos simultáneos, potenciando severamente el riesgo acumulado:
* **Tabaquismo Frecuente + Alcoholismo Alto:** Multiplica el resultado intermedio por un **x 1.25** adicional.
* **Zona Urbana + Comida Rápida Frecuente:** Añade un multiplicador de **x 1.15** por el entorno de vida de las metrópolis.
* **Sedentarismo + Comida Rápida Frecuente:** Añade un multiplicador de **x 1.25** (**x 1.10** si el consumo de comida rápida es moderado).

### Escala de Clasificación del Riesgo

Tras procesarse todos los factores multiplicadores, el nivel de riesgo final se despliega bajo tres categorías estrictas basadas en el valor final obtenido en $\beta$:
* **Riesgo Bajo:** $\beta < 1.5$
* **Riesgo Moderado:** $1.5 \le \beta < 2.5$
* **Riesgo Alto:** $\beta \ge 2.5$

---

_**Aviso Legal:** Esta herramienta es estrictamente educativa y de concientización estadística. No sustituye bajo ninguna circunstancia un diagnóstico clínico ni la valoración de un profesional de la salud._
