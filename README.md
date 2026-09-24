1.Proyecto 
Alquiler de 2 canchas sintéticas. Prototipo para tener un ejemplo interactivo, no es necesaria la conexión a base de datos externa de momento, no está destinado a ser el producto final a nivel código.

2.Plataforma objetivo
-Navegador web, orientado a móvil (mobile first), formato vertical pero suficientemente responsive para modo PC y Tablet.

3.Reglas de negocio
-La reserva se hace por horas enteras, no por fracciones de ella.
-Los estados posibles de las reservas son: Reservada, En curso, Cancelada y Pendiente por aprobación.
-No es posible alquilar la misma hora del día a más de un cliente.
-La disponibilidad de las canchas es de 6am a 10pm
-Visualización de días en el calendario con alcance de un mes 
-No hay usuarios para los clientes
-Las cancelaciones de reserva solo se podrá para reservas pendientes, es decir con fecha y hora del futuro.

4.Entidades y propiedades
Canchas
-Nombre
-Disponible
-Días Fuera de servicio
-imagen
-Pecio por hora

Usuarios
-Nombre
-Rol
-Estado

Roles
-Nombre

Reservas
-Fecha
-Horas
-Cliente

Actores
Administrador
-Usuario
-Nombre

Encargado
-Usuario
-Nombre

Cliente
-Documento
-Nombre
-Teléfono

5.Acciones por actores
Administrador:
-Crear nuevo usuario
-Crear nueva cancha
-Editar datos de una cancha existente
-Eliminar una cancha
-Consultar disponibilidad de las canchas
-Aprobar solicitudes de alquiler (reservas)
-Aprobar cancelación de reservas
-Consultar reservas
-Cancelar reservas

Encargado
-Consultar disponibilidad de las canchas
-Consultar reservas

Cliente
-Consultar disponibilidad de las canchas
-Realizar una reserva 
-Consultar sus propias reservas.
-Solicitud de cancelación de reserva.

6.Vistas y actores con acceso a ellas
Home
-Administrador
-Encargado
-Cliente

Home Administrador
-Administrador
-Encargado

Catálogo de canchas
-Administrador
-Operario
-Cliente

Calendario de Cancha
-Encargado
-Administrado
-Cliente

Horas del día
-Cliente

Formulario para una reserva
-Cliente

Creación de usuario (Administrador/Encargado)
-Administrador

Inicio de sesión (Administrador/Encargado)
-Administrador
-Encargado

Reservas 
-Administrador
-Encargado

Reservas del día
-Administrador
-Encargado


Mis reservas
-Cliente
-Operario
-Administrador

7.Relación entre vistas
Vista cliente
-Home
-Home contiene: Catálogo de canchas y Mis reservas
-Catálogo de cancha contiene: Calendario de cancha.
-Calendario de Cancha contiene: Horas del día
-Horas del día contiene: Hacer una reserva

Vista Administrador/Encargado
-Home Administrador.
- Home Administrador contiene: Inicio de sesión.
-Inicio de sesión contiene: Catálogo de canchas y Reservas.
-Catalogo de canchas contiene: Calendario de Canchas.
-Calendario de canchas contiene: Reservas del día.
-Home Administrador contiene: creación de usuario.

8.Descripción de vistas:
-Catálogo de canchas: En lista todas las canchas disponibles en el sistema para hacer reservas, esta vista es general y no requiere ningún tipo de acceso especial, sin embargo, el rol administrador podrá acceder a un menú contextual para editarlas y a un botón para crear nuevas.
-Calendario de Cancha: Se despliega al seleccionar una cancha y muestra un calendario de en rango de un mes de forma interactivo para elegir un día en particular. Al rol administrador le permitirá acceder a un menú contextual para marcarlo como día fuera de servicio, y esta acción es reversible, es decir puede ser un siwtch.
- Horas del día: Se despliega al seleccionar un día particular del calendario, muestra las horas en el rango de disponibilidad y si están disponibles el cliente podrá seleccionar las que desea reservar.
-Formulario para una reserva: Se despliega al usar un botón en la vista de las horas, contiene campos para ingresar, documento, nombre. Teléfono del cliente que va a reservar, así como un pequeño apartado donde muestra las horas seleccionadas como confirmación.
-Creación de usuario (Administrador/Encargado): Un panel reservado para la creación de un usuario pudiendo seleccionar el rol, nombre y contraseña, en general sus acciones son CRUD.
-Inicio de sesión (Administrador/Encargado): Permite ingresar el nombre de usuario y la contraseña para ingresar como administrador u Encargado.
-Reservas: Enlista todas las reservas registradas con ordenamiento por fecha más reciente (ordenamiento provisional), el rol administrador tendrá un acceso a unas opciones (CRUD) para cada reserva, cada una de ellas mostrará los datos relevantes, datos de cliente y horas reservadas, así como su estado actual.
-Reservas del día: Se despliega desde un usuario administrador u Encargado en el calendario de cancha, enlista todas las reservas del día seleccionado, con las mismas opciones para el Administrador que la vista Reservas
-Mis reservas: se despliega desde el Home en la vista cliente y enlista todas las reservas de ese cliente, en caso de ser la primera visita tiene un campo de texto para ingresar el documento y consultar las asociadas a ese documento suyo. Cada reserva mostrará los datos relevantes y tendrá su opción para solicitar cancelación.

8.Aspectos visuales:
Colores cálidos pastel sin temas contemplados de momento.
Contemplar de referencia las dimensiones del iphone 17 pro max para el viewport.
Añadir todo el CSS necesario para que el estilo y maquetado quede acorde a lo necesitado y a Material UI design.
No usar imágenes en las vistas solo en las tarjetas del catálog de canchas.
No se usaran banners de marca en las vistas con los encabezados de las vistas es suficiente.
9.Aspectos generales.
Ya que no hay un rol de usuario cliente no queremos mostrar el login (inicio de sesión) al cliente, sería una URL para el Admin y otro para el cliente.

10.Aspectos que no se contemplarán, restricciones y limitaciones.
No se implementará pasarela de pago en línea, el control de pago sigue siendo tradicional Nequi/Efectivo según convenga al cliente. El sistema no maneja sistemas de pagos, solo se limita a mostrar el costo de la reserva calculando la cantidad de horas seleccionadas en la vista “Hacer Reserva”
No se incluirá un chat interno entre los distintos perfiles que operen el aplicativo.
No se contemplarán manejo de turnos Administrador, Encargado.
No se tiene pensado hacerlo una App Nativa de un sistema operativo, las herramientas tecnológicas que más utiliza el negocio son los teléfonos inteligentes.
Limitarse a agregar solo los elementos mencionados en esta guía, ningún elemento más que requiera la creación de más entidades lógicas, el alcance del proyecto es extremadamente moderado. No se toleran añadiduras de conceptos o funcionalidades adicionales que exijan una entidad nueva para la base de datos final, tampoco ninguna vista adicional a las que ya se enlistaron previamente, ninguna de ellas se definió como una ventana modal, solo los menús contextuales pueden seguir ese criterio.
Los eventos asociados a los casos de uso derivados de este proyecto no requieren de una lógica compleja de notificaciones o sockets.
De momento no es necesaria la inclusión de una marca, dejar esto fuera del alcance del proyecto

Criterios De Aceptación
El sistema no permite el solapamiento de las horas reservadas en una misma cancha durante cualquier reserva.
El cliente puede visualizar directamente la disponibilidad y precio del alquiler de las canchas sin requerir contactar con el administrador.
Tanto el administrador como el encargado están al día con el estado y flujo de las reservas, aunque su nivel de operatividad de la App será asimétrico.

