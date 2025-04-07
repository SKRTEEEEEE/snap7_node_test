# Ejercicio 1: Sistema de Notificaciones en Telegram para Alarmas del PLC

## Descripción General

En un entorno industrial moderno, la supervisión continua de los sistemas automatizados es crucial para mantener la productividad y seguridad. Este ejercicio consiste en desarrollar un sistema de notificaciones que permita al personal técnico recibir alertas en tiempo real sobre estados críticos o anómalos del PLC a través de la aplicación Telegram, así como poder enviar comandos básicos para interactuar con el sistema sin necesidad de estar físicamente presente en la planta.

### Programas
#### Programa 1
Programa para seleccionar los distintos programas
##### Especificaciones
- Si se selecciona el selector 'físico' hacia r (%I0.2) se selecciona el programa 3 y se enciende la luz  'física' verde para indicarlo (%Q0.0)
- Si se selecciona el selector 'físico' hacia l (%I0.3) se selecciona el programa 2 y se enciende la luz 'física' naranja para indicarlo (%Q0.1)
- Una vez seleccionado el programa, con el botón 'físico' marcha (%I0.0) se activa dicho programa
- Si el usuario hace click en botón 'físico' marcha (%I0.0) SIN PROGRAMA SELECCIONADO se enciende la luz roja (%Q0.3) mientras este este seleccionado
#### Programa 2
Programa para ver/reset contador errores
##### Especificaciones
- Al iniciar-se, la luz verde parpadeara tantas veces como hayan sonado las alarmas
- Si el usuario selecciona r/indirecta, y ha terminado/no empezado el contado de la luz verde, se volverá a activar el parpadeo de la luz verde (conteo)
- Si el usuario selecciona l/directa, entrara en el modo eliminación, de tal forma que se encenderá la luz naranja(indirecta) y roja(emergencia)
- Si el usuario selecciona el botón verde, con el modo eliminación, reset el contador
- Si el usuario selecciona el botón rojo, con el modo eliminación, vuelve al modo inicial
- Si el usuario selecciona el botón rojo, en el modo inicial, vuelve al Programa 1
#### Programa 3
Programa 'PLC', simularemos un semáforo básico por las salidas, aunque aquí podría ir cualquier ejemplo industrial

## Contexto Industrial

Imagine una línea de producción de envasado de alimentos donde el PLC controla diferentes etapas del proceso: llenado, sellado, etiquetado y empaquetado. Un fallo en cualquiera de estas etapas podría detener toda la línea de producción, resultando en pérdidas significativas. Con este sistema de notificaciones, el supervisor podrá recibir alertas inmediatas y tomar decisiones rápidas incluso cuando no se encuentre en la planta.

## Requisitos Técnicos

### Hardware
- PLC Siemens CPU 1516-3 PN/DP
- Módulo DI 32x24VDC HF (entradas digitales)
- Módulo DQ 32x24VDC/0.5A HF (salidas digitales)
- PC con Node.js instalado y conexión a internet
- Red industrial con acceso a internet para el servidor Node.js

### Software
- TIA Portal V16 o superior
- Node.js v14.0 o superior
- Librerías Node.js:
  - `node-snap7` para comunicación con el PLC
  - `node-telegram-bot-api` para integración con Telegram
  - `winston` para registro de eventos
  - `dotenv` para gestión de variables de entorno

## Objetivos del Ejercicio

1. **Monitorización de Estados Críticos**: Configurar el PLC para detectar y señalizar condiciones anómalas.
2. **Sistema de Notificaciones**: Desarrollar una aplicación Node.js que se comunique con el PLC y envíe notificaciones vía Telegram.
3. **Control Remoto**: Implementar la capacidad de enviar comandos básicos al PLC desde Telegram.
4. **Registro de Eventos**: Crear un sistema de logs para auditoría de alarmas y acciones.
5. **Implementación Multi-Programa**: Desarrollar programas diferentes en el PLC que puedan ser seleccionados remotamente y presencialmente.
6. **Servidor GRAFCET**: Controlar el proceso industrial desde un servidor web.

## Requisitos Aplicación
### Sistema de Notificaciones en Telegram para Alarmas del PLC
Objetivo: Detectar estados de error o emergencia y notificar en tiempo real a un operador vía Telegram.

    ✅ Tareas:

      * Configurar un bot de Telegram que envíe alertas cuando se detecten errores.
      * Permitir que el operador pueda enviar comandos básicos desde Telegram (ej. reset una alarma).
      * Crear logs de eventos para auditoría.
      🕒 Tiempo estimado: 4 horas
      
