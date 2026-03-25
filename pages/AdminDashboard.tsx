import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, onSnapshot, collection, query, orderBy } from '../firebase';
import { motion } from 'framer-motion';
import { CheckIcon } from '../components/icons/CheckIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: !currentStatus
      });
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Gagal memperbarui status persetujuan.');
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
      alert('Gagal memperbarui peran.');
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-black text-cartoon-dark uppercase italic tracking-tight">
          ADMIN <span className="text-cartoon-blue">DASHBOARD</span>
        </h1>
        <p className="text-cartoon-dark/60 font-bold uppercase text-sm tracking-widest">
          Kelola Persetujuan & Peran Pengguna
        </p>
      </div>

      <div className="bg-white border-4 border-cartoon-dark rounded-[2rem] shadow-cartoon overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cartoon-yellow/20 border-b-4 border-cartoon-dark">
                <th className="p-4 font-black uppercase text-xs tracking-widest">User</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest">Email</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest">Status</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest">Role</th>
                <th className="p-4 font-black uppercase text-xs tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b-2 border-cartoon-dark/10 hover:bg-cartoon-yellow/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-cartoon-dark">{user.displayName || 'No Name'}</div>
                    <div className="text-[10px] text-cartoon-dark/40 font-mono">{user.id}</div>
                  </td>
                  <td className="p-4 font-medium text-sm">{user.email}</td>
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
                  <td className="p-4 text-right space-x-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-cartoon-blue/10 border-4 border-cartoon-blue/20 rounded-3xl">
        <h3 className="font-black text-cartoon-blue uppercase text-sm mb-2">Info Admin</h3>
        <p className="text-xs font-bold text-cartoon-dark/60 leading-relaxed">
          Sebagai Admin, Anda dapat menyetujui pengguna baru agar mereka dapat mengakses aplikasi. 
          Anda juga dapat mengangkat pengguna lain menjadi Admin untuk membantu proses moderasi.
          Email utama <span className="text-cartoon-blue">aahdan298@gmail.com</span> selalu memiliki akses Admin penuh.
        </p>
      </div>
    </div>
  );
};
