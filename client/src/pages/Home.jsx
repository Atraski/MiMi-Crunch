import Categories from '../components/Categories'
import FeaturedProducts from '../components/FeaturedProducts'
import Hero from '../components/Hero'
import News from '../components/News'
import Recipes from '../components/Recipes'
import Story from '../components/Story'
import FAQ from '../components/FAQ'
import { featured as fallbackFeatured, news as fallbackNews, recipes as fallbackRecipes } from '../data/homeData'

const Home = ({ products, collections, blogs, recipes, onAddToCart }) => {
  // If collections data exists from backend, use it. Otherwise, fall back to deriving from products.
  const collectionCards = Array.isArray(collections) && collections.length > 0
    ? collections.map(col => ({
      title: col.title,
      slug: col.slug,
      raw: col.title,
      desc: col.description || `Premium range of ${col.title}.`,
      count: (products || []).filter(p =>
        p.collection?.trim().toLowerCase() === col.title?.trim().toLowerCase() ||
        p.collection?.trim().toLowerCase() === col.slug?.trim().toLowerCase()
      ).length,
      image: col.image
    }))
    : (() => {
      const collectionGroups = (products || []).reduce((acc, item) => {
        const key = item.collection?.trim()
        if (!key) return acc
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {})

      const groups = Object.entries(collectionGroups).map(
        ([collection, items]) => ({
          title: formatCollectionTitle(collection),
          slug: slugifyCollection(collection),
          raw: collection,
          count: items.length,
          desc: `Explore our ${collection} collection.`,
        }),
      )
      return groups
    })();

  // Add Custom "Protein Bars" Card
  const allCollectionCards = [
    ...(collectionCards || []),
    {
      title: 'Protein Bars',
      slug: 'build-your-protein',
      desc: 'Build your own custom millet protein bars for your specific fitness goals.',
      count: 'BYO',
      image: null
    }
  ]

  const newsItems =
    Array.isArray(blogs) && blogs.length
      ? blogs.slice(0, 10).map((blog) => ({
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

  const heroProducts =
    Array.isArray(products) && products.length >= 3
      ? getRandomFeatured(products)
      : []

  const featuredItems =
    Array.isArray(products) && products.length >= 3
      ? getRandomFeatured(products)
      : fallbackFeatured

  const homepageRecipes = Array.isArray(recipes) && recipes.length > 0
    ? recipes.slice(0, 3).map(recipe => ({
      _id: recipe._id,
      title: recipe.title,
      slug: recipe.slug,
      excerpt: recipe.excerpt,
      coverImage: recipe.coverImage,
      time: recipe.time,
      tags: recipe.tags || []
    }))
    : []

  return (
    <>
      <Hero products={heroProducts} />
      <Categories collections={allCollectionCards} />
      <FeaturedProducts featured={featuredItems} onAddToCart={onAddToCart} />
      <Story />
      <Recipes recipes={homepageRecipes} />
      <News news={newsItems} />
      <FAQ />
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
    desc: item.desc,
  }))
}

export default Home
