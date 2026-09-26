1.# Proyecto: Gestión de canchas sintéticas

## Descripción general

Este prototipo corresponde a una aplicación web para la gestión y reserva de dos canchas sintéticas. El proyecto está orientado a ofrecer una experiencia interactiva sin depender de una base de datos externa en este momento y sin tener como objetivo ser la versión final del producto en código.

## Objetivo de la plataforma

La aplicación está pensada para ejecutarse en navegador web, priorizando una experiencia móvil first con un formato vertical y una adaptación suficiente para tabletas y equipos de escritorio.

## Reglas de negocio

- La reserva se realiza por horas enteras, no por fracciones de hora.
- Los estados posibles de una reserva son: Reservada, En curso, Cancelada y Pendiente por aprobación.
- No es posible alquilar la misma hora del día a más de un cliente.
- La disponibilidad de las canchas es de 6:00 a.m. a 10:00 p.m.
- El calendario permite visualizar días con alcance de un mes.
- No existen usuarios para clientes dentro del sistema.
- Las cancelaciones solo pueden realizarse en reservas pendientes con fecha y hora futuras.

## Entidades y propiedades

### Canchas

- Nombre
- Disponible
- Días fuera de servicio
- Imagen
- Precio por hora

### Usuarios

- Nombre
- Rol
- Estado

### Roles

- Nombre

### Reservas

- Fecha
- Horas
- Cliente

### Actores

#### Administrador

- Usuario
- Nombre

#### Encargado

- Usuario
- Nombre

#### Cliente

- Documento
- Nombre
- Teléfono

## Acciones por actores

### Administrador

- Crear un nuevo usuario
- Crear una nueva cancha
- Editar datos de una cancha existente
- Eliminar una cancha
- Consultar disponibilidad de las canchas
- Aprobar solicitudes de alquiler
- Aprobar cancelación de reservas
- Consultar reservas
- Cancelar reservas

### Encargado

- Consultar disponibilidad de las canchas
- Consultar reservas

### Cliente

- Consultar disponibilidad de las canchas
- Realizar una reserva
- Consultar sus propias reservas
- Solicitar cancelación de una reserva

## Vistas y permisos

| Vista | Administrador | Encargado | Cliente |
| --- | --- | --- | --- |
| Home | Sí | Sí | Sí |
| Home Administrador | Sí | Sí | No |
| Catálogo de canchas | Sí | Sí | Sí |
| Calendario de cancha | Sí | Sí | Sí |
| Horas del día | No | No | Sí |
| Formulario de reserva | No | No | Sí |
| Creación de usuario | Sí | No | No |
| Inicio de sesión | Sí | Sí | No |
| Reservas | Sí | Sí | No |
| Reservas del día | Sí | Sí | No |
| Mis reservas | Sí | Sí | Sí |

## Relación entre vistas

### Vista de cliente

- Home
- Home contiene: Catálogo de canchas y Mis reservas
- Catálogo de canchas contiene: Calendario de cancha
- Calendario de cancha contiene: Horas del día
- Horas del día contiene: Formulario de reserva

### Vista de administrador y encargado

- Home Administrador
- Home Administrador contiene: Inicio de sesión
- Inicio de sesión contiene: Catálogo de canchas y Reservas
- Catálogo de canchas contiene: Calendario de canchas
- Calendario de canchas contiene: Reservas del día
- Home Administrador contiene: Creación de usuario

## Descripción de vistas

### Catálogo de canchas

Lista todas las canchas disponibles para realizar reservas. Es una vista general que no exige acceso especial, aunque el administrador puede acceder a un menú contextual para editar canchas y a un botón para crearlas.

### Calendario de cancha

Se despliega al seleccionar una cancha y muestra un calendario con alcance de un mes para elegir un día concreto. Para el administrador, además, permite marcar días fuera de servicio mediante un menú contextual y esta acción es reversible.

### Horas del día

