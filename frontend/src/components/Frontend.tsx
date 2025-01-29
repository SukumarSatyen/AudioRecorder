import React, { useState, useCallback } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import FrontendAudioFormat, { SupportedAudioFormat } from './FrontendAudioFormat';
import FrontendBrowser, { BrowserSupport } from './FrontendBrowser';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define the interface for the AudioRecorderType, which includes start and stop methods.
interface AudioRecorderType {
    start: () => void;
    stop: () => Promise<{
        audioBlob: Blob;
        play: () => void;
    }>;
}

// Define the Frontend component as a functional component.
const Frontend: React.FC = () => {
    // Initialize state variables to manage the recording process.
    const [recorder, setRecorder] = useState<AudioRecorderType | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [supportedFormats, setSupportedFormats] = useState<SupportedAudioFormat[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<SupportedAudioFormat | null>(null);
    const [browserSupport, setBrowserSupport] = useState<BrowserSupport | null>(null);

    // Define a callback function to handle the detection of supported audio formats.
    const handleFormatsDetected = useCallback((formats: SupportedAudioFormat[]) => {
        // Update the supportedFormats state with the detected formats.
        setSupportedFormats(formats);
        // Select the first supported format as the default format.
        const defaultFormat = formats.find(format => format.mimeType !== 'No supported audio format found');
        setSelectedFormat(defaultFormat || null);
        // Log the detected formats to the console for debugging purposes.
        console.log('Detected formats:', formats);
        // Display a toast notification to inform the user about the detected formats.
        toast('Detected formats', {
            position: 'top-right',
            autoClose: 3000,
        });
    }, []);

    // Define a callback function to handle the detection of browser support.
    const handleBrowserDetected = useCallback((support: BrowserSupport) => {
        // Update the browserSupport state with the detected support.
        setBrowserSupport(support);
        // Log the detected browser support to the console for debugging purposes.
        console.log('Browser support detected:', support.isModernBrowser ? 'Modern' : 'Legacy');
        // Display a toast notification to inform the user about the detected browser support.
        toast('Browser support detected', {
            position: 'top-right',
            autoClose: 3000,
        });
    }, []);

    // Define an asynchronous function to initialize the media recorder.
    async function initializeMediaRecorder(selectedFormat: any): Promise<MediaRecorder> {
        // Request access to the user's microphone.
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        // Create a new media recorder instance with the selected format.
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: selectedFormat?.mimeType || 'audio/webm'
        });

        // Initialize an array to store audio chunks.
        const audioChunks: Blob[] = [];

        // Add an event listener to the media recorder to handle data availability.
        mediaRecorder.addEventListener("dataavailable", (event) => {
            // Push the available data to the audio chunks array.
            audioChunks.push(event.data);
        });

        // Return the media recorder instance.
        return mediaRecorder;
    }

    // Define a new function to create an audio blob and return the audio element and blob.
    const createAudioBlob = (audioChunks: Blob[], selectedFormat: any): { audioBlob: Blob; audio: HTMLAudioElement } => {
        // Create a new blob from the audio chunks array.
        const audioBlob = new Blob([], { 
            type: selectedFormat?.mimeType || 'audio/webm'
        });
        // Create a URL for the audio blob.
        const audioUrl = URL.createObjectURL(audioBlob);
        // Create a new audio element to play the recorded audio.
        const audio = new Audio(audioUrl);

        // Return the audio blob and audio element.
        return { audioBlob, audio };
    };

    // Define an asynchronous function to handle the recording process.
    const doRecordAudio = async (): Promise<AudioRecorderType> => {
        try {
            // Check if the browser supports the getUserMedia API.
            if (!navigator.mediaDevices?.getUserMedia) {
                // Throw an error if the browser does not support the getUserMedia API.
                throw new Error('Your browser does not support audio recording');
            }

            // Initialize the media recorder with the selected format.
            const mediaRecorder = await initializeMediaRecorder(selectedFormat);
            
            // Define the start method to start the recording process.
            const start = (): void => {
                // Set the isRecording state to true.
                setIsRecording(true);
                // Start the media recorder.
                mediaRecorder.start();
            };

            // Define the stop method to stop the recording process.
            const stop = (): Promise<{ audioBlob: Blob; play: () => void }> => {
                return new Promise((resolve) => {
                    // Add an event listener to the media recorder to handle the stop event.
                    mediaRecorder.addEventListener("stop", () => {
                        // Set the isRecording state to false.
                        setIsRecording(false);

                        // Call createAudioBlob to get the audio blob and audio element.
                        const { audioBlob, audio } = createAudioBlob([], selectedFormat);

                        // Resolve the promise with the recorded audio blob and the play function.
                        /*
                         This approach encapsulates all relevant information about the recording in a single return value, making it easier for the calling function to access both the recorded audio data and the functionality to play it back. 

                         It allows for asynchronous handling of the recording process, ensuring that when the recording is complete, the promise resolves with the results. The play function is defined inline as part of the resolved object, maintaining the context of the recording session. 

                         This structure enhances readability and provides a straightforward way to manage related data and actions, while also allowing for future enhancements by enabling additional properties to be included in the returned object.
                        */
                        resolve({
                            audioBlob,
                            play: () => audio.play()
                        });
                    });

                    // Stop the media recorder.
                    mediaRecorder.stop();
                });
            };

            // Return the start and stop methods as an object.
            return { start, stop };
        } catch (error) {
            // Log any errors that occur during the recording process to the console.
            console.error('Error accessing microphone:', error);
            // Display a toast notification to inform the user of any errors that occurred.
            toast('Error accessing microphone', {
                position: 'top-right',
                autoClose: 3000,
            });
            // Throw the error to propagate it up the call stack.
            throw error;
        }
    };

    // Define a function to process the recorded audio blob.
    function processAudioBlob(audioBlob: Blob) {
        // Check if the browser supports the necessary features.
        if (browserSupport) {
            // Create a new file reader to read the audio blob.
            const reader = new FileReader();
            // Read the audio blob as a data URL.
            reader.readAsDataURL(audioBlob);
            // Add an event listener to the file reader to handle the load end event.
            reader.onloadend = () => {
                // Get the base64 encoded audio data from the file reader.
                const base64 = reader.result as string;
                // Extract the base64 data from the base64 encoded string.
                const base64Data = base64.split(',')[1];
                // Send the base64 data to the server using the browser support API.
                browserSupport.sendVoiceNote(base64Data);
            };
        }
    }

    // Define an asynchronous function to handle the record click event.
    const handleRecordClick = async (): Promise<void> => {
        try {
            // Check if the recording is not currently in progress.
            if (!isRecording) {
                // Request microphone permissions using the Permissions API.
                const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                // Log the current state of the microphone permission to the console.
                console.log('Microphone permission:', permission.state);
                // Display a toast notification to inform the user about the microphone permission status.
                toast('Microphone permission', {
                    position: 'top-right',
                    autoClose: 3000,
                });

                // Create a new recorder instance using the doRecordAudio function.
                const newRecorder = await doRecordAudio();
                // Update the recorder state with the newly created recorder instance.
                setRecorder(newRecorder);
                // Start the recording process using the start method of the new recorder instance.
                newRecorder.start();
            } else if (recorder) {
                // Stop the recording process using the stop method of the recorder instance.
                const audio = await recorder.stop();
                // Play the recorded audio using the play method of the audio object.
                audio.play();
                // Process the recorded audio blob if the browser supports the necessary features.
                if (browserSupport) {
                    processAudioBlob(audio.audioBlob);
                }
            }
        } catch (error) {
            // Log any errors that occur during the recording process to the console.
            console.error('Error handling record click:', error);
            // Display a toast notification to inform the user of any errors that occurred.
            toast('Error handling record click', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    // Return the JSX structure of the Frontend component, which includes a div containing the recording button and other UI elements. This structure defines how the component will be rendered in the browser, allowing user interaction and feedback.
    return (
        <div className="audio-recorder-container" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '20px',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {/* Render a FrontendAudioFormat component to detect supported audio formats. */}
            <FrontendAudioFormat onFormatsDetected={handleFormatsDetected} />
            {/* Render a FrontendBrowser component to detect browser support. */}
            <FrontendBrowser onBrowserDetected={handleBrowserDetected} />

            {/* Conditionally render a message if the browser does not support modern features. */}
            {browserSupport && !browserSupport.isModernBrowser && (
                <div style={{ color: '#ff4444', marginBottom: '10px' }}>
                    Using legacy browser mode (IE11 or below)
                </div>
            )}

            {/* Conditionally render a message if no supported audio formats are found. */}
            {supportedFormats.length > 0 && supportedFormats[0].mimeType === 'No supported audio format found' && (
                <div style={{ color: '#ff4444', marginBottom: '10px' }}>
                    Your browser doesn't support any of the required audio formats
                </div>
            )}

            {/* Conditionally render a message with the selected audio format. */}
            {selectedFormat && (
                <div style={{ color: '#4CAF50', marginBottom: '10px' }}>
                    Using format: {selectedFormat.mimeType}
                </div>
            )}

            {/* Render an icon button to start or stop the recording process. */}
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

// Export the Frontend component as the default export for use in other parts of the application. This allows other modules to import and utilize the Frontend component, facilitating the overall structure and functionality of the application.
export default Frontend;
