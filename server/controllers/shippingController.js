import { getCourierServiceabilityRates } from '../utils/shiprocket.js'

/**
 * Public quote for checkout — cheapest Shiprocket courier rate between warehouse pincode and destination.
 * Query: delivery_postcode (or pincode), weight (kg), cod (0 prepaid / 1 COD — default 0 for online-first store).
 */
export const getShippingQuote = async (req, res) => {
  try {
    const pickup = String(process.env.SHIPROCKET_PICKUP_PINCODE || '')
      .replace(/\D/g, '')
      .slice(0, 6)
    const delivery = String(req.query.delivery_postcode ?? req.query.pincode ?? '')
      .replace(/\D/g, '')
      .slice(0, 6)
    const weightRaw = Number(req.query.weight ?? 0.25)
    const cod =
      req.query.cod === '1' || req.query.cod === 'true' || req.query.cod === true ? 1 : 0

    if (delivery.length !== 6) {
      return res.status(400).json({ ok: false, error: 'Enter a valid 6-digit delivery_postcode.' })
    }

    if (!pickup || pickup.length !== 6) {
      return res.status(200).json({
        ok: false,
        configured: false,
        error:
          'Warehouse pickup pincode is not set. Add SHIPROCKET_PICKUP_PINCODE on the server.',
      })
    }

    const weightKg =
      Number.isFinite(weightRaw) && weightRaw > 0 ? weightRaw : 0.25

    const result = await getCourierServiceabilityRates({
      pickupPostcode: pickup,
      deliveryPostcode: delivery,
      weightKg,
      cod,
    })

    if (!result.success) {
      return res.status(200).json({
        ok: false,
        error:
          typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error || 'Quote failed'),
      })
    }

    return res.status(200).json({
      ok: true,
      deliveryFee: result.deliveryFee,
      courierName: result.courierName || null,
      estimatedDeliveryDays: result.estimatedDeliveryDays ?? null,
    })
  } catch (err) {
    console.error('getShippingQuote:', err?.message || err)
    return res.status(500).json({ ok: false, error: 'Could not fetch shipping quote.' })
  }
}
