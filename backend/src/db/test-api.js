async function testApi() {
  const baseUrl = 'http://localhost:3001/api';
  let sessionCookie = '';

  console.log('--- Iniciando Pruebas de API ---');

  // Función auxiliar para realizar peticiones incluyendo y extrayendo cookies
  async function makeRequest(url, options = {}) {
    if (sessionCookie) {
      options.headers = {
        ...options.headers,
        'Cookie': sessionCookie
      };
    }
    const response = await fetch(url, options);
    
    // Capturar la cookie si se envía en los encabezados
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      // Extraer solo la parte del ID de sesión
      sessionCookie = setCookie.split(';')[0];
    }
    
    return {
      status: response.status,
      data: await response.json()
    };
  }

  // 1. Registrar un nuevo usuario
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

  // 2. Intentar registrar el mismo usuario (debería dar error de correo duplicado)
  console.log('\n2. Probando Registro de Correo Duplicado...');
  const duplicateRes = await makeRequest(`${baseUrl}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload)
  });
  console.log('Respuesta:', duplicateRes);
  if (duplicateRes.status === 400 && !duplicateRes.data.success) {
    console.log('✅ Control de duplicados correcto (Email ya registrado).');
  } else {
    console.log('❌ Control de duplicados fallido.');
    process.exit(1);
  }

  // 3. Consultar perfil con la sesión activa
  console.log('\n3. Probando Obtención de Perfil (Sesión Activa)...');
  const profileRes = await makeRequest(`${baseUrl}/auth/profile`);
  console.log('Respuesta:', profileRes);
  if (profileRes.status === 200 && profileRes.data.success && profileRes.data.user.email === userPayload.email) {
    console.log('✅ Obtención de perfil exitosa con persistencia de sesión.');
  } else {
    console.log('❌ Obtención de perfil fallida.');
    process.exit(1);
  }

  // 4. Cerrar sesión del usuario
  console.log('\n4. Probando Cierre de Sesión...');
  const logoutRes = await makeRequest(`${baseUrl}/auth/logout`, { method: 'POST' });
  console.log('Respuesta:', logoutRes);
  if (logoutRes.status === 200 && logoutRes.data.success) {
    console.log('✅ Cierre de sesión correcto.');
  } else {
    console.log('❌ Cierre de sesión fallido.');
    process.exit(1);
  }

  // 5. Intentar acceder a perfil de nuevo (debería dar error de no autenticado)
  console.log('\n5. Probando Perfil después de Cerrar Sesión...');
  const guestProfileRes = await makeRequest(`${baseUrl}/auth/profile`);
  console.log('Respuesta:', guestProfileRes);
  if (guestProfileRes.status === 401 && !guestProfileRes.data.success) {
    console.log('✅ Control de acceso correcto (No autenticado).');
  } else {
    console.log('❌ Error: Se permitió el acceso a perfil sin sesión.');
    process.exit(1);
  }

  // Limpiar cookies de usuario
  sessionCookie = '';

  // 6. Iniciar sesión como Administrador Semilla
  console.log('\n6. Probando Login de Administrador...');
  const adminPayload = {
    email: 'admin@utc.edu',
    password: 'admin12345'
  };

  const adminLoginRes = await makeRequest(`${baseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminPayload)
  });
  console.log('Respuesta:', adminLoginRes);
  if (adminLoginRes.status === 200 && adminLoginRes.data.success) {
    console.log('✅ Login de administrador exitoso.');
  } else {
    console.log('❌ Login de administrador fallido.');
    process.exit(1);
  }

  // 7. Cargar datos del panel de administrador
  console.log('\n7. Probando Obtención de Datos del Dashboard de Administración...');
  const dbDataRes = await makeRequest(`${baseUrl}/admin/dashboard-data`);
  console.log('Respuesta:', {
    status: dbDataRes.status,
    success: dbDataRes.data.success,
    totalUsuarios: dbDataRes.data.usuarios?.length,
    totalAdmins: dbDataRes.data.administradores?.length
  });
  
  if (dbDataRes.status === 200 && dbDataRes.data.success) {
    console.log('✅ Carga de datos de base de datos correcta.');
    console.log('Usuarios en BD:', dbDataRes.data.usuarios.map(u => ({ id: u.id, nombre: u.nombre, email: u.email })));
    console.log('Admins en BD:', dbDataRes.data.administradores.map(a => ({ id: a.id, nombre: a.nombre, email: a.email })));
  } else {
    console.log('❌ Carga de datos del panel fallida.');
    process.exit(1);
  }

  // 8. Cerrar sesión de administrador
  console.log('\n8. Cerrar sesión de Administrador...');
  const adminLogoutRes = await makeRequest(`${baseUrl}/admin/logout`, { method: 'POST' });
  console.log('Respuesta:', adminLogoutRes);
  if (adminLogoutRes.status === 200 && adminLogoutRes.data.success) {
    console.log('✅ Cierre de sesión de administrador correcto.');
  } else {
    console.log('❌ Cierre de sesión de administrador fallido.');
    process.exit(1);
  }

  console.log('\n🎉 ¡Todas las pruebas del Backend han pasado de forma exitosa! 🎉');
}

testApi();
