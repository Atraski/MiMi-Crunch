import React from 'react';

const InstagramReels = () => {
    // Exactly 5 User Provided Reel/Post IDs
    const reelUrls = [
        'https://www.instagram.com/p/DWWRiabE_Xo/',
        'https://www.instagram.com/p/DWWGkJDyy2C/',
        'https://www.instagram.com/p/DVyS4A6k1jS/',
        'https://www.instagram.com/p/DVvViI1ExNl/',
        'https://www.instagram.com/p/DUVh7PUk3T8/'
    ];
    // Constant Mimi Crunch Product Images (Sourced from DB)
    const reelThumbs = [
        'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1771706646/products/qw26mh3dmayiuubtcjmr.png', // Little Millet
        'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1771706431/products/lqhv1slrq4ku6yq4ulli.png', // Kodo Flour
        'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1771706259/products/b58d1eu6mmwikcdj3mci.png', // Kodo Millet
        'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1771706047/products/ojdycyc3lexk3h1lljwx.png', // Barnyard Flour
        'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1774641207/products/cqdbd00ys4tecxyc6cnf.png'  // Foxtail Flour
    ];

    return (
        <section className="py-20 bg-[#FAF8F5] relative overflow-hidden font-[Manrope]">
            {/* Background Aesthetic */}
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#1B3B26] opacity-[0.03] blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.05] blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 mb-4 bg-white/80 border border-[#1B3B26]/10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-[#1B3B26] shadow-sm">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Mimi Social
                </div>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-[Fraunces] font-medium text-[#1B3B26] leading-tight mb-4">
                    Experience <span className="text-[#F5B041]">Mimi Crunch</span>
                </h2>
                <p className="text-sm sm:text-lg text-[#4A5D4E] mb-12 max-w-2xl mx-auto opacity-80 leading-relaxed font-[Manrope]">
                    Join our vibrant community as we celebrate wellness and tradition.
                </p>

                {/* Reels Horizontal Scroll Container */}
                <div className="relative group mb-12">
                    <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 snap-x no-scrollbar px-4 sm:px-0 scroll-smooth">
                        {reelUrls.map((url, index) => (
                            <a 
                                key={index} 
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-none w-[260px] sm:w-[320px] snap-center transform transition duration-500 hover:-translate-y-2 group/card"
                            >
                                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(27,59,38,0.12)] border border-white p-2 sm:p-3 overflow-hidden aspect-[9/16] relative">
                                    <div className="w-full h-full bg-[#1B3B26] rounded-[1.5rem] sm:rounded-[2rem] relative overflow-hidden">
                                        <img 
                                            src={reelThumbs[index]}
                                            alt="Mimi Reel"
                                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover/card:scale-110 opacity-70"
                                            loading="lazy"
                                        />
                                        
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/20 group-hover/card:bg-black/40 transition-colors">
                                           <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 transition-all group-hover/card:scale-110 group-hover/card:bg-[#F5B041]">
                                               <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                   <path d="M8 5v14l11-7z" />
                                               </svg>
                                           </div>
                                           <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover/card:opacity-100 transition-opacity">Watch Now</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Follow Button */}
                <div className="flex justify-center">
                    <a 
                        href="https://www.instagram.com/mimicrunch.in" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative inline-flex items-center gap-4 bg-[#1B3B26] text-[#F5B041] px-10 py-5 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[#F5B041] hover:text-[#1B3B26] shadow-xl hover:shadow-[0_20px_40px_-10px_rgba(245,176,65,0.4)]"
                    >
                        <span className="relative z-10">Follow @mimicrunch.in</span>
                        <div className="relative z-10 w-8 h-8 rounded-full bg-[#F5B041]/20 group-hover:bg-[#1B3B26]/10 flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default InstagramReels;
