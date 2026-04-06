
type Translations = {
  [key: string]: string | Translations;
};

export const translations: Translations = {
  header: {
    subtitle: "Affiliate Go",
    about: "Tentang"
  },
  footer: {
    createdBy: "Dikembangkan oleh Ahdan"
  },
  sidebar: {
    home: "Beranda",
    history: "Riwayat",
    virtualTryOn: "Go TryOn",
    productStudio: "Go Product",
    goModel: "Go Model",
    goModelVip: "Go Model VIP",
    goModelVipV2: "Go Model VIP V2",
    goModelPremium: "Go Model PREMIUM",
    goModelPremiumV2: "Go Model PREMIUM V2",
    goDetail: "Go Detail",
    goSelfieVip: "Go Selfie VIP",
    goFashion: "Go Fashion",
    goBRoll: "Go B-Roll",
    povStudio: "Go POV Studio",
    listingStudio: "Go Listing",
    goPose: "Go Pose",
    goGenEditor: "Go Editor",
    goRestore: "Go Restore",
    goFusion: "Go Fusion",
    mergeProduct: "Go Merge",
    backgroundChanger: "Go Background",
    lifestylePhotoshoot: "Go Lifestyle",
    goCarousel: "Go Carousel",
    adCreator: "Go Poster",
    mockupGenerator: "Go Mockup",
    goPhotoshoot: "Go Photoshoot",
    goStoryboard: "Go Storyboard",
    goVoice: "Go Voice",
    motionPromptStudio: "Go Motion Prompt",
    videoStudio: "Studio Video",
    mirrorStudio: "Go Mirror",
    perspectiveStudio: "Go Perspective",
    digitalImaging: "Go Imaging",
    goAesthetic: "Go Aesthetic",
    goAestheticV2: "Go Aesthetic V2",
    goKids: "Go Kids",
    goCermin: "Go Cermin",
    goClean: "Go Clean",
    goFamily: "Go Family",
    goKamarAesthetic: "Go Kamar Aesthetic",
    goSofa: "Go Sofa",
    goSofaV2: "Go Sofa v2",
    goHanger: "Go Hanger",
    goHangerV2: "Go Hanger v2",
    goKain: "Go Kain",
    goSepatu: "Go Sepatu",
    goSepatuV2: "Go Sepatu v2",
    goSetup: "Go Setup",
    goSetupV2: "Go Setup v2",
    goSetupV3: "Go Setup v3",
    settings: "API Key",
  },
  settings: {
    title: "API Key",
    sidebar: "API Key",
    description: "Masukkan API Key Gemini Anda di sini. Key ini akan disimpan secara lokal di browser Anda dan digunakan untuk menjalankan fitur AI.",
    label: "Gemini API Key",
    placeholder: "Masukkan API Key (AIza...)",
    saveButton: "Simpan API Key",
    clearButton: "Hapus Key",
    expiryNotice: "⚠️ PENTING: API Key ini biasanya hanya aktif selama 1 JAM sejak dibuat. Jika sudah lewat 1 jam atau muncul error 'Quota Exceeded', segera ganti dengan API Key baru.\n\n💡 TIPS PRO:\n• Manfaatkan 1 jam ini semaksimal mungkin untuk generate konten sebanyak-banyaknya!\n• Jika limit habis sebelum 1 jam, segera ganti dengan API Key baru.\n• Jangan biarkan aplikasi menganggur, gaskeun terus mumpung Key masih aktif!",
    status: {
      saved: "API Key Tersimpan",
      cleared: "API Key Dihapus",
      missing: "API Key Belum Diatur",
      missingDesc: "Anda perlu mengatur Gemini API Key untuk menggunakan fitur AI.",
      warning: "Peringatan: API Key diperlukan untuk menjalankan aplikasi ini di Vercel atau hosting lainnya.",
      limitReached: "Limit API Key Tercapai",
      limitReachedDesc: "Kuota API Key Anda telah habis untuk saat ini. Silakan ganti dengan API Key lain atau coba lagi nanti.",
      invalid: "API Key Tidak Valid",
      invalidDesc: "API Key yang Anda masukkan tidak valid atau sudah tidak bisa digunakan. Silakan ganti dengan API Key yang baru."
    },
    help: {
      text: "Belum punya API Key?",
      link: "Tonton Video Tutorial"
    }
  },
  homePage: {
    title: "Selamat Datang di Affiliate Go!",
    description: "Studio AI All-in-One Anda untuk membuat visual yang menakjubkan. Sebelum mulai, harap perhatikan beberapa aturan main di bawah ini agar pengalaman Anda maksimal.",
    rules: {
      title: "Aturan Main & Tips Pro",
      rule1: {
        title: "Sabar Adalah Kunci",
        desc: "Proses AI butuh waktu. Beri jeda antar generasi untuk hasil terbaik dan hindari error. Jangan spam tombol 'Generate' ya!"
      },
      rule2: {
        title: "Pahami Batasan (Limit)",
        desc: "Every account has a usage limit. If you experience failures often, your quota might be exhausted. Try again later or use another account."
      },
      rule3: {
        title: "Kualitas Input = Kualitas Output",
        desc: "Gunakan foto dengan resolusi tinggi, pencahayaan baik, dan subjek yang jelas. Sampah masuk, sampah keluar!"
      },
      rule4: {
        title: "Jadilah Sutradara yang Jelas",
        desc: "Semakin deskriptif dan detail instruksi (prompt) Anda, semakin baik AI memahami keinginan Anda. Jelaskan gaya, suasana, dan objek yang diinginkan."
      },
      rule5: {
        title: "Eksperimen & Bersenang-senang",
        desc: "AI itu kreatif! Jika hasil pertama kurang pas, coba ubah sedikit prompt Anda. Kadang hasil tak terduga adalah yang terbaik."
      },
      rule6: {
        title: "Gunakan Secara Bertanggung Jawab",
        desc: "Dilarang membuat konten yang melanggar hukum, SARA, atau tidak pantas. Mari kita jaga lingkungan kreatif yang positif."
      }
    }
  },
  about: {
    title: "Tentang Affiliate Go",
    description: "Aplikasi ini menggunakan teknologi Google Gemini AI terbaru untuk membantu UMKM dan konten kreator membuat aset visual berkualitas tinggi dengan mudah, cepat, dan hemat biaya.",
    techStack: "Tentang",
    geminiModels: "Model Gemini yang Digunakan",
    geminiFlashImage: "Otak di balik pengeditan dan pembuatan gambar.",
    geminiFlash: "Otak untuk membuat teks iklan dan ide kreatif.",
    geminiVeo: "Teknologi untuk membuat video dari gambar.",
    productStudio: "Ubah foto produk biasa jadi foto studio profesional dengan berbagai tema estetik.",
    virtualTryOn: "Cobain baju ke model AI atau fotomu sendiri tanpa perlu ganti baju beneran.",
    lifestylePhotoshoot: "Masukin produk ke situasi nyata (misal: di kafe, di taman) biar lebih hidup.",
    mergeProduct: "Gabungin beberapa gambar jadi satu frame yang rapi. Cocok buat bikin paket bundling atau koleksi.",
    poseStudio: "Ubah gaya pose model di fotomu jadi macem-macem gaya baru biar nggak bosenin.",
    adCreator: "Bikin desain poster iklan otomatis lengkap dengan teks promosi yang menarik.",
    imageEditor: "Edit bagian foto yang nggak dimau, hapus objek, atau ganti detail foto sesuka hati.",
    digitalImaging: "Bikin foto produk yang artistik and unik, kayak editan profesional.",
    videoStudio: "Hidupkan foto produk yang diam jadi video gerak singkat yang estetik.",
    povStudio: "Bikin foto seolah-olah produk lagi dipegang tangan kamu (POV), cocok buat review.",
    mirrorStudio: "Bikin foto gaya selfie di depan cermin buat produk fashion atau casing HP.",
    listingStudio: "Bikin gambar info produk (infografis) yang jelas buat ditaruh di marketplace.",
    perspectiveStudio: "Samakan gaya foto produk dari depan, samping, dan belakang biar seragam.",
    backgroundChanger: "Hapus dan ganti background foto produkmu dengan pemandangan lain secara instan.",
    goStoryboard: "Visualisasikan ide ceritamu jadi gambar panel (storyboard) sebelum bikin video.",
    goVideo: "Ubah ide tulisan atau gambar jadi video sinematik keren.",
    mockupGenerator: "Tempel desain logomu ke berbagai produk (kaos, mug, dll) secara instan.",
    magicPhotoshoot: "Ubah foto biasa jadi potret studio kelas atas dengan nuansa Korea atau Cinematic.",
    goBRoll: "Unggah 1 gambar produk, tambahkan model (opsional), dan biarkan AI membuat6 pose foto profesional.",
    developedBy: "Ahdan",
    closeButton: "Tutup"
  },
  sections: {
    upload: {
      title: "1. Unggah Gambar",
      subtitle: "Pilih foto terbaikmu yang jelas dan terang."
    },
    style: {
      title: "2. Pilih Gaya",
      subtitle: "Mau dibuat seperti apa fotonya? Pilih di sini."
    },
    tools: {
      title: "2. Pilih Alat",
      subtitle: "Pilih alat ajaib untuk mengedit fotomu.",
      options: {
        title: "3. Pengaturan",
        subtitle: "Sesuaikan detailnya biar makin pas."
      }
    }
  },
  uploader: {
    productLabel: "Unggah Foto Produk",
    imageLabel: "Unggah Gambar",
    modelLabel: "Unggah Foto Model",
    referenceLabel: "Unggah Contoh Gaya (Referensi)",
    styleReferenceLabel: "Unggah Referensi Gaya",
    backgroundLabel: "Unggah Background Baru",
    designLabel: "Unggah Desain/Logo",
    mockupLabel: "Unggah Mockup Polos",
    fileTypes: "Format: PNG, JPG, WEBP (Maks 10MB)"
  },
  options: {
    smart: {
      title: "Otomatis Cerdas",
      description: "Biarkan AI yang mikir dan pilihin gaya terbaik buat produkmu."
    },
    customize: {
      theme: {
        label: "Pilih Tema",
        other: "Tulis Sendiri..."
      },
      customTheme: {
        label: "Tema Kustom",
        placeholder: "cth., 'Di atas meja kayu dengan sinar matahari pagi'"
      },
      props: {
        label: "Tambah Properti (Opsional)",
        placeholder: "cth., 'ada bunga kering dan biji kopi'"
      }
    },
    reference: {
      description: "Punya contoh foto bagus? Unggah di sini, AI akan meniru gayanya."
    },
    shared: {
      instructions: {
        label: "Catatan Tambahan (Opsional)",
        placeholderCustomize: "cth., 'Pastikan produk terlihat terang dan jelas'",
        placeholderReference: "cth., 'Ikuti pencahayaan dari foto contoh ini'"
      }
    },
    enhanceButton: "Mulai Sulap Foto"
  },
  results: {
    title: "3. Hasil Foto",
    titleEditor: "4. Hasil Edit",
    description: "Tadaa! Ini dia hasil foto barumu.",
    descriptionEditor: "Ini hasil editan fotomu.",
    loading: {
      title: "Sedang menyulap foto...",
      titleEditor: "Sedang mengedit...",
      subtitle: "Tunggu sebentar ya, AI lagi bekerja buat kamu."
    },
    error: {
      title: "Yah, Gagal...",
      button: "Coba Lagi Yuk"
    },
    placeholder: "Hasil foto nanti muncul di sini.",
    imageAlt: "Foto hasil generasi AI",
    variantLabel: "Pilihan",
    downloadButton: "Simpan Gambar",
    resetButton: "Ulangi Lagi"
  },
  errors: {
    noProductImage: "Jangan lupa upload foto produknya dulu ya.",
    noImage: "Upload gambarnya dulu dong.",
    noReferenceImage: "Kamu perlu upload foto contoh (referensi) buat mode ini."
  },
  themes: {
    cleanStudio: "Studio Bersih (Latar Putih)",
    dramaticMoody: "Dramatis & Elegan (Latar Gelap)",
    naturalOrganic: "Nuansa Alam & Organik",
    vibrantPlayful: "Ceria & Warna-warni",
    modernSleek: "Modern & Kekinian",
    softDreamy: "Lembut & Estetik",
    industrialRugged: "Gaya Industrial",
    vintageNostalgic: "Vintage / Jadul",
    luxeElegant: "Mewah & Mahal",
    minimalistZen: "Tenang & Minimalis",
    cosmicFuturistic: "Masa Depan & Neon",
    cozyRustic: "Nyaman & Homey",
    tropicalParadise: "Suasana Liburan Tropis",
    aquaticFreshness: "Segar & Berair",
    urbanStreet: "Gaya Jalanan Kota",
    holidayCheer: "Suasana Liburan / Natal",
  },
  perspectiveStudio: {
    page: {
      title: "Go Perspective",
      description: "Punya foto produk dari depan, samping, and belakang? Upload semua di sini, AI akan bikin background mereka seragam dan estetik."
    },
    sections: {
      upload: {
        title: "1. Unggah Sisi Produk",
        subtitle: "Minimal upload 1 sisi, tapi lebih banyak lebih bagus."
      },
      style: {
        title: "2. Pilih Gaya",
        subtitle: "Mau background seperti apa untuk semua foto ini?"
      }
    },
    labels: {
      front: "Tampak Depan",
      back: "Tampak Belakang",
      side: "Tampak Samping",
      top: "Tampak Atas/Detail"
    },
    generateButton: "✨ Seragamkan Background",
    errors: {
      noImages: "Upload minimal satu sisi foto produk ya."
    }
  },
  povStudio: {
    page: {
      title: "Go POV Studio",
      description: "Bikin foto seolah-olah produk lagi dipegang tangan kamu (POV), cocok buat review."
    },
    sections: {
      upload: {
        title: "1. Unggah Produk",
        subtitle: "Foto produknya aja, tanpa tangan."
      },
      configure: {
        title: "2. Atur Gaya",
        subtitle: "Pilih tangan siapa dan mau di mana fotonya."
      }
    },
    handStyle: {
      label: "Model Tangan",
      auto: "Otomatis",
      female: "Tangan Perempuan",
      male: "Tangan Laki-laki",
      sweater: "Pakai Sweater"
    },
    background: {
      modeLabel: "Background",
      preset: "Pilih Tema",
      custom: "Upload Sendiri",
      themeLabel: "Mau suasana apa?"
    },
    themes: {
      cozyBedroom: "Di Kamar Nyaman",
      aestheticDesk: "Di Meja Kerja Estetik",
      softMinimalist: "Dinding Polos Minimalis",
      cafeVibes: "Nongkrong di Kafe",
      urbanOutdoor: "Jalanan Kota",
      natureWalk: "Jalan-jalan di Alam",
      bathroomSelfie: "Di Depan Caca Wastafel",
    },
    generateButton: "✨ Buat Foto POV",
    errors: {
      noBackground: "Jangan lupa upload backgroundnya ya."
    }
  },
  backgroundChanger: {
    page: {
      title: "Go Background",
      description: "Hapus dan ganti background foto produkmu dengan pemandangan lain secara instan."
    },
    tabs: {
      change: "Ubah Background",
      remove: "Remove Background"
    },
    sections: {
      upload: {
        title: "1. Unggah Produk",
        subtitle: "Pilih foto produk yang mau diganti backgroundnya."
      },
      method: {
        title: "2. Pilih Background",
        subtitle: "Mau upload gambar sendiri atau dibuatin AI?"
      },
      remove: {
        title: "2. Hapus Latar",
        subtitle: "AI akan memisahkan objek dari latar belakang."
      }
    },
    modes: {
      upload: "Upload Sendiri",
      generate: "Dibuatin AI"
    },
    form: {
      prompt: {
        label: "Mau Background Apa?",
        placeholder: "cth., 'Di atas meja marmer putih', 'Di pasir pantai bali'"
      },
      instructions: {
        label: "Catatan Tambahan (Opsional)",
        placeholder: "cth., 'Bikin bayangannya lebih natural', 'Cahayanya dari kiri'"
      }
    },
    generateButton: "✨ Ganti Background",
    removeButton: "✂️ Hapus Background",
    errors: {
      noProduct: "Upload foto produknya dulu ya.",
      noBackground: "Upload foto background penggantinya dong.",
      noPrompt: "Tulis dulu mau background kayak gimana."
    }
  },
  mirrorStudio: {
    page: {
      title: "Go Mirror",
      description: "Bikin foto gaya selfie di depan cermin buat produk fashion atau casing HP."
    },
    sections: {
      upload: {
        title: "1. Unggah Produk",
        subtitle: "Produk apa yang mau dipamerin? (Casing HP, Tas, Baju)"
      },
      configure: {
        title: "2. Atur Model & Lokasi",
        subtitle: "Pilih siapa modelnya dan di mana fotonya."
      }
    },
    options: {
      modelSourceLabel: "Modelnya Dari Mana?",
      generate: "Bikin Model AI",
      upload: "Upload Foto Sendiri",
      uploadModelLabel: "Unggah Foto Model",
      genderLabel: "Gender Model",
      ethnicityLabel: "Wajah Model (Etnis)",
      ethnicityPlaceholder: "cth., Indonesia, Asia, Bule",
      frameLabel: "Jarak Foto",
      themeLabel: "Lokasi Cermin",
      female: "Cewek",
      male: "Cowok"
    },
    themes: {
      elevatorSelfie: "Cermin Lift",
      gymMirror: "Cermin Gym",
      bathroomAesthetic: "Kamar Mandi Estetik",
      bedroomOotd: "Cermin Kamar Tidur",
      fittingRoom: "Kamar Ganti Mall",
      streetReflection: "Kaca Jendela Toko"
    },
    frames: {
      halfBody: "Setengah Badan",
      fullBody: "Seluruh Badan",
      closeUp: "Close Up (Fokus HP/Tangan)"
    },
    generateButton: "✨ Cekrek Selfie",
    errors: {
      noModel: "Upload foto orangnya dulu ya."
    }
  },
  listingStudio: {
    page: {
      title: "Go Listing",
      description: "Bikin gambar info produk (infografis) yang jelas buat ditaruh di marketplace."
    },
    sections: {
      upload: {
        title: "1. Unggah Produk",
        subtitle: "Pilih foto produk utamamu."
      },
      features: {
        title: "2. Fitur Unggulan",
        subtitle: "Apa kelebihan produkmu? Tulis 3-5 poin."
      },
      style: {
        title: "3. Desain Tampilan",
        subtitle: "Pilih gaya desain yang cocok sama brandmu."
      }
    },
    form: {
      addFeature: "Tambah Poin",
      featurePlaceholder: "cth. 'Anti Air', 'Baterai Awet'",
      styleLabel: "Pilih Gaya Desain"
    },
    styles: {
      minimalistWhite: "Putih Bersih (Minimalis)",
      techSpecs: "Teknologi (Gelap & Neon)",
      ecoOrganic: "Natural (Warna Bumi)",
      boldSale: "Promo (Tegas & Mencolok)",
      luxuryElegant: "Mewah (Elegan)"
    },
    generateButton: "✨ Buat Gambar Listing",
    errors: {
      minFeatures: "Tulis minimal 1 kelebihan produkmu ya."
    }
  },
  productStudio: {
    page: {
      title: "Go Product",
      description: "Ubah foto produk biasa jadi foto studio profesional dengan berbagai tema estetik."
    },
    steps: {
        upload: "1. Unggah Foto",
        lighting: "2. Pencahayaan",
        mood: "3. Suasana",
        ratio: "4. Ukuran Foto",
        location: "5. Lokasi",
    },
    options: {
        light: "Terang",
        dark: "Gelap",
        clean: "Bersih",
        crowd: "Ramai",
        indoor: "Dalam Ruangan",
        outdoor: "Luar Ruangan"
    },
    generateButton: "Buat Foto Studio",
    generatingConcepts: "Mencari ide konsep...",
    visualizing: "Memvisualisasikan...",
    resultsTitle: "4 Variasi Foto Studio"
  },
  mergeProduct: {
    page: {
      title: "Go Merge",
      description: "Gabungin beberapa gambar jadi satu frame yang rapi. Cocok buat bikin paket bundling atau koleksi."
    },
    sections: {
      uploadProducts: {
        title: "1. Unggah Gambar",
        subtitle: "Minimal 2 gambar yang mau digabungin.",
        addProduct: "Tambah Gambar Lain"
      }
    },
    errors: {
      atLeastTwo: "Minimal harus ada 2 gambar buat digabungin."
    }
  },
  digitalImaging: {
    page: {
      title: "Go Imaging",
      description: "Bikin foto produk yang artistik dan unik, kayak editan profesional."
    },
    modes: {
      customize: "Atur Sendiri",
      generateConcept: "Minta Ide AI"
    },
    sections: {
      style: {
        title: "3. Atur Gaya",
        subtitle: "Pilih tema seni yang kamu suka."
      },
      concept: {
        title: "2. Pilih Cara",
        subtitle: "Mau atur sendiri atau biarkan AI kasih ide kreatif?"
      }
    },
    conceptGenerator: {
      title: "3. Cari Ide Kreatif",
      subtitle: "Biarkan AI melihat produkmu and kasih saran konsep yang keren.",
      button: "✨ Cari Ide Konsep",
      loading: "Lagi mikirin ide-ide liar...",
      resultsTitle: "4. Pilih Concept",
      resultsSubtitle: "Pilih salah satu ide di bawah ini buat digenerate.",
      generateImageButton: "Pilih & Buat"
    },
    generateButton: "✨ Buat Karya Seni",
    errors: {
      conceptError: "Gagal cari ide nih. Coba lagi ya."
    },
    themes: {
      miniatureWorld: "Dunia Miniatur (Kecil)",
      natureFusion: "Menatu dengan Alam",
      surrealFloating: "Melayang & Ajaib",
      cyberneticGlow: "Cyberpunk & Neon",
      watercolorSplash: "Percikan Cat Air",
      papercraftArt: "Kerajinan Kertas",
      galaxyInfused: "Luar Espaço",
      architecturalIllusion: "Ilusi Bangunan"
    }
  },
  virtualTryOn: {
    page: {
      title: "Go TryOn",
      description: "Cobain baju ke model AI atau fotomu sendiri tanpa perlu ganti baju beneran."
    },
    sections: {
      uploadProduct: {
        title: "1. Unggah Baju",
        subtitle: "Lengkapi slot tampak depan dan belakang untuk hasil 360° maksimal.",
        addProduct: "Tambah Baju"
      },
      provideModel: {
        title: "2. Siapkan Model",
        subtitle: "Mau pakai foto sendiri atau model buatan AI?"
      }
    },
    labels: {
        front: "Tampak Depan",
        back: "Tampak Belakang"
    },
    modelOptions: {
      upload: "Foto Sendiri",
      generate: "Buat Model AI",
      gender: "Gender",
      female: "Cewek",
      male: "Cowok",
      other: "Lainnya",
      ethnicity: "Wajah (Etnis)",
      aspectRatio: "Ukuran Foto",
      ethnicities: {
        caucasian: "Bule (Eropa)",
        asian: "Asia",
        african: "Afrika",
        hispanic: "Latin",
        middleEastern: "Timur Tengah",
        other: "Lainnya"
      },
      details: "Detail Tambahan",
      detailsPlaceholder: "cth., 'rambut panjang, tersenyum, pakai kacamata'",
      customEthnicity: {
        label: "Etnis Khusus",
        placeholder: "cth., 'Jawa', 'Sunda', 'Korea'"
      }
    },
    errors: {
      noProducts: "Upload foto bajunya dulu ya.",
      noFrontImage: "Upload foto tampak depan baju dulu ya (slot utama).",
      noModel: "Upload foto modelnya (orangnya) dulu."
    },
    generateButton: "✨ Pasang Baju"
  },
  lifestylePhotoshoot: {
    page: {
      title: "Go Lifestyle",
      description: "Masukin produk ke situasi nyata (misal: di kafe, di taman) biar lebih hidup."
    },
    sections: {
      uploadProduct: {
        title: "1. Unggah Produk",
        subtitle: "Produk apa yang mau difoto?"
      },
      provideModel: {
        title: "2. Model",
        subtitle: "Siapa yang pakai? Upload foto atau buat model AI."
      },
      direct: {
        title: "3. Arahan Gaya",
        subtitle: "Ceritain adegan apa yang kamu mau."
      }
    },
    form: {
      interaction: {
        label: "Deskripsi Adegan",
        placeholder: "cth., 'Wanita sedang duduk santai di sofa sambil memegang botol skincare, tersenyum rileks, cahaya matahari pagi masuk dari jendela.'"
      }
    },
    generateButton: "✨ Buat Foto Lifestyle",
    errors: {
      noProduct: "Produknya belum diupload.",
      noModel: "Modelnya belum ada."
    }
  },
  poseStudio: {
    page: {
        title: "Go Pose",
        description: "Ubah gaya pose model di fotomu jadi macem-macem gaya baru biar nggak bosenin."
    },
    sections: {
        uploadModel: {
            title: "1. Unggah Foto",
            subtitle: "Foto model yang sedang pakai produk."
        },
        chooseStyle: {
            title: "2. Pilih Pose Baru",
            subtitle: "Mau diganti jadi gaya apa?"
        }
    },
    modes: {
      smart: { 
        title: "Otomatis",
        description: "Biarkan AI yang pilihin pose-pose keren buat kamu."
       },
      customize: { title: "Atur Sendiri" }
    },
    form: {
        theme: { label: "Tema Foto" },
        angle: { label: "Sudut Kamera" },
        framing: { label: "Jarak Foto" },
        instructions: {
            label: "Catatan (Opsional)",
            placeholder: "cth., 'Bikin modelnya terlihat lebih bahagia'"
        }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Dari Atas",
      lowAngle: "Dari Bawah"
    },
    frames: {
      fullBody: "Seluruh Badan",
      mediumShot: "Setengah Badan",
      cowboyShot: "Sampai Lutut",
      closeup: "Close-up Wajah"
    },
    generateButton: "✨ Ganti Pose",
    errors: {
        noModelImage: "Upload foto modelnya dulu dong."
    }
  },
  adCreator: {
    page: {
      title: "Go Poster",
      description: "Bikin desain poster iklan otomatis lengkap dengan teks promosi yang menarik."
    },
    sections: {
      addCopy: {
        title: "2. Isi Teks Iklan",
        subtitle: "Apa yang mau ditulis di poster?"
      }
    },
    form: {
      headline: {
        label: "Judul Besar",
        placeholder: "cth., 'Diskon Spesial Hari Ini!'"
      },
      description: {
        label: "Tulisan Kecil / Deskripsi",
        placeholder: "cth., 'Beli 1 Gratis 1 khusus member.'"
      },
      cta: {
        label: "Tombol / Ajakan (Call to Action)",
        placeholder: "cth., 'Beli Sekarang'"
      },
      reference: {
        label: "Contoh Desain (Opsional)",
        description: "Punya contoh poster yang disuka? Upload biar AI niru gayanya."
      },
      instructions: {
        label: "Catatan Desain (Opsional)",
        placeholder: "cth., 'Bikin warnanya dominan merah dan emas.'"
      }
    },
    generateButton: "✨ Desain Poster",
    errors: {
      noProductImage: "Upload produknya dulu ya.",
      noHeadline: "Judul iklannya belum diisi."
    },
    copywriter: {
      button: "✨ Bantu Bikin Kata-kata",
      modalTitle: "Asisten Penulis AI",
      productNameLabel: "Nama Produk",
      productNamePlaceholder: "cth., 'Sepatu Lari Kencang'",
      keywordsLabel: "Kata Kunci / Fitur",
      keywordsPlaceholder: "cth., 'ringan, empuk, diskon'",
      generateButton: "Cari Ide",
      useButton: "Pakai Ini",
      loading: "Lagi mikirin kata-kata jualan...",
      suggestionsFor: {
        headline: "Ide Judul",
        description: "Ide Deskripsi",
        cta: "Ide Tombol Ajakan"
      },
      error: "Gagal cari ide. Coba lagi ya."
    }
  },
  imageEditor: {
    page: {
      title: "Go Editor",
      description: "Edit bagian foto yang nggak dimau, hapus objek, atau ganti detail foto sesuka hati."
    },
    tools: {
      resize: {
        title: "Ubah Ukuran (Resize)",
        description: "Ubah ukuran foto jadi kotak, portrait, atau landscape tanpa bikin gepeng (AI akan nambahin backgroundnya).",
        label: "Pilih Ukuran Baru",
        ar_1_1: "1:1 (Kotak)",
        ar_4_3: "4:3",
        ar_3_4: "3:4",
        ar_16_9: "16:9 (Youtube)",
        ar_9_16: "9:16 (Story/Reels)",
        ar_3_2: "3:2",
        ar_2_3: "2:3"
      },
      goBrush: {
        title: "Kuas Ajaib (Go Brush)",
        description: "Warnai area yang mau diedit, terus suruh AI ngapain aja.",
        promptLabel: "Perintah Edit",
        promptPlaceholder: "cth., 'hapus orang ini', 'ganti jadi vas bunga', 'ganti warna baju jadi merah'",
        brushSize: "Ukuran Kuas",
        undo: "Batal",
        clear: "Hapus Semua"
      }
    },
    generateButton: "✨ Jalankan Perintah",
    errors: {
      noMask: "Warnai dulu bagian foto yang mau diedit pakai kuas.",
      noPrompt: "Tulis perintahnya dulu, mau diapain bagian itu?"
    }
  },
  videoStudio: {
    page: {
      title: "Studio Video",
      description: "Hidupkan foto produk yang diam jadi video gerak singkat yang estetik."
    },
    sections: {
      upload: {
        title: "1. Unggah Gambar",
        subtitle: "Pilih foto yang mau digerakkan."
      },
      prompt: {
        title: "2. Mau Gerak Kayak Gimana?",
        subtitle: "Ceritain gerakannya."
      }
    },
    form: {
      prompt: {
        label: "Deskripsi Gerakan",
        placeholder: "cth., 'Kamera zoom in perlahan ke produk, ada asap tipis mengepul, cahaya berkilauan.'"
      },
      goPrompt: {
        label: "Bantu Bikin Deskripsi",
        loading: "Mikirin..."
      }
    },
    generateButton: "✨ Bikin Video",
    loading: {
      title: "Lagi syuting video...",
      messages: "[\"Sabar ya, bikin video emang butuh waktu...\",\"Lagi ngatur kamera dan pencahayaan...\",\"Render frame demi frame biar halus...\",\"Dikit lagi jadi kok, hasilnya bakal keren!\"]"
    },
    results: {
      title: "3. Hasil Video",
      description: "Videomu sudah jadi! Bisa langsung diputar atau didownload.",
      downloadButton: "Simpan Video",
      placeholder: "Video hasil karyamu bakal muncul di sini."
    },
    errors: {
      noPrompt: "Tulis dulu deskripsi gerakannya.",
      noImage: "Upload gambarnya dulu."
    },
    quotaWarning: "Info: Fitur Video ini adalah BONUS ujicoba. Google membatasi kuota pembuatan video (sekitar 10 video per akun). Kalau gagal, mungkin kuotanya habis."
  },
  notes: {
    staticWarning: "Demo: Hasil tidak disimpan di server. Langsung download ya kalau sudah jadi.",
    navigationWarning: "JANGAN tutup atau pindah halaman ini selagi proses berjalan, nanti gagal."
  },
  mockupGenerator: {
    page: {
        title: "Go Mockup",
        description: "Tempel desain logomu ke berbagai produk (kaos, mug, dll) secara instan."
    },
    sections: {
        uploadDesign: {
            title: "1. Unggah Desain",
            subtitle: "Logo atau gambar yang mau ditempel."
        },
        chooseMockup: {
            title: "2. Pilih Mockup",
            subtitle: "Pilih jenis barang atau upload foto barang sendiri."
        }
    },
    presets: {
        tshirt: "Kaos Putih",
        mug: "Mug Keramik",
        totebag: "Tote Bag Kanvas",
        hoodie: "Hoodie Hitam",
        box: "Box Kemasan"
    },
    tabs: {
        presets: "Pilih dari Daftar",
        upload: "Upload Mockup Sendiri"
    },
    generateButton: "✨ Pasang Mockup",
    errors: {
        noDesign: "Upload desainnya dulu ya.",
        noMockup: "Pilih mockup dari daftar atau upload foto barangnya sendiri."
    }
  },
  magicPhotoshoot: {
    page: {
        title: "Go Photoshoot",
        description: "Ubah foto biasa jadi potret studio kelas atas dengan nuansa Korea atau Cinematic."
    },
    sections: {
        upload: {
            title: "1. Unggah Foto Sumber",
            subtitle: "Direkomendasikan foto resolusi tinggi."
        },
        theme: {
            title: "2. Tema Khusus (Opsional)",
            subtitle: "Tambahkan nuansa khusus jika diinginkan."
        }
    },
    form: {
        customTheme: {
            placeholder: "Contoh: Nuansa neon city malam hari, atau elegan di perpustakaan tua..."
        }
    },
    generateButton: "Buat 6 Foto Studio",
    errors: {
        noImage: "Harap unggah gambar terlebih dahulu."
    }
  },
  goSepatu: {
    page: {
      title: "Go Sepatu",
      description: "Buat foto katalog sepatu atau sandal dengan gaya lifestyle yang natural, menampilkan produk saat dipakai dan dipegang secara bersamaan."
    },
    sections: {
      angle: {
        title: "Sudut Kamera",
        description: "Pilih sudut pengambilan foto untuk produk Anda."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Top View / Semi-Top View",
      closeUp: "Close Up",
      detail: "Detail Hiasan",
      dutchAngle: "Miring (Dutch Angle)"
    },
    generateButton: "✨ Buat Foto Go Sepatu",
    errors: {
      noImage: "Silakan unggah foto produk terlebih dahulu."
    }
  },
  goSepatuV2: {
    page: {
      title: "Go Sepatu v2",
      description: "Buat foto katalog sepatu atau sandal dengan gaya 'mencoba produk' di atas lantai abu-abu yang elegan."
    },
    sections: {
      angle: {
        title: "Sudut Kamera",
        description: "Pilih sudut pengambilan foto untuk produk Anda."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Top View (Dari Atas)",
      closeUp: "Close Up",
      detail: "Detail Tekstur",
      dutchAngle: "Miring (Dutch Angle)"
    },
    generateButton: "✨ Buat Foto Go Sepatu v2",
    errors: {
      noImage: "Silakan unggah foto produk terlebih dahulu."
    }
  },
  goKain: {
    page: {
      title: "Go Kain",
      description: "Buat foto flatlay estetik dengan produk di atas kain terang, lengkap dengan properti kacamata, majalah, dan laptop."
    },
    sections: {
      angle: {
        title: "Sudut Kamera",
        description: "Pilih sudut pengambilan foto untuk produk Anda."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Top View (Flatlay)",
      closeUp: "Close Up",
      detail: "Detail Tekstur",
      dutchAngle: "Miring (Dutch Angle)"
    },
    generateButton: "✨ Buat Foto Go Kain",
    errors: {
      noImage: "Silakan unggah foto produk terlebih dahulu."
    }
  },
  goHangerV2: {
    page: {
      title: "Go Hanger v2",
      description: "Buat foto katalog produk yang digantung simetris di rak besi hitam minimalis dengan latar belakang clean dan modern."
    },
    sections: {
      angle: {
        title: "Sudut Kamera",
        description: "Pilih sudut pengambilan foto untuk produk Anda."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Top View",
      closeUp: "Close Up",
      detail: "Detail Bahan",
      dutchAngle: "Miring (Dutch Angle)"
    },
    generateButton: "✨ Buat Foto Go Hanger v2",
    errors: {
      noImage: "Silakan unggah foto produk terlebih dahulu."
    }
  },
  goHanger: {
    page: {
      title: "Go Hanger",
      description: "Buat foto katalog produk yang digantung di rak besi dengan sentuhan interaktif tangan yang memegang lengan pakaian."
    },
    sections: {
      angle: {
        title: "Sudut Kamera",
        description: "Pilih sudut pengambilan foto untuk produk Anda."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Top View",
      closeUp: "Close Up",
      detail: "Detail Bahan",
      dutchAngle: "Miring (Dutch Angle)"
    },
    generateButton: "✨ Buat Foto Go Hanger",
    errors: {
      noImage: "Silakan unggah foto produk terlebih dahulu."
    }
  },
  goSofaV2: {
    page: {
      title: "Go Sofa v2",
      description: "Buat foto katalog produk yang diletakkan rapi di atas sofa terang menggunakan hanger, lengkap dengan properti majalah fashion yang artistik."
    },
    sections: {
      angle: {
        title: "Sudut Kamera",
        description: "Pilih sudut pengambilan foto untuk produk Anda."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Top View / Semi-Top View",
      closeUp: "Close Up",
      detail: "Detail Tekstur",
      dutchAngle: "Miring (Dutch Angle)"
    },
    generateButton: "✨ Buat Foto Go Sofa v2",
    errors: {
      noImage: "Silakan unggah foto produk terlebih dahulu."
    }
  },
  goSofa: {
    page: {
      title: "Go Sofa",
      description: "Hasilkan foto katalog produk yang cozy dengan setting sofa linen beige yang hangat, lengkap dengan properti fashion yang artistik."
    },
    sections: {
      angle: {
        title: "Sudut Kamera",
        description: "Pilih sudut pengambilan foto untuk produk Anda."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Flatlay / Semi-Top View",
      closeUp: "Close Up",
      detail: "Detail Tekstur",
      dutchAngle: "Miring (Dutch Angle)"
    },
    generateButton: "✨ Buat Foto Go Sofa",
    errors: {
      noImage: "Silakan unggah foto produk terlebih dahulu."
    }
  },
  goKamarAesthetic: {
    page: {
      title: "Go Kamar Aesthetic",
      description: "Ubah foto produkmu menjadi foto katalog estetik dengan setting kamar minimalis yang modern dan pencahayaan alami yang menawan."
    },
    sections: {
      angle: {
        title: "Sudut Kamera",
        description: "Pilih sudut pengambilan foto untuk produk Anda."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Dari Atas (Flat Lay)",
      closeUp: "Close Up",
      detail: "Detail Tekstur",
      dutchAngle: "Miring (Dutch Angle)"
    },
    generateButton: "✨ Buat Foto Kamar Estetik",
    errors: {
      noImage: "Silakan unggah foto produk terlebih dahulu."
    }
  },
  goAesthetic: {
    page: {
      title: "Go Aesthetic",
      description: "Secara ajaib memindahkan produk Anda ke atas karpet bulu abu-abu dengan dekorasi meja mini, menara Eiffel, dan bayangan jendela yang estetik."
    },
    errors: {
      noImage: "Harap unggah gambar produk terlebih dahulu."
    },
    generateButton: "Buat 4 Foto Estetik",
    sections: {
      angle: {
        title: "Angle Kamera",
        description: "Pilih sudut pengambilan gambar."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      highAngle: "Dari Atas",
      closeUp: "Close Up",
      detail: "Detail Produk",
      dutchAngle: "Dutch Angle"
    }
  },
  goAestheticV2: {
    page: {
      title: "Go Aesthetic V2 (Review)",
      description: "Produk Anda dipegang tangan reviewer di studio estetik Karpet Bulu & Teal LED. Sempurna untuk review produk."
    },
    sections: {
      hand: {
        title: "Model Tangan",
        description: "Pilih siapa yang memegang produk."
      }
    },
    hands: {
      auto: "Otomatis",
      female: "Wanita",
      male: "Pria"
    }
  },
  goSetup: {
    page: {
      title: "Go Setup",
      description: "Pindahkan produk Anda ke atas meja setup yang estetik. Pilih vibe warna, jumlah tangan, dan gender model sesuai keinginan Anda."
    },
    sections: {
      vibe: {
        title: "Pilih Vibe Warna",
        description: "Sesuaikan suasana warna setup dengan produkmu."
      },
      handCount: {
        title: "Jumlah Tangan",
        description: "Pilih produk dipegang 1 atau 2 tangan."
      },
      gender: {
        title: "Gender Model",
        description: "Pilih gender yang memegang produk."
      },
      motion: {
        title: "Gerakan Video",
        description: "Pilih jenis gerakan untuk prompt video."
      }
    },
    vibes: {
      pink: "Pink Aesthetic",
      blue: "Blue Tech",
      white: "Clean White",
      brown: "Cozy Brown",
      purple: "Purple Galaxy",
      green: "Natural Green",
      black: "Dark Stealth",
      aesthetic: "Warm Aesthetic",
      greyCarpet: "Karpet Bulu Abu"
    },
    handOptions: {
      one: "1 Tangan",
      two: "2 Tangan",
      compare: "Bandingkan (2 Produk)"
    },
    genders: {
      female: "Wanita",
      male: "Pria"
    },
    motions: {
      subtleWiggle: "Goyang Halus",
      gentleTilt: "Miring Halus",
      slowRotation: "Putar Lambat",
      stillLife: "Diam Estetik",
      cinematicShowcase: "Cinematic Showcase"
    },
    generateButton: "Buat Foto Setup"
  },
  goSetupV2: {
    page: {
      title: "Go Setup V2",
      description: "Pindahkan produk skincare Anda ke atas meja setup yang estetik tanpa dipegang tangan. Produk diletakkan terlentang untuk hasil maksimal."
    },
    sections: {
      vibe: {
        title: "Pilih Vibe Warna",
        description: "Sesuaikan suasana warna setup dengan produkmu."
      },
      angle: {
        title: "Sudut Kamera",
        description: "Pilih sudut pengambilan foto untuk produk Anda."
      },
      motion: {
        title: "Gerakan Video",
        description: "Pilih jenis gerakan untuk prompt video."
      }
    },
    angles: {
      eyeLevel: "Sejajar Mata",
      topDownClose: "Dari Atas (Dekat)",
      topDownFar: "Dari Atas (Jauh)"
    },
    motions: {
      slowZoom: "Zoom Lambat",
      orbit: "Orbit Kamera",
      topDown: "Top Down Cinematic",
      stillLife: "Diam Estetik"
    },
    generateButton: "Buat Foto Setup V2"
  },
  goSetupV3: {
    page: {
      title: "Go Setup V3 (Shoes)",
      description: "Pindahkan produk sepatu Anda ke model yang sedang memakainya dalam setting setup estetik. Fokus pada detail sepatu dengan berbagai pilihan vibe warna."
    },
    sections: {
      vibe: {
        title: "Pilih Vibe Warna",
        description: "Sesuaikan suasana warna setup dengan produkmu."
      },
      motion: {
        title: "Gerakan Video",
        description: "Pilih jenis gerakan untuk prompt video."
      }
    },
    motions: {
      slowZoom: "Zoom Lambat",
      orbit: "Orbit Kamera",
      topDown: "Top Down Cinematic",
      stillLife: "Diam Estetik"
    },
    generateButton: "Buat Foto Setup V3"
  },
  goModelPremium: {
    page: {
      title: "Go Model PREMIUM",
      description: "Hasilkan foto model estetik di ruangan minimalis modern dengan nuansa hangat. Cocok untuk konten influencer yang elegan dan Instagramable."
    },
    sections: {
      upload: {
        title: "Upload Produk",
        description: "Upload foto pakaian atau produk fashion Anda."
      },
      options: {
        title: "Opsi Model",
        description: "Sesuaikan tampilan model premium Anda."
      },
      faceVisibility: "Visibilitas Wajah"
    },
    faceOptions: {
      obstructed: "Wajah Terhalang HP",
      visible: "Wajah Terlihat Jelas"
    },
    generateButton: "Buat Foto Premium"
  },
  goModelPremiumV2: {
    page: {
      title: "Go Model PREMIUM V2",
      description: "Hasilkan foto model estetik tanpa kepala (neck down) di ruangan minimalis modern. Fokus pada detail pakaian dan gaya tubuh."
    },
    sections: {
      upload: {
        title: "Upload Produk",
        description: "Upload foto pakaian atau produk fashion Anda."
      },
      options: {
        title: "Opsi Model",
        description: "Sesuaikan tampilan model tanpa kepala Anda."
      }
    },
    generateButton: "Buat Foto Premium V2"
  },
  goCermin: {
    page: {
      title: "Go Cermin",
      description: "Hasilkan foto produk estetik dengan pantulan cermin dan sorotan cahaya dramatis dari kiri."
    },
    errors: {
      noImage: "Harap unggah gambar produk terlebih dahulu."
    },
    generateButton: "Buat 4 Foto Cermin"
  },
  goClean: {
    page: {
      title: "Go Clean",
      description: "Hapus orang dan background dari foto Anda secara otomatis, menyisakan hanya produk di atas latar putih bersih."
    },
    sections: {
      productType: {
        title: "2. Tentukan Produk Utama",
        subtitle: "Bantu AI fokus pada objek yang benar."
      }
    },
    productTypes: {
      baju: "Baju",
      celana: "Celana",
      tas: "Tas",
      sepatu: "Sepatu",
      full_outfit: "Full Outfit",
      lainnya: "Lainnya..."
    },
    customProductPlaceholder: "cth., 'Topi', 'Jam tangan'",
    generateButton: "Bersihkan Foto",
    errors: {
      noImage: "Harap unggah gambar terlebih dahulu.",
      noProductType: "Harap tentukan jenis produknya."
    }
  },
  goKids: {
    page: {
      title: "Go Kids Studio",
      description: "Pindahkan produk fashion anak Anda ke model anak sekolah (Anak SD) dalam ruangan estetik yang profesional."
    },
    sections: {
      type: {
        title: "Jenis Produk",
        subtitle: "Pilih jenis pakaian anak."
      },
      gender: {
        title: "Gender Model"
      },
      pose: {
        title: "Gaya Pose"
      },
      ethnicity: {
        title: "Etnis Model",
        subtitle: "Pilih penampilan etnis model anak."
      }
    },
    types: {
      baju: "Baju / Atasan",
      celana: "Celana / Bawahan",
      sarung: "Sarung Anak",
      setelan: "Setelan Lengkap",
      dress: "Dress / Gamis"
    },
    genders: {
      boy: "Laki-laki",
      girl: "Perempuan"
    },
    poses: {
      formal: "Formal",
      casual: "Santai",
      playful: "Ceria"
    }
  },
  goFamily: {
    page: {
      title: "Go Family Studio",
      description: "Unggah produk fashion keluarga Anda (Ayah, Ibu, Anak) and biarkan AI merender pemotretan keluarga profesional di studio modern."
    },
    sections: {
      upload: {
        title: "1. Unggah Set Produk",
        subtitle: "Lengkapi minimal 2 produk untuk mulai (Ayah & Ibu)."
      },
      setup: {
        title: "2. Atur Formasi",
        subtitle: "Pilih siapa saja yang muncul di foto."
      },
      ethnicity: {
        title: "3. Etnis Model",
        subtitle: "Pilih penampilan etnis untuk seluruh keluarga."
      },
      theme: {
        title: "4. Tema Studio",
        subtitle: "Pilih suasana latar belakang."
      }
    },
    labels: {
      father: "Ayah",
      mother: "Ibu",
      son: "Anak Laki-laki",
      daughter: "Anak Perempuan"
    },
    modes: {
      couple: "Pasangan (Ayah & Ibu)",
      full: "Keluarga Lengkap"
    },
    ethnicities: {
      indonesia: "Indonesia",
      asia: "Asia",
      bule: "Bule (Caucasian)",
      arab: "Arab (Middle Eastern)"
    },
    themes: {
      modernWhite: "Studio Putih Modern",
      warmLiving: "Rumah Estetik Hangat",
      minimalistGarden: "Taman Minimalis",
      luxuriousHall: "Gedung Mewah",
      aestheticRoom: "Ruangan Estetik (Teal & Fur)"
    }
  },
  history: {
    title: "Riwayat Generate",
    description: "Lihat kembali semua gambar yang pernah Anda buat sebelumnya.",
    loading: "Memuat Riwayat...",
    empty: {
      title: "Belum Ada Riwayat",
      subtitle: "Mulai buat gambar untuk melihatnya di sini!"
    },
    deleteConfirm: "Hapus item ini dari riwayat?",
    deleteButton: "Hapus"
  },
  goModelVip: {
    page: {
      title: "Go Model VIP",
      description: "Pindahkan produk Anda ke model profesional di studio eksklusif. Kustomisasi penuh mulai dari gender, etnis, hingga aksesoris."
    },
    sections: {
      styling: {
        title: "Gaya & Aksesoris",
        subtitle: "Tambahkan detail estetik pada model."
      },
      makeup: "Makeup Profesional",
      glasses: "Aksesoris Kacamata",
      hijab: "Gunakan Hijab",
      mask: "Gunakan Masker Putih",
      gender: {
          title: "Gender Model",
          male: "Pria",
          female: "Wanita"
      },
      bodyAndPose: {
        title: "Bentuk Tubuh & Pose",
        subtitle: "Tentukan fisik dan gaya model."
      },
      bodyType: "Bentuk Tubuh",
      facialExpression: "Ekspresi Wajah",
      handPose: "Gaya Tangan",
      pose: "Gaya Pose Utama",
      brief: {
        title: "Brief Tambahan (Opsional)",
        subtitle: "Tulis instruksi khusus agar hasil lebih akurat.",
        placeholder: "cth., 'Model sedang memegang tas dengan tangan kanan, latar belakang ada tanaman hijau...'"
      }
    },
    glassesOptions: {
        none: 'Tanpa Kacamata',
        sunglasses: 'Kacamata Hitam',
        reading: 'Kacamata Baca'
    },
    bodyTypes: {
        fit: 'Fit & Langsing',
        curvy: 'Curvy / Berisi',
        athletic: 'Atletis / Berotot'
    },
    themes: {
        aestheticVip: "VIP Aesthetic Room (Teal & Fur)",
        cleanStudio: "Clean White Studio",
        urbanStreet: "Urban Streetstyle",
        luxuryHotel: "Luxury Hotel Lobby"
    },
    poses: {
        formal: "Formal Standing",
        relaxed: "Relaxed Standing",
        modeling: "Fashion Modeling",
        selfie: "Selfie di Cermin",
        ootdSantai: "OOTD Santai",
        sittingRelaxed: "Duduk Santai",
        leaningWall: "Sandar di Tembok",
        walkingCasual: "Jalan Santai",
        coffeeTime: "Minum Kopi",
        lookingAway: "Candid Menoleh",
        sittingFloor: "Duduk di Lantai",
        adjustingHair: "Rapikan Rambut",
    },
    facialExpressions: {
        smile: "Senyum",
        laugh: "Tertawa",
        stern: "Judes / Serius",
        neutral: "Netral"
    },
    handPoses: {
        freestyle: "Gaya Bebas",
        peace: "Peace Sign (cis)",
        formal: "Formal",
        holding: "Pegang Produk"
    }
  },
  goModelVipV2: {
    page: {
      title: "Go Model VIP V2 (Close-up)",
      description: "Fokus pada detail produk aksesoris seperti topi, kacamata, sandal, atau perhiasan dengan model profesional dalam jarak dekat."
    },
    sections: {
      focus: {
        title: "Fokus Area",
        subtitle: "Pilih area tubuh yang ingin difokuskan."
      }
    },
    focusAreas: {
      head: "Kepala (Topi/Kacamata)",
      feet: "Kaki (Sandal/Sepatu)",
      hands: "Tangan (Jam/Perhiasan)",
      neck: "Leher (Kalung/Scarf)"
    }
  },
  goDetail: {
    page: {
      title: "Go Detail",
      description: "Tampilkan detail tekstur produk Anda dengan interaksi tangan (POV) dalam suasana studio estetik."
    },
    sections: {
      interaction: {
        title: "Interaksi Tangan",
        subtitle: "Pilih bagaimana tangan berinteraksi dengan produk."
      }
    },
    interactions: {
      holding: "Memegang Produk",
      touching: "Menyentuh Tekstur",
      pointing: "Menunjuk Detail",
      pinching: "Mencubit Kain"
    }
  },
  goSelfieVip: {
    page: {
      title: "Go Selfie VIP",
      description: "Pindahkan produk Anda ke model AI yang sedang mengambil foto selfie di cermin dengan gaya profesional."
    },
    sections: {
      gender: {
        title: "Gender Model",
        male: "Pria",
        female: "Wanita"
      },
      hijab: "Gunakan Hijab",
      faceVisibility: "Visibilitas Wajah",
      pose: "Gaya Selfie",
      theme: "Lokasi Selfie"
    },
    faceOptions: {
      obstructed: "Wajah Terhalang HP",
      unobstructed: "Wajah Terlihat Jelas"
    },
    poses: {
      fullBody: "Mirror (Full Body)",
      closeUp: "Mirror (Close Up)",
      sitting: "Mirror (Duduk)",
      fromSide: "Mirror (Samping)"
    },
    themes: {
      aestheticCafe: "Kafe Estetik",
      fittingRoom: "Kamar Ganti Mall",
      modernBedroom: "Kamar Tidur Modern",
      luxuryLobby: "Lobi Hotel Mewah"
    }
  }
};

export function getTranslation(key: string, source: any): string {
  const keys = key.split('.');
  let result = source;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key;
    }
  }
  
  if (typeof result === 'string') {
      return result;
  }

  return key;
}
