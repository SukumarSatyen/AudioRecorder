import React, { useEffect } from 'react';

export interface AudioFormat {
    mimeType: string;
    codecs: string;
}

export interface SupportedAudioFormat extends AudioFormat {
    browserName: string;
    browserVersion: string;
}

interface FrontendAudioFormatProps {
    onFormatsDetected: (formats: SupportedAudioFormat[]) => void;
}

const FrontendAudioFormat: React.FC<FrontendAudioFormatProps> = ({ onFormatsDetected }) => {
    console.log('[FrontendAudioFormat.tsx, FrontendAudioFormat] Initializing FrontendAudioFormat component');

    useEffect(() => {
        console.log('[FrontendAudioFormat.tsx, useEffect] Starting format detection');
        
        const getSupportedAudioFormats = async (): Promise<SupportedAudioFormat[]> => {
            console.log('[FrontendAudioFormat.tsx, getSupportedAudioFormats] Checking supported audio formats');
            
            const formats: AudioFormat[] = [
                { mimeType: 'audio/mpeg', codecs: 'mp3' },
                { mimeType: 'audio/ogg; codecs=opus', codecs: 'opus' },
                { mimeType: 'audio/webm; codecs=opus', codecs: 'opus' },
                { mimeType: 'audio/mp4; codecs=aac', codecs: 'aac' }
            ];

            console.log('[FrontendAudioFormat.tsx, getSupportedAudioFormats] Testing formats:', formats);

            const supported = formats
                .map(format => {
                    const canPlay = document.createElement('audio').canPlayType(format.mimeType);
                    console.log('[FrontendAudioFormat.tsx, getSupportedAudioFormats] Testing format:', {
                        format: format.mimeType,
                        support: canPlay
                    });
                    
                    if (canPlay === "probably" || canPlay === "maybe") {
                        return {
                            ...format,
                            browserName: navigator.userAgent,
                            browserVersion: navigator.appVersion
                        };
                    }
                    return null;
                })
                .filter((format): format is SupportedAudioFormat => format !== null);

            console.log('[FrontendAudioFormat.tsx, getSupportedAudioFormats] Supported formats found:', supported.length);

            if (supported.length === 0) {
                console.warn('[FrontendAudioFormat.tsx, getSupportedAudioFormats] No supported audio formats found');
                return [{
                    mimeType: 'No supported audio format found',
                    codecs: 'No supported audio format found',
                    browserName: navigator.userAgent,
                    browserVersion: navigator.appVersion
                }];
            }

            return supported;
        };

        getSupportedAudioFormats()
            .then(formats => {
                console.log('[FrontendAudioFormat.tsx, useEffect] Detected formats:', formats);
                onFormatsDetected(formats);
            })
            .catch(error => {
                console.error('[FrontendAudioFormat.tsx, useEffect] Error detecting formats:', error);
            });
    }, [onFormatsDetected]);

    return null;
};

export default FrontendAudioFormat;
