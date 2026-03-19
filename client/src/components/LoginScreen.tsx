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
            const success = isRegistering 
                ? await register(username, password)
                : await login(username, password);
            
            if (!success) {
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
            
            <div className="glass max-w-md w-full p-10 rounded-3xl border border-red-900/30 relative overflow-hidden animate-fade-in">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/10 blur-3xl rounded-full"></div>

                <div className="text-center mb-8 relative">
                    <div className="w-20 h-20 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-500/20">
                        <Shield className="text-red-500" size={40} />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Legacy of Etrio</h1>
                    <p className="text-red-500/60 text-xs font-bold tracking-[0.3em] uppercase mt-2">
                        {isRegistering ? 'Seal your lineage' : 'Enter the Basilica'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-[10px] uppercase font-bold text-red-500/40 tracking-widest ml-1">
                            <User size={10} />
                            Username
                        </div>
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none transition-all placeholder:text-white/10"
                            placeholder="Enter Name..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2 text-[10px] uppercase font-bold text-red-500/40 tracking-widest ml-1">
                            <Key size={10} />
                            Secret Phrase
                        </div>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none transition-all placeholder:text-white/10"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-[10px] uppercase font-bold text-center animate-shake">
                            ⚠️ {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg ${
                            loading 
                            ? 'bg-red-950/20 text-red-500/20 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-500 active:scale-95 shadow-red-600/20'
                        }`}
                    >
                        {loading ? 'Processing...' : (isRegistering ? 'Begin Journey' : 'Authenticate')}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <button 
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-xs text-white/40 hover:text-red-500 transition-colors uppercase font-bold tracking-widest"
                    >
                        {isRegistering ? 'Already have a lineage? Sign in' : 'New to Etrio? Create Account'}
                    </button>
                </div>

                {/* Footer Quote */}
                <div className="mt-8 flex items-center justify-center gap-2 opacity-20">
                    <Droplets size={12} />
                    <span className="text-[10px] font-bold italic tracking-tighter">"Blood is the only true signature."</span>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
