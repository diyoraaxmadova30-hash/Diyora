import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, Users, DollarSign, TrendingUp, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Card } from '../components/Card';

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        users: 0,
        orders: 0,
        products: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersReq, ordersReq, prodsReq] = await Promise.all([
                    api.get('/users?limit=1000'),
                    api.get('/orders?limit=1000'),
                    api.get('/products?limit=1000'),
                ]);

                const users = usersReq.data || [];
                const orders = ordersReq.data || [];
                const products = prodsReq.data || [];

                const revenue = orders
                    .filter((o: any) => o.status === 'completed' || o.status === 'paid')
                    .reduce((sum: number, o: any) => sum + o.total_price, 0);

                setStats({
                    users: users.length,
                    orders: orders.length,
                    products: products.length,
                    revenue,
                });
            } catch (error) {
                console.error('Failed to load stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { name: 'Total Revenue', value: `$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: '+12.5%' },
        { name: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-500/10', trend: '+8.2%' },
        { name: 'Total Products', value: stats.products, icon: Package, color: 'text-purple-600', bg: 'bg-purple-500/10', trend: '+3.1%' },
        { name: 'Total Users', value: stats.users, icon: Users, color: 'text-rose-600', bg: 'bg-rose-500/10', trend: '+15.4%' },
    ];

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Welcome back to your store's control center.</p>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-bold text-slate-600">Live Statistics</span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, idx) => (
                    <Card key={card.name} className="group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-4 rounded-2xl ${card.bg} transition-transform group-hover:scale-110 duration-500`}>
                                <card.icon className={`w-7 h-7 ${card.color}`} />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                                <ArrowUpRight className="w-3 h-3" />
                                {card.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{card.name}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${card.color.replace('text', 'bg')}`}
                                    style={{ width: `${60 + idx * 10}%` }}
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Placeholder for future charts or recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 min-h-[400px] flex items-center justify-center border-dashed border-2 border-slate-200 bg-slate-50/30">
                    <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Revenue Insights Coming Soon</p>
                    </div>
                </Card>
                <Card className="min-h-[400px] flex items-center justify-center border-dashed border-2 border-slate-200 bg-slate-50/30">
                    <div className="text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Recent Activity Stream</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};
