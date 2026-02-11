import { useNavigate } from 'react-router-dom'

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate()

  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:h-10 sm:w-10 ${className}`}
      onClick={() => navigate(-1)}
      aria-label="Go back"
      type="button"
    >
      <svg
        className="h-4 w-4 sm:h-5 sm:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    </button>
  )
}

export default BackButton
