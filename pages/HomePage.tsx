
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { Clock, AlertTriangle, Image as ImageIcon, PenSquare, Wand2, ShieldCheck, ScanFace, Monitor, Smile, Users, Eraser } from '../components/icons/LucideIcons';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { MirrorIcon } from '../components/icons/MirrorIcon';

const RuleCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; }> = ({ icon, title, desc }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-3xl border-2 border-cartoon-dark shadow-cartoon-hover flex gap-5 items-start transition-all hover:translate-y-[-4px] hover:shadow-cartoon-lg">
        <div className="flex-shrink-0 w-12 h-12 bg-cartoon-yellow border-2 border-cartoon-dark rounded-2xl flex items-center justify-center text-cartoon-dark shadow-cartoon">
            {icon}
        </div>
        <div>
            <h3 className="font-black text-lg text-cartoon-dark dark:text-white uppercase italic">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mt-1 leading-relaxed">{desc}</p>
        </div>
    </div>
);


export const HomePage: React.FC = () => {
    const { t } = useLanguage();

    const rules = [
        { icon: <Clock className="w-6 h-6" />, title: t('homePage.rules.rule1.title'), desc: t('homePage.rules.rule1.desc') },
        { icon: <AlertTriangle className="w-6 h-6" />, title: t('homePage.rules.rule2.title'), desc: t('homePage.rules.rule2.desc') },
        { icon: <ImageIcon className="w-6 h-6" />, title: t('homePage.rules.rule3.title'), desc: t('homePage.rules.rule3.desc') },
        { icon: <PenSquare className="w-6 h-6" />, title: t('homePage.rules.rule4.title'), desc: t('homePage.rules.rule4.desc') },
        { icon: <Wand2 className="w-6 h-6" />, title: t('homePage.rules.rule5.title'), desc: t('homePage.rules.rule5.desc') },
        { icon: <ShieldCheck className="w-6 h-6" />, title: t('homePage.rules.rule6.title'), desc: t('homePage.rules.rule6.desc') },
    ];

    return (
        <div className="w-full space-y-10 pb-20">
            {/* Header / Intro */}
            <FeatureHeader
                title={t('homePage.title')}
                description={t('homePage.description')}
            />

            {/* Main Welcome Content integrated from Modal */}
            <div className="bg-white dark:bg-gray-900/50 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-4 border-cartoon-dark shadow-cartoon-lg flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-cartoon-blue border-4 border-cartoon-dark text-white rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 shadow-cartoon rotate-3">
                    <ShieldCheck className="w-8 h-8 md:w-10 md:h-10"/>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase text-center">WASSUP, CREATOR! 🔥</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-lg font-bold text-center">Dikit lagi kita gaskeun karyamu jadi makin goks!</p>

                <div className="mt-8 md:mt-12 w-full max-w-2xl bg-slate-50 dark:bg-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-4 border-cartoon-dark shadow-cartoon">
                    <h3 className="font-black text-slate-800 dark:text-white mb-4 md:mb-6 text-[10px] md:text-xs uppercase tracking-[0.2em] italic text-center sm:text-left">
                        ATURAN MAIN KITA:
                    </h3>
                    <ul className="space-y-4 md:space-y-6">
                        <li className="flex items-start gap-3 md:gap-4 text-xs md:text-base text-slate-600 dark:text-slate-300 font-bold">
                            <div className="mt-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-cartoon-blue rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            <span>Aplikasi ini bikinan <strong className="text-cartoon-blue uppercase italic">Ahdan</strong>. Jadi jangan diaku-akuin ya, hargain karya orang cuy!</span>
                        </li>
                        <li className="flex items-start gap-3 md:gap-4 text-xs md:text-base text-slate-600 dark:text-slate-300 font-bold">
                            <div className="mt-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-cartoon-blue rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            <span>Lu bebas pake buat bikin konten apa aja, asal jangan buat <strong className="text-slate-900 dark:text-white">hal-hal yang aneh</strong> atau negatif.</span>
                        </li>
                        <li className="flex items-start gap-3 md:gap-4 text-xs md:text-base text-slate-600 dark:text-slate-300 font-bold">
                            <div className="mt-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-cartoon-blue rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            <span>Gunakan aplikasi secara <strong className="text-slate-900 dark:text-white uppercase">Bijak & Humble</strong>, biar rejeki lu makin lancar jaya!</span>
                        </li>
                        <li className="flex items-start gap-3 md:gap-4 text-xs md:text-base text-red-600 dark:text-red-400 font-black uppercase italic bg-red-50 dark:bg-red-900/20 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-red-600 shadow-cartoon">
                            <div className="mt-1 w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full flex-shrink-0 shadow-[0_0_12px_rgba(220,38,38,0.8)] animate-pulse"></div>
                            <span>DILARANG KERAS MENGCOPY, MENGKLONING, ATAU MEMPERJUALBELIKAN APLIKASI INI TANPA IZIN! JANGAN MAIN-MAIN SAMA HUKUM, KITA PANTAU TERUS! ⚖️🔥</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Rules Grid */}
            <div className="space-y-8">
                <h2 className="text-2xl font-black text-center uppercase italic text-cartoon-dark dark:text-white tracking-wider">
                    {t('homePage.rules.title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rules.map((rule, index) => (
                        <RuleCard key={index} icon={rule.icon} title={rule.title} desc={rule.desc} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
