import React, { useState, useRef } from 'react';
import { Microphone, MicrophoneSlash } from '@phosphor-icons/react';
import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types/webSpeech';

interface VoiceMemoProps {
  onTranscriptionComplete: (text: string) => void;
}

const VoiceMemo: React.FC<VoiceMemoProps> = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = async () => {
    try {
      // Set up speech recognition
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'zh-CN'; // Set to Chinese

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const results = Array.from(event.results);
          const transcript = results
            .map(result => result[0].transcript)
            .join('');
          
          if (results[results.length - 1].isFinal) {
            onTranscriptionComplete(transcript);
          }
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError('语音识别错误: ' + event.error);
          stopRecording();
        };

        recognitionRef.current.start();
        setIsRecording(true);
        setError(null);
      } else {
        setError('此浏览器不支持语音识别功能');
        return;
      }
    } catch (err) {
      setError('访问麦克风出错: ' + err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          padding: '10px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isRecording ? '#ff4444' : '#4285F4',
          color: 'white',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isRecording ? <MicrophoneSlash size={24} /> : <Microphone size={24} />}
      </button>
      {isRecording && (
        <span style={{ color: '#ff4444' }}>Recording...</span>
      )}
      {error && (
        <span style={{ color: '#ff4444', fontSize: '14px' }}>{error}</span>
      )}
    </div>
  );
};

export default VoiceMemo;
