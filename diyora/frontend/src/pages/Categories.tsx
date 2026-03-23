import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { Plus, Pencil, Trash2, FolderTree, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';

export const Categories: React.FC = () => {
    const { t } = useTranslation();
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
        <div className="space-y-6 lg:space-y-10 animate-fade-in overflow-x-hidden">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">{t('categories')}</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">{t('organize_products')}</p>
                </div>
                <Button onClick={() => { setEditId(null); setName(''); setModalOpen(true); }} className="w-full md:w-auto h-12 px-8 shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5 mr-3" />
                    <span>{t('create_category')}</span>
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <Card className="lg:col-span-1 h-fit lg:sticky lg:top-8 border-none shadow-xl shadow-slate-200/50">
                    <div className="mb-6 px-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Quick Search</h3>
                        <p className="text-sm text-slate-500">Find a category by name.</p>
                    </div>
                    <Input
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-5 h-5 text-slate-400" />}
                        className="bg-slate-50/50 border-none ring-1 ring-slate-100"
                    />
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-primary bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <FolderTree className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">{categories.length} Total Categories</span>
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    {filteredCategories.map((cat) => (
                        <Card key={cat.id} className="group hover:bg-slate-50/30 transition-all duration-300 py-3 lg:py-4 px-4 lg:px-6 border-none shadow-lg shadow-slate-200/40">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-primary group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 flex-shrink-0">
                                        <FolderTree className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base lg:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{cat.name}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">ID: {cat.id.substring(0, 8)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(cat)} className="w-9 h-9 lg:w-10 lg:h-10 p-0 text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="w-9 h-9 lg:w-10 lg:h-10 p-0 text-accent hover:bg-accent/10 rounded-xl">
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
