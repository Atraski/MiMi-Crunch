import React from 'react';

const ComparisonSection = () => {
    const comparisonData = [
        {
            feature: 'Dish',
            traditional: 'Poha / Upma / Bread',
            others: 'Maggi / Fries / Burgers 🍟',
            mimi: 'Millet Power Bowl 🥣'
        },
        {
            feature: 'Main Ingredient',
            traditional: 'Polished Grains',
            others: 'Refined Flour & Add-ons',
            mimi: 'Ancient Whole Millets'
        },
        {
            feature: 'Effort',
            traditional: 'Time + Prep Needed',
            others: 'Zero Effort, Just Order',
            mimi: '2-Min Smart Cooking'
        },
        {
            feature: 'Energy',
            traditional: 'Short Boost, Fades Fast',
            others: 'Spike → Crash 🔻',
            mimi: 'Slow Release Fuel ⚡'
        },
        {
            feature: 'Digestion',
            traditional: 'Sometimes Heavy',
            others: 'Feels Heavy Later',
            mimi: 'Easy, Light & Clean'
        },
        {
            feature: 'Nutrition',
            traditional: 'Basic, Not Enough',
            others: 'Empty Calories',
            mimi: 'Fiber-Rich • Naturally Nourishing'
        },
        {
            feature: 'Vibe',
            traditional: 'Routine Breakfast',
            others: 'Cravings Over Health',
            mimi: 'Everyday Clean Eating'
        }
    ];

    return (
        <section className="py-24 bg-brand-eggshell relative overflow-hidden font-[Manrope]">
            <div className="max-w-5xl mx-auto px-4 relative z-10">
                
                {/* Desktop Version */}
                <div className="hidden md:block relative mt-16 mb-8 transform scale-[0.95]">
                    {/* Floating Title Badge */}
                    <div className="absolute -top-5 left-6 bg-brand-orange text-white font-bold text-xl px-6 py-2 rounded-sm shadow-xl -rotate-2 z-20 uppercase tracking-wide inline-block border-2 border-brand-orange">
                        MIMI VS. THE REST
                    </div>

                    {/* Outer Table Container */}
                    <div className="border-[2px] border-brand-verdun/10 rounded-[2.5rem] px-6 pt-8 pb-4 relative w-full overflow-visible bg-white/40 backdrop-blur-sm z-10 shadow-2xl shadow-brand-brown/5">
                        
                        {/* Center Highlight Background */}
                        <div className="absolute -top-6 -bottom-6 left-[50%] w-[25%] bg-brand-brown rounded-[2rem] shadow-2xl z-0 border border-white/10">
                            {/* Inner glow or styling for the highlight column */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem]"></div>
                        </div>

                        {/* Headers */}
                        <div className="grid grid-cols-4 relative z-10 items-end pb-4 border-b border-brand-brown/10">
                            <div></div>
                            <div className="text-center font-black text-brand-brown/50 text-sm uppercase tracking-widest">
                                REGULAR SNACKS
                            </div>
                            <div className="text-center font-[Fraunces] italic font-black text-brand-yellow text-3xl">
                                Mimi Crunch
                            </div>
                            <div className="text-center font-black text-brand-brown/50 text-sm uppercase tracking-widest">
                                JUNK FOOD
                            </div>
                        </div>

                        {/* Rows */}
                        <div className="relative z-10 flex flex-col">
                            {comparisonData.map((row, idx) => (
                                <div key={idx} className={`grid grid-cols-4 items-center py-5 ${idx !== comparisonData.length - 1 ? 'border-b border-brand-brown/10' : ''}`}>
                                    <div className="font-bold text-brand-verdun text-base pl-6 tracking-wide">
                                        {row.feature}
                                    </div>
                                    <div className="text-center font-semibold text-brand-brown/60 text-base">
                                        {row.traditional}
                                    </div>
                                    <div className="text-center font-bold text-brand-yellow text-lg drop-shadow-md">
                                        {row.mimi}
                                    </div>
                                    <div className="text-center font-semibold text-brand-brown/60 text-base">
                                        {row.others}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Version */}
                <div className="md:hidden pb-8 mt-12">
                    <div className="text-center mb-10 relative">
                        <div className="inline-block bg-brand-orange text-white font-bold text-2xl px-6 py-2 rounded-sm shadow-md -rotate-2 z-20 uppercase tracking-widest border border-brand-orange">
                            MIMI VS. THE REST
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-8 max-w-5xl mx-auto">
                        {/* Column 1: Ghar Ka Khaana */}
                        <div className="bg-white/40 rounded-2xl sm:rounded-[3rem] p-2 flex flex-col items-center border border-brand-brown/10 shadow-sm">
                            <h3 className="text-brand-brown font-bold uppercase tracking-widest text-[8px] sm:text-xs mb-6 sm:mb-8 text-center leading-tight">Ghar Ka Khaana</h3>
                            <div className="space-y-4 sm:space-y-12 w-full text-center">
                                {comparisonData.map((row, idx) => (
                                    <div key={idx} className="space-y-1.5 sm:space-y-4 flex flex-col items-center">
                                        <div className="bg-brand-brown/5 rounded-[0.4rem] py-1 px-1.5 shadow-sm text-[6.5px] font-bold text-brand-brown/40 uppercase tracking-widest leading-tight mx-auto w-fit max-w-[95%]">{row.feature}</div>
                                        <div className="text-[9.5px] sm:text-xl font-medium text-brand-brown/80 leading-snug px-0.5">{row.traditional}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: MIMI CRUNCH (The Winner) */}
                        <div className="bg-brand-brown rounded-2xl p-2 flex flex-col items-center shadow-xl shadow-brand-brown/20 relative overflow-hidden scale-[1.03] sm:scale-105 z-10 border border-brand-yellow/30">
                            <h3 className="text-brand-yellow font-[Fraunces] italic font-black uppercase text-[11px] mb-6 text-center drop-shadow-md w-full leading-tight">Mimi Crunch</h3>
                            <div className="space-y-4 w-full text-center relative z-10">
                                {comparisonData.map((row, idx) => (
                                    <div key={idx} className="space-y-1.5 flex flex-col items-center">
                                        <div className="bg-white/5 rounded-[0.4rem] py-1 px-1.5 text-[6.5px] font-bold text-white/40 uppercase tracking-widest leading-tight mx-auto w-fit max-w-[95%]">{row.feature}</div>
                                        <div className="text-[10px] sm:text-2xl font-bold text-brand-yellow leading-snug drop-shadow-sm px-0.5">{row.mimi}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column 3: Junk Food */}
                        <div className="bg-white/40 rounded-2xl p-2 flex flex-col items-center border border-brand-brown/10 shadow-sm">
                            <h3 className="text-brand-brown font-bold uppercase tracking-widest text-[8px] sm:text-xs mb-6 sm:mb-8 text-center leading-tight">Junk Food</h3>
                            <div className="space-y-4 w-full text-center">
                                {comparisonData.map((row, idx) => (
                                    <div key={idx} className="space-y-1.5 flex flex-col items-center">
                                        <div className="bg-brand-brown/5 rounded-[0.4rem] py-1 px-1.5 shadow-sm text-[6.5px] font-bold text-brand-brown/40 uppercase tracking-widest leading-tight mx-auto w-fit max-w-[95%]">{row.feature}</div>
                                        <div className="text-[9.5px] font-medium text-brand-brown/80 leading-snug px-0.5">{row.others}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-brand-brown/40 italic mb-6">*Based on detailed nutritional analysis of leading ready-to-eat brands.</p>
                    <a href="/products" className="inline-flex items-center gap-4 bg-brand-orange text-brand-eggshell px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 hover:bg-brand-yellow transition-all active:scale-95 shadow-orange/20">
                        Try Mimi Crunch
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ComparisonSection;
