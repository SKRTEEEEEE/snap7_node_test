<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

# Snap7 NodeJS Showcase
<a href="https://github.com/SKRTEEEEEE">
<div align="center">
  <img  src="https://github.com/SKRTEEEEEE/SKRTEEEEEE/blob/main/resources/img/grid-snake.svg"
       alt="snake" />
</div>
</a>

## Introducción

Ejemplos básicos de proyectos con NodeJs y Snap7 para programar PLCs con **Snap7**. Puedes encontrar mas información sobre como conectar-se a la PLC o Snap7, al igual que las funcionalidades de este código pero escrito en `Python`, en el repositorio [snap7_py_show](https://github.com/SKRTEEEEEE/snap7_py_show.git).

### Conceptos desarrollados (funcionalidades):
#### Scripts
1. [snap7-test](./src/scripts/snap7-test.ts): Script con el código básico para conectar-se a la PLC y leer datos
2. [read-db](./src/scripts/read-db.ts): Script con el código  para conectar-se a la PLC y leer datos utilizando funciones de código.
3. [app-test](./src/scripts/app-test.ts): Script para comprobar el correcto uso de la `app`
#### CLI versions
- [cli-debounce](./src/cli/cli-debounce.ts): CLI con ejemplo de uso del debounce

### Dependencias utilizadas:
- [`snap7`](https://github.com/mathiask88/node-snap7/blob/master/README.md): Para la conectividad con la PLC
- `jest`: Para el testing
- `concurrently`: Para el montaje del server
- `tailwindcss`: Librería para los estilos
- `typescript`: Superset para el tipado
- `@types/jest`: Para agregar los tipos de TypeScript a Jest, facilitando el uso de las herramientas de test en un entorno TypeScript.
- `ts-jest`: Un pre procesador para Jest que permite ejecutar tests escritos en TypeScript, integrándose sin problemas con el ecosistema de Jest y TypeScript.
## [Recursos](https://github.com/SKRTEEEEEE/markdowns)
### [Empezando](https://github.com/SKRTEEEEEE/markdowns/blob/main/utils/how-start/ts-tw_es.md)
### Conectividad PLCs gama 1500/1700
Para la conectividad con las PLCs de gama 1500/1700 necesitamos habilitar la funcionalidad PUT/GET, para ello:
- Hacemos doble click en nuestra PLC.
- Nos dirigimos a la sección de `Protection & Security`
- Buscamos la zona donde nos dice: Connections mechanism -> Permit access with PUT/GET ...
- Habilitamos dicha opción
### DB Optimized Access (Habilitar offset)
Para tener acceso a los offset (❓dirección) en la base de datos, debemos asegurarnos de no tener habilitado el optimized access.
- Si la **DB está configurada como optimizada**, TIA Portal gestiona automáticamente la asignación de memoria, por lo que el offset no se muestra.
- **Solución**: Para ver los offsets, desactiva la optimización en la configuración de la DB:
 1. Abre la **DB** en cuestión.
 2. En la vista de propiedades, busca la opción **"Optimized Block Access"**.
 3. Desactívala y guarda los cambios.
### Snap7
#### Explicación de los parámetros en [`ReadArea`](./src/app/readArea.ts)

La función `ReadArea` de Snap7 permite leer datos desde distintas áreas de memoria del PLC, incluyendo:

- **0x83**: Especifica el área de memoria. En este caso, `0x83` corresponde a la memoria de marcas (`M` o `%M` en Step7/TIA Portal).
- **0**: Indica el número de subárea. Para `0x83` (memoria de marcas), siempre se usa `0`.
- **this.start**: Dirección de inicio dentro del área de memoria.
- **this.size**: Número de bytes a leer.
- **0x02**: Tipo de dato que se espera leer. `0x02` representa bytes de datos (`S7WLByte` en Snap7).
- **Callback**: Una función que recibe el error (`err`) y los datos (`buffer`) leídos.

##### Áreas de memoria
En Snap7, las áreas de memoria se identifican por códigos hexadecimales:

| Área de memoria | Código Hex |
|----------------|-----------|
| Entrada (%I)  | `0x81`    |
| Salida (%Q)   | `0x82`    |
| Marcas (%M)   | `0x83`    |
| DBs           | `0x84`    |
| Contadores    | `0x1C`    |
| Temporizadores | `0x1D`    |




## Contacto

### Agradecimientos

### Licencia

### Información de Contacto

#### [Envíame un mensaje](mailto:adanreh.m@gmail.com)

### Contribuciones y Problemas

Si encuentras problemas o deseas contribuir al proyecto, por favor, crea un issue en el repositorio.

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
