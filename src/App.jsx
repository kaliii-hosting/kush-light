import React, { Suspense, lazy } from 'react'
import './App.css'
import './styles/typography.css'
import './styles/sections.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ProductsProvider } from './context/ProductsContext'
import { ShopifyCartProvider } from './context/ShopifyCartContext'
import { PageContentProvider } from './context/PageContentContext'
import { HomepageProvider } from './context/HomepageContext'
import { AuthProvider } from './context/AuthContext'
import { LogosProvider } from './context/LogosContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { MusicProvider } from './context/MusicContext'
import { BlogProvider } from './context/BlogContext'
import { WishlistProvider } from './context/WishlistContextNew'
import { ShopifyProvider } from './context/ShopifyContext'
import { EnhancedProductsProvider } from './context/EnhancedProductsContext'
import { WholesaleCartProvider } from './context/WholesaleCartContext'
import SpotifyLayout from './components/SpotifyLayout'
import SpotifyHomeDynamic from './components/SpotifyHomeDynamic'
import AgeVerification from './components/AgeVerification'
import AdvertisingPopup from './components/AdvertisingPopup'
import ScrollToTop from './components/ScrollToTop'
import LoadingSpinner from './components/LoadingSpinner'
import GradientLoader from './components/admin/GradientLoader'
import useResourcePreloader from './hooks/useResourcePreloader'

// User sync is now handled in AdminAuthContext when admin logs in
// import './utils/syncUsersToRealtimeDB'

// Lazy load admin components
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'))
const AdminDashboardEnhanced = lazy(() => import('./components/admin/AdminDashboardEnhanced'))
const AdminProtectedRoute = lazy(() => import('./components/admin/AdminProtectedRoute'))
const WholesaleProtectedRoute = lazy(() => import('./components/WholesaleProtectedRoute'))
const ImagePreloader = lazy(() => import('./components/ImagePreloader'))

// Lazy load pages
const AboutDynamic = lazy(() => import('./pages/AboutDynamic'))
const ShopDynamic = lazy(() => import('./pages/ShopDynamic'))
const Products = lazy(() => import('./pages/Products'))
const WholesaleDynamic = lazy(() => import('./pages/WholesaleDynamic'))
const WholesaleLogin = lazy(() => import('./pages/WholesaleLogin'))
const ContactDynamic = lazy(() => import('./pages/ContactDynamic'))
const Blog = lazy(() => import('./pages/Blog'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Account = lazy(() => import('./pages/Account'))
const Underage = lazy(() => import('./pages/Underage'))
const Sales = lazy(() => import('./pages/Sales'))
const Careers = lazy(() => import('./pages/Careers'))
const Accessibility = lazy(() => import('./pages/Accessibility'))
const LabResults = lazy(() => import('./pages/LabResults'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))


function App() {
  useResourcePreloader();
  
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <ProductsProvider>
          <ShopifyProvider>
            <EnhancedProductsProvider>
              <ShopifyCartProvider>
                <WholesaleCartProvider>
                  <WishlistProvider>
                    <LogosProvider>
                      <PageContentProvider>
                        <HomepageProvider>
                          <MusicProvider>
                            <BlogProvider>
                      <Router>
                    <ScrollToTop />
                    <div className="min-h-screen bg-black">
                    <Suspense fallback={null}>
                      <ImagePreloader />
                    </Suspense>
                    <AgeVerification />
                    <AdvertisingPopup />
                    <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={
                  <Suspense fallback={<GradientLoader />}>
                    <AdminLogin />
                  </Suspense>
                } />
                <Route path="/admin" element={
                  <Suspense fallback={<GradientLoader />}>
                    <AdminProtectedRoute>
                      <AdminDashboardEnhanced />
                    </AdminProtectedRoute>
                  </Suspense>
                } />
                
                {/* Wholesale Login Route - with SpotifyLayout for footer/music player */}
                <Route path="/wholesale/login" element={
                  <SpotifyLayout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <WholesaleLogin />
                    </Suspense>
                  </SpotifyLayout>
                } />

                {/* Public Routes */}
                <Route path="*" element={
                  <SpotifyLayout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        <Route path="/" element={<SpotifyHomeDynamic />} />
                        <Route path="/about" element={<AboutDynamic />} />
                        <Route path="/shop" element={<ShopDynamic />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/wholesale" element={
                          <WholesaleProtectedRoute>
                            <WholesaleDynamic />
                          </WholesaleProtectedRoute>
                        } />
                        <Route path="/contact" element={<ContactDynamic />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/lab-results" element={<LabResults />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/underage" element={<Underage />} />
                        <Route path="/accessibility" element={<Accessibility />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                      </Routes>
                    </Suspense>
                  </SpotifyLayout>
                } />
              </Routes>
            </div>
                      </Router>
                            </BlogProvider>
                          </MusicProvider>
                        </HomepageProvider>
                      </PageContentProvider>
                    </LogosProvider>
                  </WishlistProvider>
                </WholesaleCartProvider>
              </ShopifyCartProvider>
            </EnhancedProductsProvider>
          </ShopifyProvider>
        </ProductsProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App