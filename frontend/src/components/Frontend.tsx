import React, { useState, useCallback } from "react"
import "@fortawesome/fontawesome-free/css/all.min.css"
import FrontendAudioFormat, {
  SupportedAudioFormat,
} from "./FrontendAudioFormat"
import FrontendBrowser, { BrowserSupport } from "./FrontendBrowser"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Define the interface for the AudioRecorderType, which includes start and stop methods.
interface AudioRecorderType {
  start: () => void
  stop: () => Promise<{
    audioBlob: Blob
    play: () => void
  }>
}

// Define the Frontend component as a functional component.
const Frontend: React.FC = () => {
  console.log('[Frontend.tsx, Frontend] Initializing Frontend component');
  
  // Initialize state variables to manage the recording process.
  const [recorder, setRecorder] = useState<AudioRecorderType | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [supportedFormats, setSupportedFormats] = useState<
    SupportedAudioFormat[]
  >([])
  const [selectedFormat, setSelectedFormat] =
    useState<SupportedAudioFormat | null>(null)
  const [browserSupport, setBrowserSupport] = useState<BrowserSupport | null>(
    null
  )

  console.log('[Frontend.tsx, Frontend] Initial state:', {
    hasRecorder: !!recorder,
    isRecording,
    supportedFormatsCount: supportedFormats.length,
    selectedFormat: selectedFormat?.mimeType,
    browserSupport: browserSupport?.isModernBrowser ? 'Modern' : 'Legacy'
  });

  /*
  Keywords: [const, useState, setRecorder, setIsRecording, setSupportedFormats, setSelectedFormat, setBrowserSupport]

  Technical: Initializes state variables for managing the audio recording process, including recorder instance, recording status, supported audio formats, selected format, and browser support.
  Role:  
    - const: Declares constants for state variables, ensuring they are immutable.
    - useState: React hook that allows functional components to manage state.
    - setRecorder, setIsRecording, setSupportedFormats, setSelectedFormat, setBrowserSupport: Functions to update the respective state variables.
  Constraints: State updates may be asynchronous, leading to potential stale state if not handled correctly.
  Actions: Initializes state variables to manage the recording process.
  Dependencies: Relies on the React library for state management.
  Outputs: Sets initial values for state variables used throughout the component.
  Performance: State updates can cause re-renders; optimizing state management is crucial for performance.
  Security: No direct security concerns in state initialization, but state values should be validated before use.
  Scalability: The state management approach scales well with additional features, but careful consideration is needed for complex state interactions.
  Errors: Errors in state updates are generally handled by React, but custom error handling may be needed for specific cases.
  */

  // Define a callback function to handle the detection of supported audio formats.
  const handleFormatsDetected = useCallback(
    (formats: SupportedAudioFormat[]) => {
      console.log('[Frontend.tsx, handleFormatsDetected] Detected audio formats:', formats);
      // Update the supportedFormats state with the detected formats.
      setSupportedFormats(formats)
      // Select the first supported format as the default format.
      const defaultFormat = formats.find(
        (format) => format.mimeType !== "No supported audio format found"
      )
      setSelectedFormat(defaultFormat || null)
      console.log('[Frontend.tsx, handleFormatsDetected] Selected default format:', defaultFormat);
      // Log the detected formats to the console for debugging purposes.
      console.log("Detected formats:", formats)
      // Display a toast notification to inform the user about the detected formats.
      toast("Detected formats", {
        position: "top-right",
        autoClose: 3000,
      })
    },
    []
  )

  /*
  Keywords: [const, handleFormatsDetected, useCallback, setSupportedFormats, setSelectedFormat]

  Technical: Defines a callback function that updates the state with detected audio formats and sets a default format.
  Role:  
    - const: Declares a constant for the callback function.
    - useCallback: React hook that memoizes the function, preventing unnecessary re-creations.
    - setSupportedFormats, setSelectedFormat: Functions to update the respective state variables.
  Constraints: The function may not work correctly if formats are not detected or if the input is invalid.
  Actions: Updates the supported formats and selects a default format based on detection results.
  Dependencies: Relies on the React library and the toast notification library.
  Outputs: Updates the component state with supported formats and triggers a toast notification.
  Performance: Memoization helps improve performance by preventing unnecessary renders.
  Security: No direct security concerns, but input validation is essential.
  Scalability: The function can handle various formats, but may need enhancements for more complex format handling.
  Errors: Errors in format detection should be handled gracefully, possibly by notifying the user.
  */

  // Define a callback function to handle the detection of browser support.
  const handleBrowserDetected = useCallback((support: BrowserSupport) => {
    console.log('[Frontend.tsx, handleBrowserDetected] Browser support detected:', {
      isModernBrowser: support.isModernBrowser,
      details: support
    });
    // Update the browserSupport state with the detected support.
    setBrowserSupport(support)
    // Log the detected browser support to the console for debugging purposes.
    console.log(
      "Browser support detected:",
      support.isModernBrowser ? "Modern" : "Legacy"
    )
    // Display a toast notification to inform the user about the detected browser support.
    toast("Browser support detected", {
      position: "top-right",
      autoClose: 3000,
    })
  }, [])

  /*
  Keywords: [const, handleBrowserDetected, useCallback, setBrowserSupport]

  Technical: Defines a callback function that updates the state with detected browser support information.
  Role:  
    - const: Declares a constant for the callback function.
    - useCallback: React hook that memoizes the function, preventing unnecessary re-creations.
    - setBrowserSupport: Function to update the browser support state variable.
  Constraints: The function may not work correctly if the support information is not provided or is invalid.
  Actions: Updates the browser support state and triggers a toast notification.
  Dependencies: Relies on the React library and the toast notification library.
  Outputs: Updates the component state with browser support information and triggers a toast notification.
  Performance: Memoization helps improve performance by preventing unnecessary renders.
  Security: No direct security concerns, but input validation is essential.
  Scalability: The function can handle various browser support scenarios but may need enhancements for more complex support checks.
  Errors: Errors in browser detection should be handled gracefully, possibly by notifying the user.
  */

  // Define an asynchronous function to initialize the media recorder.
  async function initializeMediaRecorder(
    selectedFormat: any
  ): Promise<MediaRecorder> {
    console.log('[Frontend.tsx, initializeMediaRecorder] Initializing media recorder with format:', selectedFormat?.mimeType);
    try {
      // Request access to the user's microphone.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      console.log('[Frontend.tsx, initializeMediaRecorder] Audio stream obtained successfully');

      // Create a new media recorder instance with the selected format.
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedFormat?.mimeType || "audio/webm",
      })
      console.log('[Frontend.tsx, initializeMediaRecorder] MediaRecorder created successfully');

      // Initialize an array to store audio chunks.
      const audioChunks: Blob[] = []

      // Add an event listener to the media recorder to handle data availability.
      mediaRecorder.addEventListener("dataavailable", (event) => {
        console.log('[Frontend.tsx, initializeMediaRecorder.dataavailable] New audio chunk received:', {
          size: event.data.size
        });
        // Push the available data to the audio chunks array.
        audioChunks.push(event.data)
      })

      // Return the media recorder instance.
      return mediaRecorder
    } catch (error) {
      console.error('[Frontend.tsx, initializeMediaRecorder] Error initializing media recorder:', error);
      // Log any errors that occur during the recording process to the console.
      throw error
    }
  }

  /*
  Keywords: [async, function, initializeMediaRecorder, navigator, MediaRecorder, getUserMedia]

  Technical: Asynchronously initializes a media recorder instance with the user's audio stream.
  Role:  
    - async: Declares the function as asynchronous, allowing the use of await.
    - function: Defines a reusable block of code.
    - navigator: Provides access to browser functionalities, including media devices.
    - MediaRecorder: API for recording audio.
    - getUserMedia: Requests access to the user's microphone.
  Constraints: May fail if the user denies microphone access or if the browser does not support the API.
  Actions: Requests microphone access, creates a media recorder instance, and sets up data availability handling.
  Dependencies: Relies on the MediaRecorder API and the getUserMedia function.
  Outputs: Returns a media recorder instance for recording audio.
  Performance: The process may introduce latency due to microphone access requests.
  Security: Access to the microphone requires user permission, and any recorded data should be handled securely.
  Scalability: The function can handle multiple recordings but may need enhancements for concurrent recordings.
  Errors: Errors in initialization should be handled gracefully, potentially notifying the user.
  */

  // Define a new function to create an audio blob and return the audio element and blob.
  const createAudioBlob = (
    audioChunks: Blob[],
    selectedFormat: any
  ): { audioBlob: Blob; audio: HTMLAudioElement } => {
    console.log('[Frontend.tsx, createAudioBlob] Creating audio blob', {
      chunksCount: audioChunks.length,
      format: selectedFormat?.mimeType
    });
    
    // Create a new blob from the audio chunks array.
    const audioBlob = new Blob([], {
      type: selectedFormat?.mimeType || "audio/webm",
    })
    // Create a URL for the audio blob.
    const audioUrl = URL.createObjectURL(audioBlob)
    // Create a new audio element to play the recorded audio.
    const audio = new Audio(audioUrl)

    console.log('[Frontend.tsx, createAudioBlob] Audio blob created successfully');
    // Return the audio blob and audio element.
    return { audioBlob, audio }
  }

  /*
  Keywords: [const, createAudioBlob, Blob, URL, Audio]

  Technical: Creates an audio blob from recorded audio chunks and generates a URL for playback.
  Role:  
    - const: Declares a constant for the function.
    - createAudioBlob: Function that encapsulates audio blob creation logic.
    - Blob: Represents the audio data.
    - URL: API for creating object URLs.
    - Audio: API for playing audio.
  Constraints: The function may fail if audio chunks are empty or if the format is unsupported.
  Actions: Creates a blob from audio chunks and generates a URL for playback.
  Dependencies: Relies on the Blob, URL, and Audio APIs.
  Outputs: Returns an audio blob and an audio element for playback.
  Performance: Blob creation is efficient, but large audio files may impact performance.
  Security: Ensure that audio data is handled securely to prevent leaks.
  Scalability: The function can handle various audio formats but may need enhancements for larger audio datasets.
  Errors: Errors in blob creation should be handled gracefully, potentially notifying the user.
  */

  // Define an asynchronous function to handle the recording process.
  const doRecordAudio = async (): Promise<AudioRecorderType> => {
    console.log('[Frontend.tsx, doRecordAudio] Starting audio recording process');
    try {
      // Check if the browser supports the getUserMedia API.
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error('[Frontend.tsx, doRecordAudio] Browser does not support getUserMedia');
        // Throw an error if the browser does not support the getUserMedia API.
        throw new Error("Your browser does not support audio recording")
      }

      // Initialize the media recorder with the selected format.
      const mediaRecorder = await initializeMediaRecorder(selectedFormat)

      // Define the start method to start the recording process.
      const start = (): void => {
        console.log('[Frontend.tsx, doRecordAudio.start] Starting recording');
        // Set the isRecording state to true.
        setIsRecording(true)
        // Start the media recorder.
        mediaRecorder.start()
      }

      // Define the stop method to stop the recording process.
      const stop = (): Promise<{ audioBlob: Blob; play: () => void }> => {
        console.log('[Frontend.tsx, doRecordAudio.stop] Stopping recording');
        return new Promise((resolve) => {
          // Add an event listener to the media recorder to handle the stop event.
          mediaRecorder.addEventListener("stop", () => {
            console.log('[Frontend.tsx, doRecordAudio.stop] Recording stopped');
            // Set the isRecording state to false.
            setIsRecording(false)

            // Call createAudioBlob to get the audio blob and audio element.
            const { audioBlob, audio } = createAudioBlob([], selectedFormat)
            console.log('[Frontend.tsx, doRecordAudio.stop] Audio blob created for playback');

            // Resolve the promise with the recorded audio blob and the play function.
            /*
                         This approach encapsulates all relevant information about the recording in a single return value, making it easier for the calling function to access both the recorded audio data and the functionality to play it back. 
                         It allows for asynchronous handling of the recording process, ensuring that when the recording is complete, the promise resolves with the results. The play function is defined inline as part of the resolved object, maintaining the context of the recording session. 
                         This structure enhances readability and provides a straightforward way to manage related data and actions, while also allowing for future enhancements by enabling additional properties to be included in the returned object.
                        */
            resolve({
              audioBlob,
              play: () => {
                console.log('[Frontend.tsx, doRecordAudio.play] Playing recorded audio');
                audio.play()
              },
            })
          })

          // Stop the media recorder.
          mediaRecorder.stop()
        })
      }

      // Return the start and stop methods as an object.
      return { start, stop }
    } catch (error) {
      console.error('[Frontend.tsx, doRecordAudio] Error in recording process:', error);
      // Log any errors that occur during the recording process to the console.
      console.error("Error accessing microphone:", error)
      // Display a toast notification to inform the user of any errors that occurred.
      toast("Error accessing microphone", {
        position: "top-right",
        autoClose: 3000,
      })
      // Throw the error to propagate it up the call stack.
      throw error
    }
  }

  // Define a function to process the recorded audio blob.
  function processAudioBlob(audioBlob: Blob) {
    // Check if the browser supports the necessary features.
    if (browserSupport) {
      // Create a new file reader to read the audio blob.
      const reader = new FileReader()
      // Read the audio blob as a data URL.
      reader.readAsDataURL(audioBlob)
      // Add an event listener to the file reader to handle the load end event.
      reader.onloadend = () => {
        // Get the base64 encoded audio data from the file reader.
        const base64 = reader.result as string
        // Extract the base64 data from the base64 encoded string.
        const base64Data = base64.split(",")[1]
        // Send the base64 data to the server using the browser support API.
        browserSupport.sendVoiceNote(base64Data)
      }
    }
  }

  // Define an asynchronous function to handle the record click event.
  const handleRecordClick = async (): Promise<void> => {
    try {
      // Check if the recording is not currently in progress.
      if (!isRecording) {
        // Request microphone permissions using the Permissions API.
        const permission = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        })
        // Log the current state of the microphone permission to the console.
        console.log("Microphone permission:", permission.state)
        // Display a toast notification to inform the user about the microphone permission status.
        toast("Microphone permission", {
          position: "top-right",
          autoClose: 3000,
        })

        // Create a new recorder instance using the doRecordAudio function.
        const newRecorder = await doRecordAudio()
        // Update the recorder state with the newly created recorder instance.
        setRecorder(newRecorder)
        // Start the recording process using the start method of the new recorder instance.
        newRecorder.start()
      } else if (recorder) {
        // Stop the recording process using the stop method of the recorder instance.
        const audio = await recorder.stop()
        // Play the recorded audio using the play method of the audio object.
        audio.play()
        // Process the recorded audio blob if the browser supports the necessary features.
        if (browserSupport) {
          processAudioBlob(audio.audioBlob)
        }
      }
    } catch (error) {
      // Log any errors that occur during the recording process to the console.
      console.error("Error handling record click:", error)
      // Display a toast notification to inform the user of any errors that occurred.
      toast("Error handling record click", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  /*
      Keywords: [async, doRecordAudio, initializeMediaRecorder, mediaRecorder, start, stop]

      Technical: Asynchronously handles the audio recording process, initializing the media recorder and defining start and stop methods.
      Role:  
        - async: Declares the function as asynchronous, allowing the use of await.
        - doRecordAudio: Main function to manage audio recording.
        - initializeMediaRecorder: Function to set up the media recorder.
        - mediaRecorder: Instance of the MediaRecorder API for recording audio.
        - start, stop: Methods to control the recording process.
      Constraints: The function may fail if the media recorder cannot be initialized or if the start/stop methods are not defined correctly.
      Actions: Initializes the media recorder and defines methods to start and stop recording.
      Dependencies: Relies on the MediaRecorder API and the initializeMediaRecorder function.
      Outputs: Returns an object containing the audio blob and a play function.
      Performance: Efficiently manages the recording process, but large audio files may impact performance.
      Security: Ensure that audio data is handled securely to prevent leaks.
      Scalability: The function can handle multiple recordings but may need enhancements for concurrent recordings.
      Errors: Errors in the recording process should be handled gracefully, potentially notifying the user.
      */

  // Return the JSX structure of the Frontend component, which includes a div containing the recording button and other UI elements. This structure defines how the component will be rendered in the browser, allowing user interaction and feedback.
  return (
    <div
      className="audio-recorder-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Render a FrontendAudioFormat component to detect supported audio formats. */}
      <FrontendAudioFormat onFormatsDetected={handleFormatsDetected} />
      {/* Render a FrontendBrowser component to detect browser support. */}
      <FrontendBrowser onBrowserDetected={handleBrowserDetected} />

      {/* Conditionally render a message if the browser does not support modern features. */}
      {browserSupport && !browserSupport.isModernBrowser && (
        <div style={{ color: "#ff4444", marginBottom: "10px" }}>
          Using legacy browser mode (IE11 or below)
        </div>
      )}

      {/* Conditionally render a message if no supported audio formats are found. */}
      {supportedFormats.length > 0 &&
        supportedFormats[0].mimeType === "No supported audio format found" && (
          <div style={{ color: "#ff4444", marginBottom: "10px" }}>
            Your browser doesn't support any of the required audio formats
          </div>
        )}

      {/* Conditionally render a message with the selected audio format. */}
      {selectedFormat && (
        <div style={{ color: "#4CAF50", marginBottom: "10px" }}>
          Using format: {selectedFormat.mimeType}
        </div>
      )}

      {/* Render an icon button to start or stop the recording process. */}
      <i
        className={`fa ${isRecording ? "fa-stop-circle" : "fa-microphone"}`}
        onClick={handleRecordClick}
        style={{
          cursor: "pointer",
          fontSize: "2em",
          color: isRecording ? "#ff4444" : "#333333",
        }}
        aria-label={isRecording ? "Stop Recording" : "Start Recording"}
        role="button"
        tabIndex={0}
      />
    </div>
  )
}

// Export the Frontend component as the default export for use in other parts of the application. This allows other modules to import and utilize the Frontend component, facilitating the overall structure and functionality of the application.
export default Frontend

// pending to add

// Add visual feedback during recording (e.g., waveform visualization)

// Implement recording duration timer

// Add audio playback controls

// Implement chunk upload for long recordings

// Add format selection dropdown

// Implement error boundary for the component

// Add unit tests for media handling logic

// Implement proper loading states

// Add cancellation support during recording

// Implement retry logic for failed uploads
