import BackButton from '../components/BackButton'

const PrivacyPolicy = () => {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-4xl px-4">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-semibold text-stone-900">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-sm text-stone-600">
          <p>
            We collect only the information needed to fulfill your orders and
            improve your experience, such as name, email, shipping address, and
            payment details.
          </p>
          <p>
            Your information is never sold. It is shared only with trusted
            partners for payment processing, shipping, and customer support.
          </p>
          <p>
            You can request access, updates, or deletion of your data by
            contacting support.
          </p>
        </div>
      </div>
    </main>
  )
}

export default PrivacyPolicy
