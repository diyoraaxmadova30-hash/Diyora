import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, Truck, CheckCircle, XCircle, Clock, DollarSign, Search, Filter } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
        pending: 'warning',
        paid: 'info',
        shipped: 'primary',
        completed: 'success',
        canceled: 'danger',
    };

    const icons: Record<string, React.ReactNode> = {
        pending: <Clock className="w-3.5 h-3.5 mr-1.5" />,
        paid: <DollarSign className="w-3.5 h-3.5 mr-1.5" />,
        shipped: <Truck className="w-3.5 h-3.5 mr-1.5" />,
        completed: <CheckCircle className="w-3.5 h-3.5 mr-1.5" />,
        canceled: <XCircle className="w-3.5 h-3.5 mr-1.5" />,
    };

    return (
        <Badge variant={variants[status] || 'secondary'} className="py-1 px-3">
            {icons[status]}
            <span className="capitalize">{status}</span>
        </Badge>
    );
};

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data || []); // Removed .data since axios interceptor handles it
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            fetchOrders();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Orders Management</h1>
                <p className="text-slate-500 font-medium">Track and process your store's transactions.</p>
            </header>

            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
                    <div className="w-full md:max-w-md">
                        <Input
                            placeholder="Search by Order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Search className="w-5 h-5 text-slate-400" />}
                            className="bg-white"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="h-10">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                        <p className="text-sm font-bold text-slate-400 bg-white px-3 py-2 rounded-xl border border-slate-100 italic">
                            {filteredOrders.length} Orders
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Order Information</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date & Time</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Total Price</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Current Status</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Update Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                                <Package className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 font-mono tracking-tight text-sm">#{order.id.substring(0, 8).toUpperCase()}</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer ID: {order.user_id.substring(0, 6)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-medium text-slate-600">
                                            {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">
                                            {new Date(order.created_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="font-black text-slate-900 tracking-tight text-lg">${order.total_price.toFixed(2)}</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <select
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:bg-white"
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="completed">Completed</option>
                                            <option value="canceled">Canceled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-20 bg-slate-50/50">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No orders found</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
