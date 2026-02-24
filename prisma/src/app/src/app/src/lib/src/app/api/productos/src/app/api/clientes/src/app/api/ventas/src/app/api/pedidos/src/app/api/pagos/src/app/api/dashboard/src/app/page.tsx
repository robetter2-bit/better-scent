'use client'
import { useState, useEffect } from 'react'

interface Producto { id: string; codigo: string; nombre: string; descripcion: string | null; precioCosto: number; precioVenta: number; stock: number; stockMinimo: number }
interface Cliente { id: string; nombre: string; telefono: string | null; email: string | null; direccion: string | null; notas: string | null; saldoPendiente?: number }
interface Venta { id: string; clienteId: string | null; cliente?: Cliente | null; fecha: string; subtotal: number; descuento: number; total: number; tipoPago: string; fechaLimite: string | null; estado: string; saldoPendiente: number }
interface Pago { id: string; ventaId: string; venta?: Venta; monto: number; fecha: string; notas: string | null }
interface Pedido { id: string; clienteId: string | null; cliente?: Cliente | null; nombreProducto: string; cantidad: number; precioEstimado: number | null; notas: string | null; estado: string; createdAt: string }
interface Dashboard { ventasHoy: { cantidad: number; total: number }; ventasMes: { cantidad: number; total: number }; productosBajoStock: Producto[]; ventasVencidas: Venta[]; ventasPorVencer: Venta[]; pedidosPendientes: Pedido[]; totalPendiente: number; totalVencido: number; totalProductos: number; totalClientes: number }

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [productos, setProductos] = useState<Producto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [dash, setDash] = useState<Dashboard | null>(null)
  const [searchP, setSearchP] = useState('')
  const [searchC, setSearchC] = useState('')
  const [filtroV, setFiltroV] = useState('todas')
  const [filtroPe, setFiltroPe] = useState('todos')
  const [dlgProd, setDlgProd] = useState(false)
  const [dlgCli, setDlgCli] = useState(false)
  const [dlgVent, setDlgVent] = useState(false)
  const [dlgPag, setDlgPag] = useState(false)
  const [dlgPed, setDlgPed] = useState(false)
  const [editP, setEditP] = useState<Producto | null>(null)
  const [editC, setEditC] = useState<Cliente | null>(null)
  const [editPed, setEditPed] = useState<Pedido | null>(null)
  const [nVenta, setNVenta] = useState<{ clienteId: string; tipoPago: string; fechaLimite: string; descuento: number; detalles: { productoId: string; producto?: Producto; cantidad: number; precioUnit: number; subtotal: number }[] }>({ clienteId: '', tipoPago: 'contado', fechaLimite: '', descuento: 0, detalles: [] })
  const [nPago, setNPago] = useState<{ ventaId: string; monto: string; notas: string }>({ ventaId: '', monto: '', notas: '' })
  const [nPed, setNPed] = useState<{ clienteId: string; nombreProducto: string; cantidad: string; precioEstimado: string; notas: string }>({ clienteId: '', nombreProducto: '', cantidad: '1', precioEstimado: '', notas: '' })

  const $ = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)
  const f = (d: string) => new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })

  useEffect(() => {
    const load = async () => {
      const [d, p, c, v, pa, pe] = await Promise.all([fetch('/api/dashboard'), fetch('/api/productos'), fetch('/api/clientes'), fetch('/api/ventas'), fetch('/api/pagos'), fetch('/api/pedidos')])
      setDash(await d.json())
      setProductos(await p.json())
      setClientes(await c.json())
      setVentas(await v.json())
      setPagos(await pa.json())
      setPedidos(await pe.json())
    }
    load()
  }, [])

  useEffect(() => { fetch(`/api/ventas?estado=${filtroV}`).then(r => r.json()).then(setVentas) }, [filtroV])
  useEffect(() => { fetch(`/api/pedidos?estado=${filtroPe}`).then(r => r.json()).then(setPedidos) }, [filtroPe])

  const saveProd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = { codigo: fd.get('codigo') as string, nombre: fd.get('nombre') as string, descripcion: fd.get('descripcion') as string, precioCosto: parseFloat(fd.get('precioCosto') as string), precioVenta: parseFloat(fd.get('precioVenta') as string), stock: parseInt(fd.get('stock') as string), stockMinimo: parseInt(fd.get('stockMinimo') as string) || 5 }
    if (editP) await fetch(`/api/productos/${editP.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    else await fetch('/api/productos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setDlgProd(false); setEditP(null); fetch('/api/productos').then(r => r.json()).then(setProductos); fetch('/api/dashboard').then(r => r.json()).then(setDash)
  }

  const save
