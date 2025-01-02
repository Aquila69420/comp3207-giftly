import React, { useEffect } from "react";
import config from "../config";
import { useAudioRecorder } from "react-audio-voice-recorder";

const VoiceRecorder = ({ updatePrompt }) => {
  const sendAudioToBackend = async (webaBlob) => {
    try {
      const wavBlob = await convertToWav(webaBlob);
      const wavURL = URL.createObjectURL(wavBlob);

      console.log("Converted WAV URL:", wavURL);

      // Send WAV blob to the backend
      const formData = new FormData();
      formData.append("audio", wavBlob, "recording.wav");

      const response = await fetch(`${config.backendURL}/process_audio`, {
        method: "POST",
        body: formData,
      });

      // Log the response
      const result = await response.json();
      console.log("Backend response:", result);

      // Handle the result as needed
      if (response.ok) {
        console.log("Transcription:", result.transcription);
        if (updatePrompt) {
          updatePrompt(result.transcription); // Update the search bar text
        }
      } else {
        console.error("Backend error:", result.error);
      }
    } catch (error) {
      console.error("Error during WAV conversion or sending:", error);
    }
  };

  const { startRecording, stopRecording, isRecording, recordingBlob } =
    useAudioRecorder({
      audioTrackConstraints: {
        noiseSuppression: true,
        echoCancellation: true,
      },
      downloadFileExtension: "wav",
    });

  // Handle the completion of the recording
  useEffect(() => {
    if (!recordingBlob) return;

    console.log("Recording complete. Blob:", recordingBlob);

    const audioURL = URL.createObjectURL(recordingBlob);
    console.log("Generated audio URL:", audioURL);

    // Send the audio to the backend
    sendAudioToBackend(recordingBlob);
  }, [recordingBlob]);

  const convertToWav = async (webaBlob) => {
    const arrayBuffer = await webaBlob.arrayBuffer();

    // Create an AudioContext with the desired sample rate of 16000 Hz
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(
      {
        sampleRate: 16000,
      }
    );

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioContext.sampleRate; // Ensures it is 16000
    const length = audioBuffer.length * numberOfChannels * 2;

    const wavBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(wavBuffer);

    // RIFF chunk descriptor
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, "WAVE");

    // FMT sub-chunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Sub-chunk size
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, numberOfChannels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, sampleRate * numberOfChannels * 2, true); // Byte rate
    view.setUint16(32, numberOfChannels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample

    // Data sub-chunk
    writeString(view, 36, "data");
    view.setUint32(40, length, true);

    // Write PCM samples
    const interleaved = interleave(audioBuffer);
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++, offset += 2) {
      view.setInt16(offset, interleaved[i] * 0x7fff, true);
    }

    return new Blob([view], { type: "audio/wav" });
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const interleave = (audioBuffer) => {
    const { numberOfChannels, length } = audioBuffer;
    const channels = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    const interleaved = new Float32Array(length * numberOfChannels);
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        interleaved[i * numberOfChannels + channel] = channels[channel][i];
      }
    }

    return interleaved;
  };

  return (
    <div>
      {/* Start/Stop buttons with your custom styling */}
      {!isRecording ? (
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "white",
          }}
          onClick={() => {
            console.log("Start recording clicked");
            startRecording();
          }}
        >
          <svg
            width="35"
            height="35"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: "white" }}
          >
            <path
              d="M9.5 4C8.67157 4 8 4.67157 8 5.5V18.5C8 19.3284 8.67157 20 9.5 20C10.3284 20 11 19.3284 11 18.5V5.5C11 4.67157 10.3284 4 9.5 4Z"
              fill="currentColor"
            ></path>
            <path
              d="M13 8.5C13 7.67157 13.6716 7 14.5 7C15.3284 7 16 7.67157 16 8.5V15.5C16 16.3284 15.3284 17 14.5 17C13.6716 17 13 16.3284 13 15.5V8.5Z"
              fill="currentColor"
            ></path>
            <path
              d="M4.5 9C3.67157 9 3 9.67157 3 10.5V13.5C3 14.3284 3.67157 15 4.5 15C5.32843 15 6 14.3284 6 13.5V10.5C6 9.67157 5.32843 9 4.5 9Z"
              fill="currentColor"
            ></path>
            <path
              d="M19.5 9C18.6716 9 18 9.67157 18 10.5V13.5C18 14.3284 18.6716 15 19.5 15C20.3284 15 21 14.3284 21 13.5V10.5C21 9.67157 20.3284 9 19.5 9Z"
              fill="currentColor"
            ></path>
          </svg>
        </button>
      ) : (
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "red",
          }}
          onClick={() => {
            console.log("Stop recording clicked");
            stopRecording();
          }}
        >
          <svg
            width="35"
            height="35"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C10.3431 2 9 3.34315 9 5V19C9 20.6569 10.3431 22 12 22C13.6569 22 15 20.6569 15 19V5C15 3.34315 13.6569 2 12 2Z"
              fill="currentColor"
            ></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;
