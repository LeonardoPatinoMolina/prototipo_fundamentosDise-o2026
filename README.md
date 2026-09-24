# Prototipo de gestión de alquiler de canchas

## 1. Descripción general

Este proyecto corresponde a un prototipo funcional de alquiler de 2 canchas sintéticas, orientado a un flujo de navegación web con enfoque móvil primero. El objetivo principal es demostrar la lógica de negocio, la interacción del usuario y la administración de reservas sin depender de una base de datos externa ni de un backend dedicado.

El prototipo funciona localmente con almacenamiento del navegador y es suficiente para validar el comportamiento del flujo, la sesión, el calendario y las reservas.

## 2. Plataforma objetivo

- Navegador web
- Enfoque móvil first
- Diseño vertical con respuesta funcional para tablet y escritorio
- Interfaz de usuario pensada para uso rápido y simple

## 3. Reglas de negocio

- La reserva se realiza por horas enteras, no por fracciones.
- Los estados posibles de una reserva son: Reservada, En curso, Cancelada y Pendiente por aprobación.
- No puede alquilarse la misma hora del día a más de un cliente por cancha.
- La disponibilidad de las canchas va de 6:00 a.m. a 10:00 p.m.
- El calendario ofrece una ventana de visualización de hasta 30 días a partir del día actual.
- Las cancelaciones de reserva solo pueden ejecutarse sobre reservas futuras o pendientes.
- No existe un rol de cliente con autenticación para esta versión del prototipo; el cliente usa el catálogo público y el administrador/encargado accede mediante login.

## 4. Entidades del sistema

### 4.1 Canchas

- Nombre
- Disponibilidad
- Días fuera de servicio
- Imagen
- Precio por hora

### 4.2 Usuarios

- Nombre completo
- Usuario
- Rol
- Estado

### 4.3 Roles

- Administrador
- Encargado
- Cliente

### 4.4 Reservas

- Fecha
- Horas reservadas
- Cliente asociado
- Estado
- Total

## 5. Actores y permisos

### Administrador

- Crear nuevo usuario
- Crear nueva cancha
- Editar una cancha existente
- Eliminar una cancha
- Consultar disponibilidad de las canchas
- Aprobar reservas pendientes
- Aprobar cancelaciones
- Consultar reservas
- Cancelar reservas

### Encargado

- Consultar disponibilidad de las canchas
- Consultar reservas
- Ver reservas del día

### Cliente

- Consultar disponibilidad de canchas
- Realizar una reserva
- Consultar reservas propias
- Solicitar cancelación de una reserva

## 6. Vistas del prototipo

### 6.1 Vistas públicas

- Home público
- Catálogo de canchas
- Calendario de cancha
- Horas del día
- Formulario de reserva

### 6.2 Vistas administrativas

- Home administrador
- Inicio de sesión
- Creación de usuario
- Creación y edición de cancha
- Reservas generales
- Reservas del día

### 6.3 Vistas del cliente

- Catálogo de canchas
- Calendario de cancha
- Horas del día
- Formulario de reserva
- Mis reservas

## 7. Relación entre vistas

### Vista de cliente

- Home
- Catálogo de canchas
- Calendario de cancha
- Horas del día
- Formulario de reserva

### Vista de administrador y encargado

- Inicio de sesión
- Home administrador
- Catálogo de canchas
- Calendario de cancha
- Reservas del día
- Reservas generales
- Gestión de usuarios y canchas

## 8. Descripción de las vistas

### Catálogo de canchas

Lista todas las canchas disponibles para consultar su disponibilidad y reservar. El administrador puede acceder a un menú contextual para editar y eliminar canchas, además de crear nuevas.

### Calendario de cancha

Se despliega al seleccionar una cancha y permite elegir un día dentro del rango permitido. Para el rol administrador y encargado, incluye la opción de marcar días como fuera de servicio, con una acción reversible mediante switch.

### Horas del día

Se presenta al seleccionar un día específico. Muestra las franjas horarias disponibles y permite seleccionar las horas que el cliente desea reservar.

### Formulario de reserva

Se abre desde la vista de horas. Aquí el cliente completa sus datos personales y confirma la reserva con las horas seleccionadas.

### Creación de usuario

Panel reservado para crear usuarios, seleccionando rol, nombre y contraseña. Es una vista específica del administrador.

### Inicio de sesión

Permite ingresar usuario y contraseña para acceder como administrador o encargado.

### Reservas

Lista todas las reservas registradas, ordenadas por criterio provisional de fecha. El administrador puede gestionar las acciones de aprobación, cancelación y revisión de solicitudes.

### Reservas del día

Vista enfocada en el día seleccionado, mostrando todas las reservas del mismo día y cancha. Es una vista específica para administrador/encargado.

### Mis reservas

Permite al cliente consultar las reservas asociadas a su documento y solicitar cancelaciones si aplica.

## 9. Aspectos visuales

- Colores cálidos y pastel
- Enfoque mobile first
- Interfaz inspirada en una estética simple y limpia
- Uso de encabezados directos en cada vista
- No se usan banners de marca ni elementos visuales innecesarios
- Se prioriza la claridad de uso sobre la complejidad visual

## 10. Restricciones y limitaciones

- No se implementará pasarela de pago en línea.
- El pago sigue siendo tradicional y no se gestionará dentro del prototipo.
- No se usará chat interno ni notificaciones en tiempo real.
- No se contemplan turnos administrativos ni operativos complejos.
- No se desarrollará una aplicación nativa.
- No se crearán nuevas entidades lógicas ni nuevas vistas fuera del alcance definido.
- Los menús contextuales son la única forma de uso de modalidad emergente.
- No se contempla la integración con backend ni base de datos externa.

## 11. Criterios de aceptación

- El sistema no permite el solapamiento de horas reservadas en una misma cancha.
- El cliente puede consultar disponibilidad y precio sin requerir contacto directo con el administrador.
- El administrador y el encargado pueden revisar el estado y flujo de las reservas con un nivel operativo adecuado para este prototipo.
- El flujo de usuario se mantiene coherente según el rol autenticado.

## 12. Ejecución local

Para ver el prototipo en local, basta con abrir el archivo principal desde un navegador o servir la carpeta con un servidor estático simple.

Ejemplo con Python:

```bash
python -m http.server 8000
```

Luego abrir en el navegador:

```text
http://localhost:8000/index.html
```

## 13. Nota de alcance

Este es un prototipo funcional de interfaz y lógica de negocio en frontend. No está pensado como producto final ni como implementación de producción con persistencia real, autenticación robusta ni servicios backend.

