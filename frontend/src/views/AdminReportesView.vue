<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

    <!-- Cabecera -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">📊 Reportes de Uso de Espacios</h1>
        <p class="text-sm text-slate-500 mt-1">Estadísticas y análisis de reservas universitarias</p>
      </div>
      <div class="flex gap-3">
        <button @click="exportarExcel" :disabled="!hayDatos"
          class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-40 active:scale-95">
          📥 Exportar Excel
        </button>
        <button @click="exportarPDF" :disabled="!hayDatos"
          class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-40 active:scale-95">
          📄 Exportar PDF
        </button>
        <router-link to="/admin-dashboard" class="flex items-center gap-2 border border-slate-200 text-slate-600 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
          ← Volver
        </router-link>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 class="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Filtros</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Fecha inicio</label>
          <input v-model="filtros.fecha_inicio" type="date" class="form-input text-sm" :max="filtros.fecha_fin || hoy" :min="fechaMinima">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Fecha fin</label>
          <input v-model="filtros.fecha_fin" type="date" class="form-input text-sm" :min="filtros.fecha_inicio" :max="hoy">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Tipo de espacio</label>
          <select v-model="filtros.tipo" class="form-input text-sm">
            <option value="">Todos los tipos</option>
            <option value="Laboratorios">Laboratorios</option>
            <option value="Canchas">Canchas</option>
            <option value="Salas">Salas</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Espacio específico</label>
          <select v-model="filtros.espacio_id" class="form-input text-sm">
            <option value="">Todos los espacios</option>
            <option v-for="esp in espaciosFiltro" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
          </select>
        </div>
      </div>
      <div class="flex items-center justify-between mt-5 gap-3">
        <button @click="limpiarFiltros" class="text-xs text-slate-400 hover:text-red-500 font-semibold transition">✕ Limpiar filtros</button>
        <button @click="cargarReporte" :disabled="cargando"
          class="bg-[#003087] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2 active:scale-95">
          <span v-if="cargando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ cargando ? 'Generando...' : '🔍 Generar Reporte' }}
        </button>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-if="!cargando && generado && !hayDatos" class="text-center py-16 bg-white rounded-3xl border border-slate-100">
      <p class="text-4xl mb-3">📭</p>
      <h4 class="font-bold text-slate-600">Sin datos para el período seleccionado</h4>
      <p class="text-xs text-slate-400 mt-1">No hay reservas confirmadas con los filtros aplicados.</p>
    </div>

    <template v-if="hayDatos">

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="bg-[#003087] text-white rounded-2xl p-6">
          <p class="text-xs font-semibold uppercase tracking-wider text-blue-200">Total Reservas</p>
          <p class="text-4xl font-extrabold mt-2">{{ totales.total_reservas }}</p>
          <p class="text-xs text-blue-300 mt-1">en el período seleccionado</p>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Usuarios Únicos</p>
          <p class="text-4xl font-extrabold text-slate-900 mt-2">{{ totales.usuarios_unicos }}</p>
          <p class="text-xs text-slate-400 mt-1">realizaron al menos una reserva</p>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Espacios Utilizados</p>
          <p class="text-4xl font-extrabold text-slate-900 mt-2">{{ totales.espacios_usados }}</p>
          <p class="text-xs text-slate-400 mt-1">espacios distintos reservados</p>
        </div>
      </div>

      <!-- Gráficos fila 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Barras: top espacios -->
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">🏆 Top Espacios Más Reservados</h3>
          <div class="relative h-64">
            <Bar v-if="chartEspacios" :data="chartEspacios" :options="barOptions" />
          </div>
        </div>
        <!-- Dona: por tipo -->
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">🥧 Reservas por Tipo de Espacio</h3>
          <div class="relative h-64 flex items-center justify-center">
            <Doughnut v-if="chartTipos" :data="chartTipos" :options="doughnutOptions" />
          </div>
        </div>
      </div>

      <!-- Gráficos fila 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Barras horizontales: horas pico -->
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">🕐 Horarios Más Demandados</h3>
          <div class="relative h-64">
            <Bar v-if="chartHoras" :data="chartHoras" :options="barHOptions" />
          </div>
        </div>
        <!-- Línea: tendencia por día -->
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">📈 Tendencia de Reservas por Día</h3>
          <div class="relative h-64">
            <Line v-if="chartDias" :data="chartDias" :options="lineOptions" />
          </div>
        </div>
      </div>

      <!-- Tabla detallada ranking -->
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" id="tabla-reporte">
        <h3 class="font-bold text-slate-800 mb-5">📋 Ranking Detallado de Espacios</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-xs text-slate-400 uppercase font-semibold bg-slate-50">
                <th class="py-3 px-4">#</th>
                <th class="py-3 px-4">Espacio</th>
                <th class="py-3 px-4">Tipo</th>
                <th class="py-3 px-4">Ubicación</th>
                <th class="py-3 px-4 text-right">Reservas</th>
                <th class="py-3 px-4 text-right">% del total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in reservasPorEspacio" :key="row.id"
                class="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td class="py-3 px-4 font-bold text-slate-400">{{ i + 1 }}</td>
                <td class="py-3 px-4 font-semibold text-slate-900">{{ row.nombre }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded text-xs font-bold"
                    :class="row.tipo === 'Laboratorios' ? 'bg-blue-50 text-blue-600' : row.tipo === 'Canchas' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'">
                    {{ row.tipo }}
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-500 text-xs">{{ row.ubicacion }}</td>
                <td class="py-3 px-4 text-right font-bold text-slate-900">{{ row.total_reservas }}</td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-[#003087] rounded-full" :style="{ width: porcentaje(row.total_reservas) + '%' }"></div>
                    </div>
                    <span class="text-xs font-semibold text-slate-600">{{ porcentaje(row.total_reservas) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>
  </div>
</template>

<script>
import { Bar, Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const COLORES = ['#003087','#FFB800','#10b981','#8b5cf6','#ef4444','#f97316','#06b6d4','#ec4899'];

export default {
  name: 'AdminReportesView',
  components: { Bar, Doughnut, Line },
  data() {
    const hoy = new Date().toISOString().split('T')[0];
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    const fechaMinima = new Date();
    fechaMinima.setFullYear(fechaMinima.getFullYear() - 1);

    return {
      hoy,
      fechaMinima: fechaMinima.toISOString().split('T')[0],
      filtros: { fecha_inicio: hace30.toISOString().split('T')[0], fecha_fin: hoy, tipo: '', espacio_id: '' },
      cargando: false, generado: false,
      espaciosFiltro: [],
      totales: { total_reservas: 0, usuarios_unicos: 0, espacios_usados: 0 },
      reservasPorEspacio: [], reservasPorTipo: [], horasPico: [], reservasPorDia: [],
      chartEspacios: null, chartTipos: null, chartHoras: null, chartDias: null,
      barOptions: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      },
      barHOptions: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
      },
      doughnutOptions: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      },
      lineOptions: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    };
  },
  computed: {
    hayDatos() {
      return this.generado && this.totales.total_reservas > 0;
    },
    espaciosFiltroFiltrados() {
      if (!this.filtros.tipo) return this.espaciosFiltro;
      return this.espaciosFiltro.filter(e => e.tipo === this.filtros.tipo);
    }
  },
  async mounted() {
    await this.cargarEspacios();
    await this.cargarReporte();
  },
  methods: {
    async cargarEspacios() {
      try {
        const res = await fetch('/api/admin/reportes/espacios');
        const data = await res.json();
        if (data.success) this.espaciosFiltro = data.espacios;
      } catch (e) { console.error(e); }
    },
    async cargarReporte() {
      this.cargando = true;
      try {
        const p = new URLSearchParams();
        if (this.filtros.fecha_inicio) p.append('fecha_inicio', this.filtros.fecha_inicio);
        if (this.filtros.fecha_fin)    p.append('fecha_fin',    this.filtros.fecha_fin);
        if (this.filtros.tipo)         p.append('tipo',         this.filtros.tipo);
        if (this.filtros.espacio_id)   p.append('espacio_id',   this.filtros.espacio_id);

        const res = await fetch(`/api/admin/reportes/uso?${p}`);
        const data = await res.json();
        if (!data.success) return;

        this.totales            = data.totales;
        this.reservasPorEspacio = data.reservasPorEspacio;
        this.reservasPorTipo    = data.reservasPorTipo;
        this.horasPico          = data.horasPico;
        this.reservasPorDia     = data.reservasPorDia;
        this.generado = true;
        this.buildCharts();
      } catch (e) { console.error(e); }
      finally { this.cargando = false; }
    },
    buildCharts() {
      // Barras: top 6 espacios
      const top = this.reservasPorEspacio.slice(0, 6);
      this.chartEspacios = {
        labels: top.map(r => r.nombre.length > 22 ? r.nombre.slice(0, 22) + '…' : r.nombre),
        datasets: [{ data: top.map(r => r.total_reservas), backgroundColor: COLORES.slice(0, top.length), borderRadius: 6 }]
      };
      // Dona: tipos
      this.chartTipos = {
        labels: this.reservasPorTipo.map(r => r.tipo),
        datasets: [{ data: this.reservasPorTipo.map(r => r.total_reservas), backgroundColor: COLORES }]
      };
      // Barras horizontales: horarios
      this.chartHoras = {
        labels: this.horasPico.map(r => r.horario),
        datasets: [{ data: this.horasPico.map(r => r.total_reservas), backgroundColor: '#003087', borderRadius: 4 }]
      };
      // Línea: tendencia diaria
      this.chartDias = {
        labels: this.reservasPorDia.map(r => r.fecha),
        datasets: [{
          data: this.reservasPorDia.map(r => r.total_reservas),
          borderColor: '#003087', backgroundColor: 'rgba(0,48,135,0.08)',
          tension: 0.3, fill: true, pointRadius: 3
        }]
      };
    },
    porcentaje(val) {
      if (!this.totales.total_reservas) return 0;
      return Math.round((val / this.totales.total_reservas) * 100);
    },
    limpiarFiltros() {
      const hace30 = new Date();
      hace30.setDate(hace30.getDate() - 30);
      this.filtros = { fecha_inicio: hace30.toISOString().split('T')[0], fecha_fin: this.hoy, tipo: '', espacio_id: '' };
    },
    exportarExcel() {
      const wb = XLSX.utils.book_new();

      // Hoja 1: Ranking espacios
      const wsEspacios = XLSX.utils.json_to_sheet(this.reservasPorEspacio.map((r, i) => ({
        'Posición': i + 1, 'Espacio': r.nombre, 'Tipo': r.tipo, 'Ubicación': r.ubicacion,
        'Total Reservas': r.total_reservas, '% del Total': this.porcentaje(r.total_reservas) + '%'
      })));
      XLSX.utils.book_append_sheet(wb, wsEspacios, 'Ranking Espacios');

      // Hoja 2: Por tipo
      const wsTipos = XLSX.utils.json_to_sheet(this.reservasPorTipo.map(r => ({
        'Tipo': r.tipo, 'Total Reservas': r.total_reservas
      })));
      XLSX.utils.book_append_sheet(wb, wsTipos, 'Por Tipo');

      // Hoja 3: Horas pico
      const wsHoras = XLSX.utils.json_to_sheet(this.horasPico.map(r => ({
        'Horario': r.horario, 'Total Reservas': r.total_reservas
      })));
      XLSX.utils.book_append_sheet(wb, wsHoras, 'Horas Pico');

      // Hoja 4: Tendencia diaria
      const wsDias = XLSX.utils.json_to_sheet(this.reservasPorDia.map(r => ({
        'Fecha': r.fecha, 'Reservas': r.total_reservas
      })));
      XLSX.utils.book_append_sheet(wb, wsDias, 'Tendencia Diaria');

      XLSX.writeFile(wb, `reporte_espacios_${this.filtros.fecha_inicio}_${this.filtros.fecha_fin}.xlsx`);
    },
    exportarPDF() {
      const doc = new jsPDF();
      const azul = [0, 48, 135];

      // Encabezado
      doc.setFillColor(...azul);
      doc.rect(0, 0, 210, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Uso de Espacios — UTC', 14, 14);

      doc.setTextColor(100);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${this.filtros.fecha_inicio} al ${this.filtros.fecha_fin}`, 14, 30);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 36);

      // KPIs
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...azul);
      doc.text('Resumen General', 14, 46);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(60);
      doc.text(`Total Reservas: ${this.totales.total_reservas}   |   Usuarios Únicos: ${this.totales.usuarios_unicos}   |   Espacios Utilizados: ${this.totales.espacios_usados}`, 14, 54);

      // Tabla ranking
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...azul);
      doc.text('Ranking de Espacios Más Reservados', 14, 66);

      autoTable(doc, {
        startY: 70,
        head: [['#', 'Espacio', 'Tipo', 'Reservas', '% Total']],
        body: this.reservasPorEspacio.map((r, i) => [i + 1, r.nombre, r.tipo, r.total_reservas, this.porcentaje(r.total_reservas) + '%']),
        headStyles: { fillColor: azul, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: { 0: { cellWidth: 10 }, 3: { halign: 'center' }, 4: { halign: 'center' } }
      });

      // Tabla horarios
      const y2 = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...azul);
      doc.text('Horarios Más Demandados', 14, y2);

      autoTable(doc, {
        startY: y2 + 4,
        head: [['Horario', 'Total Reservas']],
        body: this.horasPico.map(r => [r.horario, r.total_reservas]),
        headStyles: { fillColor: azul, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 1: { halign: 'center' } }
      });

      doc.save(`reporte_espacios_${this.filtros.fecha_inicio}_${this.filtros.fecha_fin}.pdf`);
    }
  }
};
</script>
