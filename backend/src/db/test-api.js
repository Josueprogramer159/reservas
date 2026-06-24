async function testApi() {
  const baseUrl = 'http://localhost:3001/api';
  let sessionCookie = '';

  console.log('--- Iniciando Pruebas de API ---');

  async function makeRequest(url, options = {}) {
    if (sessionCookie) {
      options.headers = {
        ...options.headers,
        'Cookie': sessionCookie
      };
    }
    const response = await fetch(url, options);
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }
    return {
      status: response.status,
      data: await response.json()
    };
  }

  // 1. Registro
  console.log('\n1. Probando Registro de Usuario...');
  const userPayload = {
    nombre: 'Usuario de Prueba UTC',
    email: 'test' + Date.now() + '@utc.edu',
    password: 'password123'
  };

  const registerRes = await makeRequest(`${baseUrl}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload)
  });

  console.log('Respuesta:', registerRes);
  if (registerRes.status === 200 && registerRes.data.success) {
    console.log('✅ Registro exitoso.');
  } else {
    console.log('❌ Registro fallido.');
    process.exit(1);
  }

  // 2. Correo duplicado
  console.log('\n2. Probando Registro de Correo Duplicado...');
  const duplicateRes = await makeRequest(`${baseUrl}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload)
  });
  console.log('Respuesta:', duplicateRes);
  if (duplicateRes.status === 400 && !duplicateRes.data.success) {
    console.log('✅ Control de duplicados correcto.');
  } else {
    console.log('❌ Control de duplicados fallido.');
    process.exit(1);
  }

  // 3. Contraseña corta
  console.log('\n3. Probando Contraseña Corta (< 8 caracteres)...');
  const shortPassRes = await makeRequest(`${baseUrl}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Test', email: 'short' + Date.now() + '@utc.edu', password: '1234567' })
  });
  if (shortPassRes.status === 400) {
    console.log('✅ Rechazo de contraseña corta correcto.');
  } else {
    console.log('❌ Validación de contraseña fallida.');
    process.exit(1);
  }

  // 4. Perfil con sesión activa
  console.log('\n4. Probando Obtención de Perfil...');
  const profileRes = await makeRequest(`${baseUrl}/auth/profile`);
  if (profileRes.status === 200 && profileRes.data.success) {
    console.log('✅ Perfil obtenido correctamente.');
  } else {
    console.log('❌ Perfil fallido.');
    process.exit(1);
  }

  // 5. Listar espacios (requiere auth)
  console.log('\n5. Probando Listado de Espacios...');
  const espaciosRes = await makeRequest(`${baseUrl}/espacios`);
  console.log('Total espacios:', espaciosRes.data.espacios?.length);
  if (espaciosRes.status === 200 && espaciosRes.data.success && espaciosRes.data.espacios.length > 0) {
    console.log('✅ Listado de espacios correcto.');
  } else {
    console.log('❌ Listado de espacios fallido.');
    process.exit(1);
  }

  const espacioId = espaciosRes.data.espacios[0].id;
  const fecha = new Date().toISOString().split('T')[0];

  // 6. Detalle de espacio
  console.log('\n6. Probando Detalle de Espacio...');
  const detalleRes = await makeRequest(`${baseUrl}/espacios/${espacioId}?fecha=${fecha}`);
  if (detalleRes.status === 200 && detalleRes.data.success) {
    console.log('✅ Detalle de espacio correcto:', detalleRes.data.espacio.nombre);
  } else {
    console.log('❌ Detalle de espacio fallido.');
    process.exit(1);
  }

  // 7. Espacio inexistente
  console.log('\n7. Probando Espacio Inexistente...');
  const noExisteRes = await makeRequest(`${baseUrl}/espacios/99999`);
  if (noExisteRes.status === 404) {
    console.log('✅ Error 404 para espacio inexistente correcto.');
  } else {
    console.log('❌ Manejo de espacio inexistente fallido.');
    process.exit(1);
  }

  // 8. Crear reserva
  console.log('\n8. Probando Creación de Reserva...');
  const reservaRes = await makeRequest(`${baseUrl}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ espacio_id: espacioId, fecha, horario: '08:00 - 10:00' })
  });
  console.log('Respuesta:', reservaRes.data.message);
  if (reservaRes.status === 201 && reservaRes.data.success) {
    console.log('✅ Reserva creada correctamente.');
  } else {
    console.log('❌ Creación de reserva fallida.');
    process.exit(1);
  }

  const reservaId = reservaRes.data.reserva.id;

  // 9. Verificar que el espacio ya no tiene ese horario libre
  console.log('\n9. Probando Disponibilidad tras Reserva...');
  const dispRes = await makeRequest(`${baseUrl}/espacios/${espacioId}?fecha=${fecha}`);
  const ocupado = dispRes.data.espacio.horarios_ocupados.includes('08:00 - 10:00');
  if (ocupado) {
    console.log('✅ Horario marcado como ocupado correctamente.');
  } else {
    console.log('❌ Disponibilidad no actualizada.');
    process.exit(1);
  }

  // 10. Reserva duplicada (conflicto)
  console.log('\n10. Probando Conflicto de Reserva...');
  const conflictoRes = await makeRequest(`${baseUrl}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ espacio_id: espacioId, fecha, horario: '08:00 - 10:00' })
  });
  if (conflictoRes.status === 409) {
    console.log('✅ Conflicto de reserva detectado correctamente.');
  } else {
    console.log('❌ Control de conflicto fallido.');
    process.exit(1);
  }

  // 11. Mis reservas
  console.log('\n11. Probando Mis Reservas...');
  const misReservasRes = await makeRequest(`${baseUrl}/reservas/mis-reservas`);
  if (misReservasRes.status === 200 && misReservasRes.data.reservas.length > 0) {
    console.log('✅ Mis reservas obtenidas correctamente.');
  } else {
    console.log('❌ Mis reservas fallido.');
    process.exit(1);
  }

  // 12. Cancelar reserva
  console.log('\n12. Probando Cancelación de Reserva...');
  const cancelRes = await makeRequest(`${baseUrl}/reservas/${reservaId}`, { method: 'DELETE' });
  if (cancelRes.status === 200 && cancelRes.data.success) {
    console.log('✅ Reserva cancelada correctamente.');
  } else {
    console.log('❌ Cancelación fallida.');
    process.exit(1);
  }

  // 13. Verificar disponibilidad restaurada
  console.log('\n13. Probando Disponibilidad tras Cancelación...');
  const dispRestRes = await makeRequest(`${baseUrl}/espacios/${espacioId}?fecha=${fecha}`);
  const libre = dispRestRes.data.espacio.horarios_libres.includes('08:00 - 10:00');
  if (libre) {
    console.log('✅ Horario liberado correctamente tras cancelación.');
  } else {
    console.log('❌ Disponibilidad no restaurada.');
    process.exit(1);
  }

  // 14. Logout
  console.log('\n14. Probando Cierre de Sesión...');
  const logoutRes = await makeRequest(`${baseUrl}/auth/logout`, { method: 'POST' });
  if (logoutRes.status === 200 && logoutRes.data.success) {
    console.log('✅ Cierre de sesión correcto.');
  } else {
    console.log('❌ Cierre de sesión fallido.');
    process.exit(1);
  }

  // 15. Login con cuenta inexistente
  console.log('\n15. Probando Login con Cuenta Inexistente...');
  sessionCookie = '';
  const noCuentaRes = await makeRequest(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'noexiste@utc.edu', password: 'password123' })
  });
  if (noCuentaRes.status === 401 && noCuentaRes.data.message.includes('no existe')) {
    console.log('✅ Mensaje de cuenta inexistente correcto.');
  } else {
    console.log('❌ Mensaje de cuenta inexistente fallido.');
    process.exit(1);
  }

  // 16. Login exitoso
  console.log('\n16. Probando Login Exitoso...');
  const loginRes = await makeRequest(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userPayload.email, password: userPayload.password })
  });
  if (loginRes.status === 200 && loginRes.data.success) {
    console.log('✅ Login exitoso.');
  } else {
    console.log('❌ Login fallido.');
    process.exit(1);
  }

  // 17. Login contraseña incorrecta
  sessionCookie = '';
  const badPassRes = await makeRequest(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userPayload.email, password: 'wrongpassword' })
  });
  if (badPassRes.status === 401 && badPassRes.data.message.includes('Contraseña')) {
    console.log('✅ Mensaje de contraseña incorrecta correcto.');
  } else {
    console.log('❌ Mensaje de contraseña incorrecta fallido.');
    process.exit(1);
  }

  sessionCookie = '';

  // 18. Admin login y dashboard
  console.log('\n18. Probando Admin Dashboard...');
  const adminLoginRes = await makeRequest(`${baseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@utc.edu', password: 'admin12345' })
  });
  if (adminLoginRes.status === 200) {
    const dbDataRes = await makeRequest(`${baseUrl}/admin/dashboard-data`);
    if (dbDataRes.data.reservasActivas !== undefined) {
      console.log('✅ Dashboard admin con reservas activas:', dbDataRes.data.reservasActivas);
    } else {
      console.log('❌ Dashboard admin sin conteo de reservas.');
      process.exit(1);
    }
  } else {
    console.log('❌ Admin login fallido.');
    process.exit(1);
  }

  console.log('\n🎉 ¡Todas las pruebas del Backend han pasado de forma exitosa! 🎉');
}

testApi();
