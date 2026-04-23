import Categories from '../components/Categories'
import FeaturedProducts from '../components/FeaturedProducts'
import Hero from '../components/Hero'
import News from '../components/News'
import Recipes from '../components/Recipes'
import Story from '../components/Story'
import FAQ from '../components/FAQ'
import InstagramReels from '../components/InstagramReels'
import ComparisonSection from '../components/ComparisonSection'
import { featured as fallbackFeatured, news as fallbackNews, recipes as fallbackRecipes } from '../data/homeData'

import WaveDivider from '../components/WaveDivider'

const BR = {
  VERDUN: '#48521C',
  SMOKE: '#999F54',
  ORINOCO: '#DBDAAF',
  EGGSHELL: '#FCFFF5',
  BROWN: '#4A1A00',
}

const Home = ({ products, collections, blogs, recipes, onAddToCart }) => {

  // If collections data exists from backend, use it. Otherwise, fall back to deriving from products.
  const collectionCards = Array.isArray(collections) && collections.length > 0
    ? collections.map(col => ({
      title: getDisplayTitle(col.title),
      slug: col.slug,
      raw: col.title,
      desc: col.description || `Premium range of ${col.title}.`,
      count: (() => {
        const result = new Set();
        const bySlug = new Map((products || []).map(p => [p.slug, p]));
        
        // 1. Manual slugs
        if (col.productSlugs?.length) {
          col.productSlugs.forEach(slug => {
            const item = bySlug.get(slug);
            if (item) result.add(item.slug);
          });
        }
        
        // 2. Collection field match
        const targetSlug = col.slug?.toLowerCase();
        const targetTitle = col.title?.toLowerCase().trim();
        
        (products || []).forEach(p => {
          const pCol = p.collection?.toLowerCase().trim();
          if (!pCol) return;
          if (pCol === targetSlug || pCol === targetTitle || slugifyCollection(pCol) === targetSlug) {
            result.add(p.slug);
          }
        });
        
        return result.size;
      })(),
      image: col.image || getCollectionImage(col.title)
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
          title: getDisplayTitle(formatCollectionTitle(collection)),
          slug: slugifyCollection(collection),
          raw: collection,
          count: items.length,
          desc: `Explore our ${collection} collection.`,
          image: getCollectionImage(formatCollectionTitle(collection)),
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
      <WaveDivider fromColor={BR.VERDUN} toColor={BR.ORINOCO} shape={0} />

      <Categories collections={allCollectionCards} />
      <WaveDivider fromColor={BR.ORINOCO} toColor={BR.SMOKE} shape={1} />

      <FeaturedProducts featured={featuredItems} onAddToCart={onAddToCart} />
      <WaveDivider fromColor={BR.SMOKE} toColor={BR.EGGSHELL} shape={2} />

      <ComparisonSection />
      <WaveDivider fromColor={BR.EGGSHELL} toColor={BR.ORINOCO} shape={3} />

      <Story />
      <Recipes recipes={homepageRecipes} />
      <News news={newsItems} />
      <WaveDivider fromColor={BR.ORINOCO} toColor={BR.VERDUN} shape={0} />

      <InstagramReels />
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

const getDisplayTitle = (title) => {
  const t = title?.toLowerCase().trim();
  if (t === 'millet grain') return 'Grains';
  if (t === 'millet flour') return 'Flour';
  return title;
};

const getCollectionImage = (title) => {
  const t = title?.toLowerCase().trim();
  if (t === 'millet grain' || t === 'grains' || t === 'grain') return 'https://res.cloudinary.com/daovxopcn/image/upload/v1775298126/Grain_Collection_ssawm8.png';
  if (t === 'millet flour' || t === 'flours' || t === 'flour') return 'https://res.cloudinary.com/daovxopcn/image/upload/v1775298120/Flour_Collection_ghb9qg.png';
  return null;
}

export default Home
