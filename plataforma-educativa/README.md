# Plataforma educativa (nombre provisional)

> **Documento vivo.** Aquí se recoge, de forma ordenada, todo lo que vamos decidiendo de la aplicación: qué es, para quién, qué hace y por qué. El esquema de la base de datos está en [esquema.dbml](esquema.dbml) y se ve como diagrama con el [visor propio](visor/README.md). Lo que representa cada parte del esquema se explica en [modelo-datos.md](modelo-datos.md).
>
> **Estado:** diseño. Todavía no hay código de la aplicación; solo el visor del esquema, que es una herramienta para diseñarla.

## Índice

1. [Visión](#1-visión)
2. [Usuarios](#2-usuarios)
3. [Funcionalidades](#3-funcionalidades)
4. [Glosario](#4-glosario)
5. [Reglas de negocio](#5-reglas-de-negocio)
6. [Dónde se usa la IA](#6-dónde-se-usa-la-ia)
7. [Requisitos no funcionales](#7-requisitos-no-funcionales)
8. [Decisiones de diseño](#8-decisiones-de-diseño)
9. [Preguntas abiertas](#9-preguntas-abiertas)
10. [Registro de cambios](#10-registro-de-cambios)

---

## 1. Visión

Una plataforma que hace de intermediario entre profesores y alumnos de colegios e institutos en matemáticas y, más adelante, en ciencias en general.

- **Para el profesor**, la plataforma corrige los ejercicios que manda, sean del catálogo o suyos, y le cuenta cómo está su clase: qué tiene bien entendido y en qué falla la mayoría. No le enseña todos los datos, sino lo que merece su atención. Así puede dedicar las clases presenciales a lo que más cuesta.
- **Para el alumno**, la idea es que aprenda a su manera. Tiene el mismo temario que da su profesor, explicado en el formato que mejor le funciona, con ejercicios corregidos al momento y práctica ilimitada bajo demanda. Además cuenta con un **director de estudios** que prepara los exámenes con él y con un **asistente** que le guía cuando se atasca, sin darle la solución.
- **Y todo funciona como un juego**: el alumno gana puntos, sube de nivel, compite con su clase y desbloquea el temario a medida que domina lo que necesita para entenderlo.

### De dónde partimos

[Retos, paso a paso](../web) y [sus vídeos](../videos) ya resuelven a pequeña escala varias piezas de la plataforma:

| Ya existe | En la plataforma |
| --- | --- |
| Conceptos con prerrequisitos y un grafo entre ellos (`web/src/lib/grafo.ts`) | El catálogo de conceptos, la base de todo |
| Tracks: rutas que ordenan los conceptos por niveles (`web/src/lib/tracks.ts`) | Las rutas de aprendizaje personalizadas |
| Ejercicios con dificultad fácil / media / difícil | La misma escala en los ejercicios |
| Vídeos de Manim junto a la explicación escrita | El mismo contenido en varios formatos |
| «Ningún número se escribe a mano»: todo se calcula y tiene tests | Los ejercicios generados solo se publican si su solución se ha comprobado por cálculo |

## 2. Usuarios

| Actor | Qué hace en la plataforma |
| --- | --- |
| **Alumno** | Estudia el temario, hace las tareas, practica, prepara exámenes y consulta al asistente |
| **Profesor** | Organiza el temario de sus clases, manda tareas, anuncia exámenes y consulta cómo va su clase |
| **Administrador del centro** | Da de alta profesores y clases *(supuesto, por confirmar)* |
| **Familia / tutor legal** | Da el consentimiento cuando el alumno es menor de 14 años *(supuesto)*. Falta decidir si también ve el progreso ([P7](#9-preguntas-abiertas)) |
| **Equipo de contenido** (nosotros) | Mantiene el catálogo de conceptos, las explicaciones y las plantillas de ejercicios |

## 3. Funcionalidades

### 3.1 Profesor

| # | Funcionalidad | Detalle |
| --- | --- | --- |
| F-P1 | Clases | Ve sus clases y sus alumnos |
| F-P2 | Temario | Indica qué unidades da y cuándo. Los alumnos tienen ese mismo temario en la plataforma, al ritmo de la clase |
| F-P3 | Tareas | Manda series de ejercicios con fecha de entrega. Los ejercicios pueden venir del catálogo, ser suyos o generarse |
| F-P4 | Corrección automática | La plataforma corrige cada respuesta en tiempo real y detecta qué error se ha cometido, no solo si está bien o mal |
| F-P5 | Salud de la clase | Muestra conclusiones por tarea y globales: «el 70 % de la clase cambia mal el signo al trasponer términos», «tu clase tiene dominadas las ecuaciones de primer grado». Avisa también de los alumnos que se están quedando atrás |
| F-P6 | Exámenes | Registra la fecha de cada examen y su contenido, elegido entre lo que la clase ya ha dado o dará antes de esa fecha |
| F-P7 | Crear ejercicios | Escribe sus propios ejercicios con su solución y su resolución. La plataforma le ayuda proponiendo los pasos, los conceptos que trabaja el ejercicio y los errores típicos que puede provocar. Así sus ejercicios alimentan los informes igual que los del catálogo |
| F-P8 | Ayuda con los datos | En lugar de tablas, le presenta una bandeja con lo importante, ordenado por prioridad: los problemas de la clase, los alumnos que necesitan atención y qué repasar en la próxima sesión. Cada punto trae una acción sugerida, como mandar una tarea de refuerzo, y el profesor puede marcarlo como atendido o descartarlo |

### 3.2 Alumno

| # | Funcionalidad | Detalle |
| --- | --- | --- |
| F-A1 | Temario sincronizado | Ve las unidades que su profesor va dando |
| F-A2 | Contenido en varios formatos | La misma explicación está disponible en texto, vídeo, visual interactivo, audio, ejemplo resuelto o esquema. Por defecto se le muestra su formato preferido, pero tiene todos a su alcance |
| F-A3 | Perfil de aprendizaje | Combina las preferencias que declara él (un cuestionario inicial) con las que se infieren de lo que consume y de lo que le funciona |
| F-A4 | Ruta de aprendizaje | Alterna contenido y ejercicios integrados, que se corrigen automáticamente y en tiempo real |
| F-A5 | Práctica bajo demanda | Puede pedir más ejercicios del concepto o tipo de problema que le cuesta, aunque el profesor no los haya mandado. Cada ejercicio trae su solución y la resolución paso a paso |
| F-A6 | Director de estudios | Al entrar le avisa: «Tienes examen de X el día Y, vamos a prepararlo». Después genera un mapa de estudio con lo que entra en el examen: insiste en lo que peor sabe y no abandona lo que ya domina, solo le dedica menos tiempo |
| F-A7 | Asistente tutor | Le guía cuando no llega a la solución, con preguntas y pistas para que la encuentre él. Nunca resuelve el problema por él. También responde dudas de teoría |
| F-A8 | Tareas | Ve las tareas que le ha mandado su profesor y hace las entregas |
| F-A9 | Puntos y niveles | Gana puntos resolviendo problemas y con ellos sube de nivel, con la sensación de avanzar dentro de un juego |
| F-A10 | Ranking de clase | Compite con sus compañeros por quién resuelve más y mejor |
| F-A11 | Desbloqueo progresivo | El temario se abre a medida que domina lo anterior. Si un concepto es base para el siguiente, se le exige dominarlo, o por lo menos se le avisa: «necesitas entender bien esto antes de seguir; si no, no vas a entender lo que viene» |

## 4. Glosario

Términos que usamos con un significado preciso, tanto en este documento como en el modelo de datos.

| Término | Significado |
| --- | --- |
| **Concepto** | La unidad mínima de conocimiento, por ejemplo «resolver ecuaciones de segundo grado». Todo cuelga de los conceptos: el contenido, los ejercicios, el dominio del alumno, los exámenes y los informes. Cada concepto tiene sus prerrequisitos |
| **Bloque** | Agrupa los conceptos de una asignatura: Números, Álgebra, Geometría, Funciones, Estadística y probabilidad… |
| **Unidad didáctica** | El tema tal y como lo da un profesor concreto, con sus fechas, por ejemplo «Tema 4: Ecuaciones». Agrupa conceptos del catálogo |
| **Explicación** | Una idea concreta que hay que transmitir sobre un concepto |
| **Representación** | Una explicación en un formato concreto. Una misma explicación tiene varias representaciones |
| **Formato** | El tipo de representación: texto, vídeo, interactivo, audio, ejemplo resuelto o esquema |
| **Tipología** | Una clase de problema, por ejemplo «problemas de móviles» o «ecuaciones con fracciones» |
| **Plantilla** | Un ejercicio con parámetros. Genera variantes cuya solución se calcula por código |
| **Paso de resolución** | Cada paso de la solución de un ejercicio. Es lo que se le enseña al alumno y lo que usa el asistente para guiarle |
| **Error típico** | Una equivocación frecuente y reconocible, por ejemplo «cambia mal el signo al pasar un término al otro miembro» |
| **Intento** | Cada respuesta de un alumno a un ejercicio. Es la fuente de la verdad sobre el progreso |
| **Dominio** | Cuánto sabe un alumno de un concepto, en una escala de 0 a 1. Se calcula a partir de sus intentos |
| **Ruta** | Una secuencia personalizada de pasos, cada uno de contenido o de ejercicio. Hay cuatro tipos: temario, preparación de examen, refuerzo y práctica |
| **Observación de clase** | Una conclusión para el profesor, por ejemplo «la mayoría falla en…», junto con una acción sugerida. Forma parte de su bandeja |
| **Puntos** | La recompensa por resolver y avanzar. Cada vez que se ganan puntos se apunta un movimiento, y el total es la suma de todos ellos |
| **Nivel de juego** | El escalón al que se llega acumulando puntos. No hay que confundirlo con el nivel educativo (3º ESO) |
| **Logro** | Una insignia que se consigue al cumplir una condición, por ejemplo una racha de 7 días o dominar un bloque entero |
| **Desbloqueo** | El momento en que un concepto pasa a estar disponible para el alumno, porque ya domina sus prerrequisitos |

## 5. Reglas de negocio

| # | Regla |
| --- | --- |
| R1 | El alumno ve en su temario las unidades de su clase que ya han empezado ([P8](#9-preguntas-abiertas): ¿puede adelantarse?) |
| R2 | En un examen solo pueden entrar conceptos de las unidades de la clase, tanto las ya dadas como las que se darán antes de la fecha del examen |
| R3 | La **prioridad** de cada concepto en el mapa de estudio es `peso en el examen × (1 − dominio) + mantenimiento`. El mantenimiento es un mínimo que garantiza que lo dominado sigue apareciendo, aunque menos. Se añade también el tiempo que ha pasado desde la última vez que lo practicó, para que no se olvide |
| R4 | El mapa de estudio reparte los pasos entre hoy y la fecha del examen. Se recalcula cuando cambia el dominio del alumno, por ejemplo después de cada sesión, o cuando el profesor cambia el examen |
| R5 | Las respuestas se corrigen por **equivalencia matemática** con la solución, no comparando texto: `1/2`, `0,5` y `x = 1/2` valen lo mismo |
| R6 | Un ejercicio generado no se le muestra a nadie hasta que su solución se ha **comprobado por cálculo**. No basta con que la haya dado la IA |
| R7 | El asistente **nunca da la respuesta final ni un paso completo**. Sube de nivel poco a poco: primero una pregunta que haga pensar, luego una pista conceptual, después una pista concreta y por último un ejemplo análogo resuelto |
| R8 | Si el alumno se rinde, puede ver la resolución paso a paso. Es una acción suya, no algo que haga el asistente, y queda registrada. En las tareas, el profesor decide cuándo se puede ver la solución: al responder, al entregar o al cerrar la tarea |
| R9 | Para calcular el dominio cuentan las pistas usadas y si el alumno vio la solución: un acierto después de tres pistas vale menos que uno a la primera |
| R10 | Se muestra por defecto el formato preferido. Las preferencias inferidas se ajustan según lo que el alumno consume y su rendimiento posterior en ese mismo concepto |
| R11 | Una observación de debilidad se genera cuando un porcentaje de la clase falla en un concepto o comete un error típico. Ese porcentaje es un umbral por decidir, por ejemplo el 40 %, y además hace falta un mínimo de respuestas para que sea significativo |
| R12 | Los **puntos** que da un acierto dependen de la dificultad del ejercicio, de si salió a la primera y de las pistas que se usaron. Ver la solución no da puntos. Si el alumno repite ejercicios fáciles de un concepto que ya domina, cada vez gana menos, para que subir de nivel exija avanzar y no repetir |
| R13 | También dan puntos completar pasos de la ruta, mantener una racha de días y terminar la preparación de un examen *(propuesta)* |
| R14 | Los **niveles de juego** se alcanzan con los puntos acumulados y nunca se pierden |
| R15 | Un concepto se **desbloquea** cuando el alumno alcanza el dominio mínimo en sus prerrequisitos *necesarios*. Los *recomendables* no bloquean, solo generan un aviso |
| R16 | Si el profesor ya está dando en clase una unidad cuyos prerrequisitos el alumno no domina, esa unidad **no se bloquea**, porque la necesita para seguir la clase. Se abre con un aviso y se le propone una ruta de refuerzo del prerrequisito *(propuesta, ver [P16](#9-preguntas-abiertas))* |
| R17 | El **ranking** es de cada clase y por periodo, por ejemplo semanal, y cuenta solo los puntos de esa asignatura. El profesor puede desactivarlo *(la forma exacta está pendiente, ver [P15](#9-preguntas-abiertas))* |

## 6. Dónde se usa la IA

**Principio:** la IA redacta y guía, pero los números y las correcciones salen de cálculos que se pueden comprobar. Es el mismo criterio que siguen los vídeos.

| Uso | Qué hace la IA | Qué no hace |
| --- | --- | --- |
| Asistente tutor | Conversa, pregunta y da pistas apoyándose en los pasos de resolución y en los errores típicos | Dar la solución |
| Generación de ejercicios | Propone enunciados y variantes de las plantillas | Decidir la respuesta correcta, que se calcula y se verifica |
| Ayuda al profesor | Propone los pasos de resolución, los conceptos y los errores típicos de los ejercicios que escribe el profesor | Publicarlos sin que el profesor los revise |
| Diagnóstico de errores | Interpreta las respuestas abiertas cuando las reglas no bastan | Sustituir a las reglas cuando hay reglas |
| Observaciones de clase | Redacta el texto para el profesor a partir de las cifras ya calculadas | Calcular las cifras |
| Contenido | Prepara borradores de representaciones | Publicarlas sin que las revise el equipo |

## 7. Requisitos no funcionales

- **Menores de edad.** En España, para tratar los datos de un menor de 14 años hace falta el consentimiento de sus padres o tutores (LOPDGDD, art. 7). Hay que guardar los datos mínimos imprescindibles.
- **RGPD.** Si los clientes son centros, nosotros seremos encargados del tratamiento de sus datos.
- **Reglamento europeo de IA.** Los sistemas de IA que evalúan los resultados del aprendizaje u orientan el proceso de aprendizaje están en la lista de **alto riesgo** (anexo III). Eso implica obligaciones de supervisión humana, registros y transparencia. Hay que revisarlo con alguien de legal **antes de construir**.
- **Exactitud.** Nada se enseña como correcto sin haberse comprobado.
- **Notación matemática.** LaTeX, renderizado con KaTeX como en la web.
- **Accesibilidad.** Los formatos alternativos (texto, audio) también sirven a alumnos con necesidades específicas.

## 8. Decisiones de diseño

Estado: **propuestas**, pendientes de validar.

| # | Decisión | Por qué |
| --- | --- | --- |
| D1 | El **concepto** es la unidad de todo | Es lo que permite decir «tu clase falla en X», preparar un examen por conceptos y medir el dominio |
| D2 | Hay un **catálogo común** de conceptos y cada profesor tiene **su propio temario**, que apunta a ese catálogo | Cada profesor sigue su libro y su orden, pero así todos hablan el mismo idioma |
| D3 | Cada **explicación** tiene varias **representaciones**, una por formato | Es la forma de enseñar el mismo contenido de varias maneras sin duplicar los conceptos |
| D4 | Una **única estructura de ruta** para el temario, la preparación de exámenes, el refuerzo y la práctica | El director de estudios, la práctica bajo demanda y la ruta de aprendizaje funcionan igual por dentro |
| D5 | Los **intentos** son la fuente de la verdad y el **dominio** es un valor derivado | El dominio se puede recalcular si cambiamos la fórmula, sin perder historia |
| D6 | Los ejercicios se generan a partir de **plantillas** con la solución calculada | Así hay ejercicios ilimitados y todos tienen la solución garantizada |
| D7 | Hay un **catálogo de errores típicos** | Permite ir más allá de «está mal»: decir qué falla y cómo ayudar al alumno, tanto al profesor como al asistente |
| D8 | El temario se **desbloquea por dominio de los prerrequisitos, no por puntos** | Los puntos se pueden acumular repitiendo cosas fáciles; el dominio no. Los puntos premian el esfuerzo y el dominio garantiza que el alumno está preparado. Juntos dan la sensación de juego sin dejar huecos en lo que aprende |
| D9 | Los puntos se guardan como **movimientos**, y el total y el nivel se calculan a partir de ellos | Se puede explicar de dónde sale cada punto, cambiar las reglas y recalcular, y hacer rankings de cualquier periodo |
| D10 | Las observaciones de clase funcionan como una **bandeja** que tiene prioridad, acción sugerida y estado | El profesor no tiene que interpretar los datos. Ve qué hacer y lleva la cuenta de lo que ya ha atendido |

## 9. Preguntas abiertas

Las marcadas con ⭐ son las que más cambian el modelo de datos.

| # | Pregunta | Afecta a |
| --- | --- | --- |
| P1 ⭐ | ¿Vendemos a centros, a familias o a ambos? ¿Puede un alumno usar la plataforma aunque su colegio no la tenga? | Si el alumno pertenece siempre a un centro, quién crea las clases, pagos y suscripciones |
| P2 | ¿Qué etapas cubrimos: ESO, Bachillerato, también Primaria? | Niveles, consentimientos, tono del asistente |
| P3 | ¿Qué asignaturas entran en la primera versión? Propuesta: solo Matemáticas | Contenido que hay que producir |
| P4 ⭐ | Los profesores **sí** crean ejercicios (F-P7). Falta decidir: ¿también crean explicaciones o material propio, o eso es solo del catálogo? ¿Sus ejercicios son privados, se comparten con el centro o pueden proponerse para el catálogo? | Si el contenido es global o pertenece a una clase o a un autor, y su visibilidad |
| P5 ⭐ | ¿Corregimos ejercicios de desarrollo, es decir, todo el razonamiento, quizá a partir de una foto del cuaderno? ¿O solo la respuesta final? | Tipos de respuesta, diagnóstico con IA, coste y fiabilidad |
| P6 ⭐ | ¿Puede el profesor ver las conversaciones del alumno con el asistente, o solo un resumen? ¿Y la familia? | Privacidad, qué se guarda de cada conversación |
| P7 | ¿Pueden las familias ver el progreso? | Si el tutor legal es también un usuario con acceso |
| P8 | ¿Puede el alumno adelantar temario que su profesor todavía no ha dado? | R1 |
| P9 | ¿Puede el profesor mandar una tarea solo a una parte de la clase, por ejemplo de refuerzo o de ampliación? | Entregas (el modelo ya lo permite) |
| P10 | ¿Recogemos la nota real de los exámenes? | Medir si la preparación funciona |
| P11 | ¿Idiomas: solo castellano, o también lenguas cooficiales e inglés para centros bilingües? | Idioma de las representaciones y de los ejercicios |
| P12 | ¿Cómo se conecta la IA? En tus apps personales va por tu sesión de Claude Code. Con alumnos reales (muchos usuarios a la vez y datos de menores) eso no escala | Arquitectura y coste |
| P13 | ¿Qué entra en la primera versión? Ojo con las dependencias: el asistente necesita ejercicios con sus pasos de resolución, y el director de estudios necesita conceptos, exámenes y suficientes intentos para estimar el dominio | Alcance |
| P14 | ¿Cómo se llama la aplicación? | — |
| P15 ⭐ | ¿Cómo es el ranking? Con menores, un ranking que solo premia al mejor puede desmotivar a los últimos. Algunas opciones: que cuente el progreso de la semana en vez del total, ligas por nivel, que cada alumno solo vea su puesto y los cercanos, poder salir del ranking… | Cómo se calcula y quién ve qué |
| P16 ⭐ | Cuando el profesor va por delante de lo que el alumno domina, ¿se bloquea, se avisa o decide el profesor? (R16 propone avisar) | El desbloqueo y la configuración de la clase |
| P17 | ¿Qué dominio mínimo se exige para desbloquear: uno igual para todos o uno por prerrequisito? ¿Puede ajustarlo el profesor? | Los prerrequisitos y la clase |

## 10. Registro de cambios

| Fecha | Cambio |
| --- | --- |
| 2026-11-05 | Primera versión: visión, usuarios, funcionalidades (incluidos la gamificación, el desbloqueo progresivo, los ejercicios del profesor y la bandeja de avisos), glosario, reglas, uso de la IA, requisitos, decisiones, preguntas abiertas y [modelo de datos v0.1](modelo-datos.md) |
| 2026-11-05 | El esquema pasa a DBML ([esquema.dbml](esquema.dbml)) para verlo y exportarlo desde dbdiagram.io: 49 tablas en 8 grupos y 32 `Enum`. `modelo-datos.md` deja de llevar los diagramas Mermaid y queda como explicación de cada apartado |
| 2026-11-05 | [Visor propio](visor/README.md) del esquema, para no depender de las funciones de pago de dbdiagram.io. Lee el DBML con el parser oficial y muestra grupos de color, cardinalidades, notas y detalle de cada tabla. Además se recarga en vivo, guarda la disposición y exporta a PNG |
