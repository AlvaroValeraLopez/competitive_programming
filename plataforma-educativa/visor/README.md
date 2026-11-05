# Visor de esquema

Herramienta propia y gratuita para ver el esquema de la plataforma ([`../esquema.dbml`](../esquema.dbml)) como diagrama entidad-relación, sin depender de dbdiagram.io. Lee el DBML con el parser oficial (`@dbml/core`), así que lo que se ve aquí es lo mismo que entendería dbdiagram. Junto a cada tabla muestra además lo que explica de ella [`../modelo-datos.md`](../modelo-datos.md).

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5200
npm test         # tests de la lectura del DBML y del documento, la disposición y el SVG
```

Para ver otro esquema: `VISOR_DBML=/ruta/a/otro.dbml npm run dev`. El documento se busca junto a él como `modelo-datos.md`, o se indica con `VISOR_DOC`; si no existe, el visor funciona igual, sin explicaciones.

## Qué hace

- **Tablas** con sus columnas y tipos. La llave marca la clave primaria, el eslabón la clave ajena y `?` las columnas que admiten nulo. El punto índigo indica que la columna tiene nota, y al pasar el ratón se ve la nota y el resto de rasgos.
- **Relaciones** de columna a columna, con pata de gallo en el lado «muchos» y barra en el lado «uno». Las opcionales, cuya clave ajena admite nulo, van en discontinua.
- **Grupos** (`TableGroup`) con su color y su nota. Cada grupo se arrastra desde su cabecera y se puede ocultar desde la barra lateral.
- **Resaltado.** Al pasar el ratón por una tabla o seleccionarla, se resaltan ella y sus relaciones y se atenúa el resto.
- **Panel de detalle** al hacer clic en una tabla, con tres pestañas:
  - **Explicación**: lo que dice `modelo-datos.md` de la tabla, mezclado con la nota del DBML. Incluye qué representa, el «Por qué así» de su módulo que habla de ella, si es un valor derivado, las funcionalidades que salen de ella y qué cambiaría según las preguntas abiertas. Las tablas y los enums que nombra el texto son enlaces.
  - **Columnas**: con insignias, valores por defecto, notas e índices.
  - **Relaciones**: a qué apunta y quién la referencia.

  Al hacer clic en un tipo `Enum` se ven sus valores y dónde se usa.
- **Búsqueda** en nombres y notas de tablas y columnas. Se abre con `/` y se borra con `Esc`.
- **Recarga en vivo.** Al guardar `esquema.dbml` o `modelo-datos.md`, el diagrama y el panel se actualizan sin perder la disposición ni la selección. La tarjeta del archivo cuenta cuántas tablas explica el documento y avisa de las que faltan y de las que ya no existen. Si el DBML tiene un error, se muestra la línea y se mantiene la última versión que compilaba.
- **Disposición guardada.** Lo que mueves se guarda en `../esquema.posiciones.json`, que se puede versionar con el esquema. «Reordenar» vuelve a la colocación automática.
- **Exportar SVG** vectorial de los grupos visibles, sin resaltados. Se ve igual que el lienzo y, con el esquema actual, pesa unos 170 KB.

## Cómo está hecho

| Archivo | Qué hace |
| --- | --- |
| `vite.config.ts` | API local: `GET /api/esquema` devuelve el esquema ya leído con su documentación, y `GET`/`PUT /api/posiciones` leen y guardan la disposición. Además avisa al navegador cuando cambia el DBML o el documento |
| `src/esquema.ts` | Convierte el DBML en el modelo del visor con `@dbml/core`. Se ejecuta en el servidor: en el navegador, el parser pesaría más de 17 MB |
| `src/modelo.ts` | Los tipos del modelo: tablas, columnas, relaciones, grupos, enums y la documentación de cada tabla |
| `src/documentacion.ts` | Lee `modelo-datos.md` con `marked` y reparte entre las tablas lo que dice de cada una. También se ejecuta en el servidor |
| `src/disposicion.ts` | Colocación automática con ELK: dentro de cada grupo, por capas, con las tablas referenciadas a la izquierda. Los grupos van en filas, en el orden del archivo. También combina lo calculado con lo guardado |
| `src/visor.ts` | Construye los nodos y las aristas de React Flow, y gestiona el resaltado y la búsqueda |
| `src/diagrama.tsx` | Cómo se dibujan una tabla, un grupo y una relación |
| `src/svg.ts` | Dibuja el SVG exportado a partir del esquema y de dónde está cada nodo, con las mismas medidas, rutas y marcas que el lienzo |
| `src/BarraLateral.tsx`, `src/PanelDetalle.tsx` | La barra lateral y el panel de detalle |
| `src/TextoDoc.tsx` | Pinta el texto del documento con su formato y convierte en enlaces las tablas y enums que nombra |

Las tablas tienen alto fijo (34 px de cabecera y 22 px por columna, en `styles.css`), para poder colocarlas antes de dibujarlas y para dibujar el SVG sin medir la pantalla. Si cambias esas medidas, cámbialas también en `disposicion.ts`; `svg.ts` las toma de ahí.

Las marcas de cardinalidad se dibujan dentro de cada línea, no con `<marker>` de SVG: Chrome no aplica `orient="auto-start-reverse"` y las marcas del inicio quedaban debajo de la tabla. La función que las dibuja (`marca`, en `visor.ts`) es la misma en el lienzo y en el SVG.

El SVG no se genera capturando la pantalla: así lo hacía antes `html-to-image`, que copiaba todo el HTML con sus estilos y daba un archivo de casi 50 MB.

### Cómo lee `modelo-datos.md`

El visor se apoya en la estructura del documento. Si se cambia, hay que cambiar también `documentacion.ts`:

- **Módulos.** Cada módulo es un `## N. Título`, con un número delante.
- **Qué representa.** Dentro de cada módulo, una tabla cuya primera columna se llama «Tabla», con el nombre de cada tabla en código (`` `clase` ``) y su descripción en la segunda columna.
- **Por qué así.** La lista que sigue al párrafo «**Por qué así**». A cada tabla le llegan los puntos que la nombran en código, en negrita o en el texto, sin tildes y en singular o plural.
- **Tablas globales.** «Lo que se ve | De dónde sale», «Valor | Se calcula a partir de» y «Pregunta | Cambio en el modelo». A cada tabla le llegan las filas que la nombran en código.

## Pendiente

- Editar el DBML desde el propio visor, con el diagrama al lado, como en dbdiagram.
