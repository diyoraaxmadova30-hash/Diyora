import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const Products: React.FC = () => {
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
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">Products</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">Manage your inventory and showcase your items.</p>
                </div>
                <Button onClick={openNew} className="w-full md:w-auto h-12 px-8 shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5 mr-3" />
                    <span>Add New Product</span>
                </Button>
            </header>

            <Card className="p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50">
                <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
                    <div className="w-full md:max-w-md">
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Search className="w-5 h-5 text-slate-400" />}
                            className="bg-slate-50/50 border-none ring-1 ring-slate-100"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="h-10 flex-1 md:flex-none border-slate-100 hover:bg-slate-50 rounded-xl">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                        <p className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100 uppercase tracking-widest whitespace-nowrap">
                            {filteredProducts.length} Products
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[700px] lg:min-w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product Details</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Price</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Stock</th>
                                <th className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map((prod) => {
                                const cat = categories.find(c => c.id === prod.category_id);
                                return (
                                    <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 lg:px-8 py-4 lg:py-5">
                                            <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
                                                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 flex-shrink-0">
                                                    {prod.image_url ? (
                                                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${prod.image_url}`} alt={prod.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                                                    <p className="text-xs lg:text-sm text-slate-400 truncate max-w-[150px] lg:max-w-xs">{prod.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-5">
                                            <Badge variant="info" className="py-1 px-3 text-[10px] font-black tracking-widest uppercase">
                                                {cat?.name || 'Uncategorized'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-5">
                                            <p className="font-black text-slate-900 tracking-tight">${parseFloat(prod.price).toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-5">
                                            <Badge variant={prod.stock > 0 ? "success" : "danger"} className="py-1 px-3 text-[10px] font-black tracking-widest uppercase">
                                                {prod.stock > 0 ? `${prod.stock} In Stock` : 'Out of Stock'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 lg:px-8 py-4 lg:py-5">
                                            <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(prod)} className="w-9 h-9 lg:w-10 lg:h-10 p-0 text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(prod.id)} className="w-9 h-9 lg:w-10 lg:h-10 p-0 text-accent hover:bg-accent/10 rounded-xl">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

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
                            label="Price ($)"
                            type="number" step="0.01" required min="0"
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
