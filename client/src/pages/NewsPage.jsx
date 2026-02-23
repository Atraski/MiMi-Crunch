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
    <main className="py-16">
      <div className="mx-auto max-w-6xl px-2">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-6xl px-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">News</h1>
          <p className="text-stone-600">
            Latest updates, stories, and product launches.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl bg-white p-5 shadow-lg shadow-stone-200/70"
            >
              <div className="mb-4 h-32 overflow-hidden rounded-xl bg-gradient-to-br from-amber-200 to-stone-100">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              {item.date ? <p className="pill">{item.date}</p> : null}
              <h3 className="mt-3 text-lg font-semibold text-stone-900">
                {item.title}
              </h3>
              {item.excerpt ? (
                <p className="mt-2 line-clamp-3 text-sm text-stone-600">
                  {item.excerpt}
                </p>
              ) : null}
              {item.slug ? (
                <Link
                  to={`/news/${item.slug}`}
                  className="mt-4 inline-flex text-sm font-semibold text-brand-900"
                >
                  Read More
                </Link>
              ) : (
                <span className="mt-4 inline-flex text-sm font-semibold text-brand-900">
                  Read More
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

export default NewsPage
