import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import type { User } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import {
  Search, Shield, Ban, CheckCircle, ChevronDown,
  Users as UsersIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['', 'client', 'freelancer', 'admin'];

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [roleMenuOpen, setRoleMenuOpen] = useState<string | null>(null);

  const loadUsers = (p: number) => {
    setLoading(true);
    adminAPI.getUsers({ page: p, limit: 15, role: roleFilter || undefined, search: search || undefined })
      .then(({ data }) => { setUsers(data.users); setTotal(data.total); setPage(p); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(1); }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1);
  };

  const toggleBlock = async (userId: string) => {
    try {
      const { data } = await adminAPI.toggleBlockUser(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: data.isBlocked } : u));
      toast.success(data.message);
    } catch { toast.error('Failed to toggle block.'); }
  };

  const changeRole = async (userId: string, role: string) => {
    try {
      const { data } = await adminAPI.changeUserRole(userId, { role });
      setUsers(users.map(u => u._id === userId ? { ...u, role: data.user.role } : u));
      toast.success(`Role changed to ${role}`);
      setRoleMenuOpen(null);
    } catch { toast.error('Failed to change role.'); }
  };

  const pages = Math.ceil(total / 15);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="section-title text-xl flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-brand-400" /> Users ({total})
        </h2>
        <div className="flex gap-2">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input w-36 text-sm !py-2">
            <option value="">All Roles</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
            <option value="admin">Admin</option>
          </select>
          <form onSubmit={handleSearch} className="flex gap-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                className="input !pl-9 !py-2 w-48 text-sm" placeholder="Search users..." />
            </div>
          </form>
        </div>
      </div>

      <div className="glass-dark rounded-2xl overflow-hidden overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="skeleton h-5 w-20 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`}
                        alt="" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-400 text-xs">{u.email}</td>
                  <td>
                    <div className="relative">
                      <button onClick={() => setRoleMenuOpen(roleMenuOpen === u._id ? null : u._id)}
                        className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'freelancer' ? 'badge-brand' : 'badge-gray'} cursor-pointer flex items-center gap-1`}>
                        {u.role} <ChevronDown className="w-3 h-3" />
                      </button>
                      {roleMenuOpen === u._id && (
                        <div className="absolute z-10 top-8 left-0 glass-dark border border-white/10 rounded-xl overflow-hidden shadow-card-hover">
                          {['client', 'freelancer', 'admin'].map((r) => (
                            <button key={r} onClick={() => changeRole(u._id, r)}
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${u.role === r ? 'text-brand-400' : 'text-slate-300'}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {u.isBlocked ? (
                      <span className="badge-danger"><Ban className="w-3 h-3" /> Blocked</span>
                    ) : (
                      <span className="badge-success"><CheckCircle className="w-3 h-3" /> Active</span>
                    )}
                  </td>
                  <td className="text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                  <td>
                    <button onClick={() => toggleBlock(u._id)}
                      className={`btn-sm ${u.isBlocked ? 'btn-secondary' : 'btn-danger'} flex items-center gap-1`}>
                      {u.isBlocked ? <><CheckCircle className="w-3 h-3" /> Unblock</> : <><Ban className="w-3 h-3" /> Block</>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => loadUsers(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-brand-500 text-white' : 'bg-surface-700 text-slate-400 hover:bg-surface-600'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
