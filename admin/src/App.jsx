import { useEffect, useState } from 'react'
import ApiEndpointCard from './components/ApiEndpointCard.jsx'
import AdminLogin from './components/AdminLogin.jsx'
import SectionHeader from './components/SectionHeader.jsx'
import tabs from './constants/tabs.js'
import StatsGrid from './features/dashboard/StatsGrid.jsx'
import ProductForm from './features/products/ProductForm.jsx'
import ProductList from './features/products/ProductList.jsx'
import CollectionList from './features/collections/CollectionList.jsx'
import BlogList from './features/blogs/BlogList.jsx'
import RecipeList from './features/recipes/RecipeList.jsx'
import ReviewList from './features/reviews/ReviewList.jsx'
import CouponList from './features/discounts/CouponList.jsx'
import OrderList from './features/orders/OrderList.jsx'
import useProducts from './hooks/useProducts.js'
import useCollections from './hooks/useCollections.js'
import useBlogs from './hooks/useBlogs.js'
import useRecipes from './hooks/useRecipes.js'
import useReviews from './hooks/useReviews.js'
import useCoupons from './hooks/useCoupons.js'
import useOrders from './hooks/useOrders.js'
import AdminLayout from './layout/AdminLayout.jsx'
import {
  clearAdminSession,
  isAdminSessionValid,
  saveAdminSession,
} from './utils/adminAuth.js'

const API_BASE = import.meta.env.VITE_API_BASE
const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminSessionValid())
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const {
    products,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    toggleActive,
  } = useProducts(API_BASE)

  const {
    collections,
    loading: collectionsLoading,
    error: collectionsError,
    fetchCollections,
    fetchCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
  } = useCollections(API_BASE)

  const {
    blogs,
    loading: blogsLoading,
    error: blogsError,
    fetchBlogs,
    fetchBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
  } = useBlogs(API_BASE)

  const {
    recipes,
    loading: recipesLoading,
    error: recipesError,
    fetchRecipes,
    fetchRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  } = useRecipes(API_BASE)

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    fetchReviews,
    updateReview,
  } = useReviews(API_BASE)

  const {
    coupons,
    loading: couponsLoading,
    error: couponsError,
    fetchCoupons,
    fetchCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  } = useCoupons(API_BASE)

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    fetchOrders,
    updateOrderStatus,
    syncOrderToShiprocket,
    requestPickup,
  } = useOrders(API_BASE)

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isAdminSessionValid()) {
        setIsAuthenticated(false)
      }
    }, 30000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    if (activeTab === 'products' || activeTab === 'dashboard') {
      fetchProducts()
    }
    if (activeTab === 'collections') {
      fetchProducts()
      fetchCollections()
    }
    if (activeTab === 'blogs') {
      fetchBlogs()
    }
    if (activeTab === 'recipes') {
      fetchRecipes()
      fetchProducts()
    }
    if (activeTab === 'reviews') {
      fetchReviews()
    }
    if (activeTab === 'discounts') {
      fetchCoupons()
    }
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab, isAuthenticated])

  const handleLogin = async (loginId, password) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: String(loginId || '').trim(),
          password: String(password || ''),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Invalid admin ID or password.')
      }
      saveAdminSession({
        loginId: data.loginId,
        token: data.token,
        expiresAt: data.expiresAt,
      })
      setIsAuthenticated(true)
    } catch (err) {
      setAuthError(err.message || 'Invalid admin ID or password.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    clearAdminSession()
    setIsAuthenticated(false)
    setAuthError('')
    setActiveTab('dashboard')
  }

  if (!isAuthenticated) {
    return <AdminLogin onSubmit={handleLogin} errorMessage={authError} loading={authLoading} />
  }

  return (
    <AdminLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      <SectionHeader
        title={tabs.find((tab) => tab.id === activeTab)?.label}
        description="Manage products, orders, inventory, and customers in real time."
      />

      {activeTab === 'products' ? (
        <ProductList
          products={products}
          loading={loading}
          error={error}
          onRefresh={fetchProducts}
          onFetchForEdit={fetchProductById}
          onCreate={createProduct}
          onUpdate={updateProduct}
          onUpdateStock={updateStock}
          onDelete={deleteProduct}
          onToggleActive={toggleActive}
          apiBase={API_BASE}
        />
      ) : null}

      {activeTab === 'collections' ? (
        <CollectionList
          collections={collections}
          products={products}
          loading={collectionsLoading}
          error={collectionsError}
          onRefresh={fetchCollections}
          onFetchForEdit={fetchCollectionById}
          onCreate={createCollection}
          onUpdate={updateCollection}
          onDelete={deleteCollection}
          apiBase={API_BASE}
        />
      ) : null}

      {activeTab === 'blogs' ? (
        <BlogList
          blogs={blogs}
          loading={blogsLoading}
          error={blogsError}
          onRefresh={fetchBlogs}
          onFetchForEdit={fetchBlogById}
          onCreate={createBlog}
          onUpdate={updateBlog}
          onDelete={deleteBlog}
          apiBase={API_BASE}
        />
      ) : null}

      {activeTab === 'recipes' ? (
        <RecipeList
          recipes={recipes}
          products={products}
          loading={recipesLoading}
          error={recipesError}
          onRefresh={fetchRecipes}
          onFetchForEdit={fetchRecipeById}
          onCreate={createRecipe}
          onUpdate={updateRecipe}
          onDelete={deleteRecipe}
          apiBase={API_BASE}
        />
      ) : null}

      {activeTab === 'reviews' ? (
        <ReviewList
          reviews={reviews}
          loading={reviewsLoading}
          error={reviewsError}
          onRefresh={fetchReviews}
          onUpdate={updateReview}
          apiBase={API_BASE}
        />
      ) : null}

      {activeTab === 'discounts' ? (
        <CouponList
          coupons={coupons}
          loading={couponsLoading}
          error={couponsError}
          onRefresh={fetchCoupons}
          onFetchForEdit={fetchCouponById}
          onCreate={createCoupon}
          onUpdate={updateCoupon}
          onDelete={deleteCoupon}
        />
      ) : null}

      {activeTab === 'orders' ? (
        <OrderList
          orders={orders}
          loading={ordersLoading}
          error={ordersError}
          onRefresh={fetchOrders}
          onUpdateStatus={updateOrderStatus}
          onSyncShipping={syncOrderToShiprocket}
          onRequestPickup={requestPickup}
        />
      ) : null}

      {activeTab !== 'products' &&
      activeTab !== 'orders' &&
      activeTab !== 'collections' &&
      activeTab !== 'blogs' &&
      activeTab !== 'recipes' &&
      activeTab !== 'reviews' &&
      activeTab !== 'discounts' ? (
        <StatsGrid products={products} />
      ) : null}

      <ApiEndpointCard apiBase={API_BASE} />
    </AdminLayout>
  )
}

export default AdminApp
