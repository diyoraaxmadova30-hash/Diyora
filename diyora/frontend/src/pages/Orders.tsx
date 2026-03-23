import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
        <div className="space-y-6 lg:space-y-10 animate-fade-in overflow-x-hidden">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">{t('orders')}</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">{t('track_orders')}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Search Sidebar */}
                <Card className="lg:col-span-1 h-fit lg:sticky lg:top-8 border-none shadow-xl shadow-slate-200/50">
                    <div className="mb-6 px-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Search Orders</h3>
                        <p className="text-sm text-slate-500">Filter orders by ID or status.</p>
                    </div>
                    <Input
                        placeholder="Search by Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-5 h-5 text-slate-400" />}
                        className="bg-slate-50/50 border-none ring-1 ring-slate-100"
                    />
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-primary bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                <Package className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest">{filteredOrders.length} Total Orders</span>
                            </div>
                            <Button variant="outline" className="w-full border-slate-100 hover:bg-slate-50 rounded-xl">
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Orders List */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredOrders.map((order) => (
                        <Card key={order.id} className="group hover:bg-slate-50/30 transition-all duration-300 p-4 lg:p-6 border-none shadow-lg shadow-slate-200/40">
                            <div className="flex flex-col gap-6">
                                {/* Header: Order ID & Status */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-primary group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 flex-shrink-0">
                                            <Package className="w-6 h-6 lg:w-7 lg:h-7 text-slate-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-mono font-bold text-slate-900 text-sm lg:text-base">#{order.id.substring(0, 8).toUpperCase()}</p>
                                            <p className="text-xs font-medium text-slate-600 truncate max-w-[150px]">{order.user_name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })} • {new Date(order.created_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-50"></div>

                                {/* Footer: Price & Actions */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{Math.round(order.total_price).toLocaleString('ru-RU')} sum</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col flex-1 sm:flex-none">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Update Status</p>
                                            <select
                                                className="bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:bg-white min-w-[140px]"
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="completed">Completed</option>
                                                <option value="canceled">Canceled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No orders found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
