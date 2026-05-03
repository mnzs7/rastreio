import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, LogOut, User, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

interface Props {
  children: React.ReactNode;
}

export function Layout({ children }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                <Package className="h-6 w-6" />
                <span>RastreioApp</span>
              </Link>

              <Link
                to="/"
                className={clsx(
                  'flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-colors',
                  location.pathname === '/'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                )}
              >
                <Search className="h-4 w-4" />
                Rastrear
              </Link>

              {isAuthenticated && user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={clsx(
                    'flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-colors',
                    isActive('/admin')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Painel Admin
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:block">{user?.nome}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block">Sair</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} RastreioApp — Sistema de Rastreamento de Encomendas
          </p>
        </div>
      </footer>
    </div>
  );
}
