import { useState } from 'react'

const AdminLogin = ({ onSubmit, errorMessage = '', loading = false }) => {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (loading) return
    onSubmit?.(loginId, password)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Admin Access</p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">Mimi Crunch Admin Login</h1>
        <p className="mt-1 text-sm text-stone-500">Welcome back MiMi Admin</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Login ID</label>
            <input
              type="text"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
              placeholder="Enter admin ID"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-stone-800 active:scale-[0.99]"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminLogin
