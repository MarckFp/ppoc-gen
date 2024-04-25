# PPOC Gen

## ¿Qué es?

PPOC Gen es una applicación diseñada para generar y administrar los turnos de los exhibidores de los Testigos de Jehová. De hecho las siglas PPOC son Predicación Pública Organizada por la Congregación. En esta aplicación hay una serie de conceptos que es necesario saber antes de usar:

- Publicador: Es el usuario que será asignado en los turnos
- Horario: Es el lugar y la hora en la que solemos poner un turno
- Turno: Es el día exacto donde se cumplirá el horario establecido
- Asignaciones: Es la relación entre un publicador y un turno
- Incidencias: Es el conjunto de fechas en las que un publicador no puede estar asignado en un turno
- Disponibilidad: Es la relación entre un publicador y un horario estableciendo que por norma general puede ser asignado en turnos con ese horario

Está aplicación fue diseñada como hobby y aunque demos cierto soporte no aseguramos el correcto funcionamiento de esta el 100% del tiempo. La aplicación fue diseñada para almacenar los datos en local ¿Qué quiere decir? Que ni nosotros ni nadie dispone de dichos datos pues se almacenan en la memoria de su dispositivo. Debido a esto es imposible facilitar la sincronización de los datos entre dispositivos, para ello creamos la exportación e importación de datos, puede aprender más en la sección [¿Cómo exportar e importar datos?](#cómo-exportar-e-importar-datos)

## Crear un Horario

Lo ideal para empezar es establecer que horarios dispone nuestra congregación. Para ello clickaremos en el menú "Horarios" > "Crear nuevo Horario", después tendremos que poner algunos datos como:

- Día de la semana en la que usualmente hay exhibidores
- Ubicación donde normalmente se encuentran
- Hora de inicio y hora de finalización
- Número de hermanos que deberia haber en ese horario
- Número de hermanas que deberia haber en ese horario

Tras darle al botón de "Crear" ya tendremos nuestro primer Horario.

## Crear un Publicador

Tras crear los horarios el siguiente paso lógico es crear los publicadores. Recuerde que deberia crearse a si mismo si usted también participa en los exhibidores. Para ello clickaremos en el menú "Publicadores" > "Crear nuevo Publicador" y nos aparecerá el formulario para crear uno nuevo. En el tendremos que rellenar los siguientes datos:

- Nombre
- Apellidos
- Género
- Prioridad: La frecuencia con la que el programa asignará a ese publicador a los respectivos turnos, para mejor entendimiento puede leer la sección [¿Cómo funciona la generación de turnos?](#cómo-funciona-la-generación-de-turnos)
- Afinidad: Si el Publicador por ejemplo estuviera casado/a o tuviera hijos sería recomendable rellenar este campo pues la aplicación intentará poner juntos a los publicadores junto con sus afinidades
- Disponibilidad: Que horarios puede cubrir ese Publicador

## Crear Incidencias

Algo que podemos hacer es crear una incidencia, es decir, un conjunto de fechas en las que cierto publicador (o incluso toda la congregación) no podría ser asignado a turnos. Esto viene bien para vacaciones, citas médicas, etc Para ello tendremos que clickar en el menú "Incidencias" > "Crear nueva Incidencia" y tras rellenar los datos previamente a generar los turnos el programa ignorará al hermano durante esas fechas. Hay que destacar que ambas fechas son inclusivas por lo que no le asignará ni en la fecha de inicio ni en la de fin. Si desearamos poner una incidencia de toda la congregación (Como por ejemplo para asambleas, o fechas donde la congregación no ponga exhibidores) lo único que tendrá que hacerse es crear una incidencia y en Publicador seleccionar "Toda la congregación"

## Crear Turnos

Para crear los turnos podremos hacerlo de 2 maneras: Generarlos o crearlos manualmente. Para ello debemos clickar en el menú "Turnos" y decidiremos de que forma crearlos:

- **Manualmente**: Esto viene muy bien para hacer turnos rápidos, el programa no tomará en cuenta ni la prioridad ni la disponibilidad del publicador pues el turno es configurado al completo por usted. Rellenaremos los datos como la fecha, la hora de inicio y fin, los publicadores asignados y una ubicación si se desea.
- **Generados**: Para ello deberemos poner la fecha de inicio y fin y tras clickar en el botón "Generar turnos", el programa automáticamente intentará crear los turnos desde 0 para el rango de fechas establecido. En caso de haber cualquier error como falta de hermanos para un día u hora la aplicación generará un aviso.

### ¿Cómo funciona la generación de turnos?

Atención, está sección es algo más técnica que las demás pues nos centramos en como funciona el motor de generado de turnos por debajo y los cálculos que este hace.

Para entender como el programa genera los turnos primero debemos entender como funciona la prioridad de los publicadores. La prioridad está dividida en 4: alta, media, baja y avanzado. Cada una de estas asigna un nº al publicador con la salvedad de avanzado que nos permite personalizar dicho número. Por ejemplo alta asigna el nº 1, media asigna 2 y baja asigna un nº 3. Este valor dictaminará con que frecuencia se pone ese publicador en el turno.

Cada publicador internamente, aparte de la prioridad, tiene asignado un contador, que es el nº de veces que se pone en un exhibidor. Cada vez que el publicador se le asigna un turno a ese contador se le sumará la prioridad y el programa tratará de poner siempre a los publicadores con el menor contador. Pongamos un ejemplo: Existe el publicador A que tiene una prioridad alta (1) y existe el publicador B con una prioridad baja (3). Por cada vez que se ponga el publicador B (1 turno * 3 de prioridad = 3) se pondrá 3 veces el publicador A (3 turnos * 1 de prioridad = 3). De esta manera podemos jugar con las prioridades y con las prioridades avanzadas para ajustar con cuanta frecuencia deseamos que ese publicador se ponga en los turnos.

Por debajo el programa sigue el siguiente orden para asignar turnos:

1. Recorre desde el primer día establecido para generar los turnos hasta el último
2. Comprueba si hay incidencia a nivel de congregación para ese día, si la hay pasa al siguiente
3. Luego comprueba si en ese día hay horarios creados si los hay y no hay un turno creado previamente lo crea para ese día y hora
4. Después comprueba que usuarios tienen disponibilidad para ese horario
5. Ordena los usuarios por el menor contador y comprueba si el usuario tiene una incidencia, si la tiene pasa al siguiente usuario
6. Si el usuario no existe en ningún otro turno en ese mismo día ni en el día anterior, lo asigna al turno creado
7. Busca si el usuario tiene afinidades, si las tuviera y hubiera hueco en los hermanos o hermanas de ese turno, asigna el publicador afín al turno.

## ¿Cómo exportar e importar datos?

### Exportar

Para exportar deberemos clickar el menú "Configuración" > "Exportar Datos" esto nos generará un fichero terminado en la extensión .pgen con toda la información de nuestra congregación (publicadores, horarios, incidencias, turnos, configuraciones...)

### Importar

Para importar deberemos clickar el menú "Configuración" > "Importar Datos", luego nos saldrá una ventana para seleccionar el fichero que queremos importar. Tenga en cuenta que todos los datos locales se borrarán y serán sobrescritos con los nuevos datos por lo que es muy importante que preste atención si desea realmente perder sus datos o no pues no se podrán recuperar.
