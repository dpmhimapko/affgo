import React, { useState } from 'react';
import { auth, signOut, db, doc, getDoc } from '../firebase';
import { motion } from 'framer-motion';

export const ApprovalPending: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const user = auth.currentUser;

  const handleRefresh = async () => {
    if (!user) return;
    setIsChecking(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().isApproved) {
        // Force reload or state update will happen in App.tsx
        window.location.reload();
      } else {
        alert('Status: Menunggu Persetujuan Admin');
      }
    } catch (error) {
      console.error('Error checking approval:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cartoon-yellow">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white border-4 border-cartoon-dark rounded-[2rem] p-8 shadow-cartoon-lg text-center"
      >
        <div className="w-20 h-20 bg-cartoon-orange border-4 border-cartoon-dark rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-cartoon">
          <span className="text-4xl font-black text-white italic">!</span>
        </div>
        <h1 className="text-2xl font-black text-cartoon-dark mb-4 uppercase italic tracking-tight">
          MENUNGGU <span className="text-cartoon-orange">PERSETUJUAN</span>
        </h1>
        <p className="text-cartoon-dark/60 font-bold mb-8 uppercase text-sm tracking-widest leading-relaxed">
          AKUN ANDA SEDANG DALAM PROSES PENGECEKAN OLEH ADMIN. SILAKAN HUBUNGI ADMIN UNTUK PERSETUJUAN CEPAT.
        </p>
        
        <div className="space-y-4">
          <a
            href="https://wa.me/62882002152004?text=Halo%20Admin%20AHDAN,%20saya%20ingin%20meminta%20persetujuan%20untuk%20akun%20saya:%20"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-cartoon-blue border-4 border-cartoon-dark rounded-2xl font-black text-white shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-3"
          >
            HUBUNGI ADMIN (WA)
          </a>
          
          <button
            onClick={handleRefresh}
            disabled={isChecking}
            className="w-full py-4 bg-white border-4 border-cartoon-dark rounded-2xl font-black text-cartoon-dark shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isChecking ? 'MENGECEK...' : 'CEK STATUS / REFRESH'}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-cartoon-pink/20 border-2 border-cartoon-dark rounded-xl font-black text-cartoon-dark text-xs uppercase tracking-widest"
          >
            LOGOUT
          </button>
        </div>
        
        <p className="mt-8 text-[10px] font-black uppercase text-cartoon-dark/40 tracking-widest">
          &copy; 2026 AHDAN STUDIO
        </p>
      </motion.div>
    </div>
  );
};
