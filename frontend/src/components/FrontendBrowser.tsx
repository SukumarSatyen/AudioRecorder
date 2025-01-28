import React, { useEffect } from 'react';

export interface BrowserSupport {
    isModernBrowser: boolean;
    sendVoiceNote: (base64: string) => Promise<void>;
}

interface FrontendBrowserProps {
    onBrowserDetected: (support: BrowserSupport) => void;
}

/**
 * A component that detects browser capabilities and provides appropriate APIs for voice note handling.
 * This component doesn't render anything visually.
 */
const FrontendBrowser: React.FC<FrontendBrowserProps> = ({ onBrowserDetected }) => {
    useEffect(() => {
        const detectBrowserSupport = () => {
            // Check if the browser supports fetch and other modern APIs
            const isIE = /*@cc_on!@*/false || !!(document as any).documentMode;
            const isEdgeHTML = !(window as any).StyleMedia;
            const isModernBrowser = !isIE && isEdgeHTML && 'fetch' in window;

            // Modern approach using fetch
            const sendVoiceNoteWithFetch = async (base64: string): Promise<void> => {
                try {
                    // Blob: A binary large object representing immutable data in JavaScript. 
                    // Blobs are commonly used for handling file-like objects like images, videos, and audio. 
                    // They provide methods for slicing, reading, and creating object URLs for browser use.
                    const formData = new FormData();
                    formData.append("base64", base64);

                    const response = await fetch("http://localhost:3002/sendVoiceNote", {
                        method: "POST",
                        body: formData
                    });

                    if (response.ok) {
                        console.log(await response.text());
                    } else {
                        console.error('Error:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error sending voice note:', error);
                }
            };

            // Traditional Ajax approach for IE11 and below
            const sendVoiceNoteWithAjax = async (base64: string): Promise<void> => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST", "http://localhost:3002/sendVoiceNote", true);

                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                console.log(xhr.responseText);
                                resolve();
                            } else {
                                console.error('Error:', xhr.statusText);
                                reject(new Error(xhr.statusText));
                            }
                        }
                    };

                    // Blob: A binary large object representing immutable data in JavaScript. 
                    // Blobs are commonly used for handling file-like objects like images, videos, and audio. 
                    // They provide methods for slicing, reading, and creating object URLs for browser use.
                    const formData = new FormData();
                    formData.append("base64", base64);
                    xhr.send(formData);
                });
            };

            // Create the browser support object
            const browserSupport: BrowserSupport = {
                isModernBrowser,
                sendVoiceNote: isModernBrowser ? sendVoiceNoteWithFetch : sendVoiceNoteWithAjax
            };

            console.log(`Using ${isModernBrowser ? 'modern fetch API' : 'legacy XMLHttpRequest'}`);
            onBrowserDetected(browserSupport);
        };

        detectBrowserSupport();
    }, [onBrowserDetected]);

    // Child doesn't render anything
    return null;
};

export default FrontendBrowser;
