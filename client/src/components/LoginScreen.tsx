import React, { useState } from 'react';
import { Shield, User, Key, Droplets } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const LoginScreen: React.FC = () => {
    const { login, register } = useGameStore();
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = isRegistering 
                ? await register(username, password)
                : await login(username, password);
            
            if (typeof result === 'string') {
                setError(result);
            } else if (!result) {
                setError(isRegistering ? 'Registration failed' : 'Invalid credentials');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0a0505] flex items-center justify-center p-4 z-50">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
            
            <div className="glass max-w-md w-full p-6 md:p-10 rounded-[2.5rem] border border-red-900/30 relative overflow-hidden animate-fade-in shadow-2xl shadow-red-950/50">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full -ml-16 -mb-16"></div>

                <div className="text-center mb-8 relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-500/20">
                        <Shield className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white italic leading-none">Legacy of Etrio</h1>
                    <p className="text-red-500/60 text-[8px] md:text-[10px] font-black tracking-[0.4em] uppercase mt-4">
                        {isRegistering ? 'Seal your lineage' : 'Enter the Basilica'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[9px] uppercase font-black text-red-500/40 tracking-widest ml-1">
                            <User size={10} />
                            Master Account
                        </div>
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-black/60 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-red-500/50 focus:outline-none transition-all placeholder:text-white/5 tracking-tight font-bold"
                            placeholder="Identity..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[9px] uppercase font-black text-red-500/40 tracking-widest ml-1">
                            <Key size={10} />
                            Secret Ritual
                        </div>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-black/60 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-red-500/50 focus:outline-none transition-all placeholder:text-white/5 tracking-widest"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-[10px] uppercase font-black text-center animate-shake py-2 border border-red-500/20 rounded-xl bg-red-500/5 italic">
                            ⚠️ {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 ${
                            loading 
                            ? 'bg-red-950/20 text-red-500/20 cursor-not-allowed border border-white/5'
                            : 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/30'
                        }`}
                    >
                        {loading ? 'Processing...' : (isRegistering ? 'Begin Journey' : 'Authenticate')}
                    </button>
                </form>

                <div className="mt-10 text-center border-t border-white/5 pt-8">
                    <button 
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-[10px] text-white/30 hover:text-red-500 transition-colors uppercase font-black tracking-widest leading-relaxed"
                    >
                        {isRegistering ? 'Already have a lineage? Sign in' : 'New to Etrio? Create Account'}
                    </button>
                </div>

                {/* Footer Quote */}
                <div className="mt-8 flex items-center justify-center gap-2 opacity-10">
                    <Droplets size={12} />
                    <span className="text-[9px] font-black italic tracking-tighter uppercase">"Blood is the only true signature."</span>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
