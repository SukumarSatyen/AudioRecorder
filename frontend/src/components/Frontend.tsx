import React, { useState, useCallback } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import FrontendAudioFormat, { SupportedAudioFormat } from './FrontendAudioFormat';
import FrontendBrowser, { BrowserSupport } from './FrontendBrowser';

interface AudioRecorderType {
    start: () => void;
    stop: () => Promise<{
        audioBlob: Blob;
        play: () => void;
    }>;
}

const Frontend: React.FC = () => {
    const [recorder, setRecorder] = useState<AudioRecorderType | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [supportedFormats, setSupportedFormats] = useState<SupportedAudioFormat[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<SupportedAudioFormat | null>(null);
    const [browserSupport, setBrowserSupport] = useState<BrowserSupport | null>(null);

    // Callback for receiving formats from audio format child component
    const handleFormatsDetected = useCallback((formats: SupportedAudioFormat[]) => {
        setSupportedFormats(formats);
        // Set the first supported format as selected format
        const defaultFormat = formats.find(format => 
            format.mimeType !== 'No supported audio format found'
        );
        setSelectedFormat(defaultFormat || null);
        console.log('Detected formats:', formats);
    }, []);

    // Callback for receiving browser support from browser child component
    const handleBrowserDetected = useCallback((support: BrowserSupport) => {
        setBrowserSupport(support);
        console.log('Browser support detected:', support.isModernBrowser ? 'Modern' : 'Legacy');
    }, []);

    /**
     * Creates a new audio recorder instance.
     * 
     * @returns A promise resolving to an object with start and stop methods for recording audio.
     */
    const doRecordAudio = async (): Promise<AudioRecorderType> => {
        try {
            // getUserMedia: A browser API for accessing media streams like audio and video from user devices. 
            // It is commonly used for features like video conferencing, voice recording, and camera input. 
            // getUserMedia requires user permission to access media devices.
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Your browser does not support audio recording');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            // MediaRecorder: A web API for capturing media streams and encoding them into multimedia files. 
            // MediaRecorder simplifies recording audio or video data in web applications. 
            // It works with streams from getUserMedia to capture and store media.
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: selectedFormat?.mimeType || 'audio/webm'
            });
            
            const audioChunks: Blob[] = [];

            mediaRecorder.addEventListener("dataavailable", (event) => {
                audioChunks.push(event.data);
            });

            const start = (): void => {
                setIsRecording(true);
                mediaRecorder.start();
            };

            const stop = (): Promise<{ audioBlob: Blob; play: () => void }> => {
                return new Promise((resolve) => {
                    mediaRecorder.addEventListener("stop", () => {
                        setIsRecording(false);

                        // Blob: A binary large object representing immutable data in JavaScript. 
                        // Blobs are commonly used for handling file-like objects like images, videos, and audio. 
                        // They provide methods for slicing, reading, and creating object URLs for browser use.
                        const audioBlob = new Blob(audioChunks, { 
                            type: selectedFormat?.mimeType || 'audio/webm'
                        });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const audio = new Audio(audioUrl);

                        resolve({
                            audioBlob,
                            play: () => audio.play()
                        });
                    });

                    mediaRecorder.stop();
                });
            };

            return { start, stop };
        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw error;
        }
    };

    const handleRecordClick = async (): Promise<void> => {
        try {
            if (!isRecording) {
                // Permissions API: A browser interface for querying and managing user permissions for various resources.
                // It allows checking the state of permissions (e.g., granted, denied, or prompt) for features like microphone access.
                // The API simplifies handling of permissions for enhanced user experience and security.
                const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                console.log('Microphone permission:', permission.state);

                // microphone: A hardware input device used to capture audio for applications.
                // Microphones are essential for features like voice calls, recording, and speech recognition.
                // Applications access microphones using APIs like getUserMedia, with user permission.
                const newRecorder = await doRecordAudio();
                setRecorder(newRecorder);
                newRecorder.start();
            } else if (recorder) {
                const audio = await recorder.stop();
                
                audio.play();

                if (browserSupport) {
                    // FileReader: A web API for reading file contents into memory as data URLs, binary strings, or text.
                    // FileReader is commonly used for processing files selected by users or generated by applications.
                    // It supports asynchronous file reading with event-based handling.
                    const reader = new FileReader();
                    reader.readAsDataURL(audio.audioBlob);
                    reader.onloadend = () => {
                        // base64: A text-based encoding scheme that represents binary data in ASCII format.
                        // Base64 encoding is often used for transmitting binary data (e.g., audio, images) in text-based protocols like HTTP.
                        // It converts data into a compact and safe form for storage or transmission.
                        const base64 = reader.result as string;
                        const base64Data = base64.split(',')[1];
                        browserSupport.sendVoiceNote(base64Data);
                    };
                }
            }
        } catch (error) {
            console.error('Error handling record click:', error);
        }
    };

    return (
        <div className="audio-recorder-container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '20px',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {/* Include the child components */}
            <FrontendAudioFormat onFormatsDetected={handleFormatsDetected} />
            <FrontendBrowser onBrowserDetected={handleBrowserDetected} />

            {browserSupport && !browserSupport.isModernBrowser && (
                <div style={{ color: '#ff4444', marginBottom: '10px' }}>
                    Using legacy browser mode (IE11 or below)
                </div>
            )}

            {supportedFormats.length > 0 && supportedFormats[0].mimeType === 'No supported audio format found' && (
                <div style={{ color: '#ff4444', marginBottom: '10px' }}>
                    Your browser doesn't support any of the required audio formats
                </div>
            )}

            {selectedFormat && (
                <div style={{ color: '#4CAF50', marginBottom: '10px' }}>
                    Using format: {selectedFormat.mimeType}
                </div>
            )}

            <i
                className={`fa ${isRecording ? 'fa-stop-circle' : 'fa-microphone'}`}
                onClick={handleRecordClick}
                style={{ 
                    cursor: 'pointer',
                    fontSize: '2em',
                    color: isRecording ? '#ff4444' : '#333333'
                }}
                aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
                role="button"
                tabIndex={0}
            />
        </div>
    );
};

export default Frontend;
