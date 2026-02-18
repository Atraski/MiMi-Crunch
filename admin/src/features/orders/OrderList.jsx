import { useState } from 'react'

const formatDate = (value) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getPaymentStatus = (order) => {
  const raw = order?.paymentStatus || order?.paymentMethod || 'COD'
  if (typeof raw !== 'string') return 'COD'
  return raw.toUpperCase()
}

const statusClassMap = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

const getStatusClass = (status) => {
  return statusClassMap[status] || 'bg-stone-100 text-stone-600 border-stone-200'
}

const ORDER_STATUS_OPTIONS = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']

const formatCurrency = (value) => `Rs ${Math.round(Number(value || 0))}`

const getInitials = (name) => {
  if (!name) return 'GU'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const buildPrintableSlip = (order) => {
  const customerName = order?.shippingAddress?.fullName || order?.userId?.name || 'Guest'
  const phone = order?.shippingAddress?.phone || 'N/A'
  const addressLine = order?.shippingAddress?.addressLine1 || '—'
  const city = order?.shippingAddress?.city || '—'
  const state = order?.shippingAddress?.state || ''
  const pincode = order?.shippingAddress?.pincode || '—'
  const payment = getPaymentStatus(order)
  const status = order?.status || 'Pending'
  const orderId = order?._id || '—'
  const shortOrderId = `#${String(orderId).slice(-8)}`

  const items = Array.isArray(order?.items) ? order.items : []
  const mrpSubtotal = items.reduce(
    (sum, item) => sum + Number(item?.price || 0) * Number(item?.qty || 0),
    0,
  )
  const subtotalMrp = Number.isFinite(Number(order?.subtotal))
    ? Number(order?.subtotal)
    : mrpSubtotal
  const discountAmount = Number(order?.discountAmount || 0)
  const discountedMrp = Math.max(subtotalMrp - discountAmount, 0)
  const hasDeliveryFee = Number.isFinite(Number(order?.deliveryFee))
  const storedDeliveryFee = hasDeliveryFee ? Number(order?.deliveryFee) : 0
  const basePriceExGst = subtotalMrp > 0 ? subtotalMrp / 1.05 : 0
  const gstInclusive = subtotalMrp - basePriceExGst
  const computedTotal = discountedMrp + storedDeliveryFee
  const grandTotal = Number.isFinite(Number(order?.totalAmount))
    ? Number(order?.totalAmount)
    : computedTotal
  const deliveryCharge = grandTotal - subtotalMrp

  const itemRows = items
    .map((item, idx) => {
      const name = escapeHtml(item?.name || 'Product')
      const qty = Number(item?.qty || 0)
      const price = Number(item?.price || 0)
      const lineTotal = Math.round(qty * price)
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${name}</td>
          <td>${qty}</td>
          <td>Rs ${Math.round(price)}</td>
          <td>Rs ${lineTotal}</td>
        </tr>
      `
    })
    .join('')

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Slip ${escapeHtml(shortOrderId)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
          h1, h2, p { margin: 0; }
          .top { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
          .card { border: 1px solid #ddd; border-radius: 10px; padding: 12px; }
          .muted { color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f6f6f6; }
          .totals { margin-top: 12px; text-align: right; font-weight: bold; }
          .summary-table { width: 100%; border-collapse: collapse; margin-top: 14px; }
          .summary-table td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          .summary-table td:last-child { text-align: right; font-weight: 600; }
          .summary-table .grand td { font-size: 13px; font-weight: 700; background: #fafafa; }
          @media print {
            body { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="top">
          <div>
            <h1>Mimi Crunch</h1>
            <p class="muted">Order Packing Slip</p>
          </div>
          <div>
            <p><strong>${escapeHtml(shortOrderId)}</strong></p>
            <p class="muted">Placed: ${escapeHtml(formatDate(order?.createdAt))}</p>
          </div>
        </div>

        <div class="card">
          <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Address:</strong> ${escapeHtml(addressLine)}</p>
          <p><strong>City/State:</strong> ${escapeHtml(city)}${state ? `, ${escapeHtml(state)}` : ''}</p>
          <p><strong>Pincode:</strong> ${escapeHtml(pincode)}</p>
        </div>

        <div class="card" style="margin-top:12px;">
          <p><strong>Payment:</strong> ${escapeHtml(payment)}</p>
          <p><strong>Status:</strong> ${escapeHtml(status)}</p>
          <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows || '<tr><td colspan="5">No items</td></tr>'}
          </tbody>
        </table>

        <table class="summary-table">
          <tbody>
            <tr>
              <td>Price (Excl. GST)</td>
              <td>${escapeHtml(formatCurrency(basePriceExGst))}</td>
            </tr>
            <tr>
              <td>Taxes (Inclusive GST @ 5%)</td>
              <td>${escapeHtml(formatCurrency(gstInclusive))}</td>
            </tr>
            <tr>
              <td>MRP (Price + Taxes)</td>
              <td>${escapeHtml(formatCurrency(subtotalMrp))}</td>
            </tr>
            <tr>
              <td>Discount</td>
              <td>- ${escapeHtml(formatCurrency(discountAmount))}</td>
            </tr>
            <tr>
              <td>Delivery Charges</td>
              <td>${escapeHtml(formatCurrency(deliveryCharge))}</td>
            </tr>
            <tr class="grand">
              <td>Grand Total</td>
              <td>${escapeHtml(formatCurrency(grandTotal))}</td>
            </tr>
          </tbody>
        </table>

        <p class="totals">Tax note: GST 5% inclusive in total amount.</p>
      </body>
    </html>
  `
}

const OrderList = ({
  orders = [],
  loading,
  error,
  onRefresh,
  onUpdateStatus,
  onSyncShipping,
  onRequestPickup,
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [shippingSyncing, setShippingSyncing] = useState(false)
  const [pickupRequesting, setPickupRequesting] = useState(false)
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
  const pendingCount = orders.filter((order) => order.status === 'Pending').length

  const handleSelectOrder = (order) => {
    setSelectedOrder(order)
    setSelectedStatus(order?.status || 'Pending')
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder?._id || !selectedStatus || !onUpdateStatus) return
    setStatusUpdating(true)
    const result = await onUpdateStatus(selectedOrder._id, selectedStatus)
    setStatusUpdating(false)
    if (result?.success && result?.data?.order) {
      setSelectedOrder(result.data.order)
      setSelectedStatus(result.data.order.status || selectedStatus)
    }
  }

  const handleShippingSync = async () => {
    if (!selectedOrder?._id || !onSyncShipping) return
    setShippingSyncing(true)
    const result = await onSyncShipping(selectedOrder._id)
    setShippingSyncing(false)
    if (result?.success && result?.data?.order) {
      setSelectedOrder(result.data.order)
      setSelectedStatus(result.data.order.status || selectedStatus)
    }
  }

  const handlePickupRequest = async () => {
    if (!selectedOrder?._id || !onRequestPickup) return
    setPickupRequesting(true)
    const result = await onRequestPickup(selectedOrder._id)
    setPickupRequesting(false)
    if (result?.success && result?.data?.order) {
      setSelectedOrder(result.data.order)
      setSelectedStatus(result.data.order.status || selectedStatus)
    }
  }

  const selectedShipmentId =
    selectedOrder?.shipmentId || selectedOrder?.shippingPartner?.shipmentId || ''
  const canSyncOrder = Boolean(selectedOrder?._id && !selectedShipmentId)
  const canRequestPickup = Boolean(
    selectedOrder?._id &&
      selectedShipmentId &&
      (selectedOrder?.status || '').toLowerCase() !== 'shipped',
  )

  const handlePrintSlip = (order) => {
    if (!order) return
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      window.alert('Please allow popups to print order slip.')
      return
    }
    printWindow.document.open()
    printWindow.document.write(buildPrintableSlip(order))
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Total Orders
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Pending Orders
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Total Revenue
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Delivered
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-900">
            {orders.filter((order) => order.status === 'Delivered').length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 bg-stone-50/40 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Orders</h3>
              <p className="text-xs text-stone-500">
                Kisi bhi row pe click karo, full order details khul jayengi.
              </p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="w-full rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95 hover:bg-stone-800 sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? <p className="bg-red-50 p-6 text-sm font-medium text-red-600">{error}</p> : null}

        {loading ? (
          <div className="py-20 text-center text-stone-400 animate-pulse">Fetching orders...</div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/30 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-4 sm:px-6">Order ID</th>
                  <th className="px-4 py-4 sm:px-6">Customer</th>
                  <th className="px-4 py-4 sm:px-6">Items</th>
                  <th className="px-4 py-4 sm:px-6">Total</th>
                  <th className="hidden px-4 py-4 sm:px-6 md:table-cell">Payment</th>
                  <th className="px-4 py-4 sm:px-6">Status</th>
                  <th className="hidden px-4 py-4 sm:px-6 lg:table-cell">Placed on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-stone-500 sm:px-6">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const customerName = order.shippingAddress?.fullName || order.userId?.name || 'Guest'
                    const itemCount = Array.isArray(order.items)
                      ? order.items.reduce((sum, item) => sum + Number(item.qty || 0), 0)
                      : 0
                    const orderStatus = order.status || 'Pending'
                    const paymentStatus = getPaymentStatus(order)

                    return (
                      <tr
                        key={order._id}
                        onClick={() => handleSelectOrder(order)}
                        className="cursor-pointer transition-colors hover:bg-stone-50/60"
                      >
                        <td className="px-4 py-5 sm:px-6">
                          <p className="font-semibold text-stone-900">#{String(order._id).slice(-8)}</p>
                          <p className="mt-0.5 truncate text-[11px] text-stone-400">{order._id}</p>
                        </td>
                        <td className="hidden px-4 py-5 sm:px-6 md:table-cell">
                          <p className="text-sm font-medium text-stone-900">{customerName}</p>
                          <p className="mt-0.5 text-[11px] text-stone-500">
                            {order.shippingAddress?.phone || 'No phone'}
                          </p>
                        </td>
                        <td className="px-4 py-5 text-sm text-stone-600 sm:px-6">{itemCount}</td>
                        <td className="px-4 py-5 text-sm font-semibold text-stone-900 sm:px-6">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-4 py-5 sm:px-6">
                          <span className="inline-block rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold text-stone-600">
                            {paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-5 sm:px-6">
                          <span
                            className={`inline-block rounded-lg border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                              orderStatus,
                            )}`}
                          >
                            {orderStatus}
                          </span>
                        </td>
                        <td className="hidden px-4 py-5 text-sm text-stone-600 sm:px-6 lg:table-cell">{formatDate(order.createdAt)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Order details</p>
                <h3 className="text-lg font-bold text-stone-900">
                  #{String(selectedOrder._id).slice(-8)}
                </h3>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                {canSyncOrder ? (
                  <button
                    type="button"
                    onClick={handleShippingSync}
                    disabled={shippingSyncing}
                    className="rounded-xl border border-stone-200 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {shippingSyncing ? 'Syncing...' : 'Sync Order'}
                  </button>
                ) : null}
                {canRequestPickup ? (
                  <button
                    type="button"
                    onClick={handlePickupRequest}
                    disabled={pickupRequesting}
                    className="rounded-xl border border-stone-200 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pickupRequesting ? 'Requesting...' : 'Request Pickup'}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handlePrintSlip(selectedOrder)}
                  className="rounded-xl bg-stone-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-stone-800"
                >
                  Print Slip
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-stone-200 px-3 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid gap-0 overflow-y-auto lg:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-6 border-b border-stone-100 p-4 sm:p-6 lg:border-b-0 lg:border-r">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Total</p>
                    <p className="mt-1 text-lg font-bold text-stone-900">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Payment</p>
                    <p className="mt-1 text-lg font-bold text-stone-900">{getPaymentStatus(selectedOrder)}</p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Status</p>
                    <div className="mt-2 space-y-2">
                      <span
                        className={`inline-block rounded-lg border px-2.5 py-1 text-[11px] font-bold ${getStatusClass(
                          selectedOrder.status || 'Pending',
                        )}`}
                      >
                        {selectedOrder.status || 'Pending'}
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-200"
                        >
                          {ORDER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleStatusUpdate}
                          disabled={statusUpdating || !selectedStatus || selectedStatus === selectedOrder.status}
                          className="rounded-lg bg-stone-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {statusUpdating ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-stone-900">Items</h4>
                  <div className="mt-3 space-y-2">
                    {!Array.isArray(selectedOrder.items) || selectedOrder.items.length === 0 ? (
                      <p className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-500">
                        No items available.
                      </p>
                    ) : (
                      selectedOrder.items.map((item, index) => (
                        <div
                          key={`${item.productId || item.name || 'item'}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-stone-900">{item.name || 'Product'}</p>
                            <p className="text-xs text-stone-500">
                              Qty: {Number(item.qty || 0)} x {formatCurrency(item.price)}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-stone-900">
                            {formatCurrency(Number(item.price || 0) * Number(item.qty || 0))}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-5 p-4 sm:p-6">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Customer</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                      {getInitials(selectedOrder.shippingAddress?.fullName || selectedOrder.userId?.name || 'Guest')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {selectedOrder.shippingAddress?.fullName || selectedOrder.userId?.name || 'Guest user'}
                      </p>
                      <p className="text-xs text-stone-500">
                        {selectedOrder.shippingAddress?.phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Shipping address</p>
                  <p className="mt-3 text-sm leading-6 text-stone-700">
                    {selectedOrder.shippingAddress?.addressLine1 || '—'}
                    <br />
                    {selectedOrder.shippingAddress?.city || '—'}
                    {selectedOrder.shippingAddress?.state ? `, ${selectedOrder.shippingAddress.state}` : ''}
                    <br />
                    {selectedOrder.shippingAddress?.pincode || '—'}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Shipping Partner</p>
                  <div className="mt-3 space-y-2 text-sm text-stone-700">
                    <p>
                      <span className="font-medium text-stone-900">Partner:</span>{' '}
                      {selectedOrder.shippingPartner?.partner || 'Not synced'}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">Shipment ID:</span>{' '}
                      {selectedOrder.shippingPartner?.shipmentId || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">AWB:</span>{' '}
                      {selectedOrder.shippingPartner?.awbCode || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">Courier:</span>{' '}
                      {selectedOrder.shippingPartner?.courierName || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">Last Sync:</span>{' '}
                      {formatDate(selectedOrder.shippingPartner?.syncedAt)}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">Pickup:</span>{' '}
                      {selectedOrder.shippingPartner?.pickupStatus || 'Not requested'}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">Pickup Token:</span>{' '}
                      {selectedOrder.shippingPartner?.pickupToken || '—'}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">Pickup Time:</span>{' '}
                      {formatDate(selectedOrder.shippingPartner?.pickupRequestedAt)}
                    </p>
                    {selectedOrder.shippingPartner?.lastError ? (
                      <p className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600">
                        {selectedOrder.shippingPartner.lastError}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Timeline</p>
                  <div className="mt-3 space-y-2 text-sm text-stone-700">
                    <p>
                      <span className="font-medium text-stone-900">Placed:</span>{' '}
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">Updated:</span>{' '}
                      {formatDate(selectedOrder.updatedAt)}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">Order ID:</span> {selectedOrder._id}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default OrderList
