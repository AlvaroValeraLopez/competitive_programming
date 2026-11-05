# Modelo de datos · v0.1

Este documento explica qué representa cada apartado del modelo de datos de la [plataforma educativa](README.md) y por qué está planteado así.

La **estructura** está en [esquema.dbml](esquema.dbml): tablas, columnas, tipos, claves y relaciones. Este documento no la repite. Explica para qué sirve cada tabla y qué decisiones hay detrás. Es un **borrador**: irá cambiando a medida que se resuelvan las [preguntas abiertas](README.md#9-preguntas-abiertas). Si cambia una tabla, hay que actualizar los dos archivos.

## Cómo ver el esquema

Con el **[visor propio](visor/README.md)**, que es gratuito:

```bash
npm --prefix plataforma-educativa/visor install
npm --prefix plataforma-educativa/visor run dev      # http://localhost:5200
```

Dibuja cada módulo en un grupo de color. Al hacer clic en una tabla se ve todo lo que dice el DBML de ella: notas, columnas, relaciones e índices. Además, se actualiza solo cada vez que se guarda `esquema.dbml`.

El mismo archivo sigue sirviendo en [dbdiagram.io](https://dbdiagram.io/d) si algún día hace falta: se pega en su editor y desde allí se puede exportar a SQL de PostgreSQL.

## Convenciones

- Los nombres están en español, sin tildes y en `snake_case`.
- Todas las tablas tienen `id` (uuid). Las de relación no tienen `id` propio: su clave son las dos claves ajenas. Los roles (`alumno`, `profesor`) usan como clave el `usuario_id`.
- Todas las tablas tienen también `creado_en` y `actualizado_en`.
- Los valores posibles de un campo son `Enum` en el DBML, por ejemplo `estado_ejercicio`.
- Las estructuras flexibles, como los parámetros de una plantilla o una solución con varias formas equivalentes, van en `jsonb`.
- Las notas de las columnas en el DBML remiten a las preguntas abiertas del README con su número, por ejemplo `P1`.

## Mapa de módulos

Cada módulo es un `TableGroup` del DBML.

| # | Módulo | Grupo en el DBML | Tablas | Para qué |
| --- | --- | --- | --- | --- |
| 1 | [Organización](#1-organización) | `organizacion` | 12 | Quién es quién y qué alumno está en qué clase con qué profesor |
| 2 | [Currículo y contenido](#2-currículo-y-contenido) | `curriculo_y_contenido` | 8 | Qué se aprende, en qué orden, cómo lo da cada profesor y en qué formatos se explica |
| 3 | [Ejercicios y corrección](#3-ejercicios-y-corrección) | `ejercicios_y_correccion` | 9 | Los ejercicios, sus soluciones y cada respuesta de cada alumno, con su diagnóstico |
| 4 | [Tareas](#4-tareas) | `tareas` | 3 | Lo que manda el profesor |
| 5 | [Seguimiento](#5-seguimiento) | `seguimiento` | 4 | Cuánto sabe cada alumno, cómo prefiere aprender y qué le contamos al profesor |
| 6 | [Exámenes y rutas](#6-exámenes-y-rutas) | `examenes_y_rutas` | 6 | El director de estudios, la ruta de aprendizaje y la práctica bajo demanda |
| 7 | [Asistente](#7-asistente) | `asistente` | 2 | Las conversaciones con el tutor |
| 8 | [Gamificación](#8-gamificación) | `gamificacion` | 5 | Puntos, niveles, logros y rankings |

---

## 1. Organización

| Tabla | Qué representa |
| --- | --- |
| `centro` | Un colegio o instituto |
| `usuario` | Cualquier persona que inicia sesión. Lo que es (alumno o profesor) lo dicen las dos tablas siguientes |
| `alumno` | El rol de alumno: su nivel educativo actual, su fecha de nacimiento (para saber si hace falta consentimiento) y el alias que ven sus compañeros en el ranking |
| `profesor` | El rol de profesor. `es_admin_centro` indica si además administra el centro |
| `tutor_legal` | El padre, la madre o el tutor de un alumno |
| `alumno_tutor` | Qué tutor tiene cada alumno y cuándo dio el consentimiento |
| `curso_academico` | Un año escolar, por ejemplo 2026-27 |
| `nivel_educativo` | Una etapa y un curso, por ejemplo 3º ESO |
| `asignatura` | Matemáticas, Física y Química… |
| `clase` | Un grupo en una asignatura durante un curso académico. Por ejemplo, Matemáticas de 3º ESO B en 2026-27. También guarda la configuración del profesor: si el ranking está activo y si los temas se bloquean o solo avisan |
| `docencia` | Qué profesores dan cada clase, como titulares o de apoyo |
| `matricula` | Qué alumnos están en cada clase, desde cuándo y hasta cuándo |

**Por qué así**

- Todo lo que hace el profesor, como el temario, las tareas o los exámenes, cuelga de la **clase**. Un alumno está en varias clases, una por asignatura.
- `alumno` y `profesor` amplían `usuario`, de modo que una misma persona puede iniciar sesión con un único usuario. La matrícula y la docencia apuntan al rol, no al usuario.
- La matrícula tiene fechas, así que si un alumno cambia de grupo a mitad de curso no se pierde su historia.

## 2. Currículo y contenido

| Tabla | Qué representa |
| --- | --- |
| `bloque` | Una gran parte de una asignatura: Números, Álgebra, Geometría, Funciones, Estadística y probabilidad… |
| `concepto` | La unidad mínima de conocimiento, por ejemplo «resolver ecuaciones de segundo grado». Todo cuelga de los conceptos |
| `prerrequisito` | Qué concepto hay que saber antes de otro. Indica si es *necesario* (bloquea) o *recomendable* (avisa) y el dominio mínimo para desbloquear |
| `unidad_didactica` | El tema tal y como lo da un profesor, con sus fechas, por ejemplo «Tema 4: Ecuaciones» |
| `unidad_concepto` | Qué conceptos del catálogo cubre cada unidad |
| `explicacion` | Una idea concreta que hay que transmitir sobre un concepto |
| `formato` | Los tipos de representación: texto, vídeo, interactivo, audio, ejemplo resuelto o esquema |
| `representacion` | Una explicación en un formato concreto: el texto, el vídeo, el interactivo… |

**Por qué así**

- El **catálogo** (`bloque`, `concepto`, `prerrequisito`) es común a todos los centros. El **temario** (`unidad_didactica`) es de cada profesor, con sus títulos, su orden y sus fechas, pero apunta a conceptos del catálogo. Así cada uno puede seguir su libro y la plataforma sigue sabiendo de qué se habla.
- Los prerrequisitos forman un grafo, como `web/src/lib/grafo.ts`. Ese grafo ordena las rutas y decide el **desbloqueo**.
- «El mismo contenido de distintas formas» se traduce en que una explicación tiene varias representaciones, una por formato. Las páginas de conceptos de la web serían representaciones de tipo `texto` y los vídeos de Manim, de tipo `video`.
- `formato` es una tabla, y no un `Enum`, porque las preferencias del alumno la referencian (módulo 5) y así se pueden añadir formatos nuevos sin cambiar el esquema.

## 3. Ejercicios y corrección

| Tabla | Qué representa |
| --- | --- |
| `tipologia` | Una clase de problema, por ejemplo «problemas de móviles» |
| `plantilla_ejercicio` | Un ejercicio con parámetros. Genera variantes y su `generador` calcula la solución y los pasos |
| `ejercicio` | Un ejercicio concreto: enunciado, tipo de respuesta, solución, dificultad, de dónde viene (catálogo, profesor o generado), quién puede verlo y en qué estado está |
| `ejercicio_concepto` | Qué conceptos trabaja cada ejercicio, uno principal y otros secundarios |
| `paso_resolucion` | Cada paso de la solución de un ejercicio |
| `opcion_respuesta` | Las opciones de un ejercicio de opción múltiple. Cada opción incorrecta puede delatar un error típico |
| `error_tipico` | Una equivocación frecuente y reconocible, con cómo ayudar a quien la comete |
| `intento` | Cada respuesta de un alumno a un ejercicio: qué respondió, si acertó, cuántas pistas usó y si vio la solución |
| `intento_error` | Qué errores típicos se detectaron en un intento, en qué paso y si los detectó una regla o la IA |

**Por qué así**

- Un ejercicio trabaja **varios conceptos** y pertenece a **una tipología**. Los conceptos sirven para medir el dominio. La tipología sirve para la práctica bajo demanda («dame más problemas de móviles») y para detectar el tipo de problema que más cuesta.
- Los **pasos de resolución** cumplen tres funciones: son lo que ve el alumno si pide la solución, lo que usa el asistente para guiarle sin decírsela y el lugar donde se sitúa el error de un intento.
- Los **errores típicos** van más allá de «bien o mal»: sirven para decirle al profesor *por qué* falla la clase.
- Un ejercicio generado nace en `borrador` y solo pasa a `verificado` cuando su solución se ha calculado y comprobado (R6). Los del profesor nacen también en `borrador`, con los pasos y los conceptos propuestos por la IA, y se publican cuando él los revisa.
- Cada intento viene **o** de una tarea (`entrega_id`) **o** de una ruta (`paso_ruta_id`), nunca de las dos ni de ninguna. Toda la práctica libre vive dentro de una ruta de tipo `practica` (módulo 6). Al pasar el esquema a SQL, esto será una restricción `CHECK`.

## 4. Tareas

| Tabla | Qué representa |
| --- | --- |
| `tarea` | Una serie de ejercicios que manda el profesor a una clase, con su fecha de entrega, cuántos intentos permite y cuándo se puede ver la solución |
| `tarea_ejercicio` | Qué ejercicios tiene la tarea, en qué orden y cuántos puntos vale cada uno |
| `entrega` | La tarea de un alumno concreto: si la ha empezado, si la ha entregado y su nota |

**Por qué así**

- Al publicar una tarea se crea una entrega para cada alumno al que va dirigida. Si va a toda la clase, se crea para todos; si va a un grupo de refuerzo, solo para ellos (P9). Así no hace falta otra tabla de destinatarios, y «¿quién no ha empezado?» es simplemente una consulta.

## 5. Seguimiento

| Tabla | Qué representa |
| --- | --- |
| `dominio_concepto` | Cuánto sabe un alumno de un concepto (de 0 a 1), con qué confianza lo estimamos y si el concepto está bloqueado, disponible, en progreso o dominado |
| `preferencia_formato` | Cuánto le gusta a un alumno cada formato, según lo que dice él y según lo que se deduce de su uso |
| `consumo_contenido` | Cada vez que un alumno ve, lee o escucha una representación: cuánto tiempo, hasta dónde y si le ayudó |
| `observacion_clase` | Una conclusión para el profesor, por ejemplo «el 70 % falla en…», con la acción sugerida, la prioridad y el estado. Es la bandeja del profesor |

**Por qué así**

- `dominio_concepto` es un **valor derivado**: se recalcula a partir de los intentos, teniendo en cuenta la dificultad, las pistas, si se vio la solución y el tiempo transcurrido. Así podemos cambiar la fórmula sin perder nada. El algoritmo, por ejemplo *Bayesian Knowledge Tracing* o un Elo por concepto, está por decidir.
- El `estado` guarda el **desbloqueo** (R15): un concepto pasa de `bloqueado` a `disponible` cuando el dominio de sus prerrequisitos necesarios supera su `dominio_minimo`. Se guarda en vez de calcularse al vuelo para poder celebrarlo («¡has desbloqueado X!») y saber cuándo ocurrió.
- Las preferencias guardan por separado lo que el alumno dice y lo que hace. Se pueden contradecir, y conviene ver las dos.
- Cada observación de clase apunta a lo que la originó: un concepto, un error típico, una tarea, un examen o un alumno concreto.

## 6. Exámenes y rutas

| Tabla | Qué representa |
| --- | --- |
| `examen` | Un examen de una clase en una fecha |
| `examen_concepto` | Qué conceptos entran en el examen y cuánto pesa cada uno (1 poco, 2 normal, 3 mucho) |
| `resultado_examen` | La nota real que sacó cada alumno, si decidimos recogerla (P10) |
| `ruta` | Un camino personalizado de un alumno: su temario, la preparación de un examen, un refuerzo o una práctica |
| `paso_ruta` | Cada paso de una ruta, sea contenido o un ejercicio, con su prioridad, el motivo por el que está ahí, la fecha sugerida y si ya se ha hecho |
| `notificacion` | Un aviso para un usuario: examen próximo, tarea nueva, tema desbloqueado, nivel nuevo, novedad en la bandeja… |

**Por qué así**

- Las cuatro formas de avanzar del alumno comparten **una única estructura**, `ruta` con sus `paso_ruta` (D4):
  - `temario`: la ruta de aprendizaje de su clase.
  - `examen`: el mapa de estudio del director de estudios.
  - `refuerzo`: la que se le propone cuando le falta un prerrequisito.
  - `practica`: los ejercicios que pide bajo demanda.
- El profesor elige el contenido del examen **por unidades**, que es como piensa, y lo que se guarda son **conceptos con peso**, que es lo que necesita el mapa de estudio. Al marcar una unidad se añaden sus conceptos, y luego se puede ajustar el peso de cada uno.
- El `motivo` de cada paso permite explicarle al alumno por qué está ahí: «lo fallas a menudo», «repaso para que no se te olvide». Es la cara visible de R3: lo que ya domina sigue apareciendo, pero menos.

## 7. Asistente

| Tabla | Qué representa |
| --- | --- |
| `conversacion` | Una conversación de un alumno con el asistente, con su contexto (un ejercicio, un intento fallido, una duda de teoría o un paso de una ruta) y cómo terminó |
| `mensaje` | Cada mensaje de la conversación: quién lo escribió, de qué tipo es, qué nivel de pista da y hacia qué paso de la resolución apunta |

**Por qué así**

- La conversación se abre **con contexto**. Con ese contexto el asistente puede leer los pasos de resolución y los errores típicos, y así sabe hacia dónde guiar sin necesidad de revelar nada.
- `nivel_pista` refleja la escalera de R7: pregunta, pista conceptual, pista concreta, ejemplo análogo. `paso_id` indica en qué paso se atascó el alumno. Las dos cosas alimentan el dominio (R9) y los informes: «el 60 % pide ayuda en el paso 2».
- `revisar` marca los mensajes en los que un filtro automático detecta que el asistente casi da la solución, para revisarlos y mejorar las instrucciones.

## 8. Gamificación

| Tabla | Qué representa |
| --- | --- |
| `movimiento_puntos` | Cada vez que un alumno gana puntos: cuántos, por qué y en qué clase cuentan |
| `progreso_juego` | El resumen del juego de un alumno: puntos totales, nivel, racha actual y mejor racha |
| `nivel_juego` | Los niveles del juego y los puntos que hacen falta para cada uno |
| `logro` | Las insignias que se pueden conseguir y la condición de cada una |
| `logro_alumno` | Qué insignias tiene cada alumno y cuándo las consiguió |

**Por qué así**

- Los puntos son un **libro de movimientos** (D9): cada punto sabe de dónde viene. `progreso_juego` es solo el total acumulado, que se puede recalcular.
- El **ranking** no tiene tabla propia. Se obtiene sumando los movimientos de una clase en un periodo, si la clase tiene `ranking_activo`. Como el movimiento guarda la clase, los puntos de Matemáticas no cuentan en el ranking de Física.
- **El juego y el aprendizaje van separados a propósito** (D8): los puntos y los niveles premian el esfuerzo, y el desbloqueo depende del dominio (módulo 5), no de los puntos.

---

## Cómo sale cada funcionalidad del modelo

Esta tabla sirve para comprobar que el modelo cubre lo que queremos que haga la aplicación.

| Lo que se ve | De dónde sale |
| --- | --- |
| «El 70 % de tu clase cambia mal el signo al trasponer» (F-P5) | Los `intento_error` de los intentos de las `entrega` de una `tarea`, agrupados por `error_tipico` y contados sobre los alumnos con `matricula` vigente. Se guarda como `observacion_clase` |
| «Tu clase tiene dominadas las ecuaciones de primer grado» | La media de `dominio_concepto.nivel` de los alumnos de la clase en ese concepto |
| La bandeja del profesor (F-P8) | Las `observacion_clase` de sus clases en estado `nueva` o `vista`, ordenadas por `prioridad` |
| El profesor crea un ejercicio (F-P7) | Un `ejercicio` con `origen = profesor`, con sus `ejercicio_concepto` y `paso_resolucion` propuestos por la IA. Queda en `borrador` hasta que él lo revisa |
| El temario del alumno (F-A1, F-A2) | Las `unidad_didactica` de sus clases que ya han empezado, y de ahí `unidad_concepto`, `explicacion` y `representacion`. De cada explicación se muestra primero la representación del formato con más peso en `preferencia_formato` |
| «Tienes examen de X el día Y, vamos a prepararlo» (F-A6) | Un `examen` de una de sus clases en los próximos N días, para el que el alumno todavía no tiene `ruta` de tipo `examen`. Genera una `notificacion` |
| El mapa de estudio | Para cada concepto, `examen_concepto.peso × (1 − dominio_concepto.nivel)` más el mantenimiento. Con eso se crean los `paso_ruta`, ordenados por prioridad y repartidos hasta la fecha del examen |
| «Dame más ejercicios de esto» (F-A5) | Una `ruta` de tipo `practica` con ejercicios de esa tipología, tanto del catálogo como generados desde `plantilla_ejercicio` con `generado_para_id` igual al alumno |
| El asistente (F-A7) | Una `conversacion` ligada al `ejercicio` o al `intento`. El asistente lee `paso_resolucion` y `error_tipico`, y cada pista queda en `mensaje` |
| Las preferencias inferidas (F-A3) | `consumo_contenido` cruzado con los `intento` posteriores del mismo concepto. Actualiza `preferencia_formato.peso_inferido` |
| Puntos y nivel (F-A9) | Cada acierto crea un `movimiento_puntos`, se recalcula `progreso_juego` y, si se supera un umbral de `nivel_juego`, se crea una `notificacion` |
| El ranking semanal (F-A10) | La suma de los `movimiento_puntos` de la clase en esa semana, por alumno |
| «Necesitas dominar X antes de seguir» (F-A11) | `prerrequisito` (con su fuerza y su dominio mínimo) cruzado con el `dominio_concepto` de los conceptos previos. Si la unidad ya está en curso en clase, se abre con aviso y se crea una `ruta` de tipo `refuerzo` (R16) |

## Valores derivados

Se guardan para que las consultas sean rápidas, pero se pueden recalcular en cualquier momento a partir de su fuente:

| Valor | Se calcula a partir de |
| --- | --- |
| `dominio_concepto` | `intento`, `intento_error` y `prerrequisito` (para el estado de desbloqueo) |
| `preferencia_formato.peso_inferido` | `consumo_contenido` e `intento` |
| `entrega.nota` | Los `intento` de la entrega |
| `progreso_juego` | `movimiento_puntos` |
| `paso_ruta` de las rutas de tipo `examen` | `examen_concepto` y `dominio_concepto` (se recalculan, R4) |

## Lo que cambiaría según las preguntas abiertas

| Pregunta | Cambio en el modelo |
| --- | --- |
| P1 · ¿Puede usarla un alumno sin centro? | Aparecen `suscripcion` y `pago`. Habría clases sin centro o una «clase personal» |
| P4 · ¿Contenido propio del profesor? | `explicacion` y `representacion` ganarían un autor y una visibilidad, como ya tiene `ejercicio` |
| P5 · ¿Ejercicios de desarrollo? | Aparece `intento_adjunto` para la foto del cuaderno, y la corrección por pasos pasa a ser `intento_paso` |
| P6 · ¿Ve el profesor las conversaciones? | `conversacion` ganaría un `resumen` para el profesor y unas reglas de quién ve qué |
| P7 · ¿Ven las familias el progreso? | `tutor_legal` pasaría a ser un rol de `usuario`, como `alumno` y `profesor` |
| P11 · ¿Varios idiomas? | `idioma` también en `ejercicio`, `paso_resolucion` y `error_tipico`, o una tabla de traducciones |
| P15 · ¿Qué forma tiene el ranking? | Si hay ligas: `liga` y `liga_alumno`. Si se puede salir del ranking: `alumno.en_ranking` |
