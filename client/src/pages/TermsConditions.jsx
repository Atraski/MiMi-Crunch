import BackButton from '../components/BackButton'

const TermsConditions = () => {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-4xl px-4">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-semibold text-stone-900">
          Terms & Conditions
        </h1>
        <div className="mt-6 space-y-4 text-sm text-stone-600">
          <p>
            By using this website and placing an order, you agree to our terms,
            pricing, and policies as stated on this page.
          </p>
          <p>
            All content and product details are provided for informational
            purposes and are subject to change without notice.
          </p>
          <p>
            For any questions, please contact support before placing your order.
          </p>
        </div>
      </div>
    </main>
  )
}

export default TermsConditions
