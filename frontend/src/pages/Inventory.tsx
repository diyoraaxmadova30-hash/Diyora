import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
    Package,
    AlertTriangle,
    Search,
    RefreshCw,
    TrendingDown,
    Box,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const Inventory: React.FC = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        lowStock: 0,
        outOfStock: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const [prodRes, statsRes] = await Promise.all([
                api.get('/products?limit=1000'),
                api.get('/inventory/stats')
            ]);

            const allProducts = prodRes.data || [];
            setProducts(allProducts);

            setStats({
                total: statsRes.data.total_products,
                lowStock: statsRes.data.low_stock_count,
                outOfStock: allProducts.filter((p: any) => p.stock <= 0).length
            });
        } catch (error) {
            console.error('Failed to fetch inventory data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockStatus = (stock: number) => {
        if (stock <= 0) return { label: 'Out of Stock', variant: 'danger' as const, icon: XCircle };
        if (stock < 10) return { label: 'Low Stock', variant: 'warning' as const, icon: AlertTriangle };
        return { label: 'In Stock', variant: 'success' as const, icon: CheckCircle2 };
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 lg:space-y-10 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">{t('inventory')}</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">Real-time stock monitoring and warehouse management.</p>
                </div>
                <Button
                    onClick={fetchData}
                    variant="outline"
                    className="w-full md:w-auto h-12 px-6 bg-white border-slate-200"
                    disabled={refreshing}
                >
                    <RefreshCw className={`w - 4 h - 4 mr - 2 ${refreshing ? 'animate-spin' : ''} `} />
                    Refresh Data
                </Button>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 lg:gap-6 sm:grid-cols-3">
                <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Box className="w-24 h-24 text-primary" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <Package className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('totalProducts')}</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                </Card>

                <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <AlertTriangle className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-[#d97706]">Low Stock Alerts</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stats.lowStock}</p>
                </Card>

                <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <XCircle className="w-24 h-24 text-rose-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-rose-500">Out of Stock</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stats.outOfStock}</p>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-900">Stock Levels</h2>
                    <div className="w-full md:w-72">
                        <Input
                            placeholder="Filter by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Search className="w-4 h-4 text-slate-400" />}
                            className="h-10 text-sm bg-slate-50/50 border-none ring-1 ring-slate-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Stock</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map((p) => {
                                const status = getStockStatus(p.stock);
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200/50 flex-shrink-0">
                                                    {p.image_url ? (
                                                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${p.image_url} `} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium font-mono uppercase truncate">{p.id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text - sm font - black ${p.stock < 10 ? 'text-amber-600' : 'text-slate-900'} `}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={status.variant} className="flex items-center gap-1.5 w-fit py-1 px-3">
                                                <StatusIcon className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-slate-900">{Math.round(p.price).toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">sum</span></p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-xs font-semibold text-slate-500">
                                                {new Date(p.updated_at || p.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {new Date(p.updated_at || p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No inventory items found</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
