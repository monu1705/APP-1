import React, { createContext, useContext, useRef, useCallback } from 'react';

interface SoundContextType {
    playSound: (type: 'click' | 'success' | 'error' | 'delete') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const audioContextRef = useRef<AudioContext | null>(null);

    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };

    const playSound = useCallback((type: 'click' | 'success' | 'error' | 'delete') => {
        try {
            initAudioContext();
            const ctx = audioContextRef.current;
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            switch (type) {
                case 'click':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;
                case 'success':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
                case 'error':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
                case 'delete':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                    gain.gain.setValueAtTime(0.03, now);
                    gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
            }
        } catch (e) {
            console.error("Failed to play sound", e);
        }
    }, []);

    return (
        <SoundContext.Provider value={{ playSound }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
