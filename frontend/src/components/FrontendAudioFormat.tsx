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
    useEffect(() => {
        const getSupportedAudioFormats = async (): Promise<SupportedAudioFormat[]> => {
            // Define the audio formats to check
            const formats: AudioFormat[] = [
                { mimeType: 'audio/mpeg', codecs: 'mp3' },
                { mimeType: 'audio/ogg; codecs=opus', codecs: 'opus' },
                { mimeType: 'audio/webm; codecs=opus', codecs: 'opus' },
                { mimeType: 'audio/mp4; codecs=aac', codecs: 'aac' }
            ];

            const supported = formats
                .map(format => {
                    const canPlay = document.createElement('audio').canPlayType(format.mimeType);
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

            if (supported.length === 0) {
                return [{
                    mimeType: 'No supported audio format found',
                    codecs: 'No supported audio format found',
                    browserName: navigator.userAgent,
                    browserVersion: navigator.appVersion
                }];
            }

            return supported;
        };

        // Get supported formats and notify parent
        getSupportedAudioFormats().then(formats => {
            onFormatsDetected(formats);
        });
    }, [onFormatsDetected]);

    // Child doesn't render anything
    return null;
};

export default FrontendAudioFormat;
