# Mapa de la plataforma

Una página para entender cómo está montada la [plataforma educativa](../README.md): sus dominios funcionales, qué hace cada uno y cómo se conectan entre sí. Está hecha con HTML, CSS y JavaScript sin dependencias ni compilación.

## Abrirlo

Basta con abrir `index.html` en el navegador, con doble clic. También se puede servir:

```bash
python3 -m http.server 5210 --directory plataforma-educativa/mapa
```

y entrar en http://localhost:5210. En la vista previa de la app es `mapa-plataforma`.

## Qué se ve

- **Vista general** (`#/`): los 8 dominios, que son los módulos del diseño y los `TableGroup` del esquema, colocados por capas:
  - quién la usa;
  - lo que viven el alumno y el profesor;
  - lo que la plataforma mide;
  - lo que se aprende y se practica;
  - la base.

  Las flechas indican qué dominio usa a cuál, es decir, que sus tablas apuntan a las del otro; cuanto más gruesa, más relaciones. Al pasar el ratón por un dominio se resaltan sus conexiones, y al pasar por un perfil, los dominios donde están sus funcionalidades.
- **Un dominio** (`#/dominio/<id>`):
  - qué permite hacer, con las funcionalidades de cada perfil;
  - cómo está montado, con sus tablas y lo que representa cada una;
  - por qué está así;
  - con qué dominios se conecta;
  - sus conceptos clave;
  - dónde entra la IA;
  - sus reglas, decisiones y preguntas abiertas.
- **Un perfil** (`#/perfil/profesor`, `#/perfil/alumno`): todo lo que puede hacer, agrupado por dominio.

Los botones de atrás y adelante del navegador funcionan, y `Esc` vuelve al mapa.

## De dónde salen los datos

Todo está en `datos.js`:

| Parte | Fuente |
| --- | --- |
| Dominios, colores, tablas y «qué representa» | `../esquema.dbml` y la tabla «Tabla \| Qué representa» de cada módulo de `../modelo-datos.md` |
| «Por qué está así» | El «Por qué así» de cada módulo de `../modelo-datos.md` |
| Flechas entre dominios | Las relaciones del esquema entre tablas de grupos distintos |
| Funcionalidades, reglas, decisiones, preguntas, glosario e IA | `../README.md`. El dominio al que pertenece cada una es una decisión del mapa, porque el README no lo dice |
| Capas | Una decisión del mapa, para leerlo de arriba abajo |

Si cambian esos documentos, hay que actualizar también `datos.js`.

## Archivos

| Archivo | Qué hace |
| --- | --- |
| `index.html` | La página |
| `datos.js` | Los datos del mapa (`window.MAPA`) |
| `mapa.js` | Pinta las tres vistas y dibuja las flechas |
| `estilos.css` | Los estilos, con la misma paleta que el visor del esquema |
