import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ShoppingBag, FolderTree, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '../components/Button';

export const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

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
        <div className="min-h-screen bg-[#f8f9ff] flex font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col fixed inset-y-0 left-0 z-40">
                <div className="h-24 flex items-center px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                            Shop Admin
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`group flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 relative ${isActive
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                                    }`}
                            >
                                <item.icon className={`mr-3.5 h-5 w-5 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-primary'
                                    }`} />
                                {item.name}
                                {isActive && (
                                    <span className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-slate-100/80 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-6 p-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs font-medium text-slate-500 truncate lowercase">{user?.role}</p>
                        </div>
                    </div>

                    <Button
                        variant="danger"
                        className="w-full justify-start py-3"
                        onClick={logout}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-72 min-h-screen flex flex-col">
                <main className="flex-1 p-10 animate-fade-in">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
