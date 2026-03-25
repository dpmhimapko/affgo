
import React from 'react';
import { FeatureHeader } from '../components/FeatureHeader';
import { ShieldCheck, ScanFace, Monitor, Smile, Users, Eraser, Sparkles } from '../components/icons/LucideIcons';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { MirrorIcon } from '../components/icons/MirrorIcon';

export const FeatureGuide: React.FC = () => {
    const features = [
        {
            title: "1. GO MODEL VIP",
            icon: <ShieldCheck className="w-6 h-6" />,
            color: "bg-cartoon-blue",
            desc: "Pindahkan produk fashionmu ke model profesional di studio eksklusif. Bisa atur gender, etnis, ekspresi, sampai aksesoris modelnya.",
            usage: "Upload foto produk -> Pilih Gender & Etnis -> Atur Pose & Ekspresi -> Klik 'Buat Foto'."
        },
        {
            title: "2. GO SELFIE VIP",
            icon: <ScanFace className="w-6 h-6" />,
            color: "bg-cartoon-pink",
            desc: "Bikin foto produk fashion seolah-olah lagi dipake model yang lagi selfie di depan cermin (Mirror Selfie). Sangat cocok buat konten OOTD.",
            usage: "Upload foto produk -> Pilih Lokasi (Kafe/Kamar) -> Pilih Gender -> Klik 'Cekrek Selfie'."
        },
        {
            title: "3. GO SETUP",
            icon: <Monitor className="w-6 h-6" />,
            color: "bg-cartoon-orange",
            desc: "Taruh produkmu di atas meja kerja/setup yang estetik. Bisa pilih warna setup (Pink, Blue, Dark, dll) dan ada model tangannya juga.",
            usage: "Upload foto produk -> Pilih Vibe Warna -> Pilih Jumlah Tangan -> Klik 'Buat Foto Setup'."
        },
        {
            title: "4. GO TRY ON",
            icon: <Smile className="w-6 h-6" />,
            color: "bg-cartoon-yellow",
            desc: "Fitur ajaib buat nyobain baju ke model AI. Kamu tinggal upload baju, AI yang bakal 'pakein' baju itu ke model secara natural.",
            usage: "Upload foto baju (Depan & Belakang) -> Pilih/Upload Model -> Klik 'Pasang Baju'."
        },
        {
            title: "5. GO KIDS",
            icon: <Smile className="w-6 h-6" />,
            color: "bg-emerald-400",
            desc: "Khusus buat produk fashion anak. AI bakal ngerender produkmu dipake sama model anak SD di studio yang ceria dan profesional.",
            usage: "Upload foto baju anak -> Pilih Gender Anak -> Pilih Pose -> Klik 'Generate'."
        },
        {
            title: "6. GO FAMILY",
            icon: <Users className="w-6 h-6" />,
            color: "bg-indigo-400",
            desc: "Bikin foto katalog keluarga lengkap (Ayah, Ibu, Anak) pake produkmu. Cocok banget buat jualan baju sarimbit atau seragam keluarga.",
            usage: "Upload foto produk (Ayah/Ibu/Anak) -> Pilih Formasi Keluarga -> Pilih Tema Studio -> Klik 'Generate'."
        },
        {
            title: "7. GO AESTHETIC",
            icon: <SparklesIcon className="w-6 h-6" />,
            color: "bg-rose-400",
            desc: "Ubah foto produk biasa jadi estetik di atas karpet bulu dengan dekorasi meja mini dan bayangan jendela yang cantik.",
            usage: "Upload foto produk -> Pilih Sudut Kamera (Angle) -> Klik 'Buat Foto Estetik'."
        },
        {
            title: "8. GO CERMIN",
            icon: <MirrorIcon className="w-6 h-6" />,
            color: "bg-sky-400",
            desc: "Hasilkan foto produk dengan efek pantulan cermin dan pencahayaan dramatis. Bikin produk kelihatan lebih mewah dan artistik.",
            usage: "Upload foto produk -> Klik 'Buat Foto Cermin'."
        },
        {
            title: "9. GO CLEAN",
            icon: <Eraser className="w-6 h-6" />,
            color: "bg-slate-400",
            desc: "Hapus orang atau background yang ganggu di fotomu secara otomatis. Hasilnya produk bakal bersih di atas latar putih (Clean Cut).",
            usage: "Upload foto -> Pilih Jenis Produk -> Klik 'Bersihkan Foto'."
        }
    ];

    return (
        <div className="w-full space-y-10 pb-20">
            <FeatureHeader
                title="PANDUAN FITUR & CARA PAKAI"
                description="Pelajari cara menggunakan setiap fitur ajaib di Affiliate Go untuk hasil visual terbaik."
            />

            <div className="grid grid-cols-1 gap-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] border-4 border-cartoon-dark shadow-cartoon overflow-hidden flex flex-col md:flex-row">
                        <div className={`${feature.color} p-8 flex items-center justify-center md:w-48 border-b-4 md:border-b-0 md:border-r-4 border-cartoon-dark`}>
                            <div className="bg-white p-4 rounded-2xl border-2 border-cartoon-dark shadow-cartoon rotate-3">
                                {React.cloneElement(feature.icon as React.ReactElement, { className: "w-10 h-10 text-cartoon-dark" })}
                            </div>
                        </div>
                        <div className="p-8 flex-1 space-y-4">
                            <div>
                                <h3 className="text-2xl font-black text-cartoon-dark dark:text-white italic uppercase tracking-tighter">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 leading-relaxed">{feature.desc}</p>
                            </div>
                            <div className="bg-cartoon-yellow/20 p-4 rounded-2xl border-2 border-cartoon-dark border-dashed">
                                <p className="text-xs font-black text-cartoon-dark uppercase tracking-widest mb-1">Cara Pakai:</p>
                                <p className="text-sm font-bold text-slate-700">{feature.usage}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeatureGuide;
