import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, FolderTree, Users, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';

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
        { name: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { name: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
        { name: 'Total Products', value: stats.products, icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
        { name: 'Total Users', value: stats.users, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    if (loading) {
        return <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Live Store Data</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.name}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
