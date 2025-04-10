import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronLeft, QrCode, ArrowRight, Radio, Headphones, Volume2, Play, Pause, Clock, 
  FastForward, Rewind, QrCodeScan, X, Users, Video, MessageSquare, Camera, AlertTriangle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import jsQR from 'jsqr';

const ConferenceJoinScreen = () => {
  const navigate = useNavigate();
  const { conferenceId: urlConferenceId } = useParams();
  const [step, setStep] = useState(1);
  const [conferenceId, setConferenceId] = useState(urlConferenceId || '');
  const [conferenceInfo, setConferenceInfo] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [userName, setUserName] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showConferenceSummary, setShowConferenceSummary] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participantsList, setParticipantsList] = useState([]);
  const [conferenceSummary, setConferenceSummary] = useState('');
  const [error, setError] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [showEndedAlert, setShowEndedAlert] = useState(false);
  const [endedMessage, setEndedMessage] = useState('');
  
  const videoRef = useRef(null);
  const presenterVideoRef = useRef(null);
  const audioRef = useRef(null);
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);
  const audioLevelIntervalRef = useRef(null);
  
  const API_BASE_URL = "http://localhost:8000/api";
  
  // Charger les langues et infos conférence si ID disponible
  useEffect(() => {
    if (urlConferenceId) {
      setConferenceId(urlConferenceId);
      checkConference(urlConferenceId);
    }
    
    // Générer un ID unique pour ce participant
    setParticipantId(`user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    
    // Générer un nom par défaut
    setUserName(`Participant ${Math.floor(Math.random() * 1000)}`);
    
    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
    };
  }, [urlConferenceId]);
  
  // Faire défiler le chat vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Fonction pour vérifier la validité de la conférence
  const checkConference = async (id) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Appel API pour vérifier la conférence
      const response = await axios.get(`${API_BASE_URL}/conferences/${id}`);
      
      if (response.data && response.data.success) {
        const conference = response.data.conference;
        
        // Vérifier si la conférence est active
        if (conference.status !== 'active') {
          setError("Cette conférence n'est pas active ou a été terminée.");
          setIsLoading(false);
          return;
        }
        
        setConferenceInfo(conference);
        setAvailableLanguages(conference.targetLanguages);
        setStep(2);
      } else {
        setError("La conférence n'a pas été trouvée. Veuillez vérifier l'identifiant.");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la conférence:", error);
      setError("La conférence n'a pas été trouvée. Veuillez vérifier l'identifiant.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour rejoindre la conférence
  const joinConference = async () => {
    if (!selectedLanguage) {
      alert("Veuillez sélectionner une langue d'écoute");
      return;
    }
    
    if (!userName.trim()) {
      alert("Veuillez entrer votre nom");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Établir une connexion WebSocket
      const ws = new WebSocket(`ws://localhost:8000/ws/conference/${conferenceId}`);
      
      ws.onopen = () => {
        // Envoyer les informations du participant
        ws.send(JSON.stringify({
          participant_id: participantId,
          name: userName,
          language: selectedLanguage,
          is_presenter: false
        }));
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch(message.type) {
          case 'connection_success':
            console.log("Connexion WebSocket établie avec succès");
            break;
            
          case 'conference_inactive':
            setError(message.data.message);
            setIsLoading(false);
            ws.close();
            return;
            
          case 'participants_list':
            if (message.data && message.data.participants) {
              setParticipantsList(message.data.participants);
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
                }
                break;
                
              case 'participant_left':
                // Retirer le participant de la liste
                if (message.data && message.data.participant_id) {
                  setParticipantsList(prev => prev.filter(p => p.id !== message.data.participant_id));
                }
                break;
                
              case 'translated_audio':
                // Traiter les données audio traduites
                setAudioLevel(Math.random() * 0.8);
                break;
                
              case 'video_data':
                // Traiter les données vidéo
                if (presenterVideoRef.current) {
                  // Dans une application réelle, vous décoderiez et afficheriez la vidéo ici
                }
                break;
                
              case 'conference_ended':
                // Afficher une alerte persistante indiquant que la conférence est terminée
                setEndedMessage(message.data.message || "La conférence a été terminée par l'organisateur.");
                setShowEndedAlert(true);
                setIsPlaying(false);
                break;
            }
          };
          
          ws.onerror = (error) => {
            console.error("Erreur WebSocket:", error);
          };
          
          ws.onclose = () => {
            if (joined) {
              // Ne pas afficher d'alerte automatique car l'arrêt de la conférence est géré par le message 'conference_ended'
            }
          };
          
          wsRef.current = ws;
          
          // Simuler des niveaux audio pour la démo
          audioLevelIntervalRef.current = setInterval(() => {
            setAudioLevel(Math.random() * 0.8);
          }, 100);
          
          // Simuler des données de conférence pour la démo
          setDuration(60 * 15); // 15 minutes de durée totale
          setCurrentTime(60 * 3); // 3 minutes déjà écoulées
          
          // Générer un résumé de conférence
          try {
            const summaryResponse = await axios.post(`${API_BASE_URL}/conferences/${conferenceId}/summary`);
            if (summaryResponse.data && summaryResponse.data.success) {
              setConferenceSummary(summaryResponse.data.summary);
            }
          } catch (error) {
            console.error("Erreur lors de la récupération du résumé:", error);
            
            // En cas d'erreur, générer un résumé local
            setConferenceSummary(`Résumé de la conférence "${conferenceInfo?.title}"
            
    Points clés abordés:
    - Introduction au marché financier marocain
    - Perspectives économiques pour 2025
    - Nouvelles régulations bancaires et leur impact
    - Opportunités d'investissement dans le secteur des technologies
    - Stratégies pour les investisseurs individuels
    
    Cette conférence a mis en lumière les défis et opportunités du secteur financier marocain, avec un accent particulier sur les innovations technologiques qui transforment le paysage bancaire. Les intervenants ont souligné l'importance d'une approche prudente mais proactive face aux changements réglementaires à venir.`);
          }
          
          // Activer la vidéo si disponible
          if (conferenceInfo?.hasVideo) {
            setVideoEnabled(true);
          }
          
          setJoined(true);
          setIsPlaying(true);
        } catch (error) {
          console.error("Erreur lors de la connexion à la conférence:", error);
          setError("Impossible de rejoindre la conférence. Veuillez réessayer.");
        } finally {
          setIsLoading(false);
        }
      };
      
      // Fonction pour démarrer/pauser la lecture
      const togglePlayback = () => {
        setIsPlaying(!isPlaying);
        
        // Dans une application réelle, vous interagiriez avec l'élément audio ici
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
          } else {
            audioRef.current.play();
          }
        }
      };
      
      // Fonction pour avancer/reculer de 10 secondes
      const seekAudio = (seconds) => {
        if (audioRef.current) {
          audioRef.current.currentTime += seconds;
        }
        
        // Pour la démo, mettons à jour directement currentTime
        setCurrentTime(prev => {
          const newTime = prev + seconds;
          if (newTime < 0) return 0;
          if (newTime > duration) return duration;
          return newTime;
        });
      };
      
      // Fonction pour mettre à jour le curseur de lecture
      const handleSeek = (e) => {
        const percent = e.target.value / 100;
        const newTime = percent * duration;
        setCurrentTime(newTime);
        
        if (audioRef.current) {
          audioRef.current.currentTime = newTime;
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
            senderId: participantId,
            senderName: userName,
            text: newMessage,
            originalLanguage: selectedLanguage,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, message]);
        }
        
        setNewMessage('');
      };
      
      // Fonction pour scanner le QR code
        const startQrScanner = () => {
        setShowQrScanner(true);
        
        // Accéder à la caméra
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                
                // Créer un canvas pour analyser les images de la caméra
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const scanInterval = setInterval(() => {
                if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                    // Définir la taille du canvas pour correspondre à la vidéo
                    canvas.height = videoRef.current.videoHeight;
                    canvas.width = videoRef.current.videoWidth;
                    
                    // Dessiner l'image actuelle de la vidéo sur le canvas
                    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                    
                    // Obtenir les données d'image
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Analyser l'image pour trouver un QR code
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                    });
                    
                    // Si un QR code est détecté
                    if (code) {
                    // Arrêter le scan
                    clearInterval(scanInterval);
                    stopQrScanner();
                    
                    // Extraire l'ID de conférence du QR code
                    const scannedURL = code.data;
                    let scannedId = scannedURL;
                    
                    // Si c'est une URL complète, extraire juste l'ID
                    if (scannedURL.includes('/conference/join/')) {
                        scannedId = scannedURL.split('/conference/join/')[1];
                    }
                    
                    // Définir l'ID et vérifier la conférence
                    setConferenceId(scannedId);
                    checkConference(scannedId);
                    }
                }
                }, 500); // Vérifier toutes les 500ms
                
                // Nettoyer l'intervalle quand le scanner est fermé
                const cleanup = () => {
                clearInterval(scanInterval);
                };
                
                // Stocker la fonction de nettoyage
                return cleanup;
            }
            })
            .catch(err => {
            console.error("Erreur lors de l'accès à la caméra:", err);
            setShowQrScanner(false);
            setError("Impossible d'accéder à la caméra. Veuillez saisir l'identifiant manuellement.");
            });
        };
      
      // Fonction pour arrêter le scanner de QR code
      const stopQrScanner = () => {
        setShowQrScanner(false);
        
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      };
      
      // Formater le temps en MM:SS
      const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };
      
      // Générer les barres de visualisation audio
      const generateWaveform = () => {
        return Array(15).fill(0).map((_, i) => {
          const height = joined && isPlaying 
            ? Math.min(16, Math.max(3, Math.floor(Math.sin(i/2 + Date.now()/200) * 8 * audioLevel + 5)))
            : 3;
          
          return (
            <motion.div 
              key={i} 
              className={`${joined && isPlaying ? 'bg-green-500' : 'bg-gray-300'} rounded-full mx-px`}
              style={{ 
                height: `${height}px`,
                width: '2px'
              }}
              animate={{ 
                height: `${height}px`,
              }}
              transition={{ duration: 0.1 }}
            />
          );
        });
      };
      
      // Quitter la conférence et revenir à l'accueil
      const leaveConference = () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
        setJoined(false);
        setShowEndedAlert(false);
        navigate('/conference');
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
                {joined ? (
                  <button 
                    className="mr-3 text-white/80 hover:text-white transition-colors"
                    onClick={() => setJoined(false)}
                  >
                    <ChevronLeft size={24} />
                  </button>
                ) : (
                  <Link to="/conference">
                    <button className="mr-3 text-white/80 hover:text-white transition-colors">
                      <ChevronLeft size={24} />
                    </button>
                  </Link>
                )}
                <div className="flex items-center">
                  <motion.div 
                    className="bg-white/20 text-white p-2 rounded-full flex items-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Globe size={24} />
                  </motion.div>
                  <h1 className="text-xl font-bold ml-2 text-white">
                    {joined ? conferenceInfo?.title || 'Conférence' : 'Rejoindre une conférence'}
                  </h1>
                </div>
              </motion.div>
              {joined && (
                <div className="flex items-center space-x-2">
                  <motion.div 
                    className="flex h-6 items-center bg-white/10 px-3 py-4 rounded-full"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {generateWaveform()}
                  </motion.div>
                  <motion.button
                    className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
                    onClick={() => setShowParticipantsModal(true)}
                    whileHover={{ scale: 1.1 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Users size={18} />
                  </motion.button>
                  <motion.button
                    className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
                    onClick={() => setShowChat(!showChat)}
                    whileHover={{ scale: 1.1 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <MessageSquare size={18} />
                  </motion.button>
                </div>
              )}
            </div>
          </header>
          
          <main className={`flex-grow max-w-6xl mx-auto px-4 py-8 ${showChat && joined ? 'lg:pr-80' : ''}`}>
            {/* Alerte de fin de conférence */}
            {showEndedAlert && (
              <motion.div 
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <AlertTriangle size={24} className="mr-2 flex-shrink-0" />
                  <p>{endedMessage}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={leaveConference}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Quitter
                  </button>
                </div>
              </motion.div>
            )}
            
            {!joined ? (
              // Écran de connexion
              <div className="max-w-md mx-auto">
                {step === 1 && (
                  <motion.div 
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
                      <h2 className="font-semibold text-blue-700">Rejoindre une conférence</h2>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-6">
                        Entrez l'identifiant de la conférence ou scannez le QR code fourni par l'organisateur.
                      </p>
                      
                      <div className="mb-6">
                        <label htmlFor="conference-id" className="block text-sm font-medium text-gray-700 mb-1">
                          Identifiant de la conférence
                        </label>
                        <div className="flex">
                          <input 
                            type="text" 
                            id="conference-id" 
                            value={conferenceId} 
                            onChange={(e) => setConferenceId(e.target.value)} 
                            placeholder="Ex: CN-1234-ABCD"
                            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button 
                            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg transition-colors flex items-center"
                            onClick={startQrScanner}
                          >
                            <QrCode size={20} />
                          </button>
                        </div>
                        {error && (
                          <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <motion.button 
                          className={`px-6 py-3 bg-blue-500 text-white rounded-lg font-medium shadow-md hover:bg-blue-600 transition-colors flex items-center ${
                            !conferenceId || isLoading || error ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => checkConference(conferenceId)}
                          disabled={!conferenceId || isLoading || error}
                          whileHover={{ scale: conferenceId && !isLoading && !error ? 1.05 : 1 }}
                          whileTap={{ scale: conferenceId && !isLoading && !error ? 0.95 : 1 }}
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <ArrowRight size={18} className="mr-2" />
                          )}
                          Continuer
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {step === 2 && conferenceInfo && (
                  <motion.div 
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
                      <h2 className="font-semibold text-blue-700">Rejoindre la conférence</h2>
                    </div>
                    <div className="p-6">
                      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-lg text-gray-800 mb-1">{conferenceInfo.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">ID: {conferenceInfo.id}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Langue source: <span className="font-medium">{conferenceInfo.sourceLanguage}</span></span>
                          <span className="text-gray-600">{conferenceInfo.participantsCount || 0} participants</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Votre nom
                        </label>
                        <input 
                          type="text" 
                          id="user-name" 
                          value={userName} 
                          onChange={(e) => setUserName(e.target.value)} 
                          placeholder="Ex: Jean Dupont"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Ce nom sera affiché aux autres participants
                        </p>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choisissez votre langue d'écoute
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableLanguages.map((lang) => (
                            <motion.button
                              key={lang}
                              className={`p-3 rounded-lg text-left flex items-center border ${
                                selectedLanguage === lang 
                                  ? 'bg-blue-50 border-blue-300 text-blue-800' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedLanguage(lang)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Radio size={18} className={selectedLanguage === lang ? 'text-blue-500' : 'text-gray-400'} />
                              <span className="ml-2">{lang}</span>
                            </motion.button>
                          ))}
                        </div>
                        {availableLanguages.length === 0 && (
                          <p className="text-amber-600 text-sm mt-2">
                            Aucune langue disponible pour cette conférence.
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-between">
                        <motion.button 
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
                          onClick={() => setStep(1)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ChevronLeft size={18} className="mr-1" />
                          Retour
                        </motion.button>
                        
                        <motion.button 
                          className={`px-6 py-3 bg-blue-500 text-white rounded-lg font-medium shadow-md hover:bg-blue-600 transition-colors flex items-center ${
                            !selectedLanguage || !userName.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={joinConference}
                          disabled={!selectedLanguage || !userName.trim() || isLoading}
                          whileHover={{ scale: selectedLanguage && userName.trim() && !isLoading ? 1.05 : 1 }}
                          whileTap={{ scale: selectedLanguage && userName.trim() && !isLoading ? 0.95 : 1 }}
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Headphones size={18} className="mr-2" />
                          )}
                          Rejoindre
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              // Écran d'écoute
              <div>
                {videoEnabled && (
                  <motion.div 
                    className="bg-black rounded-lg overflow-hidden mb-6 shadow-md aspect-video"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Zone de vidéo simulée */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                      <div className="text-white text-center p-6">
                        <Camera size={48} className="mx-auto mb-4 text-blue-400 opacity-50" />
                        <h3 className="text-xl font-medium mb-2">Vidéo du présentateur</h3>
                        <p className="text-gray-400">Diffusion en direct avec traduction en {selectedLanguage}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <motion.div 
                  className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-green-700">Écoute en cours</h2>
                    <div className="flex items-center text-green-700 text-sm">
                      <Clock size={14} className="mr-1" />
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>
                          Source: <span className="font-medium">{conferenceInfo?.sourceLanguage}</span>
                        </span>
                        <span>
                          Écoute: <span className="font-medium text-green-600">{selectedLanguage}</span>
                        </span>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-green-800">
                            {isPlaying ? 'Traduction en direct' : 'En pause'}
                          </h3>
                          <div className="flex items-center">
                            <Volume2 size={16} className="text-green-700 mr-1" />
                            <div className="relative w-20 h-4 bg-green-100 rounded-full overflow-hidden">
                              <motion.div 
                                className="absolute top-0 left-0 h-full bg-green-500"
                                style={{ width: `${(audioLevel * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center">
                          <motion.div 
                            className="rounded-full bg-white p-3 shadow-lg"
                            animate={{ 
                              scale: isPlaying ? [1, 1.05, 1] : 1,
                              opacity: isPlaying ? [0.9, 1, 0.9] : 0.9
                            }}
                            transition={{ 
                              repeat: isPlaying ? Infinity : 0,
                              duration: 2
                            }}
                          >
                            <Headphones size={32} className={`${isPlaying ? 'text-green-500' : 'text-gray-400'}`} />
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={(currentTime / duration) * 100 || 0} 
                          onChange={handleSeek}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                          disabled={showEndedAlert}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>00:00</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <motion.button 
                          className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                          onClick={() => seekAudio(-10)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={showEndedAlert}
                        >
                          <Rewind size={20} />
                        </motion.button>
                        
                        <motion.button 
                          className={`w-16 h-16 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} rounded-full flex items-center justify-center text-white shadow-lg ${showEndedAlert ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={togglePlayback}
                          whileHover={{ scale: showEndedAlert ? 1 : 1.1 }}
                          whileTap={{ scale: showEndedAlert ? 1 : 0.9 }}
                          disabled={showEndedAlert}
                        >
                          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                        </motion.button>
                        
                        <motion.button 
                          className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                          onClick={() => seekAudio(10)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={showEndedAlert}
                        >
                          <FastForward size={20} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-blue-700">Informations sur la conférence</h2>
                    <button 
                      className="text-blue-700 text-sm font-medium hover:text-blue-800"
                      onClick={() => setShowConferenceSummary(true)}
                    >
                      Voir le résumé
                    </button>
                  </div>
                  <div className="p-6">
                    <dl className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Titre</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{conferenceInfo?.title}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Identifiant</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{conferenceInfo?.id}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Langue source</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{conferenceInfo?.sourceLanguage}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Votre langue d'écoute</dt>
                    <dd className="text-sm text-green-600 font-medium col-span-2">{selectedLanguage}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Autres langues disponibles</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      <div className="flex flex-wrap gap-2">
                        {availableLanguages
                          .filter(lang => lang !== selectedLanguage)
                          .map(lang => (
                            <span key={lang} className="bg-gray-100 px-2 py-1 rounded-md text-xs">
                              {lang}
                            </span>
                          ))
                        }
                      </div>
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Participants</dt>
                    <dd className="text-sm text-gray-900 col-span-2 flex items-center">
                      {participantsList.length}
                      <button 
                        className="ml-2 text-blue-500 text-xs hover:underline"
                        onClick={() => setShowParticipantsModal(true)}
                      >
                        (Voir la liste)
                      </button>
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Heure de début</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {conferenceInfo?.startTime ? new Date(conferenceInfo.startTime).toLocaleTimeString() : '-'}
                    </dd>
                  </div>
                </dl>
                
                <div className="mt-6 pt-4 border-t flex gap-2">
                  {!showEndedAlert ? (
                    <>
                      <button 
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => setShowChat(!showChat)}
                      >
                        {showChat ? "Masquer le chat" : "Afficher le chat"}
                      </button>
                    </>
                  ) : (
                    <button 
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      onClick={leaveConference}
                    >
                      Quitter la conférence
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
      {/* Chat Sidebar */}
      {showChat && joined && (
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
                <p className="text-xs mt-2">Tous les messages sont automatiquement traduits dans votre langue</p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className={`mb-4 ${message.senderId === participantId ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-[85%] rounded-lg p-3 ${
                    message.senderId === participantId 
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
                disabled={showEndedAlert}
              />
              <button 
                className={`bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r-lg transition-colors ${showEndedAlert ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={sendMessage}
                disabled={showEndedAlert}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {showEndedAlert 
                ? "Le chat est désactivé car la conférence a été terminée" 
                : `Vous écrivez en ${selectedLanguage}. Les autres participants verront votre message dans leur langue.`
              }
            </p>
          </div>
        </motion.div>
      )}
      
      {/* QR Scanner Modal */}
      {showQrScanner && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-xl overflow-hidden max-w-sm w-full mx-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
              <h3 className="font-bold">Scanner le QR code</h3>
              <button 
                className="text-white/80 hover:text-white"
                onClick={stopQrScanner}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="aspect-square w-full bg-black relative overflow-hidden rounded-lg mb-4">
                <video 
                  ref={videoRef} 
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg z-10"></div>
                <motion.div 
                  className="absolute top-1/2 left-0 w-full h-1 bg-blue-500/50 z-20"
                  animate={{
                    y: [-100, 100, -100]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear"
                  }}
                />
              </div>
              
              <p className="text-gray-600 text-sm text-center mb-4">
                Centrez le QR code de la conférence dans le cadre pour le scanner automatiquement.
              </p>
              
              <button 
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={stopQrScanner}
              >
                Saisir l'identifiant manuellement
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
                {participantsList.length} participants sont connectés à cette conférence
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Modal pour le résumé de la conférence */}
      {showConferenceSummary && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowConferenceSummary(false)}
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
                onClick={() => setShowConferenceSummary(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">{conferenceSummary}</pre>
            </div>
            
            <div className="flex justify-end gap-4">
              <button 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowConferenceSummary(false)}
              >
                Fermer
              </button>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => {
                  const element = document.createElement("a");
                  const file = new Blob([conferenceSummary], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = `résumé-${conferenceInfo?.id}.txt`;
                  document.body.appendChild(element);
                  element.click();
                }}
              >
                Télécharger
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Audio element (caché) */}
      <audio ref={audioRef} className="hidden" />
      
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

export default ConferenceJoinScreen;