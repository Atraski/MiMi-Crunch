import BackButton from '../components/BackButton'

const ShippingReturns = () => {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-4xl px-2">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-4xl px-2">
        <h1 className="text-3xl font-semibold text-stone-900">
          Shipping & Returns
        </h1>
        <div className="mt-6 space-y-4 text-sm text-stone-600">
          <p>
            We process orders within 1-2 business days and share tracking details
            once your order ships.
          </p>
          <p>
            Returns are accepted for unopened and unused items within 7 days of
            delivery. Please contact support with your order number to start a
            return.
          </p>
          <p>
            For damaged or incorrect items, reach out within 48 hours of
            delivery and we will make it right.
          </p>
        </div>
      </div>
    </main>
  )
}

export default ShippingReturns
