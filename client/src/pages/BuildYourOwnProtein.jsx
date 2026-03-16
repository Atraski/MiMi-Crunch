import { useState, useRef, useEffect } from 'react'
import BackButton from '../components/BackButton'
import gsap from 'gsap'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const BuildYourOwnProtein = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const sectionRef = useRef(null);

    const [formData, setFormData] = useState({
        userName: '',
        phone: '',
        email: '',
        baseMillet: 'Ragi',
        proteinType: 'None',
        sweetener: 'Dates',
        addIns: [],
        goal: 'Healthy Snacking',
        customMessage: ''
    });

    const options = {
        baseMillet: ['Ragi', 'Bajra', 'Jowar', 'Foxtail', 'Multi-Millet'],
        proteinType: ['Whey', 'Pea', 'Soy', 'None'],
        sweetener: ['Dates', 'Jaggery', 'Stevia', 'Honey'],
        addIns: ['Almonds', 'Walnuts', 'Chia Seeds', 'Pumpkin Seeds', 'Dark Chocolate', 'Cranberries'],
        goal: ['Muscle Gain', 'Weight Management', 'Energy Boost', 'Healthy Snacking']
    };

    useEffect(() => {
        gsap.fromTo(".step-content",
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
        );
    }, [step]);

    const handleInChange = (val) => {
        setFormData(prev => ({
            ...prev,
            addIns: prev.addIns.includes(val)
                ? prev.addIns.filter(i => i !== val)
                : [...prev.addIns, val]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/custom-demands`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSuccess(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-brand-bg py-20 px-4 flex items-center justify-center">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-[Fraunces] text-brand-text">Demand Received!</h1>
                    <p className="text-brand-secondary">Bhai, tera custom bar ka idea mast hai. Humari team jald hi contact karegi!</p>
                    <button onClick={() => window.location.href = '/'} className="btn btn-primary w-full">Back to Home</button>
                </div>
            </main>
        );
    }

    return (
        <main ref={sectionRef} className="min-h-screen bg-brand-bg py-16 px-4 font-[Manrope]">
            <div className="absolute top-[-5%] left-[5%] w-[30%] h-[30%] rounded-full bg-brand-green/5 blur-[100px] pointer-events-none"></div>

            <div className="mx-auto max-w-4xl relative z-10">
                <BackButton className="mb-10" />

                <div className="text-center mb-12 space-y-4">
                    <span className="bg-brand-green/10 text-brand-green px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Build Mode ON</span>
                    <h1 className="text-4xl md:text-6xl font-[Fraunces] text-brand-text">Create Your <span className="text-brand-green italic">Dream</span> Bar</h1>
                    <p className="text-brand-secondary max-w-xl mx-auto">Tell us what you want in your Mimi Protein Bar. We'll build it according to your exact needs.</p>
                </div>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto mb-16 h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-green transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[3rem] p-8 md:p-12">
                    <form onSubmit={handleSubmit} className="step-content">
                        {step === 1 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-[Fraunces] text-brand-text mb-6">Step 1: The Foundation</h2>

                                <div className="grid gap-8 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-brand-secondary">Millet Base</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {options.baseMillet.map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, baseMillet: opt })}
                                                    className={`p-4 rounded-2xl text-sm font-bold border transition-all ${formData.baseMillet === opt ? 'bg-brand-green text-white border-brand-green shadow-lg' : 'bg-white border-stone-100 text-brand-text hover:border-brand-green/30'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-brand-secondary">Primary Goal</label>
                                        <div className="space-y-2">
                                            {options.goal.map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, goal: opt })}
                                                    className={`w-full p-4 rounded-2xl text-sm font-bold border flex justify-between items-center transition-all ${formData.goal === opt ? 'bg-brand-green text-white border-brand-green' : 'bg-white border-stone-100 text-brand-text'}`}
                                                >
                                                    {opt}
                                                    {formData.goal === opt && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button type="button" onClick={() => setStep(2)} className="btn btn-primary w-full h-16 rounded-[1.5rem] mt-8">Next Step: Flavors & Boosts</button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-[Fraunces] text-brand-text mb-6">Step 2: Boost Your Bar</h2>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-brand-secondary">Protein Source</label>
                                        <div className="flex flex-wrap gap-2">
                                            {options.proteinType.map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, proteinType: opt })}
                                                    className={`px-6 py-4 rounded-full text-sm font-bold border transition-all ${formData.proteinType === opt ? 'bg-brand-green text-white border-brand-green shadow-md' : 'bg-white border-stone-100 text-brand-text'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-brand-secondary">Sweetened With</label>
                                        <div className="flex flex-wrap gap-2">
                                            {options.sweetener.map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, sweetener: opt })}
                                                    className={`px-6 py-4 rounded-full text-sm font-bold border transition-all ${formData.sweetener === opt ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-white border-stone-100 text-brand-text'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-brand-secondary">Add-ins (Select Multiple)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {options.addIns.map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => handleInChange(opt)}
                                                    className={`p-4 rounded-2xl text-xs font-bold border transition-all ${formData.addIns.includes(opt) ? 'bg-brand-green/10 border-brand-green text-brand-green' : 'bg-white border-stone-100 text-brand-text'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setStep(1)} className="btn btn-ghost w-1/3 h-16 rounded-[1.5rem]">Back</button>
                                    <button type="button" onClick={() => setStep(3)} className="btn btn-primary flex-1 h-16 rounded-[1.5rem]">Final Step: Contact Details</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-[Fraunces] text-brand-text mb-6">Step 3: Just A Few Details</h2>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-brand-secondary ml-1">Your Name</label>
                                        <input
                                            required
                                            className="w-full p-5 rounded-2xl bg-white border border-stone-100 focus:border-brand-green outline-none font-bold"
                                            placeholder="Full Name"
                                            value={formData.userName}
                                            onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-brand-secondary ml-1">Phone Number</label>
                                            <input
                                                required
                                                className="w-full p-5 rounded-2xl bg-white border border-stone-100 focus:border-brand-green outline-none font-bold"
                                                placeholder="+91 00000 00000"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-brand-secondary ml-1">Email Address</label>
                                            <input
                                                className="w-full p-5 rounded-2xl bg-white border border-stone-100 focus:border-brand-green outline-none font-bold"
                                                placeholder="example@eail.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-brand-secondary ml-1">Any Special Requests?</label>
                                        <textarea
                                            className="w-full p-5 rounded-2xl bg-white border border-stone-100 focus:border-brand-green outline-none font-bold min-h-[120px]"
                                            placeholder="Want it extra crunchy..."
                                            value={formData.customMessage}
                                            onChange={e => setFormData({ ...formData, customMessage: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={() => setStep(2)} className="btn btn-ghost w-1/3 h-16 rounded-[1.5rem]">Back</button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary flex-1 h-16 rounded-[1.5rem]"
                                    >
                                        {loading ? 'Submitting...' : 'Send My Custom Demand'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </main>
    )
}

export default BuildYourOwnProtein
