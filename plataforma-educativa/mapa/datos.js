/*
 * Datos del mapa de la plataforma.
 *
 * - Dominios, tablas, «qué representa», «por qué así» y dependencias: sacados de ../esquema.dbml
 *   y ../modelo-datos.md (los dominios son los TableGroup del esquema).
 * - Funcionalidades, reglas, decisiones, preguntas abiertas, glosario y usos de la IA: copiados de
 *   ../README.md, con el dominio al que pertenece cada uno.
 *
 * Si cambian esos documentos, hay que actualizar también este archivo.
 * Los textos admiten **negrita**, *cursiva* y `código`.
 */
window.MAPA = {
  "plataforma": {
    "nombre": "Plataforma educativa",
    "resumen": "Hace de intermediario entre profesores y alumnos de colegios e institutos en matemáticas y, más adelante, en ciencias en general.",
    "principioIa": "La IA redacta y guía, pero los números y las correcciones salen de cálculos que se pueden comprobar."
  },
  "capas": [
    {
      "id": "experiencia",
      "nombre": "Lo que viven el alumno y el profesor",
      "dominios": [
        "tareas",
        "examenes_y_rutas",
        "asistente",
        "gamificacion"
      ]
    },
    {
      "id": "medicion",
      "nombre": "Lo que la plataforma mide",
      "dominios": [
        "seguimiento"
      ]
    },
    {
      "id": "conocimiento",
      "nombre": "Lo que se aprende y se practica",
      "dominios": [
        "curriculo_y_contenido",
        "ejercicios_y_correccion"
      ]
    },
    {
      "id": "base",
      "nombre": "La base",
      "dominios": [
        "organizacion"
      ]
    }
  ],
  "perfiles": [
    {
      "id": "profesor",
      "nombre": "Profesor",
      "resumen": "La plataforma corrige los ejercicios que manda, sean del catálogo o suyos, y le cuenta cómo está su clase: qué tiene bien entendido y en qué falla la mayoría. No le enseña todos los datos, sino lo que merece su atención. Así puede dedicar las clases presenciales a lo que más cuesta."
    },
    {
      "id": "alumno",
      "nombre": "Alumno",
      "resumen": "Aprende a su manera. Tiene el mismo temario que da su profesor, explicado en el formato que mejor le funciona, con ejercicios corregidos al momento y práctica ilimitada bajo demanda. Además cuenta con un **director de estudios** que prepara los exámenes con él y con un **asistente** que le guía cuando se atasca, sin darle la solución. Y todo funciona como un juego."
    }
  ],
  "dominios": [
    {
      "id": "organizacion",
      "numero": 1,
      "nombre": "Organización",
      "color": "#4F46E5",
      "paraQue": "Quién es quién y qué alumno está en qué clase con qué profesor",
      "tablas": [
        {
          "nombre": "centro",
          "representa": "Un colegio o instituto"
        },
        {
          "nombre": "usuario",
          "representa": "Cualquier persona que inicia sesión. Lo que es (alumno o profesor) lo dicen las dos tablas siguientes"
        },
        {
          "nombre": "alumno",
          "representa": "El rol de alumno: su nivel educativo actual, su fecha de nacimiento (para saber si hace falta consentimiento) y el alias que ven sus compañeros en el ranking"
        },
        {
          "nombre": "profesor",
          "representa": "El rol de profesor. `es_admin_centro` indica si además administra el centro"
        },
        {
          "nombre": "tutor_legal",
          "representa": "El padre, la madre o el tutor de un alumno"
        },
        {
          "nombre": "alumno_tutor",
          "representa": "Qué tutor tiene cada alumno y cuándo dio el consentimiento"
        },
        {
          "nombre": "curso_academico",
          "representa": "Un año escolar, por ejemplo 2026-27"
        },
        {
          "nombre": "nivel_educativo",
          "representa": "Una etapa y un curso, por ejemplo 3º ESO"
        },
        {
          "nombre": "asignatura",
          "representa": "Matemáticas, Física y Química…"
        },
        {
          "nombre": "clase",
          "representa": "Un grupo en una asignatura durante un curso académico. Por ejemplo, Matemáticas de 3º ESO B en 2026-27. También guarda la configuración del profesor: si el ranking está activo y si los temas se bloquean o solo avisan"
        },
        {
          "nombre": "docencia",
          "representa": "Qué profesores dan cada clase, como titulares o de apoyo"
        },
        {
          "nombre": "matricula",
          "representa": "Qué alumnos están en cada clase, desde cuándo y hasta cuándo"
        }
      ],
      "porQue": [
        "Todo lo que hace el profesor, como el temario, las tareas o los exámenes, cuelga de la **clase**. Un alumno está en varias clases, una por asignatura.",
        "`alumno` y `profesor` amplían `usuario`, de modo que una misma persona puede iniciar sesión con un único usuario. La matrícula y la docencia apuntan al rol, no al usuario.",
        "La matrícula tiene fechas, así que si un alumno cambia de grupo a mitad de curso no se pierde su historia."
      ]
    },
    {
      "id": "curriculo_y_contenido",
      "numero": 2,
      "nombre": "Currículo y contenido",
      "color": "#0EA5E9",
      "paraQue": "Qué se aprende, en qué orden, cómo lo da cada profesor y en qué formatos se explica",
      "tablas": [
        {
          "nombre": "bloque",
          "representa": "Una gran parte de una asignatura: Números, Álgebra, Geometría, Funciones, Estadística y probabilidad…"
        },
        {
          "nombre": "concepto",
          "representa": "La unidad mínima de conocimiento, por ejemplo «resolver ecuaciones de segundo grado». Todo cuelga de los conceptos"
        },
        {
          "nombre": "prerrequisito",
          "representa": "Qué concepto hay que saber antes de otro. Indica si es *necesario* (bloquea) o *recomendable* (avisa) y el dominio mínimo para desbloquear"
        },
        {
          "nombre": "unidad_didactica",
          "representa": "El tema tal y como lo da un profesor, con sus fechas, por ejemplo «Tema 4: Ecuaciones»"
        },
        {
          "nombre": "unidad_concepto",
          "representa": "Qué conceptos del catálogo cubre cada unidad"
        },
        {
          "nombre": "explicacion",
          "representa": "Una idea concreta que hay que transmitir sobre un concepto"
        },
        {
          "nombre": "formato",
          "representa": "Los tipos de representación: texto, vídeo, interactivo, audio, ejemplo resuelto o esquema"
        },
        {
          "nombre": "representacion",
          "representa": "Una explicación en un formato concreto: el texto, el vídeo, el interactivo…"
        }
      ],
      "porQue": [
        "El **catálogo** (`bloque`, `concepto`, `prerrequisito`) es común a todos los centros. El **temario** (`unidad_didactica`) es de cada profesor, con sus títulos, su orden y sus fechas, pero apunta a conceptos del catálogo. Así cada uno puede seguir su libro y la plataforma sigue sabiendo de qué se habla.",
        "Los prerrequisitos forman un grafo, como `web/src/lib/grafo.ts`. Ese grafo ordena las rutas y decide el **desbloqueo**.",
        "«El mismo contenido de distintas formas» se traduce en que una explicación tiene varias representaciones, una por formato. Las páginas de conceptos de la web serían representaciones de tipo `texto` y los vídeos de Manim, de tipo `video`.",
        "`formato` es una tabla, y no un `Enum`, porque las preferencias del alumno la referencian (módulo 5) y así se pueden añadir formatos nuevos sin cambiar el esquema."
      ]
    },
    {
      "id": "ejercicios_y_correccion",
      "numero": 3,
      "nombre": "Ejercicios y corrección",
      "color": "#10B981",
      "paraQue": "Los ejercicios, sus soluciones y cada respuesta de cada alumno con su diagnóstico",
      "tablas": [
        {
          "nombre": "tipologia",
          "representa": "Una clase de problema, por ejemplo «problemas de móviles»"
        },
        {
          "nombre": "plantilla_ejercicio",
          "representa": "Un ejercicio con parámetros. Genera variantes y su `generador` calcula la solución y los pasos"
        },
        {
          "nombre": "ejercicio",
          "representa": "Un ejercicio concreto: enunciado, tipo de respuesta, solución, dificultad, de dónde viene (catálogo, profesor o generado), quién puede verlo y en qué estado está"
        },
        {
          "nombre": "ejercicio_concepto",
          "representa": "Qué conceptos trabaja cada ejercicio, uno principal y otros secundarios"
        },
        {
          "nombre": "paso_resolucion",
          "representa": "Cada paso de la solución de un ejercicio"
        },
        {
          "nombre": "opcion_respuesta",
          "representa": "Las opciones de un ejercicio de opción múltiple. Cada opción incorrecta puede delatar un error típico"
        },
        {
          "nombre": "error_tipico",
          "representa": "Una equivocación frecuente y reconocible, con cómo ayudar a quien la comete"
        },
        {
          "nombre": "intento",
          "representa": "Cada respuesta de un alumno a un ejercicio: qué respondió, si acertó, cuántas pistas usó y si vio la solución"
        },
        {
          "nombre": "intento_error",
          "representa": "Qué errores típicos se detectaron en un intento, en qué paso y si los detectó una regla o la IA"
        }
      ],
      "porQue": [
        "Un ejercicio trabaja **varios conceptos** y pertenece a **una tipología**. Los conceptos sirven para medir el dominio. La tipología sirve para la práctica bajo demanda («dame más problemas de móviles») y para detectar el tipo de problema que más cuesta.",
        "Los **pasos de resolución** cumplen tres funciones: son lo que ve el alumno si pide la solución, lo que usa el asistente para guiarle sin decírsela y el lugar donde se sitúa el error de un intento.",
        "Los **errores típicos** van más allá de «bien o mal»: sirven para decirle al profesor *por qué* falla la clase.",
        "Un ejercicio generado nace en `borrador` y solo pasa a `verificado` cuando su solución se ha calculado y comprobado (R6). Los del profesor nacen también en `borrador`, con los pasos y los conceptos propuestos por la IA, y se publican cuando él los revisa.",
        "Cada intento viene **o** de una tarea (`entrega_id`) **o** de una ruta (`paso_ruta_id`), nunca de las dos ni de ninguna. Toda la práctica libre vive dentro de una ruta de tipo `practica` (módulo 6). Al pasar el esquema a SQL, esto será una restricción `CHECK`."
      ]
    },
    {
      "id": "tareas",
      "numero": 4,
      "nombre": "Tareas",
      "color": "#F59E0B",
      "paraQue": "Lo que manda el profesor",
      "tablas": [
        {
          "nombre": "tarea",
          "representa": "Una serie de ejercicios que manda el profesor a una clase, con su fecha de entrega, cuántos intentos permite y cuándo se puede ver la solución"
        },
        {
          "nombre": "tarea_ejercicio",
          "representa": "Qué ejercicios tiene la tarea, en qué orden y cuántos puntos vale cada uno"
        },
        {
          "nombre": "entrega",
          "representa": "La tarea de un alumno concreto: si la ha empezado, si la ha entregado y su nota"
        }
      ],
      "porQue": [
        "Al publicar una tarea se crea una entrega para cada alumno al que va dirigida. Si va a toda la clase, se crea para todos; si va a un grupo de refuerzo, solo para ellos (P9). Así no hace falta otra tabla de destinatarios, y «¿quién no ha empezado?» es simplemente una consulta."
      ]
    },
    {
      "id": "seguimiento",
      "numero": 5,
      "nombre": "Seguimiento",
      "color": "#EF4444",
      "paraQue": "Cuánto sabe cada alumno, cómo prefiere aprender y qué le contamos al profesor",
      "tablas": [
        {
          "nombre": "dominio_concepto",
          "representa": "Cuánto sabe un alumno de un concepto (de 0 a 1), con qué confianza lo estimamos y si el concepto está bloqueado, disponible, en progreso o dominado"
        },
        {
          "nombre": "preferencia_formato",
          "representa": "Cuánto le gusta a un alumno cada formato, según lo que dice él y según lo que se deduce de su uso"
        },
        {
          "nombre": "consumo_contenido",
          "representa": "Cada vez que un alumno ve, lee o escucha una representación: cuánto tiempo, hasta dónde y si le ayudó"
        },
        {
          "nombre": "observacion_clase",
          "representa": "Una conclusión para el profesor, por ejemplo «el 70 % falla en…», con la acción sugerida, la prioridad y el estado. Es la bandeja del profesor"
        }
      ],
      "porQue": [
        "`dominio_concepto` es un **valor derivado**: se recalcula a partir de los intentos, teniendo en cuenta la dificultad, las pistas, si se vio la solución y el tiempo transcurrido. Así podemos cambiar la fórmula sin perder nada. El algoritmo, por ejemplo *Bayesian Knowledge Tracing* o un Elo por concepto, está por decidir.",
        "El `estado` guarda el **desbloqueo** (R15): un concepto pasa de `bloqueado` a `disponible` cuando el dominio de sus prerrequisitos necesarios supera su `dominio_minimo`. Se guarda en vez de calcularse al vuelo para poder celebrarlo («¡has desbloqueado X!») y saber cuándo ocurrió.",
        "Las preferencias guardan por separado lo que el alumno dice y lo que hace. Se pueden contradecir, y conviene ver las dos.",
        "Cada observación de clase apunta a lo que la originó: un concepto, un error típico, una tarea, un examen o un alumno concreto."
      ]
    },
    {
      "id": "examenes_y_rutas",
      "numero": 6,
      "nombre": "Exámenes y rutas",
      "color": "#8B5CF6",
      "paraQue": "El director de estudios, la ruta de aprendizaje y la práctica bajo demanda",
      "tablas": [
        {
          "nombre": "examen",
          "representa": "Un examen de una clase en una fecha"
        },
        {
          "nombre": "examen_concepto",
          "representa": "Qué conceptos entran en el examen y cuánto pesa cada uno (1 poco, 2 normal, 3 mucho)"
        },
        {
          "nombre": "resultado_examen",
          "representa": "La nota real que sacó cada alumno, si decidimos recogerla (P10)"
        },
        {
          "nombre": "ruta",
          "representa": "Un camino personalizado de un alumno: su temario, la preparación de un examen, un refuerzo o una práctica"
        },
        {
          "nombre": "paso_ruta",
          "representa": "Cada paso de una ruta, sea contenido o un ejercicio, con su prioridad, el motivo por el que está ahí, la fecha sugerida y si ya se ha hecho"
        },
        {
          "nombre": "notificacion",
          "representa": "Un aviso para un usuario: examen próximo, tarea nueva, tema desbloqueado, nivel nuevo, novedad en la bandeja…"
        }
      ],
      "porQue": [
        {
          "texto": "Las cuatro formas de avanzar del alumno comparten **una única estructura**, `ruta` con sus `paso_ruta` (D4):",
          "subpuntos": [
            "`temario`: la ruta de aprendizaje de su clase.",
            "`examen`: el mapa de estudio del director de estudios.",
            "`refuerzo`: la que se le propone cuando le falta un prerrequisito.",
            "`practica`: los ejercicios que pide bajo demanda."
          ]
        },
        "El profesor elige el contenido del examen **por unidades**, que es como piensa, y lo que se guarda son **conceptos con peso**, que es lo que necesita el mapa de estudio. Al marcar una unidad se añaden sus conceptos, y luego se puede ajustar el peso de cada uno.",
        "El `motivo` de cada paso permite explicarle al alumno por qué está ahí: «lo fallas a menudo», «repaso para que no se te olvide». Es la cara visible de R3: lo que ya domina sigue apareciendo, pero menos."
      ]
    },
    {
      "id": "asistente",
      "numero": 7,
      "nombre": "Asistente",
      "color": "#EC4899",
      "paraQue": "Las conversaciones con el tutor",
      "tablas": [
        {
          "nombre": "conversacion",
          "representa": "Una conversación de un alumno con el asistente, con su contexto (un ejercicio, un intento fallido, una duda de teoría o un paso de una ruta) y cómo terminó"
        },
        {
          "nombre": "mensaje",
          "representa": "Cada mensaje de la conversación: quién lo escribió, de qué tipo es, qué nivel de pista da y hacia qué paso de la resolución apunta"
        }
      ],
      "porQue": [
        "La conversación se abre **con contexto**. Con ese contexto el asistente puede leer los pasos de resolución y los errores típicos, y así sabe hacia dónde guiar sin necesidad de revelar nada.",
        "`nivel_pista` refleja la escalera de R7: pregunta, pista conceptual, pista concreta, ejemplo análogo. `paso_id` indica en qué paso se atascó el alumno. Las dos cosas alimentan el dominio (R9) y los informes: «el 60 % pide ayuda en el paso 2».",
        "`revisar` marca los mensajes en los que un filtro automático detecta que el asistente casi da la solución, para revisarlos y mejorar las instrucciones."
      ]
    },
    {
      "id": "gamificacion",
      "numero": 8,
      "nombre": "Gamificación",
      "color": "#84CC16",
      "paraQue": "Puntos, niveles, logros y rankings",
      "tablas": [
        {
          "nombre": "movimiento_puntos",
          "representa": "Cada vez que un alumno gana puntos: cuántos, por qué y en qué clase cuentan"
        },
        {
          "nombre": "progreso_juego",
          "representa": "El resumen del juego de un alumno: puntos totales, nivel, racha actual y mejor racha"
        },
        {
          "nombre": "nivel_juego",
          "representa": "Los niveles del juego y los puntos que hacen falta para cada uno"
        },
        {
          "nombre": "logro",
          "representa": "Las insignias que se pueden conseguir y la condición de cada una"
        },
        {
          "nombre": "logro_alumno",
          "representa": "Qué insignias tiene cada alumno y cuándo las consiguió"
        }
      ],
      "porQue": [
        "Los puntos son un **libro de movimientos** (D9): cada punto sabe de dónde viene. `progreso_juego` es solo el total acumulado, que se puede recalcular.",
        "El **ranking** no tiene tabla propia. Se obtiene sumando los movimientos de una clase en un periodo, si la clase tiene `ranking_activo`. Como el movimiento guarda la clase, los puntos de Matemáticas no cuentan en el ranking de Física.",
        "**El juego y el aprendizaje van separados a propósito** (D8): los puntos y los niveles premian el esfuerzo, y el desbloqueo depende del dominio (módulo 5), no de los puntos."
      ]
    }
  ],
  "dependencias": [
    {
      "de": "curriculo_y_contenido",
      "a": "organizacion",
      "relaciones": 3
    },
    {
      "de": "ejercicios_y_correccion",
      "a": "curriculo_y_contenido",
      "relaciones": 4
    },
    {
      "de": "ejercicios_y_correccion",
      "a": "organizacion",
      "relaciones": 3
    },
    {
      "de": "ejercicios_y_correccion",
      "a": "tareas",
      "relaciones": 1
    },
    {
      "de": "ejercicios_y_correccion",
      "a": "examenes_y_rutas",
      "relaciones": 1
    },
    {
      "de": "tareas",
      "a": "organizacion",
      "relaciones": 3
    },
    {
      "de": "tareas",
      "a": "ejercicios_y_correccion",
      "relaciones": 1
    },
    {
      "de": "seguimiento",
      "a": "organizacion",
      "relaciones": 5
    },
    {
      "de": "seguimiento",
      "a": "curriculo_y_contenido",
      "relaciones": 4
    },
    {
      "de": "seguimiento",
      "a": "examenes_y_rutas",
      "relaciones": 2
    },
    {
      "de": "seguimiento",
      "a": "ejercicios_y_correccion",
      "relaciones": 1
    },
    {
      "de": "seguimiento",
      "a": "tareas",
      "relaciones": 1
    },
    {
      "de": "examenes_y_rutas",
      "a": "organizacion",
      "relaciones": 5
    },
    {
      "de": "examenes_y_rutas",
      "a": "curriculo_y_contenido",
      "relaciones": 4
    },
    {
      "de": "examenes_y_rutas",
      "a": "ejercicios_y_correccion",
      "relaciones": 2
    },
    {
      "de": "asistente",
      "a": "organizacion",
      "relaciones": 1
    },
    {
      "de": "asistente",
      "a": "ejercicios_y_correccion",
      "relaciones": 3
    },
    {
      "de": "asistente",
      "a": "curriculo_y_contenido",
      "relaciones": 1
    },
    {
      "de": "asistente",
      "a": "examenes_y_rutas",
      "relaciones": 1
    },
    {
      "de": "gamificacion",
      "a": "organizacion",
      "relaciones": 4
    },
    {
      "de": "gamificacion",
      "a": "ejercicios_y_correccion",
      "relaciones": 1
    },
    {
      "de": "gamificacion",
      "a": "examenes_y_rutas",
      "relaciones": 1
    }
  ],
  "funcionalidades": [
    {
      "id": "F-P1",
      "perfil": "profesor",
      "nombre": "Clases",
      "detalle": "Ve sus clases y sus alumnos",
      "dominio": "organizacion",
      "tambien": []
    },
    {
      "id": "F-P2",
      "perfil": "profesor",
      "nombre": "Temario",
      "detalle": "Indica qué unidades da y cuándo. Los alumnos tienen ese mismo temario en la plataforma, al ritmo de la clase",
      "dominio": "curriculo_y_contenido",
      "tambien": []
    },
    {
      "id": "F-P3",
      "perfil": "profesor",
      "nombre": "Tareas",
      "detalle": "Manda series de ejercicios con fecha de entrega. Los ejercicios pueden venir del catálogo, ser suyos o generarse",
      "dominio": "tareas",
      "tambien": [
        "ejercicios_y_correccion"
      ]
    },
    {
      "id": "F-P4",
      "perfil": "profesor",
      "nombre": "Corrección automática",
      "detalle": "La plataforma corrige cada respuesta en tiempo real y detecta qué error se ha cometido, no solo si está bien o mal",
      "dominio": "ejercicios_y_correccion",
      "tambien": []
    },
    {
      "id": "F-P5",
      "perfil": "profesor",
      "nombre": "Salud de la clase",
      "detalle": "Muestra conclusiones por tarea y globales: «el 70 % de la clase cambia mal el signo al trasponer términos», «tu clase tiene dominadas las ecuaciones de primer grado». Avisa también de los alumnos que se están quedando atrás",
      "dominio": "seguimiento",
      "tambien": []
    },
    {
      "id": "F-P6",
      "perfil": "profesor",
      "nombre": "Exámenes",
      "detalle": "Registra la fecha de cada examen y su contenido, elegido entre lo que la clase ya ha dado o dará antes de esa fecha",
      "dominio": "examenes_y_rutas",
      "tambien": [
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "F-P7",
      "perfil": "profesor",
      "nombre": "Crear ejercicios",
      "detalle": "Escribe sus propios ejercicios con su solución y su resolución. La plataforma le ayuda proponiendo los pasos, los conceptos que trabaja el ejercicio y los errores típicos que puede provocar. Así sus ejercicios alimentan los informes igual que los del catálogo",
      "dominio": "ejercicios_y_correccion",
      "tambien": []
    },
    {
      "id": "F-P8",
      "perfil": "profesor",
      "nombre": "Ayuda con los datos",
      "detalle": "En lugar de tablas, le presenta una bandeja con lo importante, ordenado por prioridad: los problemas de la clase, los alumnos que necesitan atención y qué repasar en la próxima sesión. Cada punto trae una acción sugerida, como mandar una tarea de refuerzo, y el profesor puede marcarlo como atendido o descartarlo",
      "dominio": "seguimiento",
      "tambien": []
    },
    {
      "id": "F-A1",
      "perfil": "alumno",
      "nombre": "Temario sincronizado",
      "detalle": "Ve las unidades que su profesor va dando",
      "dominio": "curriculo_y_contenido",
      "tambien": []
    },
    {
      "id": "F-A2",
      "perfil": "alumno",
      "nombre": "Contenido en varios formatos",
      "detalle": "La misma explicación está disponible en texto, vídeo, visual interactivo, audio, ejemplo resuelto o esquema. Por defecto se le muestra su formato preferido, pero tiene todos a su alcance",
      "dominio": "curriculo_y_contenido",
      "tambien": [
        "seguimiento"
      ]
    },
    {
      "id": "F-A3",
      "perfil": "alumno",
      "nombre": "Perfil de aprendizaje",
      "detalle": "Combina las preferencias que declara él (un cuestionario inicial) con las que se infieren de lo que consume y de lo que le funciona",
      "dominio": "seguimiento",
      "tambien": []
    },
    {
      "id": "F-A4",
      "perfil": "alumno",
      "nombre": "Ruta de aprendizaje",
      "detalle": "Alterna contenido y ejercicios integrados, que se corrigen automáticamente y en tiempo real",
      "dominio": "examenes_y_rutas",
      "tambien": [
        "curriculo_y_contenido",
        "ejercicios_y_correccion"
      ]
    },
    {
      "id": "F-A5",
      "perfil": "alumno",
      "nombre": "Práctica bajo demanda",
      "detalle": "Puede pedir más ejercicios del concepto o tipo de problema que le cuesta, aunque el profesor no los haya mandado. Cada ejercicio trae su solución y la resolución paso a paso",
      "dominio": "ejercicios_y_correccion",
      "tambien": [
        "examenes_y_rutas"
      ]
    },
    {
      "id": "F-A6",
      "perfil": "alumno",
      "nombre": "Director de estudios",
      "detalle": "Al entrar le avisa: «Tienes examen de X el día Y, vamos a prepararlo». Después genera un mapa de estudio con lo que entra en el examen: insiste en lo que peor sabe y no abandona lo que ya domina, solo le dedica menos tiempo",
      "dominio": "examenes_y_rutas",
      "tambien": [
        "seguimiento"
      ]
    },
    {
      "id": "F-A7",
      "perfil": "alumno",
      "nombre": "Asistente tutor",
      "detalle": "Le guía cuando no llega a la solución, con preguntas y pistas para que la encuentre él. Nunca resuelve el problema por él. También responde dudas de teoría",
      "dominio": "asistente",
      "tambien": [
        "ejercicios_y_correccion"
      ]
    },
    {
      "id": "F-A8",
      "perfil": "alumno",
      "nombre": "Tareas",
      "detalle": "Ve las tareas que le ha mandado su profesor y hace las entregas",
      "dominio": "tareas",
      "tambien": []
    },
    {
      "id": "F-A9",
      "perfil": "alumno",
      "nombre": "Puntos y niveles",
      "detalle": "Gana puntos resolviendo problemas y con ellos sube de nivel, con la sensación de avanzar dentro de un juego",
      "dominio": "gamificacion",
      "tambien": []
    },
    {
      "id": "F-A10",
      "perfil": "alumno",
      "nombre": "Ranking de clase",
      "detalle": "Compite con sus compañeros por quién resuelve más y mejor",
      "dominio": "gamificacion",
      "tambien": []
    },
    {
      "id": "F-A11",
      "perfil": "alumno",
      "nombre": "Desbloqueo progresivo",
      "detalle": "El temario se abre a medida que domina lo anterior. Si un concepto es base para el siguiente, se le exige dominarlo, o por lo menos se le avisa: «necesitas entender bien esto antes de seguir; si no, no vas a entender lo que viene»",
      "dominio": "seguimiento",
      "tambien": [
        "curriculo_y_contenido"
      ]
    }
  ],
  "reglas": [
    {
      "id": "R1",
      "texto": "El alumno ve en su temario las unidades de su clase que ya han empezado (P8: ¿puede adelantarse?)",
      "dominios": [
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "R2",
      "texto": "En un examen solo pueden entrar conceptos de las unidades de la clase, tanto las ya dadas como las que se darán antes de la fecha del examen",
      "dominios": [
        "examenes_y_rutas",
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "R3",
      "texto": "La **prioridad** de cada concepto en el mapa de estudio es `peso en el examen × (1 − dominio) + mantenimiento`. El mantenimiento es un mínimo que garantiza que lo dominado sigue apareciendo, aunque menos. Se añade también el tiempo que ha pasado desde la última vez que lo practicó, para que no se olvide",
      "dominios": [
        "examenes_y_rutas",
        "seguimiento"
      ]
    },
    {
      "id": "R4",
      "texto": "El mapa de estudio reparte los pasos entre hoy y la fecha del examen. Se recalcula cuando cambia el dominio del alumno, por ejemplo después de cada sesión, o cuando el profesor cambia el examen",
      "dominios": [
        "examenes_y_rutas"
      ]
    },
    {
      "id": "R5",
      "texto": "Las respuestas se corrigen por **equivalencia matemática** con la solución, no comparando texto: `1/2`, `0,5` y `x = 1/2` valen lo mismo",
      "dominios": [
        "ejercicios_y_correccion"
      ]
    },
    {
      "id": "R6",
      "texto": "Un ejercicio generado no se le muestra a nadie hasta que su solución se ha **comprobado por cálculo**. No basta con que la haya dado la IA",
      "dominios": [
        "ejercicios_y_correccion"
      ]
    },
    {
      "id": "R7",
      "texto": "El asistente **nunca da la respuesta final ni un paso completo**. Sube de nivel poco a poco: primero una pregunta que haga pensar, luego una pista conceptual, después una pista concreta y por último un ejemplo análogo resuelto",
      "dominios": [
        "asistente"
      ]
    },
    {
      "id": "R8",
      "texto": "Si el alumno se rinde, puede ver la resolución paso a paso. Es una acción suya, no algo que haga el asistente, y queda registrada. En las tareas, el profesor decide cuándo se puede ver la solución: al responder, al entregar o al cerrar la tarea",
      "dominios": [
        "ejercicios_y_correccion",
        "tareas",
        "asistente"
      ]
    },
    {
      "id": "R9",
      "texto": "Para calcular el dominio cuentan las pistas usadas y si el alumno vio la solución: un acierto después de tres pistas vale menos que uno a la primera",
      "dominios": [
        "seguimiento",
        "asistente"
      ]
    },
    {
      "id": "R10",
      "texto": "Se muestra por defecto el formato preferido. Las preferencias inferidas se ajustan según lo que el alumno consume y su rendimiento posterior en ese mismo concepto",
      "dominios": [
        "curriculo_y_contenido",
        "seguimiento"
      ]
    },
    {
      "id": "R11",
      "texto": "Una observación de debilidad se genera cuando un porcentaje de la clase falla en un concepto o comete un error típico. Ese porcentaje es un umbral por decidir, por ejemplo el 40 %, y además hace falta un mínimo de respuestas para que sea significativo",
      "dominios": [
        "seguimiento"
      ]
    },
    {
      "id": "R12",
      "texto": "Los **puntos** que da un acierto dependen de la dificultad del ejercicio, de si salió a la primera y de las pistas que se usaron. Ver la solución no da puntos. Si el alumno repite ejercicios fáciles de un concepto que ya domina, cada vez gana menos, para que subir de nivel exija avanzar y no repetir",
      "dominios": [
        "gamificacion"
      ]
    },
    {
      "id": "R13",
      "texto": "También dan puntos completar pasos de la ruta, mantener una racha de días y terminar la preparación de un examen *(propuesta)*",
      "dominios": [
        "gamificacion",
        "examenes_y_rutas"
      ]
    },
    {
      "id": "R14",
      "texto": "Los **niveles de juego** se alcanzan con los puntos acumulados y nunca se pierden",
      "dominios": [
        "gamificacion"
      ]
    },
    {
      "id": "R15",
      "texto": "Un concepto se **desbloquea** cuando el alumno alcanza el dominio mínimo en sus prerrequisitos *necesarios*. Los *recomendables* no bloquean, solo generan un aviso",
      "dominios": [
        "seguimiento",
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "R16",
      "texto": "Si el profesor ya está dando en clase una unidad cuyos prerrequisitos el alumno no domina, esa unidad **no se bloquea**, porque la necesita para seguir la clase. Se abre con un aviso y se le propone una ruta de refuerzo del prerrequisito *(propuesta, ver P16)*",
      "dominios": [
        "seguimiento",
        "curriculo_y_contenido",
        "examenes_y_rutas"
      ]
    },
    {
      "id": "R17",
      "texto": "El **ranking** es de cada clase y por periodo, por ejemplo semanal, y cuenta solo los puntos de esa asignatura. El profesor puede desactivarlo *(la forma exacta está pendiente, ver P15)*",
      "dominios": [
        "gamificacion"
      ]
    }
  ],
  "decisiones": [
    {
      "id": "D1",
      "decision": "El **concepto** es la unidad de todo",
      "porque": "Es lo que permite decir «tu clase falla en X», preparar un examen por conceptos y medir el dominio",
      "dominios": [
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "D2",
      "decision": "Hay un **catálogo común** de conceptos y cada profesor tiene **su propio temario**, que apunta a ese catálogo",
      "porque": "Cada profesor sigue su libro y su orden, pero así todos hablan el mismo idioma",
      "dominios": [
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "D3",
      "decision": "Cada **explicación** tiene varias **representaciones**, una por formato",
      "porque": "Es la forma de enseñar el mismo contenido de varias maneras sin duplicar los conceptos",
      "dominios": [
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "D4",
      "decision": "Una **única estructura de ruta** para el temario, la preparación de exámenes, el refuerzo y la práctica",
      "porque": "El director de estudios, la práctica bajo demanda y la ruta de aprendizaje funcionan igual por dentro",
      "dominios": [
        "examenes_y_rutas"
      ]
    },
    {
      "id": "D5",
      "decision": "Los **intentos** son la fuente de la verdad y el **dominio** es un valor derivado",
      "porque": "El dominio se puede recalcular si cambiamos la fórmula, sin perder historia",
      "dominios": [
        "ejercicios_y_correccion",
        "seguimiento"
      ]
    },
    {
      "id": "D6",
      "decision": "Los ejercicios se generan a partir de **plantillas** con la solución calculada",
      "porque": "Así hay ejercicios ilimitados y todos tienen la solución garantizada",
      "dominios": [
        "ejercicios_y_correccion"
      ]
    },
    {
      "id": "D7",
      "decision": "Hay un **catálogo de errores típicos**",
      "porque": "Permite ir más allá de «está mal»: decir qué falla y cómo ayudar al alumno, tanto al profesor como al asistente",
      "dominios": [
        "ejercicios_y_correccion",
        "asistente"
      ]
    },
    {
      "id": "D8",
      "decision": "El temario se **desbloquea por dominio de los prerrequisitos, no por puntos**",
      "porque": "Los puntos se pueden acumular repitiendo cosas fáciles; el dominio no. Los puntos premian el esfuerzo y el dominio garantiza que el alumno está preparado. Juntos dan la sensación de juego sin dejar huecos en lo que aprende",
      "dominios": [
        "seguimiento",
        "gamificacion"
      ]
    },
    {
      "id": "D9",
      "decision": "Los puntos se guardan como **movimientos**, y el total y el nivel se calculan a partir de ellos",
      "porque": "Se puede explicar de dónde sale cada punto, cambiar las reglas y recalcular, y hacer rankings de cualquier periodo",
      "dominios": [
        "gamificacion"
      ]
    },
    {
      "id": "D10",
      "decision": "Las observaciones de clase funcionan como una **bandeja** que tiene prioridad, acción sugerida y estado",
      "porque": "El profesor no tiene que interpretar los datos. Ve qué hacer y lleva la cuenta de lo que ya ha atendido",
      "dominios": [
        "seguimiento"
      ]
    }
  ],
  "preguntas": [
    {
      "id": "P1",
      "texto": "¿Vendemos a centros, a familias o a ambos? ¿Puede un alumno usar la plataforma aunque su colegio no la tenga?",
      "afecta": "Si el alumno pertenece siempre a un centro, quién crea las clases, pagos y suscripciones",
      "clave": true,
      "dominios": [
        "organizacion"
      ]
    },
    {
      "id": "P2",
      "texto": "¿Qué etapas cubrimos: ESO, Bachillerato, también Primaria?",
      "afecta": "Niveles, consentimientos, tono del asistente",
      "clave": false,
      "dominios": [
        "organizacion",
        "asistente"
      ]
    },
    {
      "id": "P3",
      "texto": "¿Qué asignaturas entran en la primera versión? Propuesta: solo Matemáticas",
      "afecta": "Contenido que hay que producir",
      "clave": false,
      "dominios": [
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "P4",
      "texto": "Los profesores **sí** crean ejercicios (F-P7). Falta decidir: ¿también crean explicaciones o material propio, o eso es solo del catálogo? ¿Sus ejercicios son privados, se comparten con el centro o pueden proponerse para el catálogo?",
      "afecta": "Si el contenido es global o pertenece a una clase o a un autor, y su visibilidad",
      "clave": true,
      "dominios": [
        "ejercicios_y_correccion",
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "P5",
      "texto": "¿Corregimos ejercicios de desarrollo, es decir, todo el razonamiento, quizá a partir de una foto del cuaderno? ¿O solo la respuesta final?",
      "afecta": "Tipos de respuesta, diagnóstico con IA, coste y fiabilidad",
      "clave": true,
      "dominios": [
        "ejercicios_y_correccion"
      ]
    },
    {
      "id": "P6",
      "texto": "¿Puede el profesor ver las conversaciones del alumno con el asistente, o solo un resumen? ¿Y la familia?",
      "afecta": "Privacidad, qué se guarda de cada conversación",
      "clave": true,
      "dominios": [
        "asistente"
      ]
    },
    {
      "id": "P7",
      "texto": "¿Pueden las familias ver el progreso?",
      "afecta": "Si el tutor legal es también un usuario con acceso",
      "clave": false,
      "dominios": [
        "organizacion"
      ]
    },
    {
      "id": "P8",
      "texto": "¿Puede el alumno adelantar temario que su profesor todavía no ha dado?",
      "afecta": "R1",
      "clave": false,
      "dominios": [
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "P9",
      "texto": "¿Puede el profesor mandar una tarea solo a una parte de la clase, por ejemplo de refuerzo o de ampliación?",
      "afecta": "Entregas (el modelo ya lo permite)",
      "clave": false,
      "dominios": [
        "tareas"
      ]
    },
    {
      "id": "P10",
      "texto": "¿Recogemos la nota real de los exámenes?",
      "afecta": "Medir si la preparación funciona",
      "clave": false,
      "dominios": [
        "examenes_y_rutas"
      ]
    },
    {
      "id": "P11",
      "texto": "¿Idiomas: solo castellano, o también lenguas cooficiales e inglés para centros bilingües?",
      "afecta": "Idioma de las representaciones y de los ejercicios",
      "clave": false,
      "dominios": [
        "curriculo_y_contenido",
        "ejercicios_y_correccion"
      ]
    },
    {
      "id": "P12",
      "texto": "¿Cómo se conecta la IA? En tus apps personales va por tu sesión de Claude Code. Con alumnos reales (muchos usuarios a la vez y datos de menores) eso no escala",
      "afecta": "Arquitectura y coste",
      "clave": false,
      "dominios": []
    },
    {
      "id": "P13",
      "texto": "¿Qué entra en la primera versión? Ojo con las dependencias: el asistente necesita ejercicios con sus pasos de resolución, y el director de estudios necesita conceptos, exámenes y suficientes intentos para estimar el dominio",
      "afecta": "Alcance",
      "clave": false,
      "dominios": []
    },
    {
      "id": "P14",
      "texto": "¿Cómo se llama la aplicación?",
      "afecta": "—",
      "clave": false,
      "dominios": []
    },
    {
      "id": "P15",
      "texto": "¿Cómo es el ranking? Con menores, un ranking que solo premia al mejor puede desmotivar a los últimos. Algunas opciones: que cuente el progreso de la semana en vez del total, ligas por nivel, que cada alumno solo vea su puesto y los cercanos, poder salir del ranking…",
      "afecta": "Cómo se calcula y quién ve qué",
      "clave": true,
      "dominios": [
        "gamificacion"
      ]
    },
    {
      "id": "P16",
      "texto": "Cuando el profesor va por delante de lo que el alumno domina, ¿se bloquea, se avisa o decide el profesor? (R16 propone avisar)",
      "afecta": "El desbloqueo y la configuración de la clase",
      "clave": true,
      "dominios": [
        "seguimiento",
        "curriculo_y_contenido"
      ]
    },
    {
      "id": "P17",
      "texto": "¿Qué dominio mínimo se exige para desbloquear: uno igual para todos o uno por prerrequisito? ¿Puede ajustarlo el profesor?",
      "afecta": "Los prerrequisitos y la clase",
      "clave": false,
      "dominios": [
        "curriculo_y_contenido",
        "seguimiento"
      ]
    }
  ],
  "glosario": [
    {
      "termino": "Concepto",
      "definicion": "La unidad mínima de conocimiento, por ejemplo «resolver ecuaciones de segundo grado». Todo cuelga de los conceptos: el contenido, los ejercicios, el dominio del alumno, los exámenes y los informes. Cada concepto tiene sus prerrequisitos",
      "dominio": "curriculo_y_contenido"
    },
    {
      "termino": "Bloque",
      "definicion": "Agrupa los conceptos de una asignatura: Números, Álgebra, Geometría, Funciones, Estadística y probabilidad…",
      "dominio": "curriculo_y_contenido"
    },
    {
      "termino": "Unidad didáctica",
      "definicion": "El tema tal y como lo da un profesor concreto, con sus fechas, por ejemplo «Tema 4: Ecuaciones». Agrupa conceptos del catálogo",
      "dominio": "curriculo_y_contenido"
    },
    {
      "termino": "Explicación",
      "definicion": "Una idea concreta que hay que transmitir sobre un concepto",
      "dominio": "curriculo_y_contenido"
    },
    {
      "termino": "Representación",
      "definicion": "Una explicación en un formato concreto. Una misma explicación tiene varias representaciones",
      "dominio": "curriculo_y_contenido"
    },
    {
      "termino": "Formato",
      "definicion": "El tipo de representación: texto, vídeo, interactivo, audio, ejemplo resuelto o esquema",
      "dominio": "curriculo_y_contenido"
    },
    {
      "termino": "Tipología",
      "definicion": "Una clase de problema, por ejemplo «problemas de móviles» o «ecuaciones con fracciones»",
      "dominio": "ejercicios_y_correccion"
    },
    {
      "termino": "Plantilla",
      "definicion": "Un ejercicio con parámetros. Genera variantes cuya solución se calcula por código",
      "dominio": "ejercicios_y_correccion"
    },
    {
      "termino": "Paso de resolución",
      "definicion": "Cada paso de la solución de un ejercicio. Es lo que se le enseña al alumno y lo que usa el asistente para guiarle",
      "dominio": "ejercicios_y_correccion"
    },
    {
      "termino": "Error típico",
      "definicion": "Una equivocación frecuente y reconocible, por ejemplo «cambia mal el signo al pasar un término al otro miembro»",
      "dominio": "ejercicios_y_correccion"
    },
    {
      "termino": "Intento",
      "definicion": "Cada respuesta de un alumno a un ejercicio. Es la fuente de la verdad sobre el progreso",
      "dominio": "ejercicios_y_correccion"
    },
    {
      "termino": "Dominio",
      "definicion": "Cuánto sabe un alumno de un concepto, en una escala de 0 a 1. Se calcula a partir de sus intentos",
      "dominio": "seguimiento"
    },
    {
      "termino": "Observación de clase",
      "definicion": "Una conclusión para el profesor, por ejemplo «la mayoría falla en…», junto con una acción sugerida. Forma parte de su bandeja",
      "dominio": "seguimiento"
    },
    {
      "termino": "Desbloqueo",
      "definicion": "El momento en que un concepto pasa a estar disponible para el alumno, porque ya domina sus prerrequisitos",
      "dominio": "seguimiento"
    },
    {
      "termino": "Ruta",
      "definicion": "Una secuencia personalizada de pasos, cada uno de contenido o de ejercicio. Hay cuatro tipos: temario, preparación de examen, refuerzo y práctica",
      "dominio": "examenes_y_rutas"
    },
    {
      "termino": "Puntos",
      "definicion": "La recompensa por resolver y avanzar. Cada vez que se ganan puntos se apunta un movimiento, y el total es la suma de todos ellos",
      "dominio": "gamificacion"
    },
    {
      "termino": "Nivel de juego",
      "definicion": "El escalón al que se llega acumulando puntos. No hay que confundirlo con el nivel educativo (3º ESO)",
      "dominio": "gamificacion"
    },
    {
      "termino": "Logro",
      "definicion": "Una insignia que se consigue al cumplir una condición, por ejemplo una racha de 7 días o dominar un bloque entero",
      "dominio": "gamificacion"
    }
  ],
  "ia": [
    {
      "uso": "Asistente tutor",
      "hace": "Conversa, pregunta y da pistas apoyándose en los pasos de resolución y en los errores típicos",
      "noHace": "Dar la solución",
      "dominio": "asistente"
    },
    {
      "uso": "Generación de ejercicios",
      "hace": "Propone enunciados y variantes de las plantillas",
      "noHace": "Decidir la respuesta correcta, que se calcula y se verifica",
      "dominio": "ejercicios_y_correccion"
    },
    {
      "uso": "Ayuda al profesor",
      "hace": "Propone los pasos de resolución, los conceptos y los errores típicos de los ejercicios que escribe el profesor",
      "noHace": "Publicarlos sin que el profesor los revise",
      "dominio": "ejercicios_y_correccion"
    },
    {
      "uso": "Diagnóstico de errores",
      "hace": "Interpreta las respuestas abiertas cuando las reglas no bastan",
      "noHace": "Sustituir a las reglas cuando hay reglas",
      "dominio": "ejercicios_y_correccion"
    },
    {
      "uso": "Observaciones de clase",
      "hace": "Redacta el texto para el profesor a partir de las cifras ya calculadas",
      "noHace": "Calcular las cifras",
      "dominio": "seguimiento"
    },
    {
      "uso": "Contenido",
      "hace": "Prepara borradores de representaciones",
      "noHace": "Publicarlas sin que las revise el equipo",
      "dominio": "curriculo_y_contenido"
    }
  ]
};
