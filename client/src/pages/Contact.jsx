import BackButton from '../components/BackButton'

const Contact = () => {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-5xl px-2">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-5xl px-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">Contact</h1>
          <p className="text-stone-600">
            Reach out for partnerships, distribution, or support.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4 text-stone-600">
            <div>
              <p className="text-sm font-semibold text-stone-900">Email</p>
              <p>support@mimicrunch.com</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">Phone</p>
              <p>+91 9157165523</p>
            </div>
            {/* <div>
              <p className="text-sm font-semibold text-stone-900">Address</p>
              <p>Gujrat, India</p>
            </div> */}
          </div>

          <form className="rounded-2xl bg-white p-6 shadow-lg shadow-stone-200/70">
            <div className="grid gap-4">
              <input
                className="rounded-xl border border-stone-200 px-4 py-2 text-sm"
                placeholder="Full name"
              />
              <input
                className="rounded-xl border border-stone-200 px-4 py-2 text-sm"
                placeholder="Email address"
              />
              <textarea
                className="min-h-[120px] rounded-xl border border-stone-200 px-4 py-2 text-sm"
                placeholder="Your message"
              />
              <button className="btn btn-primary w-fit" type="button">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Contact
