import BackButton from '../components/BackButton'
import SEO from '../components/SEO'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'

const BlogDetail = ({ blogs }) => {
  const { slug } = useParams()
  const blog = (blogs || []).find((item) => item.slug === slug)


  if (!blog) {
    return (
      <main className="py-16">
        <div className="mx-auto max-w-4xl px-2">
          <BackButton className="mb-6" />
          <h1 className="text-2xl font-semibold text-stone-900">
            Blog not found
          </h1>
          <p className="mt-2 text-stone-600">
            The blog post you are looking for could not be found.
          </p>
        </div>
      </main>
    )
  }

  const publishedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : ''

  return (
    <main className="py-16">
      <SEO 
        title={blog.metaTitle || blog.title} 
        description={blog.metaDescription || blog.excerpt} 
        schemaMarkup={blog.schemaMarkup} 
        slug={blog.slug} 
        type="article" 
      />
      <div className="mx-auto max-w-3xl px-2">
        <BackButton className="mb-6" />
        {publishedDate ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            {publishedDate}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">
          {blog.title}
        </h1>
        {blog.excerpt ? (
          <p className="mt-3 text-stone-600">{blog.excerpt}</p>
        ) : null}
      </div>
      {blog.coverImage ? (
        <div className="mt-8">
          <div className="mx-auto max-w-5xl px-2">
            <div className="h-80 overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      ) : null}
      <section className="py-10">
        <div className="mx-auto max-w-3xl px-2">
          <article
            className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-brand-900 prose-li:marker:text-stone-400"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml || '' }}
          />
        </div>
      </section>
    </main>
  )
}

export default BlogDetail

