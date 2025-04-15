// ConferenceBroadcastScreen.jsx (modifié)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, ChevronLeft, Globe, Copy, Download, Settings, Play, Pause, QrCode, Check, X, Video, Users, MessageSquare, FileText, AlertTriangle, MicOff, VideoOff, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

const ConferenceBroadcastScreen = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();
  const [title, setTitle] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguages, setTargetLanguages] = useState([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [participantsList, setParticipantsList] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [micAccess, setMicAccess] = useState(false);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [streamStartTime, setStreamStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [conferenceSummary, setConferenceSummary] = useState('');
  const [settings, setSettings] = useState({
    audioQuality: 'medium',
    videoQuality: 'medium',
    noiseReduction: 0.5,
    normalizeSpeech: true,
    allowReplay: true,
    allowDownload: false,
    enableChat: true
  });
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [stoppingConference, setStoppingConference] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraPaused, setCameraPaused] = useState(false);
  
  // État pour l'enregistrement de la conférence
  const [recordConference, setRecordConference] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [pinError, setPinError] = useState('');
  
  // États et refs WebRTC
  const [peerConnections, setPeerConnections] = useState({});
  const peerConnectionsRef = useRef({});
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const mediaSourceRef = useRef(null);
  const mediaBufferRef = useRef([]);
  const [recording, setRecording] = useState(false);
  
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const videoStreamRef = useRef(null);
  const videoRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const wsRef = useRef(null);
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  
  const API_BASE_URL = "http://localhost:8000/api";
  
  // Configuration WebRTC
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  // Charger les informations de la conférence
  useEffect(() => {
    // Récupérer les données sauvegardées
    const savedData = localStorage.getItem('conferenceData');
    
    if (savedData) {
      const conferenceData = JSON.parse(savedData);
      
      if (conferenceData.id !== conferenceId) {
        // Si l'ID ne correspond pas, rediriger vers la création
        navigate('/conference/create');
        return;
      }
      
      setTitle(conferenceData.title);
      setSourceLanguage(conferenceData.sourceLanguage);
      setTargetLanguages(conferenceData.targetLanguages);
      
      // Charger les paramètres s'ils existent
      if (conferenceData.settings) {
        setSettings(conferenceData.settings);
      }
      
      setVideoEnabled(conferenceData.hasVideo !== false);
    } else {
      // Si pas de données, essayer de récupérer depuis l'API
      fetchConferenceData();
    }
    
    // Cleanup
    return () => {
      // Ne stopper que si la diffusion est active
      if (isBroadcasting) {
        stopBroadcasting();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [conferenceId, navigate, isBroadcasting]);
  
  // Récupérer les données de la conférence depuis l'API
  const fetchConferenceData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conferences/${conferenceId}`);
      
      if (response.data && response.data.success) {
        const conference = response.data.conference;
        
        // Vérifier uniquement si la conférence est terminée, pas si elle est nouvelle
        if (conference.status === "ended") {
          alert("Cette conférence est déjà terminée. Vous allez être redirigé vers la page de création.");
          navigate('/conference/create');
          return;
        }
        
        setTitle(conference.title);
        setSourceLanguage(conference.sourceLanguage);
        setTargetLanguages(conference.targetLanguages);
        setVideoEnabled(conference.hasVideo !== false);
        
        // Si la conférence est déjà active, mettre à jour l'état
        if (conference.status === "active") {
          setIsBroadcasting(true);
          if (conference.startTime) {
            const startTime = new Date(conference.startTime);
            setStreamStartTime(startTime);
            
            // Calculer le temps écoulé
            const now = new Date();
            const diff = Math.floor((now - startTime) / 1000);
            const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
            const seconds = Math.floor(diff % 60).toString().padStart(2, '0');
            setElapsedTime(`${hours}:${minutes}:${seconds}`);
          }
        }
        // Une nouvelle conférence est prête à diffuser, pas besoin de message d'erreur
      } else {
        // Si pas de données, rediriger vers la création
        navigate('/conference/create');
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données de la conférence:", error);
      navigate('/conference/create');
    }
  };
  
  // Faire défiler le chat vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Mettre à jour le compteur de temps
  useEffect(() => {
    if (isBroadcasting && streamStartTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - streamStartTime) / 1000);
        const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const seconds = Math.floor(diff % 60).toString().padStart(2, '0');
        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBroadcasting, streamStartTime]);
  
  // Gérer le démarrage du microphone
  const startMicrophone = async () => {
    try {
      if (!navigator.mediaDevices) {
        alert("Votre navigateur ne prend pas en charge l'accès au microphone.");
        return false;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: settings.normalizeSpeech
        } 
      });
      micStreamRef.current = stream;
      
      // Initialiser l'AudioContext
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Créer un analyseur pour visualiser les niveaux audio
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Connecter le microphone à l'analyseur
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Visualisation des niveaux audio
      const visualizeAudio = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculer un niveau audio moyen
        let sum = 0;
        dataArray.forEach(value => { sum += value });
        const average = sum / dataArray.length;
        const normalizedLevel = Math.min(1, average / 128);
        
        setAudioLevel(normalizedLevel);
        
        // Continuer la boucle d'animation
        animationFrameRef.current = requestAnimationFrame(visualizeAudio);
      };
      
      visualizeAudio();
      setMicAccess(true);
      setMicMuted(false);
      return true;
      
    } catch (error) {
      console.error("Erreur lors de l'accès au microphone:", error);
      alert("Impossible d'accéder au microphone. Veuillez vérifier les permissions.");
      setMicAccess(false);
      return false;
    }
  };
  
  // Gérer le démarrage de la caméra
  const startCamera = async () => {
    try {
      console.log("🔵 Tentative d'accès à la caméra...");
      
      if (!navigator.mediaDevices) {
        console.error("❌ navigator.mediaDevices n'est pas disponible");
        alert("Votre navigateur ne prend pas en charge l'accès à la caméra.");
        return false;
      }
      
      // Configurer la qualité vidéo selon les paramètres
      let videoConstraints = { facingMode: "user" };
      
      if (settings.videoQuality === 'high') {
        videoConstraints.width = { ideal: 1920 };
        videoConstraints.height = { ideal: 1080 };
        console.log("🔵 Qualité vidéo: haute (1080p)");
      } else if (settings.videoQuality === 'medium') {
        videoConstraints.width = { ideal: 1280 };
        videoConstraints.height = { ideal: 720 };
        console.log("🔵 Qualité vidéo: moyenne (720p)");
      } else {
        videoConstraints.width = { ideal: 854 };
        videoConstraints.height = { ideal: 480 };
        console.log("🔵 Qualité vidéo: basse (480p)");
      }
      
      console.log("🔵 Demande d'accès à la caméra avec contraintes:", videoConstraints);
      const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
      console.log("🟢 Accès à la caméra autorisé!");
      
      // Vérifier ce que nous avons reçu
      const videoTracks = stream.getVideoTracks();
      console.log(`🔵 Nombre de pistes vidéo obtenues: ${videoTracks.length}`);
      
      if (videoTracks.length > 0) {
        const settings = videoTracks[0].getSettings();
        console.log("🔵 Paramètres réels de la vidéo:", settings);
      }
      
      // Sauvegarder le flux
      videoStreamRef.current = stream;
      
      // Affectez le flux avec un délai pour éviter les problèmes de lecture
      if (videoRef.current) {
        console.log("🔵 Référence à l'élément vidéo trouvée, attribution du flux");
        
        // Arrêtez d'abord toute lecture en cours
        if (videoRef.current.srcObject) {
          console.log("🔵 Arrêt du flux vidéo précédent");
          const oldStream = videoRef.current.srcObject;
          videoRef.current.srcObject = null;
          // Arrêtez les anciennes pistes
          oldStream.getTracks().forEach(track => {
            track.stop();
            console.log(`🔵 Piste ${track.kind} arrêtée`);
          });
        }
        
        // Puis associez le nouveau flux après un court délai
        setTimeout(() => {
          if (videoRef.current) {
            console.log("🔵 Attribution du nouveau flux vidéo après délai");
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true; // Le présentateur doit être en sourdine pour éviter l'écho
            videoRef.current.playsInline = true;
            
            videoRef.current.onloadedmetadata = () => {
              console.log("🔵 Métadonnées vidéo chargées");
            };
            
            videoRef.current.play()
              .then(() => {
                console.log("🟢 Lecture vidéo démarrée avec succès");
              })
              .catch(e => {
                console.error("❌ Erreur lors du démarrage de la vidéo:", e);
              });
          } else {
            console.warn("⚠️ Référence à l'élément vidéo perdue pendant le délai");
          }
        }, 100);
      } else {
        console.warn("⚠️ Pas de référence à l'élément vidéo");
      }
      
      setCameraAccess(true);
      setVideoEnabled(true);
      setCameraPaused(false);
      console.log("🟢 Caméra activée avec succès");
      return true;
      
    } catch (error) {
      console.error("❌ Erreur lors de l'accès à la caméra:", error);
      console.error("❌ Détails:", error.message);
      alert("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
      setCameraAccess(false);
      return false;
    }
  };
  
  // Arrêter le microphone
  const stopMicrophone = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setMicAccess(false);
    setAudioLevel(0);
  };
  
  // Arrêter la caméra
  const stopCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    
    setCameraAccess(false);
    setVideoEnabled(false);
    setCameraPaused(false);
  };
  
  // Basculer l'état du microphone (muet/non muet)
  const toggleMicrophone = () => {
    if (micStreamRef.current) {
      const audioTracks = micStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setMicMuted(!enabled);
        
        // Notifier tous les participants du changement
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'track_status_change',
            data: {
              kind: 'audio',
              enabled: enabled
            }
          }));
          console.log(`🔵 Notification de changement d'état audio envoyée à tous: ${enabled ? 'activé' : 'désactivé'}`);
        }
      }
    }
  };
  
  // Basculer l'état de la caméra (activée/désactivée)
  const toggleCamera = () => {
    if (videoStreamRef.current) {
      const videoTracks = videoStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const enabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = enabled;
        setCameraPaused(!enabled);
        
        // Notifier tous les participants du changement
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'track_status_change',
            data: {
              kind: 'video',
              enabled: enabled
            }
          }));
          console.log(`🔵 Notification de changement d'état vidéo envoyée à tous: ${enabled ? 'activé' : 'désactivé'}`);
        }
      }
    }
  };
  
  // Notifier les participants du changement d'état des pistes
  const sendTrackStatusToParticipant = (participantId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Envoyer l'état de la piste audio
      if (micStreamRef.current) {
        const audioTracks = micStreamRef.current.getAudioTracks();
        if (audioTracks.length > 0) {
          wsRef.current.send(JSON.stringify({
            type: 'track_status_change',
            data: {
              kind: 'audio',
              enabled: audioTracks[0].enabled,
              target_id: participantId
            }
          }));
          console.log(`🔵 État de piste audio envoyé à ${participantId}: ${audioTracks[0].enabled ? 'activé' : 'désactivé'}`);
        }
      }
      
      // Envoyer l'état de la piste vidéo
      if (videoStreamRef.current) {
        const videoTracks = videoStreamRef.current.getVideoTracks();
        if (videoTracks.length > 0) {
          wsRef.current.send(JSON.stringify({
            type: 'track_status_change',
            data: {
              kind: 'video',
              enabled: videoTracks[0].enabled,
              target_id: participantId
            }
          }));
          console.log(`🔵 État de piste vidéo envoyé à ${participantId}: ${videoTracks[0].enabled ? 'activé' : 'désactivé'}`);
        }
      }
    }
  };
  
  // Basculer la caméra
  const toggleVideo = async () => {
    if (videoEnabled) {
      setCameraPaused(!cameraPaused);
      toggleCamera();
    } else {
      if (isBroadcasting) {
        await startCamera();
      } else {
        alert("Veuillez d'abord démarrer la diffusion.");
      }
    }
  };
  
  // Créer une offre WebRTC pour un participant spécifique
  const createOfferForParticipant = async (participantId) => {
    try {
      console.log(`🔵 Création d'une offre WebRTC pour le participant ${participantId}...`);
      
      // S'assurer que nous avons accès au microphone et à la caméra 
      if (!micStreamRef.current) {
        console.log("🔵 Démarrage du microphone");
        await startMicrophone();
      }
      
      if (videoEnabled && !videoStreamRef.current) {
        console.log("🔵 Démarrage de la caméra");
        await startCamera();
      }
      
      // Vérifier si une connexion existe déjà pour ce participant
      if (peerConnectionsRef.current[participantId]) {
        console.log(`🔵 Fermeture de la connexion existante pour ${participantId}`);
        peerConnectionsRef.current[participantId].close();
        delete peerConnectionsRef.current[participantId];
      }
      
      // Créer une nouvelle connexion pour ce participant
      console.log(`🔵 Création d'une nouvelle RTCPeerConnection pour ${participantId}`);
      const peerConnection = new RTCPeerConnection(rtcConfig);
      
      // Configurer les événements pour surveiller l'état de la connexion
      peerConnection.onconnectionstatechange = () => {
        console.log(`🔵 État de connexion WebRTC pour ${participantId}:`, peerConnection.connectionState);
      };
      
      peerConnection.oniceconnectionstatechange = () => {
        console.log(`🔵 État de connexion ICE pour ${participantId}:`, peerConnection.iceConnectionState);
      };
      
      // Combiner les flux audio et vidéo
      const mediaStream = new MediaStream();
      console.log("🔵 MediaStream créé");
      
      if (micStreamRef.current) {
        const audioTracks = micStreamRef.current.getAudioTracks();
        console.log("🔵 Pistes audio disponibles:", audioTracks.length);
        
        audioTracks.forEach(track => {
          mediaStream.addTrack(track);
          console.log(`🔵 Piste audio ajoutée: ${track.id}`);
        });
      }
      
      if (videoStreamRef.current) {
        const videoTracks = videoStreamRef.current.getVideoTracks();
        console.log("🔵 Pistes vidéo disponibles:", videoTracks.length);
        
        videoTracks.forEach(track => {
          mediaStream.addTrack(track);
          console.log(`🔵 Piste vidéo ajoutée: ${track.id}`);
        });
      }

      console.log("🔵 Nombre total de pistes dans le flux:", mediaStream.getTracks().length);
      
      // Ajouter les pistes au peer connection
      mediaStream.getTracks().forEach(track => {
        console.log(`🔵 Ajout de la piste ${track.kind} à RTCPeerConnection pour ${participantId}`);
        peerConnection.addTrack(track, mediaStream);
      });
      
      // Écouter les candidats ICE
      peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log(`🔵 Candidat ICE généré pour ${participantId}:`, event.candidate);
          
          try {
            // Envoyer les candidats via WebSocket à ce participant spécifique
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'ice_candidate',
                data: {
                  sender_id: 'presenter',
                  candidate: event.candidate.toJSON(),
                  target_id: participantId
                }
              }));
              console.log(`🔵 Candidat ICE envoyé à ${participantId}`);
            } else {
              console.warn("⚠️ WebSocket non disponible pour envoyer le candidat ICE");
            }
          } catch (error) {
            console.error("❌ Erreur lors de l'envoi du candidat ICE:", error);
          }
        }
      };
      
      // Créer une offre SDP
      console.log(`🔵 Création de l'offre WebRTC pour ${participantId}`);
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: videoEnabled
      });
      console.log(`🔵 Offre SDP créée pour ${participantId}:`, offer);
      
      // Définir l'offre locale
      console.log(`🔵 Application de l'offre comme description locale pour ${participantId}`);
      await peerConnection.setLocalDescription(offer);
      console.log(`🔵 Description locale appliquée avec succès pour ${participantId}`);
      
      // Envoyer l'offre via WebSocket pour ce participant
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc_offer',
          data: {
            type: offer.type,
            sdp: offer.sdp,
            sender_id: 'presenter',
            target_id: participantId
          }
        }));
        console.log(`🔵 Offre WebRTC envoyée via WebSocket à ${participantId}`);
        
        // Envoyer l'état actuel des pistes à ce participant
        sendTrackStatusToParticipant(participantId);
      } else {
        console.warn("⚠️ WebSocket non disponible pour envoyer l'offre");
      }
      
      // Stocker la connexion
      peerConnectionsRef.current[participantId] = peerConnection;
      setPeerConnections(prev => ({ ...prev, [participantId]: peerConnection }));
      
      console.log(`🟢 Offre WebRTC créée et envoyée avec succès à ${participantId}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erreur lors de la création de l'offre WebRTC pour ${participantId}:`, error);
      console.error("❌ Détails de l'erreur:", error.message);
      console.error("❌ Stack trace:", error.stack);
      return false;
    }
  };
  
  // Démarrer la diffusion
  const startBroadcasting = async () => {
    const micStarted = await startMicrophone();
    if (!micStarted) return;
    
    try {
      // Démarrer la conférence sur le serveur
      const response = await axios.post(`${API_BASE_URL}/conferences/${conferenceId}/start`);
      
      if (response.data && response.data.success) {
        console.log("Conférence démarrée avec succès");
        
        // Établir une connexion WebSocket
        const ws = new WebSocket(`ws://localhost:8000/ws/conference/${conferenceId}`);
        
        ws.onopen = () => {
          // Envoyer les informations du présentateur
          ws.send(JSON.stringify({
            participant_id: 'presenter',
            name: 'Présentateur',
            language: sourceLanguage,
            is_presenter: true
          }));
          console.log("🔴 WebSocket ouverte côté présentateur, envoi des informations");
        };
        
        ws.onmessage = async (event) => {
          const message = JSON.parse(event.data);
          
          switch(message.type) {
            case 'connection_success':
              console.log("Connexion WebSocket établie avec succès");
              setIsBroadcasting(true);
              setStreamStartTime(new Date());
              break;
              
            case 'webrtc_answer':
              // Gérer les réponses des participants
              if (message.data && message.data.sender_id) {
                const { sender_id, type, sdp } = message.data;
                const answerDescription = new RTCSessionDescription({ type, sdp });
                
                // Utiliser la connexion spécifique à ce participant
                if (peerConnectionsRef.current[sender_id]) {
                  try {
                    console.log(`🔵 Réception de la réponse depuis ${sender_id}, application...`);
                    await peerConnectionsRef.current[sender_id].setRemoteDescription(answerDescription);
                    console.log(`🟢 Réponse WebRTC acceptée de ${sender_id}`);
                  } catch (e) {
                    console.error(`❌ Erreur lors de l'application de la réponse WebRTC de ${sender_id}:`, e);
                  }
                } else {
                  console.warn(`⚠️ Pas de connexion établie pour ${sender_id}, création d'une nouvelle offre...`);
                  createOfferForParticipant(sender_id);
                }
              }
              break;
              
            case 'ice_candidate':
              // Gérer les candidats ICE des participants
              if (message.data && message.data.sender_id !== 'presenter') {
                const { sender_id, candidate } = message.data;
                
                // Utiliser la connexion spécifique à ce participant
                if (peerConnectionsRef.current[sender_id]) {
                  try {
                    await peerConnectionsRef.current[sender_id].addIceCandidate(
                      new RTCIceCandidate(candidate)
                    );
                    console.log(`🔵 Candidat ICE ajouté pour ${sender_id}`);
                  } catch (e) {
                    console.error(`❌ Erreur lors de l'ajout d'un candidat ICE pour ${sender_id}:`, e);
                  }
                } else {
                  console.warn(`⚠️ Pas de connexion établie pour le candidat ICE de ${sender_id}`);
                }
              }
              break;
              
            case 'participants_list':
              if (message.data && message.data.participants) {
                setParticipantsList(message.data.participants);
                setParticipants(message.data.participants.length);
              }
              break;
              
            case 'chat_message':
              if (message.data) {
                setMessages(prev => [...prev, message.data]);
              }
              break;
              
            case 'participant_joined':
              // Mettre à jour la liste des participants
              if (message.data) {
                setParticipantsList(prev => {
                  // Vérifier si le participant existe déjà
                  const exists = prev.some(p => p.id === message.data.participant_id);
                  if (!exists) {
                    return [...prev, {
                      id: message.data.participant_id,
                      name: message.data.name,
                      language: message.data.language,
                      joinTime: message.data.joinTime,
                      isPresenter: message.data.is_presenter
                    }];
                  }
                  return prev;
                });
                
                setParticipants(prev => prev + 1);
                
                // Créer une nouvelle offre spécifique pour ce participant
                const newParticipantId = message.data.participant_id;
                console.log(`🔵 Nouveau participant détecté: ${newParticipantId}, création d'une offre...`);
                setTimeout(() => {
                  createOfferForParticipant(newParticipantId);
                }, 1000); // Court délai pour s'assurer que le participant est prêt
              }
              break;
              
            case 'participant_left':
              // Retirer le participant de la liste
              if (message.data && message.data.participant_id) {
                setParticipantsList(prev => prev.filter(p => p.id !== message.data.participant_id));
                setParticipants(prev => prev - 1);
              }
              break;
            case 'request_new_offer':
              // Un participant demande une nouvelle offre
              if (message.data && message.data.target_id) {
                const targetId = message.data.target_id;
                console.log(`🔵 Demande d'offre pour le participant ${targetId}`);
                
                // Créer une nouvelle offre pour ce participant
                createOfferForParticipant(targetId);
              }
              break;
            
            case 'send_track_status':
              // Un participant demande l'état actuel des pistes
              if (message.data && message.data.target_id) {
                const targetId = message.data.target_id;
                console.log(`🔵 Demande d'état des pistes pour le participant ${targetId}`);
                
                // Envoyer l'état actuel des pistes à ce participant
                sendTrackStatusToParticipant(targetId);
              }
              break;  
          }
        };
        
        ws.onerror = (error) => {
          console.error("Erreur WebSocket:", error);
        };
        
        wsRef.current = ws;
        
        // Si la vidéo est activée, démarrer la caméra
        if (videoEnabled) {
          await startCamera();
        }
        
        // Vérifier si l'utilisateur veut enregistrer la conférence
        setShowRecordModal(true);
        
      } else {
        alert("Échec du démarrage de la conférence. La réponse du serveur n'est pas valide.");
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la diffusion:", error);
      alert("Erreur lors du démarrage de la diffusion. Veuillez réessayer.");
    }
  };
  
  // Valider le code PIN
  const validatePin = () => {
    // Le PIN doit être un nombre de 4 à 6 chiffres
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError("Le code PIN doit contenir entre 4 et 6 chiffres");
      return false;
    }
    
    setPinError("");
    return true;
  };
  
  // Fonction pour enregistrer les détails de l'enregistrement
  const saveRecordingDetails = async () => {
    try {
      if (recordConference) {
        if (!validatePin()) {
          return;
        }
        
        console.log("🔵 Démarrage de l'enregistrement avec PIN:", pin);
        
        // Démarrer l'enregistrement réel du média
        const recordingStarted = startRecording();
        
        if (!recordingStarted) {
          console.warn("⚠️ L'enregistrement n'a pas pu démarrer, mais les métadonnées seront enregistrées");
        }
        
        // Envoyer les informations d'authentification au serveur
        const response = await axios.post(`${API_BASE_URL}/recordings`, {
          conferenceId,
          pin,
          email: email || null,
          title,
          sourceLanguage,
          targetLanguages,
          hasVideo: videoEnabled
        });
        
        console.log("🔵 Réponse du serveur pour l'enregistrement:", response.data);
        
        if (response.data.success) {
          console.log("🟢 Configuration de l'enregistrement réussie");
        } else {
          console.error("❌ Erreur lors de la configuration:", response.data.error);
          alert(`Erreur: ${response.data.error || "Erreur inconnue"}`);
        }
      }
      
      setShowRecordModal(false);
      
    } catch (error) {
      console.error("❌ Erreur complète lors de la configuration de l'enregistrement:", error);
      alert(`Erreur lors de l'enregistrement: ${error.message}`);
    }
  };
  
  // Ajoutez cette fonction pour calculer la durée
  const calculateDuration = () => {
    if (!streamStartTime) return 0;
    const now = new Date();
    return Math.floor((now - streamStartTime) / 1000); // Durée en secondes
  };
  
  // Arrêter la diffusion
  // Arrêter la diffusion
