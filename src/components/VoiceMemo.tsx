import React, { useState, useRef } from 'react';
import { Microphone, MicrophoneSlash } from '@phosphor-icons/react';
import '../styles/VoiceMemo.css';
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
    <div className="voice-memo-container">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`voice-button ${isRecording ? 'recording' : 'not-recording'}`}
      >
        {isRecording ? <MicrophoneSlash size={32} weight="bold" /> : <Microphone size={32} weight="bold" />}
      </button>
      <div className="status-container">
        {isRecording && (
          <div className="recording-status">
            <div className="recording-indicator" />
            正在录音...
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceMemo;
