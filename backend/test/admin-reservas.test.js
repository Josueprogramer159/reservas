import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdminReservationsQuery } from '../src/utils/adminReservations.js';
import { listarReservasAdmin } from '../src/controllers/adminController.js';
import pool from '../src/db/database.js';

function createRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('buildAdminReservationsQuery aplica filtros y paginación', () => {
  const config = buildAdminReservationsQuery({
    busqueda: 'Juan',
    fechaDesde: '2026-01-01',
    fechaHasta: '2026-01-31',
    usuarioId: '7',
    espacioId: '3',
    page: 2,
    limit: 15,
  });

  assert.equal(config.page, 2);
  assert.equal(config.limit, 15);
  assert.equal(config.offset, 15);
  assert.match(config.query, /u\.nombre ILIKE/);
  assert.match(config.query, /r\.fecha >=/);
  assert.match(config.query, /r\.fecha <=/);
  assert.match(config.query, /r\.usuario_id =/);
  assert.match(config.query, /r\.espacio_id =/);
  assert.equal(config.params[0], '%Juan%');
  assert.equal(config.params[1], '2026-01-01');
  assert.equal(config.params[2], '2026-01-31');
  assert.equal(config.params[3], 7);
  assert.equal(config.params[4], 3);
  assert.equal(config.params[5], 15);
  assert.equal(config.params[6], 15);
});

test('listarReservasAdmin devuelve reservas paginadas para administradores autenticados', async () => {
  const originalQuery = pool.query;
  const calls = [];

  pool.query = async (query, params = []) => {
    calls.push({ query, params });
    if (query.includes('COUNT(*)')) {
      return { rows: [{ total: 2 }] };
    }
    return {
      rows: [{
        id: 10,
        fecha: '2026-07-03',
        horario: '08:00 - 10:00',
        estado: 'completado',
        usuario_nombre: 'Ana',
        usuario_email: 'ana@mail.com',
        espacio_nombre: 'Laboratorio 1',
        espacio_ubicacion: 'Bloque A',
      }],
    };
  };

  try {
    const req = {
      session: { adminId: 1, role: 'admin' },
      query: { page: '2', limit: '10', fecha_desde: '2026-07-01', fecha_hasta: '2026-07-31' },
    };
    const res = createRes();

    await listarReservasAdmin(req, res);

    assert.equal(res.statusCode, null);
    assert.equal(res.body.success, true);
    assert.equal(res.body.total, 2);
    assert.equal(res.body.page, 2);
    assert.equal(res.body.limit, 10);
    assert.equal(res.body.totalPages, 1);
    assert.equal(res.body.reservas.length, 1);
    assert.equal(calls.length, 2);
    assert.match(calls[1].query, /LIMIT/);
  } finally {
    pool.query = originalQuery;
  }
});

test('listarReservasAdmin rechaza acceso sin autenticación de administrador', async () => {
  const req = { session: {}, query: {} };
  const res = createRes();

  await listarReservasAdmin(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /administradores/i);
});
