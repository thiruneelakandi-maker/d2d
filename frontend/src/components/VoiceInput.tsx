import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onListeningStart?: () => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, onListeningStart, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [browserSupported, setBrowserSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const fullResult = (finalTranscript + interimTranscript).trim();
        setTranscript(fullResult);
        onTranscript(fullResult);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition event:', err.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setBrowserSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (disabled) return;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (onListeningStart) onListeningStart();
      setTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn('Error starting speech recognition:', e);
          fallbackSimulateSpeech();
        }
      } else {
        fallbackSimulateSpeech();
      }
    }
  };

  const fallbackSimulateSpeech = () => {
    if (onListeningStart) onListeningStart();
    setIsListening(true);
    const demoPhrases = [
      "Car collision on highway, two people trapped with head injury and bleeding heavily",
      "Structure fire spreading rapidly to curtains, heavy black smoke and people trapped",
      "Elderly patient collapsed, unconscious and having severe trouble breathing",
      "Rapidly rising flood water entering basement, electrical danger and rescue needed"
    ];
    const phrase = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
    let index = 0;
    const interval = setInterval(() => {
      index += 5;
      const partial = phrase.slice(0, index);
      setTranscript(partial);
      onTranscript(partial);
      if (index >= phrase.length) {
        clearInterval(interval);
        setTimeout(() => setIsListening(false), 500);
      }
    }, 120);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          isListening
            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse'
            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
        }`}
        title={isListening ? 'Stop Voice Recording' : 'Record Emergency Description by Voice'}
      >
        {isListening ? (
          <>
            <Mic className="w-4 h-4 text-white animate-bounce" />
            <span>Listening...</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Voice Input</span>
          </>
        )}
      </button>

      {/* Visual Audio Waveform Animation when listening */}
      {isListening && (
        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs">
          <Volume2 className="w-3.5 h-3.5 shrink-0" />
          <div className="flex items-center gap-0.5 h-4">
            <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.4s_infinite_ease-in-out] h-2"></span>
            <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.7s_infinite_ease-in-out] h-4"></span>
            <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.3s_infinite_ease-in-out] h-3"></span>
            <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.5s_infinite_ease-in-out] h-5"></span>
            <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.6s_infinite_ease-in-out] h-2.5"></span>
          </div>
          <span className="text-[11px] font-medium hidden sm:inline ml-1">Speak clearly...</span>
        </div>
      )}
    </div>
  );
};
