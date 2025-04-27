<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

# Conectividad a PLC con Node JS
<a href="https://github.com/SKRTEEEEEE">
<div align="center">
  <img  src="https://github.com/SKRTEEEEEE/SKRTEEEEEE/blob/main/resources/img/grid-snake.svg"
       alt="snake" />
</div>
</a>

## Introducción

Ejemplos básicos de proyectos para obtener conectividad a PLCs con Node Js. Utilizando los siguientes protocolos de comunicación:
- [Snap7](https://snap7.sourceforge.net/)
- [OPC UA](https://opcfoundation.org/)

  💡Puedes encontrar mas información sobre como conectar-se a una PLC, Snap7, OPC UA, al igual que las funcionalidades de este código pero escrito en `Python`, en el repositorio [snap7_py_show](https://github.com/SKRTEEEEEE/plc_py_conn).
### Ejemplos PLCs:
#### 1. [Ejemplo básico s300](https://github.com/SKRTEEEEEE/plc_py_conn/blob/main/snap7-tia.7z)
- snap7 py -> snap7-tia (1st example) 
- tia portal house -> Plc_snap7_test
- Plc model -> s300
#### 2. Ejemplo ejercicios 
- snap7 py -> NO example 
- tia portal house -> EjerciciosTimers
- Plc model -> s1500
#### 3. Ejemplo grafcet bot/HMI 
- snap7 py -> NO example 
- tia portal house -> s1500-timer
- Plc model -> s1500
### Funcionalidades:
#### Scripts
1. [test](./src/scripts/test.ts): Script con el código básico para conectar-se a la PLC y la opción de leer datos comentado.
2. [read](./src/scripts/read.ts): Script con el código  para conectar-se a la PLC y leer datos.
#### CLI versions
- [PLC manager](): CLI para manejar los [Ejemplos PLCs](#ejemplos-plcs) utilizando snap7.
- [cli-debounce](./src/cli/cli-debounce.ts): CLI con ejemplo de uso del debounce.

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



### ⚔️ **OPC UA vs Snap7** – Comparativa rápida

| Característica                 | **OPC UA**                                             | **Snap7**                                            |
|-------------------------------|--------------------------------------------------------|------------------------------------------------------|
| 🔌 **Tipo de conexión**       | Estándar industrial basado en servidor cliente         | Protocolo nativo S7 (S7Comm)                         |
| 📦 **Protocolo**              | OPC Unified Architecture (estándar abierto)            | Protocolo propietario de Siemens                     |
| 🛠️ **Configuración en PLC**   | Requiere configurar y habilitar el servidor OPC UA     | No requiere configuración especial (excepto acceso) |
| 🔐 **Seguridad**              | Seguridad integrada (certificados, cifrado, usuarios)  | No tiene seguridad integrada                         |
| 🌐 **Compatibilidad**         | Multiplataforma y multivendor                          | Solo Siemens (S7-300, 400, 1200, 1500)               |
| 🧠 **Modelo de datos**        | Estructurado, navegable (tipo árbol)                   | Raw access a bloques de memoria                     |
| 🧪 **Diagnóstico y control**  | Limitado a lo expuesto en el servidor OPC              | Acceso total a bloques de datos y registros         |
| 🔄 **Acceso a variables**     | Variables publicadas explícitamente                   | Acceso directo por dirección (DBx.DBWy)             |
| ⚙️ **Facilidad de uso**       | Requiere configuración inicial en TIA Portal           | Más directo pero requiere conocer direcciones       |
| 📚 **Librerías en Node.js**   | [`node-opcua`](https://github.com/node-opcua/node-opcua) | [`node-snap7`](https://github.com/mathiask88/node-snap7) |
| 🧱 **Escalabilidad IoT/Cloud**| Muy buena, pensado para Industria 4.0                  | Limitado a redes internas o entornos cerrados       |

---

#### 🔍 ¿Cuándo usar OPC UA?

✅ Si buscas:
- Un **estándar abierto** y seguro.
- Compatibilidad con **otros fabricantes**.
- Integración con sistemas **SCADA, MES, IoT, o Cloud**.
- Soporte estructurado de variables (modelos de objetos, browsable).

⚠️ Pero requiere configuración en el PLC y tiene un consumo un poco mayor de recursos.

---

#### 🔧 ¿Cuándo usar Snap7?

✅ Si buscas:
- **Simplicidad** y acceso directo a datos.
- Trabajar en entornos controlados sin mucha seguridad.
- Leer/escribir datos sin que estén “publicados” en OPC.
- Diagnóstico, estados de CPU, lectura de inputs/outputs, etc.

⚠️ Pero **no es seguro** para uso en red pública o industrial abierta. No está soportado oficialmente por Siemens.

---

#### 🔩 Ejemplo típico de uso

- 🏭 **OPC UA**: App de supervisión que se conecta a múltiples PLCs y sensores, con integración en Azure o AWS IoT.
- 🔧 **Snap7**: Aplicación de mantenimiento o una herramienta interna que necesita acceso total a la memoria del PLC.




## Contacto

### Agradecimientos

### Licencia

### Información de Contacto

#### [Envíame un mensaje](mailto:adanreh.m@gmail.com)

### Contribuciones y Problemas

Si encuentras problemas o deseas contribuir al proyecto, por favor, crea un issue en el repositorio.

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">
