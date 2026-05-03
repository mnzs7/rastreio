import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/Home';
import { TrackPage } from './pages/Track';
import { LoginPage } from './pages/Login';
import { AdminPage } from './pages/Admin';
import { PackageDetailPage } from './pages/Admin/PackageDetail';
import { CreatePackagePage } from './pages/Admin/CreatePackage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/track/:codigo" element={<TrackPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="ADMIN">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/packages/new"
                element={
                  <ProtectedRoute role="ADMIN">
                    <CreatePackagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/packages/:id"
                element={
                  <ProtectedRoute role="ADMIN">
                    <PackageDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-700">Página não encontrada</h2>
                  </div>
                }
              />
            </Routes>
          </Layout>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
