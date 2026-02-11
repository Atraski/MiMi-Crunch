import Categories from '../components/Categories'
import FeaturedProducts from '../components/FeaturedProducts'
import Hero from '../components/Hero'
import News from '../components/News'
import Newsletter from '../components/Newsletter'
import Recipes from '../components/Recipes'
import Story from '../components/Story'
import { featured as fallbackFeatured, news as fallbackNews } from '../data/homeData'

const Home = ({ products, blogs, recipes }) => {
  const collectionGroups = (products || []).reduce((acc, item) => {
    const key = item.collection?.trim()
    if (!key) {
      return acc
    }
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {})

  const collectionCards = Object.entries(collectionGroups).map(
    ([collection, items]) => ({
      title: formatCollectionTitle(collection),
      slug: slugifyCollection(collection),
      raw: collection,
      count: items.length,
      desc: `Explore ${items.length} products in this collection.`,
    }),
  )

  const newsItems =
    Array.isArray(blogs) && blogs.length
      ? blogs.slice(0, 3).map((blog) => ({
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

  const featuredItems =
    Array.isArray(products) && products.length >= 3
      ? getRandomFeatured(products)
      : fallbackFeatured

  const homepageRecipes = Array.isArray(recipes) ? recipes.slice(0, 3) : []

  return (
    <>
      <Hero />
      <Categories collections={collectionCards} />
      <FeaturedProducts featured={featuredItems} />
      <Story />
      <Recipes recipes={homepageRecipes} />
      <News news={newsItems} />
      <Newsletter />
    </>
  )
}

const formatCollectionTitle = (value) =>
  value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')

const slugifyCollection = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const getRandomFeatured = (items) => {
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 3).map((item) => ({
    name: item.name,
    slug: item.slug,
    size: item.size,
    price: item.price,
    tags: item.tags || [],
    image: item.image,
  }))
}

export default Home
