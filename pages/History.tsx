
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { db, auth, collection, query, orderBy, onSnapshot } from '../firebase';
import { FeatureHeader } from '../components/FeatureHeader';
import { Spinner } from '../components/Spinner';
import { ZoomModal } from '../components/ZoomModal';
import { Download as DownloadIcon, Eye as ZoomIcon, TrashIcon, Clock, Image as ImageIcon } from '../components/icons/LucideIcons';
import { deleteDoc, doc } from 'firebase/firestore';

interface HistoryItem {
    id: string;
    imageUrl: string;
    type: string;
    timestamp: any;
    prompt?: string;
}

export const History: React.FC = () => {
    const { t } = useLanguage();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, `users/${auth.currentUser.uid}/history`),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: HistoryItem[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as HistoryItem);
            });
            setHistory(items);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching history:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (!auth.currentUser) return;
        if (!window.confirm(t('history.deleteConfirm') as string)) return;

        try {
            await deleteDoc(doc(db, `users/${auth.currentUser.uid}/history`, id));
        } catch (error) {
            console.error("Error deleting history item:", error);
        }
    };

    const handleDownload = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `go-history-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="w-full">
            <FeatureHeader
                title={t('history.title') as string}
                description={t('history.description') as string}
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Spinner className="w-12 h-12 text-cartoon-blue" />
                    <p className="mt-4 font-bold text-slate-500 animate-pulse uppercase tracking-widest text-xs">{t('history.loading')}</p>
                </div>
            ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-[3rem] border-4 border-cartoon-dark shadow-cartoon">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Clock className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-black text-cartoon-dark dark:text-white uppercase italic">{t('history.empty.title')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold">{t('history.empty.subtitle')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {history.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group bg-white dark:bg-gray-900 border-4 border-cartoon-dark rounded-3xl shadow-cartoon overflow-hidden flex flex-col"
                            >
                                <div className="relative aspect-[3/4] bg-slate-100 dark:bg-black/20 overflow-hidden border-b-4 border-cartoon-dark">
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.type} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => {
                                                setSelectedImage(item.imageUrl);
                                                setIsZoomModalOpen(true);
                                            }}
                                            className="p-3 bg-white text-cartoon-dark rounded-xl hover:bg-cartoon-yellow transition-colors shadow-cartoon"
                                        >
                                            <ZoomIcon className="w-6 h-6" />
                                        </button>
                                        <button 
                                            onClick={() => handleDownload(item.imageUrl)}
                                            className="p-3 bg-cartoon-blue text-white rounded-xl hover:bg-blue-600 transition-colors shadow-cartoon"
                                        >
                                            <DownloadIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="absolute top-3 left-3 px-3 py-1 bg-cartoon-yellow border-2 border-cartoon-dark rounded-full shadow-cartoon text-[10px] font-black uppercase italic">
                                        {item.type}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {formatDate(item.timestamp)}
                                        </p>
                                        {item.prompt && (
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                                                "{item.prompt}"
                                            </p>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border-2 border-red-200 transition-colors flex items-center justify-center gap-2 text-xs font-black uppercase"
                                    >
                                        <TrashIcon className="w-4 h-4" /> {t('history.deleteButton')}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <ZoomModal 
                isOpen={isZoomModalOpen}
                onClose={() => setIsZoomModalOpen(false)}
                imageUrl={selectedImage}
            />
        </div>
    );
};
