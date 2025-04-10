import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Phone,
  Users,
  MessageCircle,
  Settings,
  Send,
  X,
  Volume2,
  Volume1,
  VolumeX,
  AlertCircle,
  UserX,
  LogOut,
  Clock
} from 'lucide-react';
import {
  joinRoom,
  initializeMedia,
  toggleAudio,
  toggleVideo,
  sendChatMessage,
  processAndSendAudio,
  getSocket,
  leaveRoom,
  endMeeting,
  removeParticipant,
  rejoinRoom
} from './services/socketService';

// Composant pour l'intégration de la traduction audio
import AudioProcessor from './components/AudioProcessor';

const MeetingRoomScreen = () => {
  const { meetingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // État des médias
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isTranslationOn, setIsTranslationOn] = useState(true);
  
  // UI states
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEndMeetingOptions, setShowEndMeetingOptions] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [participantSpeaking, setParticipantSpeaking] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [meetingStartTime, setMeetingStartTime] = useState(null);
  
  // User data from location state
  const username = location.state?.username || 'Utilisateur';
  const speakLanguage = location.state?.speakLanguage || 'fr';
  const listenLanguage = location.state?.listenLanguage || 'fr';
  const isHost = location.state?.isHost || false;
  
  // Refs
  const localVideoRef = useRef(null);
  const participantRefs = useRef({});
  const audioContextRef = useRef(null);
  const socketRef = useRef(null);
  const leaveTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);
  const cleanupFunctionRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const sessionStorageKey = `meeting-${meetingId}-user`;
  
  // Get language name by code
  const getLanguageName = (code) => {
    const languages = {
      'fr': 'Français',
      'en': 'Anglais',
      'es': 'Espagnol',
      'de': 'Allemand',
      'it': 'Italien',
      'pt': 'Portugais',
      'ar': 'Arabe',
      'ru': 'Russe',
      'zh': 'Chinois',
      'ja': 'Japonais',
      'ko': 'Coréen',
      'nl': 'Néerlandais'
    };
    return languages[code] || code;
  };
  
  // Formater la durée en HH:MM:SS
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Initialiser médias et rejoindre la salle
  useEffect(() => {
    let cleanupFunction = () => {};
    
    const initialize = async () => {
      try {
        setIsConnecting(true);
        
        // Vérifier si l'utilisateur était déjà dans cette réunion (stocker dans sessionStorage)
        const savedUserData = sessionStorage.getItem(sessionStorageKey);
        let userData = null;
        
        if (savedUserData) {
          try {
            userData = JSON.parse(savedUserData);
            console.log('Reconnecting with saved data:', userData);
          } catch (e) {
            console.error('Error parsing saved user data:', e);
          }
        }
        
        // Initialiser les médias (caméra et micro)
        const stream = await initializeMedia(true, true);
        setLocalStream(stream);
        
        // Connecter au local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Créer un AudioContext pour la traduction
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        // Rejoindre la salle
        socketRef.current = getSocket();
        
        let cleanup;
        if (userData) {
          // Rejoindre à nouveau avec les mêmes paramètres
          cleanup = rejoinRoom({
            roomCode: meetingId,
            username: userData.username,
            speakLanguage: userData.speakLanguage,
            listenLanguage: userData.listenLanguage,
            isHost: userData.isHost,
            onUserJoined: handleUserJoined,
            onUserLeft: handleUserLeft,
            onRoomJoined: handleRoomJoined,
            onError: handleRoomError,
            onNewMessage: handleNewMessage,
            onTranslatedAudio: handleTranslatedAudio,
            onMeetingEnded: handleMeetingEnded,
            onRemoved: handleRemovedFromMeeting
          });
        } else {
          // Première connexion
          cleanup = joinRoom({
            roomCode: meetingId,
            username,
            speakLanguage,
            listenLanguage,
            isHost,
            onUserJoined: handleUserJoined,
            onUserLeft: handleUserLeft,
            onRoomJoined: handleRoomJoined,
            onError: handleRoomError,
            onNewMessage: handleNewMessage,
            onTranslatedAudio: handleTranslatedAudio,
            onMeetingEnded: handleMeetingEnded,
            onRemoved: handleRemovedFromMeeting
          });
          
          // Sauvegarder les données utilisateur pour une reconnexion potentielle
          sessionStorage.setItem(sessionStorageKey, JSON.stringify({
            username,
            speakLanguage,
            listenLanguage,
            isHost
          }));
        }
        
        cleanupFunctionRef.current = () => {
          // Arrêter les médias locaux
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          
          // Fermer l'audioContext
          if (audioContextRef.current) {
            audioContextRef.current.close();
          }
          
          // Nettoyer l'intervalle de durée
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
          }
          
          // Nettoyer les connexions de salle
          cleanup();
        };
        
        setIsConnecting(false);
        
      } catch (error) {
        console.error('Error initializing meeting:', error);
        setConnectionError(
          error.name === 'NotAllowedError' 
            ? "Accès au microphone et à la caméra refusé. Veuillez autoriser l'accès pour rejoindre la réunion."
            : "Erreur lors de l'initialisation de la réunion. Veuillez réessayer."
        );
        setIsConnecting(false);
      }
    };
    
    initialize();
    
    // Écouter les événements de déchargement de page pour sauvegarder l'état
    const handleBeforeUnload = (e) => {
      // Ne pas déconnecter - juste permettre de partir
      // Le serveur gardera l'utilisateur connecté
      
      // Message standard pour demander confirmation avant fermeture
      e.preventDefault();
      e.returnValue = "Êtes-vous sûr de vouloir quitter la réunion ?";
      return e.returnValue;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function pour useEffect
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
      
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
      }
    };
  }, [meetingId, username, speakLanguage, listenLanguage, isHost]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && showChat) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, showChat]);
  
  // Timer pour la durée de la réunion
  useEffect(() => {
    if (meetingStartTime && !durationIntervalRef.current) {
      durationIntervalRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - meetingStartTime) / 1000);
        setMeetingDuration(elapsedSeconds);
      }, 1000);
    }
    
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [meetingStartTime]);
  
  // Gestionnaires d'événements de salle
  const handleUserJoined = (user) => {
    setParticipants(prev => {
      // Vérifier si l'utilisateur existe déjà
      const userExists = prev.some(p => p.id === user.id);
      if (userExists) {
        // Si l'utilisateur existe, mettre à jour son statut
        return prev.map(p => p.id === user.id ? { ...p, isConnected: true } : p);
      } else {
        // Sinon, ajouter le nouvel utilisateur
        return [...prev, { ...user, isConnected: true }];
      }
    });
    
    // Ajouter un message de notification
    const joinMessage = {
      id: Date.now(),
      type: 'system',
      text: `${user.username} a rejoint la réunion`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, joinMessage]);
  };
  
  const handleUserLeft = (userId) => {
    // Trouver le nom de l'utilisateur qui part
    const leavingUser = participants.find(p => p.id === userId);
    const username = leavingUser ? leavingUser.username : 'Un participant';
    
    // Mettre à jour la liste des participants
    setParticipants(prev => 
      prev.map(p => p.id === userId ? { ...p, isConnected: false } : p)
    );
    
    // Ajouter un message de notification
    const leaveMessage = {
      id: Date.now(),
      type: 'system',
      text: `${username} a quitté la réunion`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, leaveMessage]);
    
    // Arrêter de montrer ce participant comme parlant
    if (participantSpeaking === userId) {
      setParticipantSpeaking(null);
    }
  };
  
  const handleRoomJoined = (roomData) => {
    console.log('Room joined callback with data:', roomData);
    const socket = socketRef.current;
    if (!socket) return;
    
    // Définir l'heure de début de la réunion si pas encore définie
    if (!meetingStartTime) {
      setMeetingStartTime(Date.now());
    }
    
    // Ajouter l'utilisateur local à la liste des participants
    const localUser = {
      id: socket.id,
      username,
      speakLanguage,
      listenLanguage,
      isYou: true,
      isConnected: true,
      isHost
    };
    
    // Vérifier si c'est la première fois que nous rejoignons (pour le message de bienvenue)
    const isFirstJoin = participants.length === 0;
    
    // Créer un Map des participants existants pour une fusion efficace
    const participantMap = new Map();
    
    // D'abord ajouter les participants existants
    participants.forEach(p => {
      if (p.isConnected) {
        participantMap.set(p.id, p);
      }
    });
    
    // Ajouter/mettre à jour avec les nouveaux participants
    roomData.participants.forEach(p => {
      // Ne pas écraser notre propre entrée
      if (p.id !== socket.id) {
        // Marquer comme connecté
        participantMap.set(p.id, {...p, isConnected: true});
      }
    });
    
    // S'assurer que l'utilisateur local est toujours présent et à jour
    participantMap.set(socket.id, localUser);
    
    // Convertir la Map en tableau
    const updatedParticipants = Array.from(participantMap.values());
    console.log('Updated participants list:', updatedParticipants);
    
    // Mettre à jour la liste des participants
    setParticipants(updatedParticipants);
    
    // Ajouter un message de bienvenue seulement à la première connexion
    if (isFirstJoin) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'system',
        text: `Bienvenue dans la réunion "${roomData.meetingName || meetingId}"`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => prev.length === 0 ? [welcomeMessage] : prev);
    }
    
    // Charger l'historique des messages si disponible
    if (roomData.messageHistory && roomData.messageHistory.length > 0) {
      setMessages(prev => {
        // Vérifier les doublons par ID
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = roomData.messageHistory.filter(m => !existingIds.has(m.id));
        
        if (newMessages.length === 0) return prev;
        
        // Formater les timestamps
        const formattedMessages = newMessages.map(m => ({
          ...m,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isYou: m.senderId === socket.id
        }));
        
        return [...prev, ...formattedMessages];
      });
    }
  };
  
  const handleRoomError = (error) => {
    setConnectionError(error.message || 'Erreur de connexion à la salle');
    
    // Rediriger automatiquement après un délai
    leaveTimeoutRef.current = setTimeout(() => {
      navigate('/virtual-meeting');
    }, 5000);
  };
  
  const handleNewMessage = (messageData) => {
    setMessages(prev => [...prev, {
      ...messageData,
      time: new Date(messageData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isYou: messageData.senderId === socketRef.current?.id
    }]);
  };
  
  const handleTranslatedAudio = (audioData) => {
    // Si la traduction est désactivée, ne rien faire
    if (!isTranslationOn) return;
    
    // Mettre à jour qui parle
    setParticipantSpeaking(audioData.fromUser);
    
    // Après un délai, arrêter l'indication de parole
    setTimeout(() => {
      if (participantSpeaking === audioData.fromUser) {
        setParticipantSpeaking(null);
      }
    }, 1000);
  };
  
  const handleMeetingEnded = (data) => {
    const endedByHostName = data.endedBy || "L'organisateur";
    
    // Afficher un message
    const endMessage = {
      id: Date.now(),
      type: 'system',
      text: `${endedByHostName} a mis fin à la réunion pour tous les participants`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, endMessage]);
    
    // Demander à l'utilisateur s'il veut quitter
    setTimeout(() => {
      alert("La réunion a été terminée par l'organisateur. Vous allez être redirigé.");
      
      // Nettoyer et rediriger
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
      }
      
      // Supprimer les données de session
      sessionStorage.removeItem(sessionStorageKey);
      
      navigate('/virtual-meeting');
    }, 1000);
  };
  
  const handleRemovedFromMeeting = (data) => {
    const removedByName = data.removedBy || "L'organisateur";
    
    // Afficher un message
    alert(`Vous avez été retiré de la réunion par ${removedByName}.`);
    
    // Nettoyer et rediriger
    if (cleanupFunctionRef.current) {
      cleanupFunctionRef.current();
    }
    
    // Supprimer les données de session
    sessionStorage.removeItem(sessionStorageKey);
    
    navigate('/virtual-meeting');
  };
  
  // Gérer les changements d'état du micro et de la caméra
  const handleToggleMic = () => {
    const newState = !isMicOn;
    setIsMicOn(newState);
    if (localStream) {
      toggleAudio(newState);
    }
  };
  
  const handleToggleVideo = () => {
    const newState = !isVideoOn;
    setIsVideoOn(newState);
    
    // S'assurer que localStream existe avant de manipuler ses tracks
    if (localStream) {
      toggleVideo(newState);
    }
  };
  
  // Gérer l'envoi de messages
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendChatMessage(meetingId, chatMessage);
      setChatMessage('');
    }
  };
  
  // Gérer le départ de la réunion
  const handleLeaveMeeting = () => {
    if (isHost) {
      // L'hôte a des options supplémentaires
      setShowEndMeetingOptions(true);
    } else {
      // Participants normaux
      if (window.confirm('Voulez-vous vraiment quitter la réunion?')) {
        // Assurez-vous d'appeler la fonction de nettoyage
        if (cleanupFunctionRef.current) {
          cleanupFunctionRef.current();
        }
        
        // Quitter la salle
        leaveRoom(meetingId);
        
        // Supprimer les données de session
        sessionStorage.removeItem(sessionStorageKey);
        
        navigate('/virtual-meeting');
      }
    }
  };
  
  // Gérer le retrait d'un participant par l'hôte
  const handleRemoveParticipant = (participantId) => {
    if (!isHost) return;
    
    const participant = participants.find(p => p.id === participantId);
    if (!participant || participant.isYou) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir retirer ${participant.username} de la réunion?`)) {
      removeParticipant(meetingId, participantId);
    }
  };
  
  // Gérer la fin de la réunion pour tous
  const handleEndMeetingForAll = () => {
    if (!isHost) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir terminer la réunion pour tous les participants?")) {
      endMeeting(meetingId);
      
      // Nettoyer et rediriger
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
      }
      
      // Supprimer les données de session
      sessionStorage.removeItem(sessionStorageKey);
      
      navigate('/virtual-meeting');
    }
  };

  // Composant pour afficher un participant
  const ParticipantVideo = ({ participant }) => {
    const videoRef = useRef(null);
    
    useEffect(() => {
      // Vérifier que la référence vidéo existe avant d'assigner srcObject
      if (videoRef.current) {
        // Si c'est l'utilisateur local et que le stream existe, afficher son propre flux vidéo
        if (participant.isYou && localStream) {
          videoRef.current.srcObject = localStream;
        }
        
        // Conserver une référence pour l'accès par d'autres composants
        participantRefs.current[participant.id] = videoRef;
      }
      
      return () => {
        // Nettoyer la référence lorsque le composant est démonté
        delete participantRefs.current[participant.id];
      };
    }, [participant.id]);
    
    // Calculer la classe de surbrillance
    const highlightClass = participantSpeaking === participant.id ? 'border-2 border-green-500' : (participant.isYou ? 'border-2 border-blue-500' : '');
    
    return (
      <motion.div
        className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg ${highlightClass}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        layout
      >
        <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
          {/* Video placeholder or actual video */}
          {participant.isYou && !isVideoOn ? (
            <div className="h-28 w-28 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-bold">
              {participant.username.charAt(0)}
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={participant.isYou}
              className="h-full w-full object-cover"
            />
          )}
  
          {/* Participant info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <span className="font-medium">
                  {participant.username} 
                  {participant.isYou && ' (Vous)'} 
                  {participant.isHost && <span className="ml-1 text-yellow-400">(Organisateur)</span>}
                </span>
                {participantSpeaking === participant.id && (
                  <motion.div
                    className="ml-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Volume2 size={16} className="text-green-400" />
                  </motion.div>
                )}
              </div>
              <div className="text-xs text-gray-300 flex items-center">
                <Globe size={12} className="mr-1" />
                {getLanguageName(participant.speakLanguage)} → {getLanguageName(participant.listenLanguage)}
              </div>
            </div>
            
            <div className="flex">
              {isHost && !participant.isYou && (
                <button
                  className="p-1 rounded-full bg-red-500 hover:bg-red-600 mr-1"
                  onClick={() => handleRemoveParticipant(participant.id)}
                  title="Retirer ce participant"
                >
                  <UserX size={14} />
                </button>
              )}
              
              {participant.isYou && (
                <div className="flex space-x-1">
                  <button
                    className={`p-1 rounded-full ${isMicOn ? 'bg-gray-700' : 'bg-red-500'}`}
                    onClick={handleToggleMic}
                  >
                    {isMicOn ? <Mic size={14} /> : <MicOff size={14} />}
                  </button>
                  <button
                    className={`p-1 rounded-full ${isVideoOn ? 'bg-gray-700' : 'bg-red-500'}`}
                    onClick={handleToggleVideo}
                  >
                    {isVideoOn ? <VideoIcon size={14} /> : <VideoOff size={14} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Si en cours de connexion ou erreur
  if (isConnecting || connectionError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="max-w-md p-8 bg-gray-800 rounded-xl shadow-lg text-center">
          {isConnecting ? (
            <>
              <div className="mb-4">
                <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Connexion à la réunion...</h2>
              <p className="text-gray-400">Veuillez autoriser l'accès à la caméra et au microphone lorsque le navigateur vous le demande.</p>
            </>
          ) : (
            <>
              <div className="mb-4 text-red-500">
                <AlertCircle size={48} className="mx-auto" />
              </div>
              <h2 className="text-xl font-bold mb-2">Impossible de rejoindre la réunion</h2>
              <p className="text-gray-400 mb-6">{connectionError}</p>
              <p className="text-sm text-gray-500">Vous serez redirigé automatiquement dans quelques secondes...</p>
              <div className="mt-6">
                <Link to="/virtual-meeting">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Retour aux réunions
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Filtrer les participants connectés pour affichage
  const connectedParticipants = participants.filter(p => p.isConnected);
  const participantCount = connectedParticipants.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Meeting info header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/">
                <motion.div 
                  className="bg-blue-500 text-white p-1 rounded-full flex items-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Globe size={20} />
                  <h1 className="text-sm font-bold ml-1 text-white">VoiceTranslate</h1>
                </motion.div>
              </Link>
              <div className="ml-4 pl-4 border-l border-gray-600">
                <h2 className="text-sm font-medium">Code: <span className="font-mono">{meetingId}</span></h2>
              </div>
              <div className="ml-4 pl-4 border-l border-gray-600 flex items-center">
                <Clock size={14} className="mr-1 text-gray-400" />
                <span className="text-sm text-gray-300">{formatDuration(meetingDuration)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-1 ${isTranslationOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Traduction {isTranslationOn ? 'active' : 'désactivée'}</span>
              </div>
              
              <button 
                className="text-sm text-gray-300 hover:text-white flex items-center"
                onClick={() => setShowParticipants(!showParticipants)}
              >
                <Users size={16} className="mr-1" />
                <span>{participantCount}</span>
              </button>
              
              <button 
                className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded flex items-center"
                onClick={handleLeaveMeeting}
              >
                <Phone size={16} className="mr-1" />
                {isHost ? "Terminer" : "Quitter"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main meeting area */}
      <div className="flex-grow flex">
        {/* Video grid */}
        <div className={`flex-grow p-4 ${showParticipants || showChat ? 'md:pr-80' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {connectedParticipants.map(participant => (
              <ParticipantVideo key={participant.id} participant={participant} />
            ))}
          </div>
        </div>

        {/* Side panel (chat or participants) */}
        <AnimatePresence>
          {(showParticipants || showChat) && (
            <motion.div
              className="fixed right-0 top-12 bottom-16 w-80 bg-gray-800 border-l border-gray-700"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3 }}
            >
              {/* Panel header */}
              <div className="border-b border-gray-700 p-4 flex justify-between items-center">
                <h3 className="font-medium">
                  {showParticipants ? 'Participants' : 'Chat'}
                </h3>
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => {
                    setShowParticipants(false);
                    setShowChat(false);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Panel content */}
              <div className="overflow-y-auto h-full p-2">
                {showParticipants && (
                  <div className="space-y-2">
                    {participants.map(participant => (
                      <motion.div
                        key={participant.id}
                        className={`p-3 rounded-lg ${participant.isConnected ? 'bg-gray-750' : 'bg-gray-800 opacity-50'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold mr-2">
                              {participant.username.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium flex items-center">
                                {participant.username}
                                {participant.isYou && <span className="text-xs ml-1 text-blue-400">(Vous)</span>}
                                {participant.isHost && <span className="text-xs ml-1 text-yellow-400">(Organisateur)</span>}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center">
                                <Globe size={10} className="mr-1" />
                                {getLanguageName(participant.speakLanguage)} → {getLanguageName(participant.listenLanguage)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {!participant.isConnected && (
                              <span className="text-xs text-gray-400">Hors ligne</span>
                            )}
                            {participant.id === participantSpeaking && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              >
                                <Volume2 size={16} className="text-green-400" />
                              </motion.div>
                            )}
                            {isHost && !participant.isYou && participant.isConnected && (
                              <button
                                onClick={() => handleRemoveParticipant(participant.id)}
                                className="ml-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                                title="Retirer ce participant"
                              >
                                <UserX size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {showChat && (
                  <div className="h-full flex flex-col pb-16">
                    {/* Chat messages - avec hauteur fixe et scrolling */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-grow overflow-y-auto space-y-3 p-2"
                      style={{ height: 'calc(100% - 60px)' }}
                    >
                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500 text-center">
                            Aucun message pour l'instant.<br />
                            Commencez la conversation!
                          </p>
                        </div>
                      ) : (
                        messages.map(message => (
                          <motion.div
                            key={message.id}
                            className={`max-w-xs rounded-lg p-3 break-words ${
                              message.type === 'system' 
                                ? 'bg-gray-700/50 mx-auto text-center text-sm text-gray-400' 
                                : message.isYou 
                                  ? 'bg-blue-600 ml-auto rounded-br-none' 
                                  : 'bg-gray-700 rounded-bl-none'
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {message.type !== 'system' && (
                              <div className="text-xs text-gray-300 mb-1 flex justify-between">
                                <span>{message.sender}</span>
                                <span>{message.time}</span>
                              </div>
                            )}
                            <p>{message.text}</p>
                            {message.type === 'system' && (
                              <span className="text-xs">{message.time}</span>
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                    
                    {/* Chat input fixed at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700 p-3 bg-gray-800">
                      <div className="flex items-center">
                        <input
                          type="text"
                          className="flex-grow p-2 bg-gray-700 rounded-l-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Écrivez un message..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                          className="p-2 bg-blue-500 rounded-r-lg"
                          onClick={handleSendMessage}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control bar */}
      <div className="bg-gray-800 border-t border-gray-700 py-3">
        <div className="max-w-3xl mx-auto flex justify-between items-center px-4">
          <div className="flex space-x-2">
            <motion.button
              className={`p-3 rounded-full ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleMic}
            >
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </motion.button>
            
            <motion.button
              className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleVideo}
            >
              {isVideoOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
            </motion.button>
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              className={`p-3 rounded-full ${isTranslationOn ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsTranslationOn(!isTranslationOn)}
              title="Activer/désactiver la traduction"
            >
              {isTranslationOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </motion.button>
            
            <motion.button
              className={`p-3 rounded-full ${showParticipants ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowParticipants(!showParticipants);
                setShowChat(false);
              }}
            >
              <Users size={20} />
            </motion.button>
            
            <motion.button
              className={`p-3 rounded-full ${showChat ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowChat(!showChat);
                setShowParticipants(false);
              }}
            >
              <MessageCircle size={20} />
            </motion.button>
            
            <motion.button
              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={20} />
            </motion.button>
            
            <motion.button
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 md:hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLeaveMeeting}
            >
              <Phone size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Translation status floating card */}
      <motion.div 
        className="fixed bottom-20 left-4 bg-gray-800 rounded-lg shadow-lg p-3 flex items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`h-3 w-3 rounded-full mr-2 ${isTranslationOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div>
          <div className="text-sm font-medium">Traduction {isTranslationOn ? 'active' : 'désactivée'}</div>
          <div className="text-xs text-gray-400">
            Vous parlez en {getLanguageName(speakLanguage)} et écoutez en {getLanguageName(listenLanguage)}
          </div>
        </div>
      </motion.div>
      
      {/* Settings panel (modal) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Paramètres</h3>
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowSettings(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Langue avec laquelle vous parlez
                  </label>
                  <select 
                    className="w-full p-2 bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={speakLanguage}
                    disabled
                  >
                    <option value={speakLanguage}>{getLanguageName(speakLanguage)}</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cette option ne peut pas être modifiée pendant une réunion
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Langue dans laquelle vous écoutez
                  </label>
                  <select 
                    className="w-full p-2 bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={listenLanguage}
                    disabled
                  >
                    <option value={listenLanguage}>{getLanguageName(listenLanguage)}</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cette option ne peut pas être modifiée pendant une réunion
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Volume de la traduction
                  </label>
                  <div className="flex items-center">
                    <Volume1 size={16} className="text-gray-400 mr-2" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      defaultValue="80"
                    />
                    <Volume2 size={16} className="text-gray-400 ml-2" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Volume de la voix originale
                  </label>
                  <div className="flex items-center">
                    <Volume1 size={16} className="text-gray-400 mr-2" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      defaultValue="20"
                    />
                    <Volume2 size={16} className="text-gray-400 ml-2" />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition duration-200"
                    onClick={() => setShowSettings(false)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* End Meeting Options Modal (for host only) */}
      <AnimatePresence>
        {showEndMeetingOptions && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEndMeetingOptions(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Terminer la réunion</h3>
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowEndMeetingOptions(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-300">
                  En tant qu'organisateur, vous pouvez terminer la réunion pour tous ou simplement la quitter.
                </p>
                
                <div className="pt-4 space-y-3">
                  <button
                    className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition duration-200 flex items-center justify-center"
                    onClick={handleEndMeetingForAll}
                  >
                    <LogOut size={18} className="mr-2" />
                    Terminer pour tous
                  </button>
                  
                  <button
                    className="w-full py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition duration-200 flex items-center justify-center"
                    onClick={() => {
                      setShowEndMeetingOptions(false);
                      
                      // Assurez-vous d'appeler la fonction de nettoyage
                      if (cleanupFunctionRef.current) {
                        cleanupFunctionRef.current();
                      }
                      
                      // Quitter la salle sans la terminer
                      leaveRoom(meetingId);
                      
                      // Supprimer les données de session
                      sessionStorage.removeItem(sessionStorageKey);
                      
                      navigate('/virtual-meeting');
                    }}
                  >
                    <Phone size={18} className="mr-2" />
                    Quitter seulement
                  </button>
                  
                  <button
                    className="w-full py-2 text-gray-400 hover:text-white transition duration-200"
                    onClick={() => setShowEndMeetingOptions(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Audio processing component (invisible) */}
      {localStream && (
        <AudioProcessor
          stream={localStream}
          isEnabled={isMicOn && isTranslationOn}
          speakLanguage={speakLanguage}
          roomCode={meetingId}
          onAudioProcessed={(audioData) => {
            // Traitement de l'audio pour la traduction
            if (isMicOn && isTranslationOn) {
              processAndSendAudio(meetingId, audioData);
            }
          }}
        />
      )}
    </div>
  );
};

export default MeetingRoomScreen;