Se abre al seleccionar un día del calendario y muestra las horas disponibles. Si la franja está libre, el cliente puede seleccionarla para reservar.

### Formulario para una reserva

Se presenta al usar la opción de reserva en la vista de horas. Incluye campos para documento, nombre y teléfono del cliente, además de una sección de confirmación con las horas seleccionadas.

### Creación de usuario

Panel reservado para registrar usuarios con la posibilidad de definir su rol, nombre y contraseña. En términos generales, esta vista incluye operaciones CRUD.

### Inicio de sesión

Permite ingresar el nombre de usuario y la contraseña para acceder como administrador o encargado.

### Reservas

Muestra todas las reservas registradas, ordenadas por fecha más reciente de manera provisional. El administrador tiene acceso a opciones para gestionar cada reserva y ver datos relevantes, información del cliente y sus horas reservadas.

### Reservas del día

Se accede desde el calendario de una cancha y lista todas las reservas del día seleccionado, con las mismas opciones de gestión que la vista de Reservas.

### Mis reservas

Se presenta desde la vista del cliente y muestra todas las reservas asociadas a su documento. Si es la primera vez que visita la sección, puede ingresar el documento para consultar sus reservas y solicitar cancelación cuando aplique.

## Aspectos visuales

- Se utilizarán colores cálidos y pastel.
- Se tomará como referencia de viewport el tamaño de un iPhone 17 Pro Max.
- El CSS será suficiente para mantener un diseño ordenado y coherente con principios de Material Design.
- No se usarán imágenes en las vistas, salvo en las tarjetas del catálogo de canchas.
- No se incorporarán banners de marca; los encabezados de cada vista serán suficientes.

## Aspectos generales

- No existe un rol de usuario cliente dentro del sistema; por tanto, el login no se mostrará para ese perfil.
- El acceso administrativo y encargado se mantendrá separado según la URL y el rol activo.

## Restricciones y limitaciones

- No se implementará pasarela de pago en línea. El cobro continua siendo tradicional, por ejemplo Nequi o efectivo.
- El sistema solo mostrará el costo de la reserva calculando la cantidad de horas seleccionadas en la vista de hacer reserva.
- No se incluirá un chat interno entre perfiles.
- No se contemplarán turnos para administrador ni encargado.
- No se desarrollará como una app nativa para un sistema operativo específico; la solución está orientada a dispositivos móviles y navegadores web.
- Se limitará el alcance a los elementos ya definidos en esta guía; no se agregarán entidades, vistas ni funcionalidades adicionales.
- No se contemplan notificaciones complejas ni sockets.
- No se incluirá una marca ni identidad visual adicional fuera del alcance del prototipo.

## Criterios de aceptación

- El sistema no permite el solapamiento de horas reservadas en la misma cancha.
- El cliente puede visualizar la disponibilidad y el precio del alquiler sin necesidad de contactar con el administrador.
- El administrador y el encargado mantienen un estado actualizado del flujo de reservas, aunque la operatividad de la app será asimétrica.

## Despliegue y ejecución local

### Requisitos

- Navegador web moderno
- Python instalado en el equipo

### Ejecutar el proyecto con servidor HTTP de Python

Desde la carpeta del proyecto, abre una terminal y ejecuta:

```bash
cd "c:\Users\Admin\Desktop\IBERO\Fundamentos del diseño de software\Prototipo"
python -m http.server 8000
```

Luego abre en el navegador:

```text
http://localhost:8000
```

### Acceso por defecto

El prototipo incluye usuarios de prueba con las siguientes credenciales:

- Administrador: `admin` / `admin123`
- Encargado: `encargado` / `encargado123`

> Este despliegue es ideal para pruebas locales del prototipo y se puede usar sin necesidad de configurar un servidor web más complejo.

## Observación final

Este README funciona como guía funcional del prototipo, documentando el negocio, los permisos y la ejecución local del proyecto para facilitar pruebas y revisión del flujo de la aplicación.

