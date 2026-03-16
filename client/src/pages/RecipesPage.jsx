import BackButton from '../components/BackButton'
import { Link } from 'react-router-dom'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app'
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

        <section className="submit-panel mt-14 overflow-hidden rounded-[3rem] border border-white/60 bg-white/70 shadow-[0_32px_64px_-16px_rgba(20,35,25,0.12)] backdrop-blur-xl">
          <div className="bg-brand-green p-8 text-white md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Community Hub</span>
                <h2 className="text-3xl font-[Fraunces] md:text-5xl">Submit Your <span className="italic opacity-80">Recipe</span></h2>
                <p className="text-emerald-100/80 text-sm max-w-md italic">Share your secret millet recipes with the Mimi family. Every approved dish earns a spot in our hall of fame.</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${ (i === 1 && !submission.title) || (i === 2 && submission.title && !submission.contentHtml) ? 'bg-white' : 'bg-white/30' }`} />
                ))}
              </div>
            </div>
          </div>

          <form className="p-8 md:p-12" onSubmit={onSubmissionSubmit}>
            <div className="grid gap-10 lg:grid-cols-12">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-12 space-y-10">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-black">01</div>
                    <h3 className="text-lg font-bold text-stone-900 uppercase tracking-tight">The Basics</h3>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">Recipe Title *</label>
                      <input className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 p-5 text-sm font-bold placeholder:text-stone-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" name="title" placeholder="e.g. Ragi Chocolate Mug Cake" value={submission.title} onChange={onSubmissionChange} required />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">Prep Time</label>
                      <input className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 p-5 text-sm font-bold placeholder:text-stone-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" name="time" placeholder="e.g. 15 mins" value={submission.time} onChange={onSubmissionChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">Chef Name</label>
                      <input className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 p-5 text-sm font-bold placeholder:text-stone-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" name="submittedBy" placeholder="Your name" value={submission.submittedBy} onChange={onSubmissionChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">Chef Email</label>
                      <input className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 p-5 text-sm font-bold placeholder:text-stone-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" type="email" name="submitterEmail" placeholder="example@email.com" value={submission.submitterEmail} onChange={onSubmissionChange} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Media */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-black">02</div>
                    <h3 className="text-lg font-bold text-stone-900 uppercase tracking-tight">Visuals</h3>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className={`relative group flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] p-8 transition-all ${coverFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-stone-200 bg-stone-50/50 hover:border-emerald-300'}`}>
                      <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={onCoverFileChange} />
                      <div className="text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📸</div>
                        <div>
                          <p className="text-sm font-black text-stone-900 uppercase tracking-widest">Cover Image</p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">{coverFile ? coverFile.name : 'Upload .jpg or .png'}</p>
                        </div>
                      </div>
                      {coverPreviewUrl && (
                        <div className="mt-4 w-full h-32 rounded-xl overflow-hidden shadow-md">
                          <img src={coverPreviewUrl} className="w-full h-full object-cover" alt="preview" />
                        </div>
                      )}
                    </div>

                    <div className={`relative group flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] p-8 transition-all ${videoFile ? 'border-amber-500 bg-amber-50/30' : 'border-stone-200 bg-stone-50/50 hover:border-amber-300'}`}>
                      <input type="file" accept="video/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={onVideoFileChange} />
                      <div className="text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🎥</div>
                        <div>
                          <p className="text-sm font-black text-stone-900 uppercase tracking-widest">Recipe Video</p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">{videoFile ? videoFile.name : 'Upload .mp4'}</p>
                        </div>
                      </div>
                      {videoPreviewUrl && (
                        <div className="mt-4 w-full h-32 rounded-xl overflow-hidden bg-black/10 shadow-md">
                          <video src={videoPreviewUrl} className="w-full h-full object-cover" muted />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 text-center">- OR PASTE EXTERNAL LINKS -</p>
                    <div className="grid gap-4 md:grid-cols-2">
                       <input className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 p-4 text-xs font-bold outline-none" name="coverImage" placeholder="Image URL (Unsplash, Google Drive, etc.)" value={submission.coverImage} onChange={onSubmissionChange} />
                       <input className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 p-4 text-xs font-bold outline-none" name="videoUrl" placeholder="Video URL (YouTube, Vimeo, etc.)" value={submission.videoUrl} onChange={onSubmissionChange} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Content */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-white text-sm font-black">03</div>
                    <h3 className="text-lg font-bold text-stone-900 uppercase tracking-tight">The Secret Sauce</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">Short Summary</label>
                      <textarea className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 p-5 text-sm font-bold min-h-[80px] outline-none focus:border-emerald-500 focus:bg-white transition-all" name="excerpt" placeholder="What makes this recipe special?" value={submission.excerpt} onChange={onSubmissionChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-stone-400">Recipe Steps</label>
                      <textarea className="w-full rounded-[2rem] border border-stone-100 bg-stone-50/50 p-6 text-sm font-bold min-h-[220px] outline-none focus:border-emerald-500 focus:bg-white transition-all" name="contentHtml" placeholder="List ingredients and step-by-step instructions..." value={submission.contentHtml} onChange={onSubmissionChange} />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-6">
                  <div className="flex flex-col items-center gap-6">
                    <button type="submit" className="btn btn-primary w-full md:w-auto min-w-[300px] h-16 rounded-[1.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all" disabled={submitLoading}>
                      {submitLoading ? 'Cooking up your submission...' : '🚀 Submit My Recipe'}
                    </button>
                    {uploadMessage && <p className="text-sm font-bold text-emerald-600 animate-pulse">{uploadMessage}</p>}
                    {submitMessage && (
                      <div className="bg-emerald-50 text-emerald-700 p-6 rounded-[1.5rem] border border-emerald-100 text-center">
                        <p className="font-bold text-lg">Hooray! Recipe Received!</p>
                        <p className="text-sm mt-1">{submitMessage}</p>
                      </div>
                    )}
                    {submitError && (
                      <div className="bg-red-50 text-red-700 p-6 rounded-[1.5rem] border border-red-100">
                        <p className="font-bold">Oops! {submitError}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default RecipesPage
