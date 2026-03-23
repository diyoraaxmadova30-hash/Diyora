import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { Plus, Pencil, Trash2, Users as UsersIcon, Search, Mail, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const Users: React.FC = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
    });

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                const payload = { ...formData };
                if (!payload.password) delete (payload as any).password;
                await api.put(`/users/${editId}`, payload);
            } else {
                await api.post('/users/register', formData);
            }
            setModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const openEdit = (user: any) => {
        setEditId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
        });
        setModalOpen(true);
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({ name: '', email: '', password: '', role: 'user' });
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">{t('user_management')}</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium">{t('control_access')}</p>
                </div>
                <Button onClick={() => { resetForm(); setModalOpen(true); }} className="w-full md:w-auto shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5 mr-3" />
                    <span>{t('add_user')}</span>
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Search Sidebar */}
                <Card className="lg:col-span-1 h-fit lg:sticky lg:top-8 border-none shadow-xl shadow-slate-200/50">
                    <div className="mb-6 px-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Search Team</h3>
                        <p className="text-sm text-slate-500">Find users by name or email.</p>
                    </div>
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-5 h-5 text-slate-400" />}
                        className="bg-slate-50/50 border-none ring-1 ring-slate-100"
                    />
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-primary bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <UsersIcon className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">{filteredUsers.length} Total Users</span>
                        </div>
                    </div>
                </Card>

                {/* Users List */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredUsers.map((user) => (
                        <Card key={user.id} className="group hover:bg-slate-50/30 transition-all duration-300 p-4 lg:p-6 border-none shadow-lg shadow-slate-200/40">
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 font-bold border border-slate-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 flex-shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-base lg:text-lg font-bold text-slate-900 truncate">{user.name}</h3>
                                            <Badge variant={user.role === 'admin' ? 'danger' : 'primary'} className="py-0.5 px-2 text-[8px] lg:text-[10px] font-black tracking-widest uppercase">
                                                <Shield className="w-2.5 h-2.5 mr-1" />
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <p className="text-xs lg:text-sm text-slate-400 flex items-center gap-1.5 truncate">
                                            <Mail className="w-3 h-3" />
                                            {user.email}
                                        </p>
                                        <p className="font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-tight">ID: {user.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100/60">
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(user)} className="w-10 h-10 p-0 text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="w-10 h-10 p-0 text-accent hover:bg-accent/10 rounded-xl">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No users found</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                title={editId ? 'Edit User' : 'Add New User'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                    />
                    <Input
                        label={editId ? "New Password (Optional)" : "Password"}
                        type="password"
                        required={!editId}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                    />
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 uppercase tracking-widest">System Role</label>
                        <select
                            required
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                        >
                            <option value="user">User</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button variant="outline" className="flex-1" type="button" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1" type="submit">
                            {editId ? 'Update Permissions' : 'Create Account'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
