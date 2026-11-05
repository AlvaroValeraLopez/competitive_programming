# Visor de esquema

Herramienta propia y gratuita para ver el esquema de la plataforma ([`../esquema.dbml`](../esquema.dbml)) como diagrama entidad-relación, sin depender de dbdiagram.io. Lee el DBML con el parser oficial (`@dbml/core`), así que lo que se ve aquí es lo mismo que entendería dbdiagram.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5200
npm test         # tests de la lectura del DBML y de la disposición
```

Para ver otro archivo: `VISOR_DBML=/ruta/a/otro.dbml npm run dev`.

## Qué hace

- **Tablas** con sus columnas y tipos. La llave marca la clave primaria, el eslabón la clave ajena y `?` las columnas que admiten nulo. El punto índigo indica que la columna tiene nota, y al pasar el ratón se ve la nota y el resto de rasgos.
- **Relaciones** de columna a columna, con pata de gallo en el lado «muchos» y barra en el lado «uno». Las opcionales, cuya clave ajena admite nulo, van en discontinua.
- **Grupos** (`TableGroup`) con su color y su nota. Cada grupo se arrastra desde su cabecera y se puede ocultar desde la barra lateral.
- **Resaltado.** Al pasar el ratón por una tabla o seleccionarla, se resaltan ella y sus relaciones y se atenúa el resto.
- **Panel de detalle** al hacer clic en una tabla: su nota, las columnas con insignias, valores por defecto y notas, a qué apunta, quién la referencia y sus índices. Al hacer clic en un tipo `Enum` se ven sus valores y dónde se usa.
- **Búsqueda** en nombres y notas de tablas y columnas.
- **Recarga en vivo.** Al guardar `esquema.dbml`, el diagrama se actualiza sin perder la disposición ni la selección. Si el DBML tiene un error, se muestra la línea y se mantiene la última versión que compilaba.
- **Disposición guardada.** Lo que mueves se guarda en `../esquema.posiciones.json`, que se puede versionar con el esquema. «Reordenar» vuelve a la colocación automática.
- **Exportar PNG** del diagrama completo, a doble resolución.

## Cómo está hecho

| Archivo | Qué hace |
| --- | --- |
| `vite.config.ts` | API local: `GET /api/esquema` devuelve el esquema ya leído, y `GET`/`PUT /api/posiciones` leen y guardan la disposición. Además avisa al navegador cuando cambia el DBML |
| `src/esquema.ts` | Convierte el DBML en el modelo del visor con `@dbml/core`. Se ejecuta en el servidor: en el navegador, el parser pesaría más de 17 MB |
| `src/modelo.ts` | Los tipos del modelo: tablas, columnas, relaciones, grupos y enums |
| `src/disposicion.ts` | Colocación automática con ELK: dentro de cada grupo, por capas, con las tablas referenciadas a la izquierda. Los grupos van en filas, en el orden del archivo. También combina lo calculado con lo guardado |
| `src/visor.ts` | Construye los nodos y las aristas de React Flow, y gestiona el resaltado y la búsqueda |
| `src/diagrama.tsx` | Cómo se dibujan una tabla, un grupo y una relación |
| `src/BarraLateral.tsx`, `src/PanelDetalle.tsx` | La barra lateral y el panel de detalle |

Las tablas tienen alto fijo (34 px de cabecera y 22 px por columna, en `styles.css`), para poder colocarlas antes de dibujarlas. Si cambias esas medidas, cámbialas también en `disposicion.ts`.

Las marcas de cardinalidad se dibujan dentro de cada línea, no con `<marker>` de SVG: Chrome no aplica `orient="auto-start-reverse"` y las marcas del inicio quedaban debajo de la tabla.

## Pendiente

- Editar el DBML desde el propio visor, con el diagrama al lado, como en dbdiagram.
- Exportar a SVG vectorial. Lo que genera `html-to-image` pesa casi 50 MB con este esquema; habría que dibujar el SVG a mano.