const stopBroadcasting = async () => {
  setStoppingConference(true);
  
  try {
    // Ajouter des logs pour déboguer
    console.log("🔵 Début de l'arrêt de la diffusion");
    
    // Arrêter l'enregistrement
    if (mediaRecorderRef.current && recording) {
      console.log("🔵 Arrêt de l'enregistreur de médias");
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
    
    // Calculer la durée totale
    const totalDuration = calculateDuration();
    console.log(`🔵 Durée totale de la conférence: ${totalDuration} secondes`);
    
    // Préparer les données d'enregistrement
    const recordingData = {
      title,
      duration: totalDuration,
      hasVideo: videoEnabled,
      sourceLanguage,
      targetLanguages,
      participants: participantsList.map(p => ({
        id: p.id,
        name: p.name,
        language: p.language,
        joinTime: p.joinTime
      }))
    };
    
    // Si l'enregistrement est activé, ajouter le PIN
    if (recordConference && pin) {
      console.log("🔵 Préparation de l'enregistrement avec PIN:", pin);
      recordingData.pin = pin;
      recordingData.email = email;
      
      // Envoyer les données à l'API pour l'enregistrement complet
      console.log("🔵 Envoi des données d'enregistrement à l'API:", recordingData);
      const response = await axios.post(`${API_BASE_URL}/conferences/${conferenceId}/record`, recordingData);
      console.log("🔵 Réponse de l'API d'enregistrement:", response.data);
    } else {
      console.log("🔵 L'enregistrement n'est pas activé, aucune donnée d'enregistrement ne sera envoyée");
    }
    
    // Fermer toutes les connexions WebRTC
    console.log("🔵 Fermeture des connexions WebRTC");
    Object.keys(peerConnectionsRef.current).forEach(participantId => {
      if (peerConnectionsRef.current[participantId]) {
        peerConnectionsRef.current[participantId].close();
        console.log(`🔵 Connexion fermée pour ${participantId}`);
      }
    });
    
    // Vider les références
    peerConnectionsRef.current = {};
    setPeerConnections({});
    
    // Arrêter la conférence sur le serveur
    if (conferenceId) {
      console.log("🔵 Demande d'arrêt de la conférence sur le serveur");
      await axios.post(`${API_BASE_URL}/conferences/${conferenceId}/stop`, {
        // Ajouter ce paramètre pour indiquer si on veut enregistrer ou non
        shouldRecord: recordConference
      });
    }
    
    // Fermer la connexion WebSocket
    if (wsRef.current) {
      console.log("🔵 Fermeture de la WebSocket");
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Arrêter les périphériques
    console.log("🔵 Arrêt des périphériques audio/vidéo");
    stopMicrophone();
    stopCamera();
    
    // Mise à jour de l'état
    setIsBroadcasting(false);
    setStoppingConference(false);
    
    console.log("🟢 La diffusion a été arrêtée avec succès");
    
    // Rediriger vers la page de création de conférence après avoir arrêté la diffusion
    alert("La conférence a été terminée avec succès. Les participants ont été notifiés.");
    navigate('/conference');
  } catch (error) {
    console.error("❌ Erreur lors de l'arrêt de la diffusion:", error);
    
    // Arrêt local même en cas d'erreur
    stopMicrophone();
    stopCamera();
    setIsBroadcasting(false);
    setStoppingConference(false);
    
    // Rediriger vers la page de création même en cas d'erreur
    alert("La conférence a été terminée. Les participants ont été notifiés.");
    navigate('/conference/create');
  }
};
  const startRecording = () => {
    if (!micStreamRef.current) {
      console.error("❌ Pas de flux audio disponible pour l'enregistrement");
      return false;
    }
    
    try {
      console.log("🔵 Démarrage de l'enregistrement des médias");
      
      // Créer un nouveau MediaStream avec toutes les pistes
      const mediaStream = new MediaStream();
      
      // Ajouter les pistes audio
      micStreamRef.current.getAudioTracks().forEach(track => {
        mediaStream.addTrack(track);
        console.log(`🔵 Piste audio ajoutée à l'enregistrement: ${track.id}`);
      });
      
      // Ajouter les pistes vidéo si disponibles et activées
      if (videoEnabled && videoStreamRef.current) {
        videoStreamRef.current.getVideoTracks().forEach(track => {
          mediaStream.addTrack(track);
          console.log(`🔵 Piste vidéo ajoutée à l'enregistrement: ${track.id}`);
        });
      }
      
      // Options pour l'enregistreur
      const options = {
        mimeType: videoEnabled ? 'video/webm;codecs=vp9,opus' : 'audio/webm;codecs=opus',
        audioBitsPerSecond: settings.audioQuality === 'high' ? 128000 : 64000,
        videoBitsPerSecond: settings.videoQuality === 'high' ? 2500000 : 1000000
      };
      
      // Créer l'enregistreur
      const mediaRecorder = new MediaRecorder(mediaStream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      // Gérer les données enregistrées
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log(`🔵 Nouveau chunk d'enregistrement reçu: ${event.data.size} bytes`);
        }
      };
      
      // Quand l'enregistrement est arrêté
      mediaRecorder.onstop = async () => {
        console.log("🔵 Enregistrement terminé, traitement des données");
        const recordedBlob = new Blob(recordedChunksRef.current, { 
          type: videoEnabled ? 'video/webm' : 'audio/webm' 
        });
        
        console.log(`🔵 Taille totale de l'enregistrement: ${recordedBlob.size} bytes`);
        
        // Créer un FormData pour l'envoi
        const formData = new FormData();
        formData.append('conference_id', conferenceId);
        formData.append('media_file', recordedBlob, `${conferenceId}_recording.webm`);
        formData.append('has_video', videoEnabled.toString());
        
        try {
          // Envoyer le fichier au serveur
          console.log("🔵 Envoi du fichier média au serveur");
          const uploadResponse = await axios.post(
            `${API_BASE_URL}/recordings/upload`, 
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          
          console.log("🟢 Téléchargement du média réussi:", uploadResponse.data);
        } catch (uploadError) {
          console.error("❌ Erreur lors du téléchargement du média:", uploadError);
        }
        
        // Réinitialiser les chunks
        recordedChunksRef.current = [];
      };
      
      // Commencer l'enregistrement
      mediaRecorder.start(1000); // Créer un chunk toutes les secondes
      setRecording(true);
      
      console.log("🟢 Enregistrement démarré avec succès");
      return true;
      
    } catch (error) {
      console.error("❌ Erreur lors du démarrage de l'enregistrement:", error);
      return false;
    }
  };
  // Confirmation avant d'arrêter la diffusion
  const confirmStopBroadcasting = () => {
    setShowEndConfirmation(true);
  };
  
  // Toggle la diffusion
  const toggleBroadcasting = () => {
    if (isBroadcasting) {
      confirmStopBroadcasting();
    } else {
      startBroadcasting();
    }
  };
  
  // Envoyer un message dans le chat
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat_message',
          text: newMessage
        }));
        
        // Note: le message sera ajouté à l'UI quand il sera reçu via WebSocket
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      
      // Fallback pour la démo
      const message = {
        id: `msg-${Date.now()}`,
        senderId: 'presenter',
        senderName: 'Présentateur',
        text: newMessage,
        originalLanguage: sourceLanguage,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, message]);
    }
    
    setNewMessage('');
  };
  
  // Générer un résumé de la conférence
  const generateSummary = async () => {
    setSummarizing(true);
    
    try {
      // Appel API pour générer le résumé
      const response = await axios.post(`${API_BASE_URL}/conferences/${conferenceId}/summary`);
      
      if (response.data && response.data.success) {
        setConferenceSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du résumé:", error);
      
      // Fallback pour la démo
      const summary = `Résumé de la conférence "${title || 'Sans titre'}" (${elapsedTime})
      
Points clés abordés:
- Introduction au marché financier marocain
- Perspectives économiques pour 2025
- Nouvelles régulations bancaires et leur impact
- Opportunités d'investissement dans le secteur des technologies
- Stratégies pour les investisseurs individuels

Participants: ${participants} personnes connectées depuis ${targetLanguages.length} langues différentes
Messages échangés: ${messages.length} questions et commentaires

Cette conférence a mis en lumière les défis et opportunités du secteur financier marocain, avec un accent particulier sur les innovations technologiques qui transforment le paysage bancaire. Les intervenants ont souligné l'importance d'une approche prudente mais proactive face aux changements réglementaires à venir.`;
      
      setConferenceSummary(summary);
    } finally {
      setSummarizing(false);
    }
  };
  
  // Générer les barres de visualisation audio
  const generateWaveform = () => {
    return Array(20).fill(0).map((_, i) => {
      const height = Math.min(24, Math.max(3, Math.floor(Math.sin(i/3 + Date.now()/200) * 12 * audioLevel + 8)));
      return (
        <motion.div 
          key={i} 
          className={`${isBroadcasting && !micMuted ? 'bg-green-500' : 'bg-gray-300'} rounded-full mx-px`}
          style={{ 
            height: `${height}px`,
            width: '3px'
          }}
          animate={{ 
            height: `${height}px`,
          }}
          transition={{ duration: 0.1 }}
        />
      );
    });
  };
  
  // Copier le lien dans le presse-papier
  const copyLinkToClipboard = () => {
    const url = `${window.location.origin}/conference/join/${conferenceId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert("Lien copié dans le presse-papier !");
      })
      .catch(err => {
        console.error("Impossible de copier le lien:", err);
      });
  };
  
  // Télécharger le QR code
  const downloadQRCode = () => {
    const canvas = document.getElementById('conference-qr-code');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `conference-${conferenceId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Gérer les changements de paramètres
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/conference/create">
              <button className="mr-3 text-white/80 hover:text-white transition-colors">
                <ChevronLeft size={24} />
              </button>
            </Link>
            <div className="flex items-center">
              <motion.div 
                className="bg-white/20 text-white p-2 rounded-full flex items-center"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Globe size={24} />
              </motion.div>
              <div className="ml-2">
                <h1 className="text-xl font-bold text-white">{title}</h1>
                <p className="text-sm text-white/80">{conferenceId}</p>
              </div>
            </div>
          </motion.div>
          <div className="flex items-center space-x-3">
            {isBroadcasting && recordConference && (
              <motion.div
                className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium hidden md:flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                Enregistrement
              </motion.div>
            )}
            {isBroadcasting && (
              <motion.div 
                className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium hidden md:flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                En direct ({elapsedTime})
              </motion.div>
            )}
            {isBroadcasting && (
              <>
                <motion.button 
                  className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
                  onClick={() => setShowParticipantsModal(!showParticipantsModal)}
                  whileHover={{ scale: 1.1 }}
                >
                  <Users size={20} />
                </motion.button>
                <motion.button 
                  className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
                  onClick={() => setShowChat(!showChat)}
                  whileHover={{ scale: 1.1 }}
                >
                  <MessageSquare size={20} />
                </motion.button>
              </>
            )}
            <motion.button 
              className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
              onClick={() => setShowSettings(!showSettings)}
              whileHover={{ scale: 1.1 }}
            >
              <Settings size={20} />
            </motion.button>
          </div>
        </div>
      </header>
      
      <main className={`flex-grow max-w-6xl mx-auto px-4 py-8 ${showChat ? 'lg:pr-80' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Diffusion */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-black rounded-lg overflow-hidden mb-6 aspect-video flex items-center justify-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Indicateur de caméra désactivée */}
              {cameraPaused && videoEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 z-10">
                  <VideoOff size={60} className="text-white/50 mb-4" />
                  <p className="text-white/80 text-lg">Caméra désactivée</p>
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${cameraPaused ? 'hidden' : 'block'}`}
                onError={(e) => console.error("❌ Erreur vidéo:", e.target.error)}
              />
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
                <h2 className="font-semibold text-blue-700">Options de diffusion</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {micMuted ? (
                          <MicOff size={20} className="text-red-500 mr-2" />
                        ) : (
                          <Mic size={20} className="text-gray-500 mr-2" />
                        )}
                        <span className="text-gray-700 font-medium">Microphone</span>
                      </div>
                      <div className="flex h-6 items-center">
                        {generateWaveform()}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${micAccess ? (micMuted ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700') : 'bg-yellow-50 text-yellow-700'}`}>
                      {micAccess ? (
                        <div className="flex justify-between items-center">
                          <p className="text-sm flex items-center">
                            <Check size={16} className="mr-2" />
                            {micMuted ? "Microphone en sourdine" : "Microphone actif"}
                          </p>
                          {isBroadcasting && (
                            <button 
                              className={`px-3 py-1 text-xs rounded-full ${micMuted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                              onClick={toggleMicrophone}
                            >
                              {micMuted ? 'Réactiver' : 'Désactiver'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">
                          Cliquez sur "Démarrer la diffusion" pour connecter votre microphone
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {cameraPaused ? (
                          <VideoOff size={20} className="text-red-500 mr-2" />
                        ) : (
                          <Video size={20} className="text-gray-500 mr-2" />
                        )}
                        <span className="text-gray-700 font-medium">Caméra</span>
                      </div>
                      <button 
                        className={`px-3 py-1 text-xs rounded-full ${videoEnabled ? (cameraPaused ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-blue-100 text-blue-700'}`}
                        onClick={toggleVideo}
                        disabled={!isBroadcasting}
                      >
                        {videoEnabled ? (cameraPaused ? 'Réactiver' : 'Désactiver') : 'Activer'}
                      </button>
                    </div>
                    <div className={`p-3 rounded-lg ${cameraAccess ? (cameraPaused ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700') : 'bg-yellow-50 text-yellow-700'}`}>
                      {cameraAccess ? (
                        <p className="text-sm flex items-center">
                          <Check size={16} className="mr-2" />
                          {cameraPaused ? "Caméra désactivée" : "Caméra active"}
                        </p>
                      ) : (
                        <p className="text-sm">
                          {isBroadcasting ? "Activez la caméra pour partager votre vidéo" : "Démarrez la diffusion puis activez la caméra"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {isBroadcasting && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <h3 className="text-green-700 font-semibold mb-2 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Diffusion en cours
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex justify-between">
                        <span>Durée</span>
                        <span className="font-mono">{elapsedTime}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Participants</span>
                        <span className="font-mono">{participants}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Langues disponibles</span>
                        <span className="font-mono">{targetLanguages.length}</span>
                      </li>
                      {recordConference && (
                        <li className="flex justify-between text-red-700">
                          <span>Enregistrement</span>
                          <span className="font-mono">Activé</span>
                        </li>
                      )}
                    </ul>
                    <div className="mt-4 pt-4 border-t">
                      <button 
                        className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                        onClick={() => setShowSummaryModal(true)}
                      >
                        <FileText size={16} />
                        <span>Générer un résumé de la conférence</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className={`p-6 flex flex-col items-center border-t-4 ${isBroadcasting ? 'border-green-500' : 'border-blue-500'}`}>
                <motion.button 
                  className={`w-32 h-32 rounded-full shadow-lg flex items-center justify-center mb-6 
                    ${isBroadcasting 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-500 hover:bg-blue-600'} 
                    text-white transition-colors ${stoppingConference ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={toggleBroadcasting}
                  disabled={stoppingConference}
                  whileHover={{ scale: stoppingConference ? 1 : 1.05 }}
                  whileTap={{ scale: stoppingConference ? 1 : 0.95 }}
                  animate={isBroadcasting ? {
                    boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0)", "0 0 0 10px rgba(239, 68, 68, 0.2)", "0 0 0 20px rgba(239, 68, 68, 0)"]
                  } : {}}
                  transition={isBroadcasting ? {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  } : {}}
                >
                  {stoppingConference ? (
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isBroadcasting ? (
                    <Pause size={40} />
                  ) : (
                    <Play size={40} className="ml-2" />
                  )}
                </motion.button>
                <h3 className="text-xl font-semibold mb-2 text-center">
                  {stoppingConference 
                    ? 'Arrêt de la diffusion...' 
                    : (isBroadcasting ? 'Arrêter la diffusion' : 'Démarrer la diffusion')}
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  {stoppingConference
                    ? "Arrêt de la conférence et notification des participants en cours..."
                    : (isBroadcasting 
                      ? "La conférence est en cours de diffusion. Les participants peuvent vous écouter dans leur langue préférée." 
                      : "Commencez à diffuser pour permettre aux participants d'écouter la traduction en temps réel.")}
                </p>
              </div>
            </motion.div>
          </div>
          
          {/* Colonne de droite - QR Code */}
          <div>
            <motion.div 
              className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b">
                <h2 className="font-semibold text-purple-700">Informations de la conférence</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la conférence
                  </label>
                  <input 
                    type="text" 
                    value={title} 
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identifiant unique
                  </label>
                  <div className="flex">
                    <input 
                      type="text" 
                      value={conferenceId} 
                      className="w-full p-3 border border-gray-300 rounded-l-lg bg-gray-50"
                      readOnly
                    />
                    <button 
                      className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-3 rounded-r-lg transition-colors flex items-center"
                      onClick={copyLinkToClipboard}
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cet identifiant permet aux participants de rejoindre votre conférence
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Langue du conférencier
                  </label>
                  <input 
                    type="text" 
                    value={sourceLanguage} 
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Langues de traduction disponibles
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-300 rounded-lg min-h-[60px]">
                    {targetLanguages.map(lang => (
                      <div 
                        key={lang}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b">
                <h2 className="font-semibold text-purple-700">QR Code d'accès</h2>
              </div>
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
                  <QRCodeCanvas 
                    id="conference-qr-code"
                    value={`${window.location.origin}/conference/join/${conferenceId}`}
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mb-4">
                  Les participants peuvent scanner ce QR code pour rejoindre la conférence
                </p>
                <div className="flex gap-2 w-full">
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    onClick={downloadQRCode}
                  >
                    <Download size={16} />
                    <span>Télécharger</span>
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    onClick={() => setShowQRModal(true)}
                  >
                    <QrCode size={16} />
                    <span>Agrandir</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      {/* Chat Sidebar */}
      {showChat && (
        <motion.div 
          className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-20 flex flex-col"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="bg-blue-500 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold">Chat de la conférence</h3>
            <button 
              className="text-white/80 hover:text-white"
              onClick={() => setShowChat(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
              <MessageSquare size={40} className="mx-auto mb-2 opacity-20" />
              <p>Les messages de la conférence s'afficheront ici</p>
              </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`mb-4 ${message.senderId === 'presenter' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[85%] rounded-lg p-3 ${
                  message.senderId === 'presenter' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="text-xs text-gray-500 mb-1 flex justify-between">
                    <span>{message.senderName}</span>
                    <span className="ml-2">{message.originalLanguage}</span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex">
            <input 
              type="text" 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              placeholder="Écrivez un message..."
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r-lg transition-colors"
              onClick={sendMessage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Les messages seront traduits dans la langue de chaque participant
          </p>
        </div>
      </motion.div>
    )}
    
    {/* Modal pour QR code plein écran */}
    {showQRModal && (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowQRModal(false)}
      >
        <motion.div 
          className="bg-white rounded-xl p-8 max-w-md w-full flex flex-col items-center"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-2">QR Code de la conférence</h3>
          <p className="text-gray-600 text-center mb-6">
            {title} - {conferenceId}
          </p>
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <QRCodeCanvas 
              value={`${window.location.origin}/conference/join/${conferenceId}`}
              size={250}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              onClick={downloadQRCode}
            >
              <Download size={18} />
              <span>Télécharger</span>
            </button>
            <button 
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => setShowQRModal(false)}
            >
              <X size={18} />
              <span>Fermer</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
    
    {/* Modal pour liste des participants */}
    {showParticipantsModal && (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowParticipantsModal(false)}
      >
        <motion.div 
          className="bg-white rounded-xl p-6 max-w-lg w-full"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Participants ({participantsList.length})</h3>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setShowParticipantsModal(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {participantsList.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aucun participant pour le moment
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {participantsList.map(participant => (
                  <li key={participant.id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium">{participant.name}</span>
                      <p className="text-xs text-gray-500">
                        Rejoint à {new Date(participant.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {participant.language}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-600">
              Les participants peuvent se joindre à la conférence en scannant le QR code ou en utilisant l'identifiant unique
            </p>
          </div>
        </motion.div>
      </motion.div>
    )}
    
    {/* Modal pour le résumé de la conférence */}
    {showSummaryModal && (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowSummaryModal(false)}
      >
        <motion.div 
          className="bg-white rounded-xl p-6 max-w-2xl w-full"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Résumé de la conférence</h3>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setShowSummaryModal(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          {summarizing ? (
            <div className="py-12 flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Génération du résumé en cours...</p>
            </div>
          ) : conferenceSummary ? (
            <div>
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <pre className="whitespace-pre-wrap font-sans text-gray-800">{conferenceSummary}</pre>
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setShowSummaryModal(false)}
                >
                  Fermer
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([conferenceSummary], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = `résumé-${conferenceId}.txt`;
                    document.body.appendChild(element);
                    element.click();
                  }}
                >
                  Télécharger
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">
                Générer un résumé automatique de la conférence avec les points clés abordés et les statistiques de participation.
              </p>
              <div className="flex justify-end">
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={generateSummary}
                >
                  Générer le résumé
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    )}
    
    {/* Modal de confirmation pour arrêter la conférence */}
    {showEndConfirmation && (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-xl p-6 max-w-md w-full"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center mb-4 text-red-500">
            <AlertTriangle size={24} className="mr-2" />
            <h3 className="text-xl font-bold">Terminer la conférence</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir terminer cette conférence ? Tous les participants recevront une notification 
            et la traduction en direct s'arrêtera. Cette action est irréversible.
          </p>
          
          <div className="flex justify-end gap-4">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setShowRecordModal(false);
                setRecordConference(false);
              }}
            >
              Annuler
            </button>
            <button 
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              onClick={() => {
                setShowEndConfirmation(false);
                stopBroadcasting();
              }}
            >
              Terminer la conférence
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
    
    {/* Modal d'enregistrement */}
    {showRecordModal && (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-xl p-6 max-w-md w-full"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center mb-4 text-blue-500">
            <Save size={24} className="mr-2" />
            <h3 className="text-xl font-bold">Enregistrer la conférence</h3>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={recordConference}
                onChange={(e) => setRecordConference(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 block text-sm text-gray-700">
                Je souhaite enregistrer cette conférence pour un accès ultérieur
              </span>
            </label>
            
            {recordConference && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-4">
                  Pour protéger votre enregistrement, veuillez définir un code PIN et fournir une adresse email (optionnel) pour récupérer l'accès en cas d'oubli.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code PIN (4-6 chiffres)
                    </label>
                    <input 
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Entrez un code PIN (ex: 123456)"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    {pinError && (
                      <p className="mt-1 text-xs text-red-500">{pinError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de récupération (optionnel)
                    </label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrez une adresse email"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      En cas d'oubli du PIN, cet email vous permettra de récupérer l'accès à l'enregistrement.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-4">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setShowRecordModal(false);
                setRecordConference(false);
              }}
            >
              Annuler
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={saveRecordingDetails}
            >
              Confirmer
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
    
    {/* Panel de configuration */}
    {showSettings && (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowSettings(false)}
      >
        <motion.div 
          className="bg-white rounded-xl p-6 max-w-lg w-full"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Paramètres avancés</h3>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setShowSettings(false)}
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualité audio
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={settings.audioQuality}
                onChange={(e) => handleSettingChange('audioQuality', e.target.value)}
                disabled={isBroadcasting}
              >
                <option value="medium">Standard (48 kHz)</option>
                <option value="high">Haute qualité (96 kHz)</option>
                <option value="low">Économie de données (32 kHz)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualité vidéo
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={settings.videoQuality}
                onChange={(e) => handleSettingChange('videoQuality', e.target.value)}
                disabled={isBroadcasting}
              >
                <option value="medium">Standard (720p)</option>
                <option value="high">Haute qualité (1080p)</option>
                <option value="low">Économie de données (480p)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niveau de réduction de bruit
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={settings.noiseReduction}
                onChange={(e) => handleSettingChange('noiseReduction', parseFloat(e.target.value))}
                disabled={isBroadcasting}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Minimal</span>
                <span>Standard</span>
                <span>Maximum</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="normalize_speech" 
                checked={settings.normalizeSpeech}
                onChange={(e) => handleSettingChange('normalizeSpeech', e.target.checked)}
                disabled={isBroadcasting}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="normalize_speech" className="ml-2 block text-sm text-gray-900">
                Normaliser le débit de parole
              </label>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="enable_chat"
                checked={settings.enableChat}
                onChange={(e) => handleSettingChange('enableChat', e.target.checked)}
                disabled={isBroadcasting}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enable_chat" className="ml-2 block text-sm text-gray-900">
                Activer le chat avec traduction automatique
              </label>
            </div>
            
            <div className="pt-4 border-t">
              <button 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowSettings(false)}
              >
                Enregistrer les paramètres
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
    
    {/* Footer */}
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <Globe size={16} />
            </div>
            <span className="text-sm font-bold ml-2">VoiceTranslate</span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; 2025 VoiceTranslate - Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  </div>
);
};

export default ConferenceBroadcastScreen;