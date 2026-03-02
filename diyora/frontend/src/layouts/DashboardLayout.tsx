import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ShoppingBag, FolderTree, ShoppingCart, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

    return <Outlet />;
};

export const DashboardLayout: React.FC = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Categories', href: '/categories', icon: FolderTree },
        { name: 'Products', href: '/products', icon: ShoppingBag },
        { name: 'Orders', href: '/orders', icon: ShoppingCart },
        { name: 'Users', href: '/users', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-primary">Shop Admin</h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center px-4 py-3 text-sm text-gray-700">
                        <div className="flex-1 truncate">
                            <p className="font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="mt-2 flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
