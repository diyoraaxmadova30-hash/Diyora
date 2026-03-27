import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, Filter, Package } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const Products: React.FC = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: '',
    });

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(prodRes.data || []);
            setCategories(catRes.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fd = new FormData();
        fd.append('image', file);

        try {
            const res = await api.post('/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, image_url: res.data.url }));
        } catch (error) {
            console.error('Upload failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
            };

            if (editId) {
                await api.put(`/products/${editId}`, payload);
            } else {
                await api.post('/products', payload);
            }

            setModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchData();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const openNew = () => {
        resetForm();
        if (categories.length > 0) {
            setFormData(prev => ({ ...prev, category_id: categories[0].id }));
        }
        setModalOpen(true);
    };

    const openEdit = (prod: any) => {
        setEditId(prod.id);
        setFormData({
            name: prod.name,
            description: prod.description || '',
            price: prod.price.toString(),
            stock: prod.stock ? prod.stock.toString() : '0',
            category_id: prod.category_id,
            image_url: prod.image_url || '',
        });
        setModalOpen(true);
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">{t('products')}</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">{t('manage_inventory')}</p>
                </div>
                <Button onClick={openNew} className="w-full md:w-auto h-12 px-8 shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5 mr-3" />
                    <span>{t('add_product')}</span>
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Search Sidebar */}
                <Card className="lg:col-span-1 h-fit lg:sticky lg:top-8 border-none shadow-xl shadow-slate-200/50">
                    <div className="mb-6 px-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Quick Search</h3>
                        <p className="text-sm text-slate-500">Find products by name.</p>
                    </div>
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-5 h-5 text-slate-400" />}
                        className="bg-slate-50/50 border-none ring-1 ring-slate-100"
                    />
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-primary bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                <Package className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest">{filteredProducts.length} Products</span>
                            </div>
                            <Button variant="outline" className="w-full border-slate-100 hover:bg-slate-50 rounded-xl">
                                <Filter className="w-4 h-4 mr-2" />
                                More Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Product List */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredProducts.map((prod) => {
                        const cat = categories.find(c => c.id === prod.category_id);
                        return (
                            <Card key={prod.id} className="group hover:bg-slate-50/30 transition-all duration-300 p-4 lg:p-6 border-none shadow-lg shadow-slate-200/40">
                                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                                            {prod.image_url ? (
                                                <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${prod.image_url}`} alt={prod.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 lg:w-8 lg:h-8 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 mb-1.5">
                                                <Badge variant="info" className="py-0.5 px-2 text-[8px] lg:text-[10px] font-black tracking-widest uppercase truncate max-w-[120px]">
                                                    {cat?.name || 'Uncategorized'}
                                                </Badge>
                                                <Badge variant={prod.stock > 0 ? (prod.stock < 10 ? "warning" : "success") : "danger"} className="py-0.5 px-2 text-[8px] lg:text-[10px] font-black tracking-widest uppercase whitespace-nowrap">
                                                    {prod.stock > 0 ? (prod.stock < 10 ? `Low Stock (${prod.stock})` : `${prod.stock} In Stock`) : 'Out of Stock'}
                                                </Badge>
                                            </div>
                                            <h3 className="text-base lg:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{prod.name}</h3>
                                            <div className="flex items-center justify-between gap-4 mt-0.5">
                                                <p className="font-black text-slate-900 tracking-tight text-lg">{Math.round(parseFloat(prod.price)).toLocaleString('ru-RU')} so'm</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    Updated: {new Date(prod.updated_at || prod.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100/60">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(prod)} className="w-10 h-10 p-0 text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(prod.id)} className="w-10 h-10 p-0 text-accent hover:bg-accent/10 rounded-xl">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No products found</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title={editId ? 'Edit Product' : 'Add New Product'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-widest">Product Image</label>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                                {formData.image_url ? (
                                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${formData.image_url}`} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-slate-300" />
                                )}
                            </div>
                            <input
                                type="file" accept="image/*"
                                onChange={handleImageUpload}
                                className="text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                            />
                        </div>
                    </div>

                    <Input
                        label="Product Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Premium Espresso Roast"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">Category</label>
                            <select
                                required
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Price (sum)"
                            type="number" step="1" required min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0.00"
                        />
                        <Input
                            label="Stock Quantity"
                            type="number" step="1" required min="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest">Description</label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-slate-400 font-medium"
                            placeholder="Describe your product's unique features..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button variant="outline" className="flex-1" type="button" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1" type="submit">
                            {editId ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
