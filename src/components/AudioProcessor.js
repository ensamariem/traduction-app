import React, { useEffect, useRef } from 'react';

/**
 * Composant qui traite l'audio pour la traduction en temps réel
 * 
 * @param {MediaStream} stream - Le flux média local
 * @param {boolean} isEnabled - Si le traitement est activé
 * @param {string} speakLanguage - La langue parlée par l'utilisateur
 * @param {string} roomCode - Le code de la salle
 * @param {Function} onAudioProcessed - Callback lorsque l'audio est traité
 */
const AudioProcessor = ({ stream, isEnabled, speakLanguage, roomCode, onAudioProcessed }) => {
  // Références pour les objets liés au traitement audio
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);
  const analyserNodeRef = useRef(null);
  
  // Configuration pour la détection de la parole
  const silenceThreshold = -50; // dB
  const silenceTime = 0.5; // secondes
  let silenceDuration = 0;
  let isSpeaking = false;
  
  // Initialiser le traitement audio
  useEffect(() => {
    if (!stream || !isEnabled) return;
    
    // Créer un nouveau contexte audio s'il n'existe pas
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    
    // Créer le source node depuis le stream
    const sourceNode = audioContext.createMediaStreamSource(stream);
    sourceNodeRef.current = sourceNode;
    
    // Créer un ScriptProcessorNode pour le traitement audio
    // Note: Cette API est obsolète mais encore largement utilisée. 
    // Une implémentation complète utiliserait AudioWorklet à la place
    const processorNode = audioContext.createScriptProcessor(4096, 1, 1);
    processorNodeRef.current = processorNode;
    
    // Créer un AnalyserNode pour la détection de la parole
    const analyserNode = audioContext.createAnalyser();
    analyserNodeRef.current = analyserNode;
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.8;
    
    // Connecter les nœuds ensemble
    sourceNode.connect(analyserNode);
    analyserNode.connect(processorNode);
    
    // Le processeur doit être connecté à la destination pour que le traitement fonctionne
    // Mais nous utilisons gain = 0 pour éviter la rétroaction audio
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    processorNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Traitement audio
    processorNode.onaudioprocess = (e) => {
      if (!isEnabled) return;
      
      // Obtenir les données audio
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Analyse pour détecter la parole (silence/activité)
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);
      
      // Calculer l'intensité moyenne
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      
      const average = sum / bufferLength;
      const decibels = 20 * Math.log10(average / 255);
      
      // Détection de parole
      const frameTime = e.inputBuffer.duration;
      
      if (decibels < silenceThreshold) {
        silenceDuration += frameTime;
        if (silenceDuration > silenceTime && isSpeaking) {
          isSpeaking = false;
          // Fin de parole - on pourrait envoyer un signal ici
        }
      } else {
        if (!isSpeaking) {
          isSpeaking = true;
          silenceDuration = 0;
          
          // Début de parole - envoyer un échantillon audio
          // Dans une implémentation réelle, on collecterait plus de données
          // avant d'envoyer pour traduction
          
          // Exemple simple : créer un audio buffer pour l'envoi
          if (onAudioProcessed) {
            // Convertir les données Float32Array en Int16Array pour la compression
            const audioData = convertFloat32ToInt16(inputData);
            
            // En réalité, ici on utiliserait WebRTC data channels ou une API 
            // pour envoyer l'audio au service de traduction
            onAudioProcessed({
              audio: audioData,
              language: speakLanguage,
              timestamp: Date.now()
            });
          }
        } else {
          silenceDuration = 0;
        }
      }
    };
    
    // Nettoyage lors du démontage
    return () => {
      if (processorNode) {
        processorNode.disconnect();
        processorNodeRef.current = null;
      }
      
      if (analyserNode) {
        analyserNode.disconnect();
        analyserNodeRef.current = null;
      }
      
      if (sourceNode) {
        sourceNode.disconnect();
        sourceNodeRef.current = null;
      }
    };
  }, [stream, isEnabled, speakLanguage, onAudioProcessed]);
  
  // Fonction utilitaire pour convertir Float32Array en Int16Array (compression)
  const convertFloat32ToInt16 = (buffer) => {
    const l = buffer.length;
    const buf = new Int16Array(l);
    
    for (let i = 0; i < l; i++) {
      // Conversion de float32 [-1,1] en int16 [-32768,32767]
      buf[i] = Math.min(1, Math.max(-1, buffer[i])) * 0x7FFF;
    }
    
    return buf;
  };
  
  // Ce composant ne rend rien visuellement
  return null;
};

export default AudioProcessor;