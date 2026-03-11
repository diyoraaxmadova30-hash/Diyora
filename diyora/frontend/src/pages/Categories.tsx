import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Pencil, Trash2, FolderTree, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';

export const Categories: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState('');

    const fetchData = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/categories/${editId}`, { name });
            } else {
                await api.post('/categories', { name });
            }
            setModalOpen(false);
            setName('');
            setEditId(null);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure? This may affect products in this category.')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchData();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const openEdit = (cat: any) => {
        setEditId(cat.id);
        setName(cat.name);
        setModalOpen(true);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Categories</h1>
                    <p className="text-slate-500 font-medium">Organize your products into logical groups.</p>
                </div>
                <Button onClick={() => { setEditId(null); setName(''); setModalOpen(true); }} className="h-12 px-6">
                    <Plus className="w-5 h-5 mr-3" />
                    <span>Create Category</span>
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1 h-fit sticky top-24 lg:top-8 outline-none">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Quick Search</h3>
                        <p className="text-sm text-slate-500">Find a category by name.</p>
                    </div>
                    <Input
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-5 h-5 text-slate-400" />}
                    />
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-primary bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <FolderTree className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">{categories.length} Total Categories</span>
                        </div>
                    </div>
                </Card>

                <div className="md:col-span-2 space-y-4">
                    {filteredCategories.map((cat) => (
                        <Card key={cat.id} className="group hover:border-primary/30 transition-all duration-300 py-4 px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                                        <FolderTree className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{cat.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: {cat.id.substring(0, 8)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(cat)} className="w-10 h-10 p-0 text-indigo-600 hover:bg-indigo-50">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="w-10 h-10 p-0 text-accent hover:bg-accent/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <FolderTree className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No categories found</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title={editId ? 'Edit Category' : 'New Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Category Name"
                        required
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Beverages, Electronics..."
                    />
                    <div className="flex gap-4 pt-4">
                        <Button variant="outline" className="flex-1" type="button" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1" type="submit">
                            {editId ? 'Update Category' : 'Save Category'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
