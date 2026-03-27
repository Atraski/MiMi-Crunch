import React from 'react';

const ComparisonSection = () => {
    const comparisonData = [
        {
            feature: 'Cooking Time',
            traditional: '30-40 Minutes',
            others: '5 Minutes (Preservatives)',
            mimi: '2 Minutes (Natural)'
        },
        {
            feature: 'Ingredients',
            traditional: 'Simple Grains',
            others: 'MSG, Palm Oil, Colors',
            mimi: '5+ Native Millets, Cold-Pressed Oil'
        },
        {
            feature: 'Nutrition',
            traditional: 'Variable',
            others: 'High Sodium & Sugars',
            mimi: 'High Protein & Fiber'
        },
        {
            feature: 'Prep Effort',
            traditional: 'High (Soaking + Cooking)',
            others: 'Instant but Unhealthy',
            mimi: 'Instant & Wholesome'
        }
    ];

    return (
        <section className="py-24 bg-[#FAF8F5] relative overflow-hidden font-[Manrope]">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-[#F5B041] opacity-[0.03] blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[#1B3B26] opacity-[0.04] blur-[150px] rounded-full"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-block bg-[#1B3B26]/5 border border-[#1B3B26]/10 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#1B3B26] mb-6">
                        Why Mimi Crunch?
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-[Fraunces] font-medium text-[#1B3B26] mb-4">
                        Mimi vs. <span className="text-[#F5B041]">The Rest</span>
                    </h2>
                    <p className="text-[#4A5D4E] max-w-2xl mx-auto opacity-70">
                        See how our Multi-Millet Khichdi stands out against traditional methods and processed convenience foods.
                    </p>
                </div>

                {/* Side-by-Side Comparison (Desktop & Mobile) */}
                <div className="overflow-x-hidden pb-8">
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-8 max-w-5xl mx-auto">
                        {/* Column 1: Ghar Ka Khaana */}
                        <div className="bg-[#1B3B26]/5 rounded-[1.5rem] sm:rounded-[3rem] p-2 sm:p-10 flex flex-col items-center border border-[#1B3B26]/10">
                            <h3 className="text-[#1B3B26] font-bold uppercase tracking-widest text-[7px] sm:text-xs mb-6 sm:mb-8 text-center px-1">Traditional</h3>
                            <div className="space-y-6 sm:space-y-12 w-full text-center">
                                {comparisonData.map((row, idx) => (
                                    <div key={idx} className="space-y-2 sm:space-y-4">
                                        <div className="bg-white/80 rounded-xl py-1 px-1 shadow-sm text-[6px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">{row.feature}</div>
                                        <div className="text-[10px] sm:text-xl font-[Fraunces] text-[#1B3B26]/60 leading-tight">{row.traditional}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Junk Food */}
                        <div className="bg-[#F5B041]/5 rounded-[1.5rem] sm:rounded-[3rem] p-2 sm:p-10 flex flex-col items-center border border-[#F5B041]/10">
                            <h3 className="text-[#F5B041] font-bold uppercase tracking-widest text-[7px] sm:text-xs mb-6 sm:mb-8 text-center px-1">Processed</h3>
                            <div className="space-y-6 sm:space-y-12 w-full text-center">
                                {comparisonData.map((row, idx) => (
                                    <div key={idx} className="space-y-2 sm:space-y-4">
                                        <div className="bg-white/80 rounded-xl py-1 px-1 shadow-sm text-[6px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">{row.feature}</div>
                                        <div className="text-[10px] sm:text-xl font-[Fraunces] text-[#F5B041]/60 leading-tight">{row.others}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column 3: MIMI CRUNCH (The Winner) */}
                        <div className="bg-[#1B3B26] rounded-[1.5rem] sm:rounded-[3rem] p-2 sm:p-10 flex flex-col items-center shadow-2xl shadow-[#1B3B26]/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-[#F5B041] opacity-20 blur-[40px] sm:blur-[60px]"></div>
                            <h3 className="text-white font-bold uppercase tracking-[0.1em] sm:tracking-[0.3em] text-[7px] sm:text-sm mb-6 sm:mb-8 z-10 flex items-center gap-1">
                                <span className="flex h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-[#F5B041]"></span>
                                Mimi
                            </h3>
                            <div className="space-y-6 sm:space-y-12 w-full text-center relative z-10">
                                {comparisonData.map((row, idx) => (
                                    <div key={idx} className="space-y-2 sm:space-y-4">
                                        <div className="bg-[#2A5237] rounded-xl py-1 px-1 text-[6px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">{row.feature}</div>
                                        <div className="text-[11px] sm:text-2xl font-[Fraunces] text-[#F5B041] drop-shadow-sm leading-tight">{row.mimi}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm text-[#4A5D4E] italic mb-8 opacity-60">*Based on detailed nutritional analysis of leading ready-to-eat brands.</p>
                    <a href="/product/multi-millet-khichdi" className="inline-flex items-center gap-4 bg-[#F5B041] text-white px-10 py-5 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all active:scale-95 shadow-orange-500/20">
                        Try Multi-Millet Khichdi
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ComparisonSection;
