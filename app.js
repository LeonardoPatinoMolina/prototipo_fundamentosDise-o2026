(function () {
  const STORAGE_KEY = 'prototipo-canchas-v1';
  const CURRENT_USER_KEY = 'prototipo-current-user';
  const pageName = window.location.pathname.split('/').pop() || 'index.html';

  if (pageName === 'HomeAdmin.html') {
    const currentUser = (() => {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (error) {
        return null;
      }
    })();

    if (!currentUser || !['Administrador', 'Encargado'].includes(currentUser.role)) {
      window.location.replace('InicioSesion.html');
      return;
    }
  }

  const DEFAULT_DATA = {
    users: [],
    courts: [],
    reservations: [],
    outOfServiceDates: {}
  };

  let loadedDefaultData = null;

  function loadDefaultData() {
    try {
      const request = new XMLHttpRequest();
      request.open('GET', 'appsettings.json', false);
      request.send(null);

      if (request.status === 200 && request.responseText) {
        const settings = JSON.parse(request.responseText);
        if (settings && typeof settings === 'object') {
          loadedDefaultData = settings;
        }
      }
    } catch (error) {
      loadedDefaultData = null;
    }
  }

  function getDefaultData() {
    return clone(loadedDefaultData || DEFAULT_DATA);
  }

  loadDefaultData();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function ensureData() {
    const current = localStorage.getItem(STORAGE_KEY);
    const seedData = getDefaultData();

    if (!current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return clone(seedData);
    }

    try {
      const parsed = JSON.parse(current);
      return {
        users: Array.isArray(parsed.users) && parsed.users.length ? parsed.users : clone(seedData.users),
        courts: Array.isArray(parsed.courts) && parsed.courts.length ? parsed.courts : clone(seedData.courts),
        reservations: Array.isArray(parsed.reservations) ? parsed.reservations : clone(seedData.reservations),
        outOfServiceDates: parsed.outOfServiceDates || clone(seedData.outOfServiceDates || {})
      };
    } catch (error) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return clone(seedData);
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getData() {
    return ensureData();
  }

  function money(value) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  }

  function formatLongDate(dateString) {
    if (!dateString) return 'Sin fecha';
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  function formatShortDate(dateString) {
    if (!dateString) return 'Sin fecha';
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  function normalizeStatus(reservation) {
    if (reservation.cancelRequested) {
      return 'Cancelación solicitada';
    }
    return reservation.status || 'Reservada';
  }

  function shouldShowApprovalAction(reservation) {
    return !!reservation && reservation.status === 'Pendiente por aprobación' && reservation.cancelRequested !== true;
  }

  function shouldShowCancelRequestAction(reservation) {
    return !!reservation && reservation.cancelRequested === true;
  }

  function shouldShowCancelAction(reservation) {
    return !!reservation && reservation.status !== 'Cancelada';
  }

  function getCourtById(courtId) {
    return getData().courts.find((court) => court.id === courtId) || null;
  }

  function getPageName() {
    const name = window.location.pathname.split('/').pop() || 'index.html';
    return name;
  }

  function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function isCurrentUserAdmin() {
    const user = getCurrentUser();
    return !!user && user.role === 'Administrador';
  }

  function isCurrentUserStaff() {
    const user = getCurrentUser();
    return !!user && (user.role === 'Administrador' || user.role === 'Encargado');
  }

  function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  function configureSessionHeader() {
    const user = getCurrentUser();
    const badge = document.getElementById('roleBadge');
    const sessionLink = document.getElementById('sessionActionLink');

    if (badge && user) {
      badge.textContent = user.role === 'Encargado' ? 'ENCARGADO' : 'ADMIN';
    }

    if (sessionLink) {
      sessionLink.textContent = user ? 'Cerrar sesión' : 'Inicio de sesión';
      sessionLink.href = user ? '#' : 'InicioSesion.html';
      if (user) {
        sessionLink.addEventListener('click', function (event) {
          event.preventDefault();
          clearCurrentUser();
          window.location.href = 'InicioSesion.html';
        }, { once: true });
      }
    }

    if (!user) {
      const adminOnlyButtons = document.querySelectorAll('.admin-only');
      adminOnlyButtons.forEach((element) => element.remove());
    }
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function readBookingSelection() {
    const raw = sessionStorage.getItem('bookingSelection');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function saveBookingSelection(selection) {
    sessionStorage.setItem('bookingSelection', JSON.stringify(selection));
  }

  function clearCalendarSelection() {
    sessionStorage.removeItem('calendar-selected-date');
  }

  function getReservedHoursForCourtAndDate(courtId, dateString) {
    const data = getData();
    return data.reservations
      .filter((reservation) => reservation.courtId === courtId && reservation.date === dateString)
      .flatMap((reservation) => reservation.hours || []);
  }

  function isDateOutOfService(courtId, dateString) {
    const data = getData();
    const list = data.outOfServiceDates[courtId] || [];
    return list.includes(dateString);
  }

  function isDateWithinFutureWindow(dateString) {
    if (!dateString) return false;

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
    const chosen = new Date(`${dateString}T00:00:00`);

    return chosen >= start && chosen <= end;
  }

  function getAllHours() {
    const hours = [];
    for (let h = 6; h <= 21; h += 1) {
      const start = `${String(h).padStart(2, '0')}:00`;
      const endHour = h + 1;
      const end = `${String(endHour).padStart(2, '0')}:00`;
      hours.push(`${start} - ${end}`);
    }
    return hours;
  }

  function renderClientCatalog() {
    const container = document.querySelector('.catalog-grid');
    if (!container) return;

    const data = getData();
    container.innerHTML = data.courts.map((court) => {
      const isAvailable = court.available !== false;
      return `
        <article class="court-card">
          <img class="court-image" src="${court.image}" alt="${court.name}">
          <div class="court-info">
            <div class="court-title-wrap">
              <h2 class="court-name">${court.name}</h2>
              <span class="status-badge ${isAvailable ? 'available' : 'unavailable'}">${isAvailable ? 'Disponible' : 'No disponible'}</span>
            </div>
            <div class="court-price">Precio: <span>${money(court.price)}</span> / hora</div>
            <a href="CalendarioCancha.html?courtId=${court.id}" class="btn-action">Ver Disponibilidad</a>
          </div>
        </article>
      `;
    }).join('');
  }

  function buildReservationCards(entries) {
    return entries.map((reservation) => {
      const status = normalizeStatus(reservation);
      const statusClass = status === 'Reservada' ? 'reserved' : status === 'En curso' ? 'in-progress' : status === 'Cancelada' ? 'canceled' : 'pending';
      const isFuture = new Date(`${reservation.date}T00:00:00`) > new Date();
      const canCancel = reservation.status === 'Pendiente por aprobación' && !reservation.cancelRequested && isFuture;

      return `
        <article class="reservation-card ${statusClass}">
          <div class="res-header">
            <span class="res-court">${reservation.courtName}</span>
            <span class="res-status-tag">${status}</span>
          </div>
          <div class="res-details">
            <div><strong>Fecha:</strong> ${formatShortDate(reservation.date)}</div>
            <div><strong>Horas:</strong> ${reservation.hours.join(', ')} (${reservation.hours.length} ${reservation.hours.length === 1 ? 'hr' : 'hrs'})</div>
            <div><strong>Cliente:</strong> ${reservation.clientName} (Doc: ${reservation.document})</div>
            <div><strong>Total:</strong> ${money(reservation.total)}</div>
          </div>
          <button class="btn-cancel" data-id="${reservation.id}" ${canCancel ? '' : 'disabled'} title="${canCancel ? 'Solicitar cancelación' : 'Solo se puede cancelar reservas pendientes y futuras'}">Solicitar cancelación</button>
        </article>
      `;
    }).join('');
  }

  function renderClientReservations(docNumber) {
    const list = document.getElementById('reservas-list');
    if (!list) return;

    const data = getData();
    const matches = data.reservations.filter((reservation) => reservation.document === docNumber && reservation.document);

    if (!matches.length) {
      list.innerHTML = '<div class="lookup-card"><p style="color: var(--text-muted);">No se encontraron reservas para este documento.</p></div>';
      return;
    }

    list.innerHTML = buildReservationCards(matches);

    list.querySelectorAll('.btn-cancel').forEach((button) => {
      button.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        requestCancellation(id);
      });
    });
  }

  function requestCancellation(reservationId) {
    const data = getData();
    const reservation = data.reservations.find((item) => item.id === reservationId);
    if (!reservation) return;

    reservation.cancelRequested = true;
    reservation.status = 'Pendiente por aprobación';
    saveData(data);
    renderClientReservations(reservation.document);
    alert('Solicitud de cancelación enviada para aprobación.');
  }

  function consultarReservas() {
    const input = document.getElementById('document-input');
    const doc = (input ? input.value : '').trim();
    if (!doc) {
      alert('Por favor ingrese su número de documento.');
      return;
    }
    renderClientReservations(doc);
  }

  function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach((tab) => tab.classList.remove('active'));
    buttons.forEach((btn) => btn.classList.remove('active'));

    if (tabName === 'catalogo') {
      document.getElementById('tab-catalogo')?.classList.add('active');
      buttons[0]?.classList.add('active');
    } else if (tabName === 'mis-reservas') {
      document.getElementById('tab-mis-reservas')?.classList.add('active');
      buttons[1]?.classList.add('active');
    }
  }

  function initClientHome() {
    renderClientCatalog();

    document.querySelectorAll('.tab-button').forEach((button, index) => {
      button.addEventListener('click', function () {
        switchTab(index === 0 ? 'catalogo' : 'mis-reservas');
      });
    });

    const docInput = document.getElementById('document-input');
    if (docInput) {
      docInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          consultarReservas();
        }
      });

      const consultButton = document.querySelector('.lookup-card .btn-action');
      if (consultButton) {
        consultButton.addEventListener('click', consultarReservas);
      }

      const defaultDoc = '1012345678';
      docInput.value = defaultDoc;
      renderClientReservations(defaultDoc);
    }

    window.switchTab = switchTab;
    window.consultarReservas = consultarReservas;
  }

  function initLoginPage() {
    document.getElementById('loginForm')?.addEventListener('submit', function (event) {
      event.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      const data = getData();
      const match = data.users.find((user) => user.username === username && user.password === password);

      if (!match) {
        alert('Credenciales inválidas. Intente nuevamente.');
        return;
      }

      setCurrentUser(match);
      alert('Sesión iniciada correctamente');
      window.location.href = 'HomeAdmin.html';
    });
  }

  function renderAdminCourts() {
    const container = document.querySelector('.catalog-grid');
    const summary = document.querySelector('.section-title span:last-child');
    if (!container) return;

    const data = getData();
    container.innerHTML = data.courts.map((court) => {
      const isAvailable = court.available !== false;
      return `
        <article class="court-card" data-id="${court.id}">
          <button class="admin-menu-btn" type="button" data-menu="menu-${court.id}">⋮</button>
          <div class="context-menu" id="menu-${court.id}">
            <button type="button" class="context-option" data-action="edit" data-id="${court.id}">✏️ Editar Cancha</button>
            <button type="button" class="context-option delete" data-action="delete" data-id="${court.id}">🗑️ Eliminar</button>
          </div>
          <img class="court-image" src="${court.image}" alt="${court.name}">
          <div class="court-info">
            <div class="court-title-wrap">
              <h2 class="court-name">${court.name}</h2>
              <span class="status-badge ${isAvailable ? 'available' : 'unavailable'}">${isAvailable ? 'Disponible' : 'No disponible'}</span>
            </div>
            <div class="court-price">Precio: <span>${money(court.price)}</span> / hr</div>
            <a href="CalendarioCancha.html?courtId=${court.id}" class="btn-action" style="text-decoration:none; display:block;">Consultar Disponibilidad / Día</a>
          </div>
        </article>
      `;
    }).join('');

    if (summary) {
      summary.textContent = `${data.courts.length} canchas registradas`;
    }

    document.querySelectorAll('.admin-menu-btn').forEach((button) => {
      button.addEventListener('click', function () {
        const menuId = this.getAttribute('data-menu');
        document.querySelectorAll('.context-menu').forEach((menu) => {
          if (menu.id !== menuId) menu.classList.remove('active');
        });
        const menu = document.getElementById(menuId);
        menu?.classList.toggle('active');
      });
    });

    document.querySelectorAll('[data-action="edit"]').forEach((button) => {
      button.addEventListener('click', function () {
        const courtId = this.getAttribute('data-id');
        window.location.href = `CrearCancha.html?editId=${courtId}`;
      });
    });

    document.querySelectorAll('[data-action="delete"]').forEach((button) => {
      button.addEventListener('click', function () {
        const courtId = this.getAttribute('data-id');
        removeCourt(courtId);
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.admin-menu-btn')) {
        document.querySelectorAll('.context-menu').forEach((menu) => menu.classList.remove('active'));
      }
    });
  }

  function removeCourt(courtId) {
    const data = getData();
    const court = data.courts.find((item) => item.id === courtId);
    if (!court) return;

    const confirmed = window.confirm(`¿Está seguro que desea eliminar ${court.name}?`);
    if (!confirmed) return;

    const hasReservations = data.reservations.some((reservation) => reservation.courtId === courtId);
    if (hasReservations) {
      alert('La cancha tiene reservas asociadas. No puede eliminarse.');
      return;
    }

    data.courts = data.courts.filter((item) => item.id !== courtId);
    delete data.outOfServiceDates[courtId];
    saveData(data);
    renderAdminCourts();
  }

  function initAdminHome() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'InicioSesion.html';
      return;
    }

    configureSessionHeader();
    renderAdminCourts();

    if (!isCurrentUserAdmin()) {
      document.querySelectorAll('.admin-only').forEach((element) => element.remove());
      document.querySelectorAll('.context-option').forEach((element) => element.remove());
      document.querySelectorAll('.admin-menu-btn').forEach((element) => element.remove());
    }
  }

  function initCreateCourtPage() {
    if (!isCurrentUserAdmin()) {
      alert('No tienes permisos para modificar canchas.');
      window.location.href = 'HomeAdmin.html';
      return;
    }

    const form = document.getElementById('createCourtForm');
    const editId = getQueryParam('editId');
    const imageInput = document.getElementById('imageUrl');
    const previewImg = document.getElementById('previewImg');
    const previewText = document.getElementById('previewText');

    if (imageInput) {
      imageInput.addEventListener('input', function () {
        const url = this.value.trim();
        if (url) {
          previewImg.src = url;
          previewImg.style.display = 'block';
          previewText.style.display = 'none';
        } else {
          previewImg.style.display = 'none';
          previewText.style.display = 'block';
        }
      });
    }

    if (editId) {
      const court = getCourtById(editId);
      if (court) {
        document.getElementById('courtName').value = court.name;
        document.getElementById('hourlyRate').value = court.price;
        document.getElementById('imageUrl').value = court.image;
        document.getElementById('courtAvailable').checked = court.available !== false;
        if (previewImg && previewText) {
          previewImg.src = court.image;
          previewImg.style.display = 'block';
          previewText.style.display = 'none';
        }
      }
    }

    form?.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = getData();
      const name = document.getElementById('courtName').value.trim();
      const price = Number(document.getElementById('hourlyRate').value);
      const image = document.getElementById('imageUrl').value.trim() || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80';
      const available = document.getElementById('courtAvailable').checked;

      if (!name || !price || price <= 0) {
        alert('Ingrese un nombre y un precio válido.');
        return;
      }

      if (editId) {
        const court = data.courts.find((item) => item.id === editId);
        if (!court) {
          alert('La cancha no existe.');
          return;
        }
        court.name = name;
        court.price = price;
        court.image = image;
        court.available = available;
      } else {
        data.courts.push({ id: makeId('court'), name, price, image, available });
      }

      saveData(data);
      window.location.href = 'HomeAdmin.html';
    });
  }

  function initCreateUserPage() {
    if (!isCurrentUserAdmin()) {
      alert('No tienes permisos para crear usuarios.');
      window.location.href = 'HomeAdmin.html';
      return;
    }

    const form = document.getElementById('createUserForm');
    form?.addEventListener('submit', function (event) {
      event.preventDefault();
      const data = getData();
      const username = document.getElementById('username').value.trim();
      const fullName = document.getElementById('fullName').value.trim();
      const password = document.getElementById('password').value.trim();
      const role = document.querySelector('input[name="userRole"]:checked')?.value || 'Encargado';
      const state = document.getElementById('userState').value;

      if (!username || !fullName || !password) {
        alert('Complete los campos obligatorios.');
        return;
      }

      if (data.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
        alert('Ya existe un usuario con ese nombre de usuario.');
        return;
      }

      data.users.push({ id: makeId('user'), username, password, role, name: fullName, state });
      saveData(data);
      alert('Usuario creado exitosamente');
      window.location.href = 'HomeAdmin.html';
    });
  }

  function initCalendarPage() {
    clearCalendarSelection();

    const pageName = getPageName();
    const courtId = getQueryParam('courtId') || 'c1';
    const court = getCourtById(courtId) || getData().courts[0];
    const titleNode = document.querySelector('.header-titles h1');
    if (titleNode) titleNode.textContent = court ? court.name : 'Cancha';

    const backLink = document.querySelector('.btn-back');
    if (backLink) {
      backLink.href = isCurrentUserStaff() ? 'HomeAdmin.html' : 'index.html';
    }

    const dateDisplay = document.getElementById('selectedDateDisplay');
    const nextButton = document.getElementById('btnNext');
    const selectedDateField = '';
    const isStaff = isCurrentUserStaff();
    const adminControls = document.querySelector('.admin-controls');
    const switchElem = document.getElementById('outOfServiceSwitch');

    if (dateDisplay) {
      dateDisplay.textContent = 'Ninguna';
    }
    if (nextButton) {
      nextButton.disabled = true;
    }

    if (adminControls) {
      adminControls.style.display = isStaff ? 'flex' : 'none';
    }

    if (nextButton) {
      nextButton.textContent = isStaff ? 'Ver reservas del día' : 'Ver horas disponibles';
    }

    const getRangeDates = () => {
      const today = new Date();
      const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const maxDate = new Date(minDate);
      maxDate.setDate(minDate.getDate() + 30);
      return { minDate, maxDate };
    };

    const getDisabledDates = (date) => {
      const { minDate, maxDate } = getRangeDates();
      const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const isOutOfRange = date < minDate || date > maxDate;
      return isOutOfRange || (!isStaff && isDateOutOfService(courtId, isoDate));
    };

    const renderOutOfServiceClasses = (picker) => {
      if (!picker || !picker.calendarContainer) return;
      const days = picker.calendarContainer.querySelectorAll('.flatpickr-day');
      days.forEach((day) => {
        const dayText = day.textContent.trim();
        if (!dayText) return;
        const month = String(picker.currentMonth + 1).padStart(2, '0');
        const year = picker.currentYear;
        const isoDate = `${year}-${month}-${String(dayText).padStart(2, '0')}`;
        day.classList.toggle('out-of-service-day', isDateOutOfService(courtId, isoDate));
        day.classList.toggle('flatpickr-disabled', getDisabledDates(new Date(`${isoDate}T00:00:00`)) && !isStaff);
      });
    };

    const picker = flatpickr('#calendario-inline', {
      inline: true,
      locale: 'es',
      dateFormat: 'Y-m-d',
      minDate: getRangeDates().minDate,
      maxDate: getRangeDates().maxDate,
      defaultDate: selectedDateField || null,
      disable: [function (date) {
        return getDisabledDates(date);
      }],
      onChange: function (selectedDates, dateStr) {
        if (!dateStr) return;
        sessionStorage.setItem('calendar-selected-date', dateStr);
        dateDisplay.textContent = dateStr;
        nextButton.disabled = false;
        if (switchElem) {
          switchElem.checked = isDateOutOfService(courtId, dateStr);
        }
        renderOutOfServiceClasses(this);
      },
      onReady: function () {
        renderOutOfServiceClasses(this);
        if (selectedDateField) {
          dateDisplay.textContent = selectedDateField;
          nextButton.disabled = false;
        }
        if (switchElem) {
          switchElem.disabled = !isStaff;
          switchElem.checked = !!(selectedDateField && isDateOutOfService(courtId, selectedDateField));
        }
      }
    });

    nextButton?.addEventListener('click', function () {
      const date = sessionStorage.getItem('calendar-selected-date');
      if (!date) {
        alert('Primero seleccione una fecha.');
        return;
      }
      if (!isDateWithinFutureWindow(date)) {
        alert('La fecha seleccionada debe estar dentro del plazo de 30 días desde hoy.');
        return;
      }
      if (isDateOutOfService(courtId, date) && !isStaff) {
        alert('Ese día está marcado como fuera de servicio y no está disponible para reservas.');
        return;
      }
      clearCalendarSelection();
      const targetPage = isStaff ? 'ReservasDia.html' : 'HorasDia.html';
      window.location.href = `${targetPage}?courtId=${courtId}&date=${date}`;
    });

    if (switchElem) {
      switchElem.addEventListener('change', function () {
        const date = sessionStorage.getItem('calendar-selected-date');
        if (!date) {
          alert('Debe seleccionar un día primero.');
          this.checked = !this.checked;
          return;
        }
        if (!isDateWithinFutureWindow(date)) {
          alert('No se puede marcar días fuera del rango permitido.');
          this.checked = !this.checked;
          return;
        }

        const data = getData();
        if (!data.outOfServiceDates[courtId]) data.outOfServiceDates[courtId] = [];

        if (this.checked) {
          if (!data.outOfServiceDates[courtId].includes(date)) {
            data.outOfServiceDates[courtId].push(date);
          }
          alert(`El día ${date} ha sido marcado como fuera de servicio.`);
        } else {
          data.outOfServiceDates[courtId] = data.outOfServiceDates[courtId].filter((d) => d !== date);
          alert(`El día ${date} ha sido habilitado nuevamente.`);
        }

        saveData(data);
        picker.redraw();
        renderOutOfServiceClasses(picker);
        switchElem.checked = isDateOutOfService(courtId, date);
      });
    }

    window.addEventListener('beforeunload', clearCalendarSelection);

    if (pageName === 'CalendarioCancha11.html') {
      const path = `CalendarioCancha.html?courtId=${courtId}`;
      window.location.href = path;
    }
  }

  function initHoursPage() {
    const courtId = getQueryParam('courtId') || 'c1';
    const chosenDate = getQueryParam('date') || new Date().toISOString().slice(0, 10);
    const court = getCourtById(courtId) || getData().courts[0];
    const isAdmin = isCurrentUserAdmin();

    if (!isDateWithinFutureWindow(chosenDate)) {
      alert('La fecha seleccionada está fuera del rango permitido para reservas.');
      window.location.href = `CalendarioCancha.html?courtId=${courtId}`;
      return;
    }

    if (isDateOutOfService(courtId, chosenDate) && !isAdmin) {
      alert('Ese día está marcado como fuera de servicio y no se puede reservar.');
      window.location.href = `CalendarioCancha.html?courtId=${courtId}`;
      return;
    }

    const reservedHours = getReservedHoursForCourtAndDate(courtId, chosenDate);
    const selectedHours = (readBookingSelection()?.hours || []).filter((hour) => !reservedHours.includes(hour));

    const headerTitle = document.querySelector('.header-titles p');
    if (headerTitle) {
      headerTitle.textContent = `${court ? court.name : 'Cancha'} · ${formatShortDate(chosenDate)}`;
    }

    const contextDate = document.querySelector('.context-info strong');
    if (contextDate) {
      contextDate.textContent = formatShortDate(chosenDate);
    }

    const totalPrice = document.getElementById('totalPriceText');
    const countText = document.getElementById('selectedCountText');
    const grid = document.querySelector('.hours-grid');
    if (!grid) return;

    grid.innerHTML = '';
    getAllHours().forEach((hourLabel) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'hour-chip';
      chip.textContent = hourLabel;
      chip.dataset.hour = hourLabel;
      const isReserved = reservedHours.includes(hourLabel);
      const isOutOfService = isDateOutOfService(courtId, chosenDate);
      if (isReserved || isOutOfService) {
        chip.classList.add('occupied');
        chip.disabled = true;
        chip.setAttribute('aria-disabled', 'true');
      }
      if (selectedHours.includes(hourLabel)) {
        chip.classList.add('selected');
      }

      chip.addEventListener('click', () => {
        if (chip.classList.contains('occupied') || chip.disabled) return;
        chip.classList.toggle('selected');
        updateHoursSummary();
      });

      grid.appendChild(chip);
    });

    const link = document.querySelector('.btn-action');
    if (link) {
      link.addEventListener('click', function (event) {
        const selected = Array.from(document.querySelectorAll('.hour-chip.selected')).map((element) => element.dataset.hour);
        if (!selected.length) {
          event.preventDefault();
          alert('Seleccione al menos una hora para continuar.');
          return;
        }
        saveBookingSelection({ courtId, date: chosenDate, hours: selected, total: selected.length * court.price });
      });
    }

    function updateHoursSummary() {
      const selected = Array.from(document.querySelectorAll('.hour-chip.selected')).map((element) => element.dataset.hour);
      countText.textContent = `${selected.length} hora${selected.length === 1 ? '' : 's'}`;
      totalPrice.textContent = money(selected.length * (court ? court.price : 0));
      if (link) {
        link.disabled = selected.length === 0;
      }
    }

    updateHoursSummary();
  }

  function initReservationForm() {
    const selection = readBookingSelection();
    if (!selection) {
      alert('No hay una reserva activa para completar.');
      window.location.href = 'index.html';
      return;
    }

    const court = getCourtById(selection.courtId) || getData().courts[0];

    const info = document.querySelector('.confirmation-card');
    if (info) {
      info.innerHTML = `
        <h2>Confirmación de reserva</h2>
        <div class="summary-list">
          <div class="summary-item"><span>Cancha</span><strong>${court.name}</strong></div>
          <div class="summary-item"><span>Fecha</span><strong>${formatLongDate(selection.date)}</strong></div>
          <div class="summary-item"><span>Horas</span><strong>${selection.hours.length} seleccionadas</strong></div>
          <div class="hours-tags">${selection.hours.map((hour) => `<span class="hour-badge">${hour}</span>`).join('')}</div>
          <div class="total-row"><span>Total estimado</span><span>${money(selection.total || (selection.hours.length * court.price))}</span></div>
        </div>
      `;
    }

    const form = document.getElementById('reservationForm');
    form?.addEventListener('submit', function (event) {
      event.preventDefault();
      const clientName = document.getElementById('clientName').value.trim();
      const documentNumber = document.getElementById('clientDocument').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();

      if (!clientName || !documentNumber || !phone) {
        alert('Complete todos los datos del cliente.');
        return;
      }

      const data = getData();
      const bookedHours = selection.hours;
      const conflict = data.reservations.some((reservation) => {
        if (reservation.courtId !== selection.courtId || reservation.date !== selection.date) return false;
        return reservation.hours.some((hour) => bookedHours.includes(hour));
      });

      if (conflict) {
        alert('Ya existen reservas en algunas de las horas seleccionadas. Elija otra franja horaria.');
        return;
      }

      const reservation = {
        id: makeId('reservation'),
        courtId: selection.courtId,
        courtName: court.name,
        date: selection.date,
        hours: bookedHours,
        clientName,
        document: documentNumber,
        phone,
        status: 'Pendiente por aprobación',
        total: selection.total || (bookedHours.length * court.price),
        cancelRequested: false
      };

      data.reservations.push(reservation);
      saveData(data);
      sessionStorage.removeItem('bookingSelection');
      alert('Reserva creada exitosamente y enviada para aprobación.');
      window.location.href = 'index.html';
    });
  }

  function renderAdminReservations() {
    const content = document.querySelector('.content-area');
    if (!content) return;

    const data = getData();
    const ordered = [...data.reservations].sort((a, b) => new Date(b.date) - new Date(a.date));
    const isAdmin = isCurrentUserAdmin();

    content.innerHTML = `
      <div class="section-header">
        <span class="section-title">Todas las Reservas</span>
        <span class="order-indicator">📅 Más recientes primero</span>
      </div>
      ${ordered.map((reservation) => {
        const status = normalizeStatus(reservation);
        const statusClass = status === 'Reservada' ? 'reserved' : status === 'En curso' ? 'in-progress' : status === 'Cancelada' ? 'canceled' : 'pending';
        const showApprovalAction = isAdmin && shouldShowApprovalAction(reservation);
        const showCancelRequestActionState = isAdmin && shouldShowCancelRequestAction(reservation);
        const showCancelActionState = isAdmin && shouldShowCancelAction(reservation);
        const adminActions = isAdmin ? `
          <div class="admin-actions">
            ${showApprovalAction ? '<button class="btn-approve" data-action="approve" data-id="' + reservation.id + '">✓ Aprobar Reserva</button>' : ''}
            ${showCancelRequestActionState ? '<button class="btn-cancel-req" data-action="approve-cancel" data-id="' + reservation.id + '">✓ Confirmar Cancelación</button>' : ''}
            ${showCancelActionState ? '<button class="btn-danger" data-action="cancel" data-id="' + reservation.id + '">' + (reservation.cancelRequested ? 'Rechazar cancelación' : 'Cancelar Reserva') + '</button>' : ''}
          </div>
        ` : '';

        return `
          <article class="reservation-card ${statusClass}">
            <div class="res-top">
              <div>
                <div class="res-court">${reservation.courtName}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${formatLongDate(reservation.date)}</div>
              </div>
              <span class="res-badge ${statusClass}">${status}</span>
            </div>
            <div class="res-info">
              <div><strong>Horas:</strong> ${reservation.hours.join(', ')} (${reservation.hours.length} ${reservation.hours.length === 1 ? 'hr' : 'hrs'})</div>
              <div><strong>Total:</strong> ${money(reservation.total)}</div>
              <div class="client-box">
                <div>👤 <strong>Cliente:</strong> ${reservation.clientName}</div>
                <div>📄 <strong>Doc:</strong> ${reservation.document}</div>
                <div>📞 <strong>Tel:</strong> ${reservation.phone}</div>
              </div>
            </div>
            ${adminActions}
          </article>
        `;
      }).join('') || '<p style="color: var(--text-muted);">No hay reservas registradas.</p>'}
    `;

    content.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', function () {
        const action = this.getAttribute('data-action');
        const id = this.getAttribute('data-id');
        handleAdminReservationAction(action, id);
      });
    });
  }

  function handleAdminReservationAction(action, reservationId) {
    if (!isCurrentUserAdmin()) {
      alert('El rol Encargado no puede modificar reservas.');
      return;
    }

    const data = getData();
    const reservation = data.reservations.find((item) => item.id === reservationId);
    if (!reservation) return;

    if (action === 'approve') {
      reservation.status = 'Reservada';
      reservation.cancelRequested = false;
      alert('Reserva aprobada correctamente.');
    }

    if (action === 'approve-cancel') {
      reservation.status = 'Cancelada';
      reservation.cancelRequested = false;
      alert('Cancelación aprobada.');
    }

    if (action === 'cancel') {
      reservation.status = reservation.cancelRequested ? 'Reservada' : 'Cancelada';
      reservation.cancelRequested = false;
      alert(reservation.status === 'Cancelada' ? 'Reserva cancelada por el administrador.' : 'Solicitud de cancelación rechazada.');
    }

    saveData(data);
    renderAdminReservations();
  }

  function initAdminReservationsPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'InicioSesion.html';
      return;
    }

    configureSessionHeader();
    renderAdminReservations();
  }

  function initDayReservationsPage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'InicioSesion.html';
      return;
    }

    const content = document.querySelector('.content-area');
    if (!content) return;

    const courtId = getQueryParam('courtId') || 'c1';
    const date = getQueryParam('date') || new Date().toISOString().slice(0, 10);
    const court = getCourtById(courtId) || getData().courts[0];
    const data = getData();
    const reservations = data.reservations.filter((reservation) => reservation.courtId === courtId && reservation.date === date);

    const summary = document.querySelector('.day-summary-card');
    if (summary) {
      summary.innerHTML = `
        <div class="day-info">
          <h2>${formatLongDate(date)}</h2>
          <p>${court.name}</p>
        </div>
        <span class="day-count-badge">${reservations.length} Reserva${reservations.length === 1 ? '' : 's'}</span>
      `;
    }

    const cards = reservations.length ? reservations.map((reservation) => {
      const status = normalizeStatus(reservation);
      const statusClass = status === 'Reservada' ? 'reserved' : status === 'En curso' ? 'in-progress' : status === 'Cancelada' ? 'canceled' : 'pending';
      const timeInfo = reservation.hours.length > 1 ? reservation.hours.join(', ') : reservation.hours[0];
      const showDayApproveAction = shouldShowApprovalAction(reservation);
      const showDayCancelRequestAction = shouldShowCancelRequestAction(reservation);
      const showDayCancelAction = shouldShowCancelAction(reservation);
      return `
        <article class="reservation-card ${statusClass}">
          <div class="res-top">
            <span class="res-time">⏰ ${timeInfo}</span>
            <span class="res-badge ${statusClass}">${status}</span>
          </div>
          <div class="res-info">
            <div><strong>Duración:</strong> ${reservation.hours.length} hora${reservation.hours.length === 1 ? '' : 's'} (${reservation.hours.join(', ')})</div>
            <div><strong>Monto:</strong> ${money(reservation.total)}</div>
            <div class="client-box">
              <div>👤 <strong>Cliente:</strong> ${reservation.clientName}</div>
              <div>📄 <strong>Doc:</strong> ${reservation.document}</div>
              <div>📞 <strong>Tel:</strong> ${reservation.phone}</div>
            </div>
          </div>
          <div class="admin-actions">
            ${showDayApproveAction ? '<button class="btn-approve" data-action="approve" data-id="' + reservation.id + '">✓ Aprobar Reserva</button>' : ''}
            ${showDayCancelRequestAction ? '<button class="btn-cancel-req" data-action="approve-cancel" data-id="' + reservation.id + '">✓ Confirmar Cancelación</button>' : ''}
            ${showDayCancelAction ? '<button class="btn-danger" data-action="cancel" data-id="' + reservation.id + '">' + (reservation.cancelRequested ? 'Rechazar cancelación' : 'Cancelar Reserva') + '</button>' : ''}
          </div>
        </article>
      `;
    }).join('') : '<p style="color: var(--text-muted);">No hay reservas para este día.</p>';

    content.innerHTML = `
      <section class="day-summary-card">
        <div class="day-info">
          <h2>${formatLongDate(date)}</h2>
          <p>${court.name}</p>
        </div>
        <span class="day-count-badge">${reservations.length} Reserva${reservations.length === 1 ? '' : 's'}</span>
      </section>
      ${cards}
    `;

    content.querySelectorAll('[data-action="approve-cancel"]').forEach((button) => {
      button.addEventListener('click', function () {
        handleAdminReservationAction('approve-cancel', this.getAttribute('data-id'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const page = getPageName();
    if (page === 'index.html') initClientHome();
    if (page === 'InicioSesion.html') initLoginPage();
    if (page === 'HomeAdmin.html') initAdminHome();
    if (page === 'CrearCancha.html') initCreateCourtPage();
    if (page === 'CrearUsuario.html') initCreateUserPage();
    if (page === 'CalendarioCancha.html' || page === 'CalendarioCancha11.html') initCalendarPage();
    if (page === 'HorasDia.html') initHoursPage();
    if (page === 'FormularioReserva.html') initReservationForm();
    if (page === 'ReservasAdmin.html') initAdminReservationsPage();
    if (page === 'ReservasDia.html') initDayReservationsPage();
  });
})();
