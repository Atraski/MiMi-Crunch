import BackButton from '../components/BackButton'
import { Link } from 'react-router-dom'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://mimicrunch-33how.ondigitalocean.app'
gsap.registerPlugin(ScrollTrigger)

const RecipesPage = () => {
  const pageRef = useRef(null)
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submission, setSubmission] = useState({
    title: '',
    submittedBy: '',
    submitterEmail: '',
    excerpt: '',
    contentHtml: '',
    time: '',
    coverImage: '',
    videoUrl: '',
  })
  const [coverFile, setCoverFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.recipes-hero-chip', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      })
      gsap.from('.recipes-hero-title', {
        y: 34,
        opacity: 0,
        duration: 0.8,
        delay: 0.08,
        ease: 'power3.out',
      })
      gsap.from('.recipes-hero-copy', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        delay: 0.18,
        ease: 'power3.out',
      })

      gsap.utils.toArray('.recipes-section').forEach((section) => {
        gsap.from(section, {
          y: 40,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      gsap.utils.toArray('.recipe-card').forEach((card, index) => {
        gsap.from(card, {
          y: 52,
          opacity: 0,
          duration: 0.65,
          delay: (index % 3) * 0.07,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      gsap.from('.submit-panel', {
        y: 44,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.submit-panel',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(
          `${API_BASE}/api/recipes?published=true&approvalStatus=approved`,
        )
        const data = await res.json()
        setRecipes(Array.isArray(data) ? data : [])
      } catch {
        setError('Failed to load recipes.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    return () => {
      if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl)
      }
    }
  }, [coverPreviewUrl])

  useEffect(() => {
    return () => {
      if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
    }
  }, [videoPreviewUrl])

  const officialRecipes = useMemo(
    () => recipes.filter((item) => (item.source || 'official') === 'official'),
    [recipes],
  )
  const communityRecipes = useMemo(
    () => recipes.filter((item) => (item.source || 'official') === 'community'),
    [recipes],
  )

  const onSubmissionChange = (event) => {
    const { name, value } = event.target
    setSubmission((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmissionSubmit = async (event) => {
    event.preventDefault()
    setSubmitLoading(true)
    setSubmitError('')
    setSubmitMessage('')
    setUploadMessage('')
    try {
      let coverImage = submission.coverImage.trim()
      let videoUrl = submission.videoUrl.trim()

      if (coverFile) {
        setUploadMessage('Uploading cover image...')
        coverImage = await uploadToCloudinary(coverFile, 'image')
      }

      if (videoFile) {
        setUploadMessage('Uploading video...')
        videoUrl = await uploadToCloudinary(videoFile, 'video')
      }

      const res = await fetch(`${API_BASE}/api/recipes/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submission,
          coverImage,
          videoUrl,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit recipe.')
      }
      setSubmitMessage('Recipe submitted successfully. We will review and publish after approval.')
      setSubmission({
        title: '',
        submittedBy: '',
        submitterEmail: '',
        excerpt: '',
        contentHtml: '',
        time: '',
        coverImage: '',
        videoUrl: '',
      })
      setCoverFile(null)
      setVideoFile(null)
      setCoverPreviewUrl('')
      setVideoPreviewUrl('')
      setUploadMessage('')
    } catch (submitErr) {
      setSubmitError(submitErr.message || 'Failed to submit recipe.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const uploadToCloudinary = async (file, mediaType) => {
    const signRes = await fetch(`${API_BASE}/api/uploads/public-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaType }),
    })
    const signData = await signRes.json().catch(() => ({}))
    if (!signRes.ok) {
      throw new Error(signData.error || 'Failed to start upload.')
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/${signData.mediaType}/upload`
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', signData.apiKey)
    formData.append('timestamp', String(signData.timestamp))
    formData.append('signature', signData.signature)
    formData.append('folder', signData.folder)

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })
    const uploadData = await uploadRes.json().catch(() => ({}))
    if (!uploadRes.ok || !uploadData.secure_url) {
      throw new Error('Cloudinary upload failed.')
    }
    return uploadData.secure_url
  }

  const onCoverFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreviewUrl(URL.createObjectURL(file))
  }

  const onVideoFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
  }

  const RecipeCard = ({ item, label }) => (
    <Link
      key={item._id}
      to={`/recipes/${item.slug}`}
      className="recipe-card group relative flex flex-col overflow-hidden rounded-[2rem] border border-emerald-100/70 bg-white/95 shadow-[0_12px_40px_rgba(20,35,25,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(20,35,25,0.16)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-stone-100">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : item.videoUrl ? (
          <video
            src={item.videoUrl}
            className="h-full w-full object-cover"
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-300">
            <span className="text-6xl">🍲</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {item.time ? (
          <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-stone-900/80 px-3 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
            {item.time}
          </div>
        ) : null}
        {item.videoUrl ? (
          <div className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-900">
            Video
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-7 pt-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-px w-8 bg-gradient-to-r from-emerald-600 to-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            {label}
          </span>
        </div>
        <h3 className="line-clamp-2 text-2xl leading-tight font-bold text-stone-900 transition-colors group-hover:text-emerald-700">
          {item.title}
        </h3>
        {item.excerpt ? (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-500">
            {item.excerpt}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between border-t border-stone-50 pt-6">
          <span className="text-sm font-bold tracking-wide text-stone-900">
            Read Details
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
            <svg className="h-5 w-5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <main ref={pageRef} className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f6f8f2] via-[#f8f6f0] to-[#f4efe5] py-16 lg:py-24">
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-lime-100/40 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 rounded-[2rem] border border-white/70 bg-white/70 px-5 py-9 backdrop-blur-sm md:px-10 lg:mb-20">
          <BackButton className="self-start mb-10" />
          <span className="recipes-hero-chip mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800">
            Our Cookbook
          </span>
          <h1 className="recipes-hero-title text-4xl font-extrabold text-stone-900 lg:text-6xl">
            Healthy <span className="text-emerald-700">Recipes</span>
          </h1>
          <p className="recipes-hero-copy mt-4 max-w-2xl text-lg text-stone-600">
            Discover two recipe streams: official Mimi recipes and approved community recipes.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-6 text-center text-red-600 border border-red-100 mb-10">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[450px] animate-pulse rounded-[2.5rem] bg-stone-200" />
            ))}
          </div>
        ) : (
          <div className="space-y-14">
            <section className="recipes-section rounded-[1.8rem] border border-white/80 bg-white/75 p-5 backdrop-blur-sm md:p-7">
              <div className="mb-5 flex items-end justify-between gap-3">
                <h2 className="text-2xl font-bold text-stone-900 lg:text-3xl">Official Mimi Recipes</h2>
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                  Shared by us
                </span>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-12">
                {officialRecipes.map((item) => (
                  <RecipeCard key={item._id} item={item} label="Shared by Mimi" />
                ))}
                {!officialRecipes.length ? (
                  <div className="col-span-full rounded-[2rem] border border-dashed border-stone-200 bg-white/50 py-14 text-center text-stone-500">
                    No official recipes yet.
                  </div>
                ) : null}
              </div>
            </section>
            <section className="recipes-section rounded-[1.8rem] border border-white/80 bg-white/75 p-5 backdrop-blur-sm md:p-7">
              <div className="mb-5 flex items-end justify-between gap-3">
                <h2 className="text-2xl font-bold text-stone-900 lg:text-3xl">Community Recipes</h2>
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
                  Approved submissions
                </span>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-12">
                {communityRecipes.map((item) => (
                  <RecipeCard key={item._id} item={item} label="Community Approved" />
                ))}
                {!communityRecipes.length ? (
                  <div className="col-span-full rounded-[2rem] border border-dashed border-stone-200 bg-white/50 py-14 text-center text-stone-500">
                    No approved community recipes yet.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        )}

        <section className="submit-panel mt-14 rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-[0_16px_50px_rgba(20,35,25,0.08)] backdrop-blur-sm lg:p-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-stone-900 lg:text-3xl">Submit Your Recipe</h2>
            <p className="mt-1 text-sm text-stone-600">
              Community recipes are reviewed by our team before they appear on the public recipe page.
            </p>
          </div>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmissionSubmit}>
            <input className="input" name="title" placeholder="Recipe title*" value={submission.title} onChange={onSubmissionChange} required />
            <input className="input" name="time" placeholder="Time (e.g. 20 mins)" value={submission.time} onChange={onSubmissionChange} />
            <input className="input" name="submittedBy" placeholder="Your name" value={submission.submittedBy} onChange={onSubmissionChange} />
            <input className="input" type="email" name="submitterEmail" placeholder="Your email" value={submission.submitterEmail} onChange={onSubmissionChange} />
            <input className="input md:col-span-2" name="coverImage" placeholder="Cover image URL (optional)" value={submission.coverImage} onChange={onSubmissionChange} />
            <input className="input md:col-span-2" name="videoUrl" placeholder="Video URL (optional)" value={submission.videoUrl} onChange={onSubmissionChange} />
            <div className="md:col-span-2 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/60 p-4">
              <p className="text-sm font-semibold text-stone-800">Upload Media (Optional)</p>
              <p className="mt-1 text-xs text-stone-500">
                You can upload cover image/video to Cloudinary. We store only URL in MongoDB.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-dashed border-stone-300 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">Cover Image</p>
                  <label className="mt-2 inline-flex cursor-pointer rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onCoverFileChange}
                    />
                  </label>
                  {coverFile ? (
                    <p className="mt-2 text-xs text-stone-600">{coverFile.name}</p>
                  ) : null}
                  {coverPreviewUrl ? (
                    <img
                      src={coverPreviewUrl}
                      alt="Cover preview"
                      className="mt-2 h-24 w-full rounded-lg object-cover"
                    />
                  ) : null}
                </div>
                <div className="rounded-xl border border-dashed border-stone-300 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">Recipe Video</p>
                  <label className="mt-2 inline-flex cursor-pointer rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100">
                    Choose Video
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={onVideoFileChange}
                    />
                  </label>
                  {videoFile ? (
                    <p className="mt-2 text-xs text-stone-600">{videoFile.name}</p>
                  ) : null}
                  {videoPreviewUrl ? (
                    <video
                      src={videoPreviewUrl}
                      className="mt-2 h-24 w-full rounded-lg bg-black/10 object-cover"
                      controls
                      muted
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <textarea className="input min-h-[80px] md:col-span-2" name="excerpt" placeholder="Short summary" value={submission.excerpt} onChange={onSubmissionChange} />
            <textarea className="input min-h-[140px] md:col-span-2" name="contentHtml" placeholder="Recipe steps/details" value={submission.contentHtml} onChange={onSubmissionChange} />
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Submitting...' : 'Send for Approval'}
              </button>
              {uploadMessage ? <p className="text-sm text-stone-600">{uploadMessage}</p> : null}
              {submitMessage ? <p className="text-sm text-emerald-700">{submitMessage}</p> : null}
              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default RecipesPage