### Utilizar todos los bits 'iniciales' como mínimo 
### Programas dentro de la plc que desde telegram y desde entradas físicas puedan ser utilizados
### Plc CPU 1516-3 PN/DP
#### Módulos usados
#####	DI 32x24VDC HF_1 -  	DI 32x24VDC HF
##### DQ 32x24VDC/0.5A HF_1 - 	DQ 32x24VDC/0.5A HF
#### Bits 'iniciales'
##### **Bits de Memoria Iniciales (%M)**
| Nombre    | Dirección  | Descripción |
|-----------|-----------|-------------|
| **Marcha**  | %M0.2  | Activación de la marcha |
| **Paro**    | %M0.3  | Detención del sistema |
| **Rearme**  | %M0.4  | Restablecimiento de estado |
| **Directa** | %M0.0  | Movimiento en dirección directa |
| **Inversa** | %M0.1  | Movimiento en dirección inversa |

---

##### **Entradas Digitales (%I)**
| Nombre                  | Dirección | Descripción |
|-------------------------|----------|-------------|
| **Botonera selector**   | I0.2 - I0.3 | Selector de modo |
| **Paro NC** (botón rojo) | I0.1 | Botón de parada normalmente cerrado |
| **Marcha** (botón verde) | I0.0 | Botón de arranque |
| **Stop Emergencia NC**   | I0.4 | Parada de emergencia con enclavamiento |

---

##### **Salidas Digitales (%Q)**
| Nombre      | Dirección | Descripción |
|------------|----------|-------------|
| **Luz verde**  | Q0.0 | Indica estado activo o correcto |
| **Luz naranja** | Q0.1 | Indica advertencia o estado intermedio |
| **Luz roja**  | Q0.2 | Indica fallo o estado de parada |

---


## Proceso

### Parte 1: Configuración del PLC

#### 1.1 ❓☁️ Definición de Estados de Alarma

Configurar los siguientes estados de alarma en el PLC:

1. **Alarma de Emergencia**: Activación del botón de emergencia (%I0.4)
2. **Alarma de Paro Prolongado**: Sistema en estado de paro (%M0.3) por más de 10 segundos
3. **Alarma de Conflicto de Dirección**: Activación simultánea de dirección directa e inversa (%M0.0 y %M0.1)
4. **Alarma de Ciclo Incompleto**: Interrupción del ciclo de trabajo antes de completarse



#### 1.2 Creación de Bloques de Datos para Gestión

##### DB1: Gestión de Alarmas
```
DB_Alarmas [DB1] (para Programa 3)
  - Alarma_Emergencia: Bool
  - ☁️ Alarma_Paro_Prolongado: Bool
  - ☁️ Alarma_Conflicto_Direccion: Bool
  - ☁️ Alarma_Ciclo_Incompleto: Bool
  - Contador_Alarmas: Int
```

##### DB2: Gestión de Programas
```
DB_Programas [DB2]
  - Programa_1: Bool
  - Programa_2: Bool
  - Programa_3: Bool
  - ☁️ Programa_En_Ejecucion: Bool
  - Grafcet_1: Bool (para Programa 3)
  - Grafcet_2: Bool (para Programa 3)
  - Grafcet_3: Bool (para Programa 3)
  - Time_1: Time (para Programa 3)
  - Time_2: Time (para Programa 3)
  - Time_3: Time (para Programa 3)

```

### Parte 2: Implementación Programas PLC
#### Programa 1
**Objetivo**: Implementar un sistema que permita seleccionar entre modos de trabajo diferentes.
##### 2.1: Implementar Programa de selección en la PLC
Permitiendo selección física y desde el HMI de Tia Portal
##### 2.2: Implementar Sistema de Alarma
- Al accionar-se Emergencia (físico o PLC) se activa Alarma_Emergencia, y se suma uno al contador
- Esto afectara a todos los programas


#### Programa 2: Control de Alarmas
**Objetivo**: Implementar un sistema que permita visualizar y manejar el contador de alarmas.
#### Programa 3: Secuencia de Movimientos Bidireccionales
**Objetivo**: Implementar una secuencia con tiempos y diferentes salidas utilizando Grafcet.
##### Condiciones
- Utilizar las salidas de la PLC
- Que se vea también en el HMI
- Utilizar Grafcet para la secuencia

## **⬇️TERMINAR⬇️**
### Parte 3: Aplicaciones Node.js
#### [ ] Crear servidor para Telegram
#### [ ] Crear servidor para HMI