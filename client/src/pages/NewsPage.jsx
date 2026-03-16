import BackButton from '../components/BackButton'
import { Link } from 'react-router-dom'
import { news as fallbackNews } from '../data/homeData'

const NewsPage = ({ blogs }) => {
  const posts =
    Array.isArray(blogs) && blogs.length
      ? blogs.map((blog) => ({
        title: blog.title,
        date: blog.publishedAt
          ? new Date(blog.publishedAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          : '',
        slug: blog.slug,
        coverImage: blog.coverImage,
        excerpt: blog.excerpt,
      }))
      : fallbackNews

  return (
    <main className="min-h-screen bg-[#FAF8F5] relative overflow-hidden py-16 px-4 font-[Manrope]">
      <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#1B3B26] opacity-[0.04] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.06] blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10">
        <BackButton className="mb-8 text-[#1B3B26]" />

        <div className="space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-[Fraunces] font-medium text-[#1B3B26] tracking-tight">
            Our Blogs
          </h1>
          <p className="text-lg text-[#4A5D4E] max-w-2xl">
            Latest stories, community updates, and newly launched products.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {posts.map((item) => (
            <article
              key={item.title}
              className="group flex flex-col h-[450px] backdrop-blur-xl bg-white/70 border border-white/60 shadow-[0_15px_40px_-15px_rgba(27,59,38,0.06)] rounded-[2rem] overflow-hidden transition-all hover:shadow-[0_24px_50px_-15px_rgba(27,59,38,0.12)] hover:-translate-y-1"
            >
              {/* Image Container - Using aspect-video for rectangular look */}
              <div className="aspect-video w-full shrink-0 relative bg-[#EAE6DF] overflow-hidden">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : null}

                {item.date && (
                  <div className="absolute bottom-2 right-4 z-20 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-[#1B3B26]/10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#1B3B26]">{item.date}</span>
                  </div>
                )}
              </div>              {/* Content Container */}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-xl font-[Fraunces] font-medium text-[#1B3B26] leading-tight line-clamp-2 group-hover:text-[#F5B041] transition-colors">
                  {item.title}
                </h3>

                {item.excerpt ? (
                  <p className="mt-3 line-clamp-2 text-sm text-[#4A5D4E]">
                    {item.excerpt}
                  </p>
                ) : null}

                <div className="mt-auto pt-4">
                  {item.slug ? (
                    <Link
                      to={`/blogs/${item.slug}`}
                      className="inline-flex items-center text-sm font-bold text-[#F5B041] hover:text-[#d99732] transition-colors"
                    >
                      Read Story <span className="ml-1 text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  ) : (
                    <span className="inline-flex text-sm font-bold text-[#F5B041]">
                      Read Story
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

export default NewsPage
