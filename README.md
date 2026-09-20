> **Estado del repositorio:** versión legada conservada como historial académico. La versión principal mantenida es [gestion-proyectos-agiles-app](https://github.com/mesaresarroyo-7/gestion-proyectos-agiles-app). No publiques archivos `.env` ni credenciales reales en este repositorio.

# 🏪 DollarCity Santa Anita — Sistema de Gestión de Compras, Ventas e Inventario

Sistema web completo para gestionar productos, categorías, proveedores, clientes, compras, ventas, inventario, movimientos de stock y reportes operativos.

## 📋 Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Gráficos | Chart.js |
| Autenticación | JWT |
| Estilos | CSS puro |

## 🚀 Instrucciones de Instalación y Ejecución

### 1. Requisitos previos
- Node.js v18+ instalado
- PostgreSQL instalado y corriendo
- Git (opcional)

### 2. Configurar la base de datos

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE dollarcity_db;"

# Ejecutar el script SQL
psql -U postgres -d dollarcity_db -f database/schema.sql
```

O desde pgAdmin:
1. Crear una base de datos llamada `dollarcity_db`
2. Abrir el archivo `database/schema.sql`
3. Ejecutar todo el script

### 3. Configurar el Backend

```bash
# Ir al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar el archivo .env (ajustar credenciales si es necesario)
# Editar backend/.env con tus credenciales de PostgreSQL

# Iniciar servidor de desarrollo
npm run dev
```

El backend correrá en: `http://localhost:5000`

### 4. Configurar el Frontend

```bash
# Ir al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend correrá en: `http://localhost:5173`

### 5. Acceder al Sistema

Abrir `http://localhost:5173` en el navegador.

#### Credenciales de prueba:

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin@dollarcity.com | 123456 |
| Encargado de almacén | almacen@dollarcity.com | 123456 |
| Vendedor | vendedor@dollarcity.com | 123456 |

## 📁 Estructura del Proyecto

```
Proyecto Agiles/
├── frontend/          # React + Vite
│   └── src/
│       ├── components/  # Componentes reutilizables
│       ├── context/     # Contexto de autenticación
│       ├── pages/       # Páginas por módulo
│       └── services/    # Servicios API
├── backend/           # Node.js + Express
│   ├── config/        # Configuración DB
│   ├── middleware/     # Auth + Roles
│   └── routes/        # Rutas API REST
├── database/          # Script SQL
└── README.md
```

## 🎯 Módulos del Sistema

1. **Login** — Autenticación con JWT y 3 roles
2. **Dashboard** — Tarjetas resumen y gráficos
3. **Productos** — CRUD completo con filtros
4. **Categorías** — CRUD de categorías
5. **Proveedores** — CRUD de proveedores
6. **Clientes** — CRUD de clientes
7. **Compras** — Registro con actualización automática de stock
8. **Ventas** — Registro con validación de stock
9. **Inventario** — Vista de stock con alertas
10. **Movimientos** — Historial de entradas/salidas
11. **Reportes** — 5 tipos de reportes con filtros
12. **Usuarios** — Gestión de usuarios y roles

## 📝 Proyecto Académico

- Metodología Ágil Scrum
- Datos ficticios — no contiene información real
- © 2026 DollarCity Santa Anita
