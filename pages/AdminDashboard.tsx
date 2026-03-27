import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, onSnapshot, collection, query, orderBy, deleteDoc } from '../firebase';
import { motion } from 'framer-motion';
import { CheckIcon } from '../components/icons/CheckIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: !currentStatus
      });
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Gagal memperbarui status persetujuan. Pastikan Anda memiliki hak akses admin.');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Ubah peran user ini menjadi ${newRole}?`)) return;
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Gagal memperbarui peran. Pastikan Anda memiliki hak akses admin.');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`HAPUS PERMANEN user ${userEmail}? Tindakan ini tidak bisa dibatalkan.`)) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus user. Pastikan Anda memiliki hak akses admin.');
    }
  };

  const isOnline = (lastActive: any) => {
    if (!lastActive) return false;
    const lastActiveDate = lastActive.toDate ? lastActive.toDate() : new Date(lastActive);
    const diffInMinutes = (lastRefresh.getTime() - lastActiveDate.getTime()) / 60000;
    return diffInMinutes < 5; // Online if active in last 5 minutes relative to last refresh
  };

  const formatLastActive = (lastActive: any) => {
    if (!lastActive) return 'Never';
    const date = lastActive.toDate ? lastActive.toDate() : new Date(lastActive);
    return date.toLocaleString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-black uppercase tracking-widest text-cartoon-dark/40">
        Memuat Data User...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-cartoon-dark uppercase italic tracking-tight">
            ADMIN <span className="text-cartoon-blue">DASHBOARD</span>
          </h1>
          <p className="text-cartoon-dark/60 font-bold uppercase text-sm tracking-widest">
            Kelola Persetujuan, Peran & Monitoring Pengguna
          </p>
        </div>
        
        <button 
          onClick={handleRefresh}
          className="px-6 py-2 bg-cartoon-yellow border-4 border-cartoon-dark rounded-xl shadow-cartoon font-black uppercase text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Status
        </button>
      </div>

      <div className="bg-white border-4 border-cartoon-dark rounded-[2rem] shadow-cartoon overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cartoon-yellow/20 border-b-4 border-cartoon-dark">
                <th className="p-4 font-black uppercase text-xs tracking-widest">User</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest">Status</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest">Role</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest">Usage</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest">Aktivitas</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b-2 border-cartoon-dark/10 hover:bg-cartoon-yellow/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-cartoon-blue/10 border-2 border-cartoon-dark rounded-xl flex items-center justify-center font-black text-cartoon-blue">
                          {user.displayName?.charAt(0) || 'U'}
                        </div>
                        {isOnline(user.lastActive) && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" title="Online" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-cartoon-dark leading-tight">{user.displayName || 'No Name'}</div>
                        <div className="text-[10px] text-cartoon-dark/40 font-bold">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-cartoon-dark ${
                      user.isApproved ? 'bg-green-400' : 'bg-cartoon-orange text-white'
                    }`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-cartoon-dark ${
                      user.role === 'admin' ? 'bg-cartoon-blue text-white' : 'bg-slate-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-cartoon-yellow border-2 border-cartoon-dark rounded-lg font-black text-xs shadow-cartoon-sm">
                        {user.generationCount || 0}
                      </div>
                      <span className="text-[10px] font-bold text-cartoon-dark/40 uppercase">Gens</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-[10px] font-black uppercase text-cartoon-dark/60">Terakhir Aktif:</div>
                    <div className="text-xs font-bold text-cartoon-dark">{formatLastActive(user.lastActive)}</div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleApproval(user.id, user.isApproved)}
                        className={`p-2 rounded-xl border-2 border-cartoon-dark shadow-cartoon-hover hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${
                          user.isApproved ? 'bg-cartoon-orange text-white' : 'bg-green-400 text-cartoon-dark'
                        }`}
                        title={user.isApproved ? 'Batalkan Persetujuan' : 'Setujui User'}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className="p-2 bg-white rounded-xl border-2 border-cartoon-dark shadow-cartoon-hover hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-cartoon-dark"
                        title="Ubah Peran"
                      >
                        <span className="text-[10px] font-black uppercase">Role</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="p-2 bg-red-500 text-white rounded-xl border-2 border-cartoon-dark shadow-cartoon-hover hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        title="Hapus User"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-cartoon-blue/10 border-4 border-cartoon-blue/20 rounded-3xl">
          <h3 className="font-black text-cartoon-blue uppercase text-sm mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Monitoring Real-time
          </h3>
          <p className="text-xs font-bold text-cartoon-dark/60 leading-relaxed">
            Titik hijau menandakan user sedang aktif atau baru saja menggunakan aplikasi dalam 5 menit terakhir. 
            Waktu "Terakhir Aktif" diperbarui secara otomatis setiap kali user berinteraksi.
          </p>
        </div>

        <div className="p-6 bg-red-50 border-4 border-red-100 rounded-3xl">
          <h3 className="font-black text-red-500 uppercase text-sm mb-2 flex items-center gap-2">
            <TrashIcon className="w-4 h-4" />
            Moderasi User
          </h3>
          <p className="text-xs font-bold text-cartoon-dark/60 leading-relaxed">
            Gunakan tombol hapus untuk membersihkan data user yang tidak diinginkan. 
            Menghapus user akan menghilangkan akses mereka secara permanen dari database Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};
