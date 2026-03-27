import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, FolderTree, ShoppingCart, LogOut, Menu, X, Warehouse } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

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
    const { t } = useTranslation();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const navigation = [
        { name: t('dashboard'), href: '/', icon: LayoutDashboard },
        { name: t('categories'), href: '/categories', icon: FolderTree },
        { name: t('products'), href: '/products', icon: ShoppingBag },
        { name: t('inventory'), href: '/inventory', icon: Warehouse },
        { name: t('orders'), href: '/orders', icon: ShoppingCart },
        { name: t('users'), href: '/users', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9ff] flex font-sans overflow-x-hidden">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 w-full h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-primary to-primary-light rounded-lg flex items-center justify-center shadow-md">
                        <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight">Shop Admin</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-white hover:text-primary transition-all active:scale-95"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-72 bg-white/95 backdrop-blur-3xl border-r border-slate-200/60 flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl lg:shadow-none transition-transform duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)] 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                <div className="h-20 lg:h-24 flex items-center px-8 justify-between border-b lg:border-none border-slate-100/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                            Shop Admin
                        </h1>
                    </div>
                    <button
                        className="lg:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-6 py-6 border-b border-slate-100/60 lg:py-4 lg:border-none">
                    <LanguageSwitcher />
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 relative ${isActive
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-primary'
                                    }`} />
                                <span className="flex-1">{item.name}</span>
                                {isActive && (
                                    <span className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-slate-100/80 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-4 p-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm ring-4 ring-slate-100/50">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 truncate">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-primary">{user?.role}</p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full justify-start py-3 text-slate-600 hover:bg-accent/10 hover:text-accent rounded-xl"
                        onClick={logout}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span>{t('logout')}</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-72 min-h-screen flex flex-col pt-20 lg:pt-0">

                <main className="flex-1 p-4 sm:p-6 lg:p-10 animate-fade-in overflow-x-hidden">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
