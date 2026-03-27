import React, { useEffect } from 'react';

const InstagramReels = () => {
    // User Provided Reel/Post URLs
    const reelUrls = [
        'https://www.instagram.com/p/DWWRiabE_Xo/',
        'https://www.instagram.com/p/DWWGkJDyy2C/',
        'https://www.instagram.com/p/DVyS4A6k1jS/',
        'https://www.instagram.com/p/DVvViI1ExNl/',
        'https://www.instagram.com/p/DUVh7PUk3T8/'
    ];

    const [scriptBlocked, setScriptBlocked] = React.useState(false);

    useEffect(() => {
        // Load Instagram Embed Script
        const scriptId = 'instagram-embed-script';
        
        // Detect localhost to show a better developer experience
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(() => setScriptBlocked(true), 1500); // Simulate check
        }

        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.async = true;
            script.src = 'https://www.instagram.com/embed.js';
            script.onerror = () => setScriptBlocked(true);
            document.head.appendChild(script);
        } else {
            if (window.instgrm) {
                window.instgrm.Embeds.process();
            } else {
                setScriptBlocked(true);
            }
        }
    }, []);

    return (
        <section className="py-20 bg-[#FAF8F5] relative overflow-hidden font-[Manrope]">
            {/* Background Aesthetic */}
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#1B3B26] opacity-[0.03] blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.05] blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 mb-4 bg-white/80 border border-[#1B3B26]/10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-[#1B3B26] shadow-sm">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Mimi Lifestyle
                </div>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-[Fraunces] font-medium text-[#1B3B26] leading-tight mb-4">
                    Experience the <span className="text-[#F5B041]">Mimi Lifestyle</span>
                </h2>
                <p className="text-lg text-[#4A5D4E] mb-12 max-w-2xl mx-auto opacity-80 leading-relaxed font-[Manrope]">
                    Join our vibrant community as we celebrate wellness, tradition, and the love for healthy millets. Follow <a href="https://www.instagram.com/mimicrunch.in" target="_blank" rel="noopener noreferrer" className="text-[#1B3B26] font-bold underline underline-offset-4 decoration-[#F5B041]">@mimicrunch.in</a> for daily millet recipes!
                </p>

                {/* Reels Horizontal Scroll Container */}
                <div className="relative group">
                    <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide no-scrollbar px-4 sm:px-0 scroll-smooth">
                        {reelUrls.map((url, index) => (
                            <div 
                                key={index} 
                                className="flex-none w-[280px] sm:w-[320px] snap-center transform transition duration-500 hover:-translate-y-2"
                            >
                                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(27,59,38,0.12)] border border-white p-2 sm:p-3 overflow-hidden aspect-[9/16] relative group">
                                    {scriptBlocked ? (
                                        // Premium Fallback Card with Real Instagram Thumbnails
                                        <div className="w-full h-full bg-[#1B3B26] rounded-[2rem] relative overflow-hidden group">
                                             {/* Attempt to load real Instagram Thumbnail using the /media/ redirect */}
                                             <img 
                                                src={`${url}media/?size=l`} 
                                                alt="Mimi Reel"
                                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-60"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                             />
                                             
                                             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#1B3B26]/40 backdrop-blur-[2px]">
                                                <div className="w-14 h-14 bg-[#F5B041] rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                                                    <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                <h4 className="text-white font-[Fraunces] text-lg mb-1 drop-shadow-md">Watch on Instagram</h4>
                                                <a 
                                                    href={url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-block bg-white/20 hover:bg-white/30 border border-white/20 text-white px-5 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase transition-colors"
                                                >
                                                    View Reel
                                                </a>
                                             </div>
                                        </div>
                                    ) : (
                                        <blockquote 
                                            className="instagram-media w-full h-full m-0 p-0 border-0" 
                                            data-instgrm-permalink={url}
                                            data-instgrm-version="14"
                                            style={{ background: '#FFF', border: '0', borderRadius: '3px', margin: '0', padding: '0', width: '100%' }}
                                        >
                                            <div style={{ padding: '16px' }}>
                                                <a href={url} style={{ color: '#000', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: '500', lineHeight: '18px', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                                                    Loading Reel...
                                                </a>
                                            </div>
                                        </blockquote>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Peek Indicators */}
                    <div className="flex justify-center gap-2 mt-4 bg-white/40 w-fit mx-auto px-4 py-2 rounded-full border border-white/60">
                         {[0, 1, 2, 3].map((dot) => (
                             <div key={dot} className={`h-1.5 w-1.5 rounded-full ${dot === 0 ? 'bg-[#1B3B26] w-4' : 'bg-[#1B3B26]/20'} transition-all`}></div>
                         ))}
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <a 
                        href="https://www.instagram.com/mimicrunch.in" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn inline-flex items-center gap-4 bg-[#1B3B26] text-white px-8 py-5 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] shadow-xl hover:shadow-[#1B3B26]/20 hover:-translate-y-1 transition-all active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Follow @mimicrunch.in
                    </a>
                </div>
            </div>
            
            {/* Custom Styles for Reel Embeds */}
            <style dangerouslySetInnerHTML={{ __html: `
                .instagram-media { width: 100% !important; height: 100% !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </section>
    );
};

export default InstagramReels;
