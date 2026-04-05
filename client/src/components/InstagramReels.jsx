import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

/** Instagram post/reel permalink → official embed URL (works in iframe; shows real IG player) */
function permalinkToEmbedSrc(permalink) {
    const u = String(permalink).replace(/\/$/, '');
    const reel = u.match(/instagram\.com\/reel\/([^/?#]+)/i);
    if (reel) return `https://www.instagram.com/reel/${reel[1]}/embed`;
    const post = u.match(/instagram\.com\/p\/([^/?#]+)/i);
    if (post) return `https://www.instagram.com/p/${post[1]}/embed`;
    return null;
}

/**
 * Optional: apni reel ke direct .mp4 URLs yahan daalo (Cloudinary / CDN), same order as reelUrls.
 * Khali chhodne par Instagram embed use hoga (PNG se .mp4 guess kabhi kaam nahi karta jab video upload hi nahi hai).
 */
const REEL_MP4_SOURCES = ['', '', '', '', ''];

const ReelVideo = ({ videoUrl, posterUrl, playActive }) => {
    const videoRef = useRef(null);
    const [usePoster, setUsePoster] = useState(false);

    const tryPlay = useCallback(() => {
        const v = videoRef.current;
        if (!v || !playActive || usePoster) return;
        v.muted = true;
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
    }, [playActive, usePoster]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v || usePoster) return;
        if (playActive) {
            tryPlay();
            const t = requestAnimationFrame(() => tryPlay());
            return () => cancelAnimationFrame(t);
        }
        v.pause();
    }, [playActive, tryPlay, usePoster]);

    if (usePoster && posterUrl) {
        return (
            <img
                src={posterUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
            />
        );
    }

    return (
        <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            loop
            muted
            autoPlay
            playsInline
            preload="metadata"
            onLoadedData={tryPlay}
            onCanPlay={tryPlay}
            onLoadedMetadata={tryPlay}
            onError={() => setUsePoster(true)}
            className="absolute inset-0 h-full w-full object-cover"
        />
    );
};

const InstagramEmbedFrame = ({ permalink, title }) => {
    const src = permalinkToEmbedSrc(permalink);
    if (!src) return null;
    return (
        <iframe
            title={title}
            src={src}
            className="absolute inset-0 h-full w-full scale-[1.02] border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
        />
    );
};

const InstagramReels = () => {
    const sectionRef = useRef(null);
    const [sectionInView, setSectionInView] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => setSectionInView(entry.isIntersecting),
            { threshold: 0.06, rootMargin: '0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const reelUrls = useMemo(
        () => [
            'https://www.instagram.com/p/DWWRiabE_Xo/',
            'https://www.instagram.com/p/DWWGkJDyy2C/',
            'https://www.instagram.com/p/DVyS4A6k1jS/',
            'https://www.instagram.com/p/DVvViI1ExNl/',
            'https://www.instagram.com/p/DUVh7PUk3T8/'
        ],
        []
    );

    const reelThumbs = useMemo(
        () => [
            'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1771706646/products/qw26mh3dmayiuubtcjmr.png',
            'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1771706431/products/lqhv1slrq4ku6yq4ulli.png',
            'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1771706259/products/b58d1eu6mmwikcdj3mci.png',
            'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1771706047/products/ojdycyc3lexk3h1lljwx.png',
            'https://res.cloudinary.com/daovxopcn/image/upload/w_800,h_1422,c_fill,g_auto/v1774641207/products/cqdbd00ys4tecxyc6cnf.png'
        ],
        []
    );

    return (
        <section ref={sectionRef} className="py-20 bg-[#FAF8F5] relative overflow-hidden font-[Manrope]">
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#1B3B26] opacity-[0.03] blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.05] blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 mb-4 bg-white/80 border border-[#1B3B26]/10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-[#1B3B26] shadow-sm">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    Mimi Social
                </div>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-[Fraunces] font-medium text-[#1B3B26] leading-tight mb-4">
                    Experience <span className="text-[#F5B041]">Mimi Crunch</span>
                </h2>
                <p className="text-sm sm:text-lg text-[#4A5D4E] mb-12 max-w-2xl mx-auto opacity-80 leading-relaxed font-[Manrope]">
                    Join our vibrant community as we celebrate wellness and tradition.
                </p>

                <div className="mb-12 w-full">
                    {/* Single row — horizontal scroll for extra reels */}
                    <div
                        className="-mx-4 flex flex-nowrap gap-5 overflow-x-auto overflow-y-visible px-4 pb-4 pt-1 scroll-smooth sm:-mx-6 sm:gap-6 sm:px-6 sm:pb-5 md:gap-7 lg:mx-0 lg:max-w-none lg:px-0 snap-x snap-mandatory [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]"
                        style={{ scrollbarGutter: 'stable' }}
                    >
                        {reelUrls.map((url, index) => {
                            const mp4 = REEL_MP4_SOURCES[index]?.trim();
                            const useNativeVideo = Boolean(mp4);

                            return (
                                <div
                                    key={url}
                                    className="w-[min(78vw,300px)] shrink-0 snap-center min-[400px]:w-[min(76vw,320px)] sm:w-[300px] md:w-[320px] lg:w-[340px]"
                                >
                                    <div className="w-full rounded-[1.5rem] sm:rounded-[2rem] border border-white bg-white p-2 sm:p-2.5 shadow-[0_20px_48px_-14px_rgba(27,59,38,0.14)] transition-transform duration-500 hover:-translate-y-1">
                                        <div className="relative w-full overflow-hidden rounded-[1.15rem] sm:rounded-[1.65rem] bg-[#1B3B26]">
                                            <div className="relative aspect-[9/16] w-full overflow-hidden">
                                                {useNativeVideo ? (
                                                    <ReelVideo
                                                        videoUrl={mp4}
                                                        posterUrl={reelThumbs[index]}
                                                        playActive={sectionInView}
                                                    />
                                                ) : (
                                                    <>
                                                        {sectionInView ? (
                                                            <InstagramEmbedFrame permalink={url} title={`Instagram reel ${index + 1}`} />
                                                        ) : (
                                                            <img
                                                                src={reelThumbs[index]}
                                                                alt=""
                                                                className="absolute inset-0 h-full w-full object-cover opacity-90"
                                                            />
                                                        )}
                                                    </>
                                                )}
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-white backdrop-blur-sm hover:bg-black/75 sm:bottom-3 sm:px-3 sm:text-[9px]"
                                                >
                                                    Open on IG
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

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
