import React from 'react';
import { auth, googleProvider, signInWithPopup, db, doc, getDoc, setDoc, serverTimestamp } from '../firebase';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user profile with isApproved: false
        // Unless it's the admin email
        const isAdmin = user.email === 'aahdan298@gmail.com';
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isApproved: isAdmin,
          role: isAdmin ? 'admin' : 'user',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cartoon-yellow">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white border-4 border-cartoon-dark rounded-[2rem] p-8 shadow-cartoon-lg text-center"
      >
        <div className="w-20 h-20 bg-cartoon-blue border-4 border-cartoon-dark rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-cartoon">
          <span className="text-4xl font-black text-white italic">A</span>
        </div>
        <h1 className="text-3xl font-black text-cartoon-dark mb-2 uppercase italic tracking-tight">
          AFFILIATE <span className="text-cartoon-blue">GO</span>
        </h1>
        <p className="text-cartoon-dark/60 font-bold mb-8 uppercase text-sm tracking-widest">
          AI PRODUCT STUDIO BY AHDAN
        </p>
        
        <button
          onClick={handleLogin}
          className="w-full py-4 bg-white border-4 border-cartoon-dark rounded-2xl font-black text-cartoon-dark shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          MASUK DENGAN GOOGLE
        </button>
        
        <p className="mt-8 text-[10px] font-black uppercase text-cartoon-dark/40 tracking-widest">
          &copy; 2026 AHDAN STUDIO
        </p>
      </motion.div>
    </div>
  );
};
