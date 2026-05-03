import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/Home';
import { TrackPage } from './pages/Track';
import { LoginPage } from './pages/Login';
import { AdminPage } from './pages/Admin';
import { EncomendasPage } from './pages/Admin/Encomendas';
import { NovaEncomendaPage } from './pages/Admin/Encomendas/Nova';
import { DetalheEncomendaPage } from './pages/Admin/Encomendas/Detalhe';

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
                path="/admin/encomendas"
                element={
                  <ProtectedRoute role="ADMIN">
                    <EncomendasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/encomendas/nova"
                element={
                  <ProtectedRoute role="ADMIN">
                    <NovaEncomendaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/encomendas/:id"
                element={
                  <ProtectedRoute role="ADMIN">
                    <DetalheEncomendaPage />
                  </ProtectedRoute>
                }
              />

              {/* Redireciona rotas antigas */}
              <Route path="/admin/packages/new" element={<Navigate to="/admin/encomendas/nova" replace />} />
              <Route path="/admin/packages/:id" element={<Navigate to="/admin/encomendas" replace />} />

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
