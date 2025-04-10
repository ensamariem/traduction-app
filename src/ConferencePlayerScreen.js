import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronLeft, Download, Volume2, Play, Pause, Clock, FastForward, Rewind, Settings, 
  HeadphonesMic, List, X, MessageSquare, Users, Camera, FileText } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const ConferencePlayerScreen = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();
  const [conferenceInfo, setConferenceInfo] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [participantsList, setParticipantsList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [conferenceSummary, setConferenceSummary] = useState('');
  const [error, setError] = useState('');
  
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const chatEndRef = useRef(null);
  
  const API_BASE_URL = "http://localhost:8000/api";
  
  // Charger les infos de la conférence
  useEffect(() => {
    const fetchConferenceInfo = async () => {
      setIsLoading(true);
      
      try {
        // Récupérer les données de la conférence
        const conferenceResponse = await axios.get(`${API_BASE_URL}/conferences/${conferenceId}`);
        
        if (conferenceResponse.data && conferenceResponse.data.success) {
          const conference = conferenceResponse.data.conference;
          
          // Récupérer les enregistrements associés
          const recordingsResponse = await axios.get(`${API_BASE_URL}/recordings?conference_id=${conferenceId}`);
          
          if (recordingsResponse.data && recordingsResponse.data.success && recordingsResponse.data.recordings.length > 0) {
            const recording = recordingsResponse.data.recordings[0];
            
            // Récupérer le résumé de la conférence
            const summaryResponse = await axios.post(`${API_BASE_URL}/conferences/${conferenceId}/summary`);
            
            // Récupérer les participants
            const participantsResponse = await axios.get(`${API_BASE_URL}/conferences/${conferenceId}/participants`);
            
            // Récupérer les messages
            const messagesResponse = await axios.get(`${API_BASE_URL}/conferences/${conferenceId}/messages`);
            
            // Construire l'objet de conférence
            const conferenceData = {
              id: conference.id,
              title: conference.title,
              description: conference.description || "Pas de description disponible",
              sourceLanguage: conference.sourceLanguage,
              date: new Date(conference.startTime).toLocaleDateString(),
              duration: recording.duration || 2700, // 45 minutes par défaut
              availableLanguages: [...conference.targetLanguages, conference.sourceLanguage],
              speakerName: "Présentateur",
              speakerTitle: "",
              hasVideo: conference.hasVideo,
              hasChat: conference.hasChat,
              participantsCount: participantsResponse.data.participants?.length || 0,
              participants: participantsResponse.data.participants || [],
              messages: messagesResponse.data.messages || [],
              summary: summaryResponse.data.summary || ""
            };
            
            setConferenceInfo(conferenceData);
            setLanguages(conferenceData.availableLanguages);
            setSelectedLanguage(conferenceData.sourceLanguage);
            setDuration(conferenceData.duration);
            setVideoEnabled(conferenceData.hasVideo);
            setParticipantsList(conferenceData.participants);
            setMessages(conferenceData.messages || []);
            setConferenceSummary(conferenceData.summary || "");
            
            // Générer un transcript factice (dans une vraie application, vous l'extrairiez de l'enregistrement)
            generateMockTranscript(conferenceData);
          } else {
            throw new Error("Aucun enregistrement trouvé pour cette conférence");
          }
        } else {
          throw new Error("Conférence non trouvée");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la conférence:", error);
        
        // Générer des données fictives pour la démo
        generateMockData();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConferenceInfo();
    
    // Cleanup
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [conferenceId]);
  
  // Générer des données fictives pour la démo
  const generateMockData = () => {
    const mockConference = {
      id: conferenceId,
      title: 'Réunion de la Bourse de Casablanca',
      description: 'Discussion sur les perspectives économiques pour le secteur bancaire en 2025',
      sourceLanguage: 'Français',
      date: '2025-04-08',
      duration: 60 * 45, // 45 minutes
      availableLanguages: ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Allemand'],
      speakerName: 'Dr. Mohammed Benali',
      speakerTitle: 'Directeur Exécutif, Bourse de Casablanca',
      hasVideo: true,
      hasChat: true,
      participantsCount: Math.floor(Math.random() * 30) + 20
    };
    
    setConferenceInfo(mockConference);
    setLanguages(mockConference.availableLanguages);
    setSelectedLanguage(mockConference.availableLanguages[0]);
    setDuration(mockConference.duration);
    setVideoEnabled(mockConference.hasVideo);
    
    // Générer un résumé fictif
    setConferenceSummary(`Résumé de la conférence "${mockConference.title}"
    
Points clés abordés:
- Introduction au marché financier marocain
- Perspectives économiques pour 2025
- Nouvelles régulations bancaires et leur impact
- Opportunités d'investissement dans le secteur des technologies
- Stratégies pour les investisseurs individuels

Cette conférence a mis en lumière les défis et opportunités du secteur financier marocain, avec un accent particulier sur les innovations technologiques qui transforment le paysage bancaire. Les intervenants ont souligné l'importance d'une approche prudente mais proactive face aux changements réglementaires à venir.

Nombre de participants: ${mockConference.participantsCount}
Date: ${mockConference.date}
Durée: 45 minutes`);
    
    // Générer un transcript factice
    generateMockTranscript(mockConference);
    
    // Générer des participants fictifs
    generateMockParticipants(mockConference);
    
    // Générer des messages fictifs
    generateMockMessages(mockConference);
  };
  
  // Générer un transcript factice
  const generateMockTranscript = (conference) => {
    const topics = [
      "Introduction et bienvenue",
      "Analyse du marché actuel",
      "Performance des secteurs clés",
      "Impact des changements réglementaires",
      "Stratégies d'investissement pour 2025",
      "Digitalisation du secteur financier",
      "Questions et réponses"
    ];
    
    const mockTranscript = [];
    let currentTime = 0;
    
    topics.forEach((topic, index) => {
      const segmentDuration = Math.floor(conference.duration / topics.length);
      const segmentStart = currentTime;
      currentTime += segmentDuration;
      
      mockTranscript.push({
        id: `segment-${index}`,
        startTime: segmentStart,
        endTime: currentTime,
        topic: topic,
        text: `${topic}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        speaker: conference.speakerName
      });
    });
    
    setTranscript(mockTranscript);
  };
  
  // Générer des participants fictifs
  const generateMockParticipants = (conference) => {
    const mockParticipants = [];
    
    for (let i = 0; i < conference.participantsCount; i++) {
      mockParticipants.push({
        id: `user-${i}`,
        name: `Participant ${i + 1}`,
        language: conference.availableLanguages[Math.floor(Math.random() * conference.availableLanguages.length)],
        joinTime: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 45)).toISOString()
      });
    }
    
    setParticipantsList(mockParticipants);
  };
  
  // Générer des messages fictifs
  const generateMockMessages = (conference) => {
    const chatMessages = [
      "Bonjour tout le monde !",
      "Pouvez-vous revenir sur le point concernant les investissements technologiques ?",
      "Merci pour cette présentation très claire.",
      "Y aura-t-il des documents partagés à la fin ?",
      "Quelles sont vos prévisions pour le secteur bancaire en 2026 ?",
      "Est-ce que la présentation sera disponible en replay ?",
      "Très intéressant, merci pour ces informations."
    ];
    
    const mockMessages = [];
    
    for (let i = 0; i < 15; i++) {
      const randomParticipant = participantsList[Math.floor(Math.random() * participantsList.length)] || { 
        id: `random-${i}`, 
        name: `Participant ${i}`,
        language: conference.availableLanguages[Math.floor(Math.random() * conference.availableLanguages.length)]
      };
      
      mockMessages.push({
        id: `msg-${i}`,
        senderId: randomParticipant.id,
        senderName: randomParticipant.name,
        text: chatMessages[i % chatMessages.length],
        originalLanguage: randomParticipant.language,
        timestamp: new Date(Date.now() - (15 - i) * 60000).toISOString()
      });
    }
    
    setMessages(mockMessages);
  };
  
  // Faire défiler le chat vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Gérer la mise à jour du temps de lecture
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1 * playbackSpeed;
          if (newTime >= duration) {
            setIsPlaying(false);
            clearInterval(progressIntervalRef.current);
            return duration;
          }
          return newTime;
        });
        
        // Simuler un niveau audio aléatoire pour la démo
        setAudioLevel(Math.random() * 0.8);
      }, 1000 / playbackSpeed);
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, duration, playbackSpeed]);
  
  // Fonction pour démarrer/pauser la lecture
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    
    // Dans une application réelle, nous interagirions avec l'élément audio ici
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
    setCurrentTime(prev => {
      const newTime = prev + seconds;
      if (newTime < 0) return 0;
      if (newTime > duration) return duration;
      return newTime;
    });
    
    // Dans une application réelle, nous interagirions avec l'élément audio ici
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };
  
  // Fonction pour mettre à jour le curseur de lecture
  const handleSeek = (e) => {
    const percent = e.target.value / 100;
    const newTime = percent * duration;
    setCurrentTime(newTime);
    
    // Dans une application réelle, nous interagirions avec l'élément audio ici
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  // Fonction pour changer la vitesse de lecture
  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    
    // Dans une application réelle, nous interagirions avec l'élément audio ici
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    
    setShowSettings(false);
  };
  
  // Fonction pour télécharger l'audio
  const downloadAudio = () => {
    alert(`Téléchargement de l'audio en ${selectedLanguage} - Fonctionnalité simulée`);
    
    // Dans une application réelle, nous téléchargerions le fichier audio ici
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/conferences/${conferenceId}/download?language=${selectedLanguage}`;
    link.download = `conference-${conferenceId}-${selectedLanguage}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Formater le temps en HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [
      hrs > 0 ? hrs.toString().padStart(2, '0') : null,
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean);
    
    return parts.join(':');
  };
  
  // Trouver le segment de transcript actuel
  const getCurrentSegment = () => {
    return transcript.find(
      seg => currentTime >= seg.startTime && currentTime < seg.endTime
    );
  };
  
  // Générer les barres de visualisation audio
  const generateWaveform = () => {
    return Array(15).fill(0).map((_, i) => {
      const height = isPlaying 
        ? Math.min(16, Math.max(3, Math.floor(Math.sin(i/2 + Date.now()/200) * 8 * audioLevel + 5)))
        : 3;
      
      return (
        <motion.div 
          key={i} 
          className={`${isPlaying ? 'bg-green-500' : 'bg-gray-300'} rounded-full mx-px`}
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
            <Link to="/conference">
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
              <h1 className="text-xl font-bold ml-2 text-white">
                {isLoading ? 'Chargement...' : conferenceInfo?.title || 'Lecture de conférence'}
              </h1>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-2">
            <motion.div 
              className="flex h-6 items-center bg-white/10 px-3 py-4 rounded-full mr-1"
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
            
            <motion.button 
              className="p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
              onClick={() => setShowTranscript(!showTranscript)}
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <List size={18} />
            </motion.button>
          </div>
        </div>
      </header>
      
      <main className={`flex-grow max-w-6xl mx-auto px-4 py-8 ${showChat ? 'lg:pr-80' : ''}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Chargement de la conférence...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p>{error}</p>
            <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section principale - Player */}
            <div className="lg:col-span-2">
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
                      <h3 className="text-xl font-medium mb-2">Vidéo de la conférence</h3>
                      <p className="text-gray-400">Lecture en {selectedLanguage}</p>
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
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b flex justify-between items-center">
                  <h2 className="font-semibold text-blue-700">Lecteur de conférence</h2>
                  <div className="flex items-center text-blue-700 text-sm">
                    <Clock size={14} className="mr-1" />
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>
                        Date: <span className="font-medium">{conferenceInfo?.date}</span>
                      </span>
                      <span>
                        Langue: 
                        <select 
                          value={selectedLanguage} 
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="ml-2 border-none bg-transparent font-medium text-blue-600 focus:outline-none focus:ring-0 p-0"
                        >
                          {languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </span>
                    </div>
                    
                    <div className="bg-blue-50 p-6 rounded-lg mb-4 flex items-center">
                      {getCurrentSegment() ? (
                        <div className="w-full">
                          <h3 className="font-medium text-blue-800 mb-2 text-lg">
                            {getCurrentSegment().topic}
                          </h3>
                          <p className="text-gray-700">
                            {getCurrentSegment().text}
                          </p>
                          <div className="mt-2 flex justify-between text-sm text-gray-500">
                            <span>{getCurrentSegment().speaker}</span>
                            <span>{formatTime(getCurrentSegment().startTime)} - {formatTime(getCurrentSegment().endTime)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full text-center text-gray-500">
                          <p>Aucune transcription disponible pour ce segment</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={(currentTime / duration) * 100 || 0} 
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
                      >
                        <Rewind size={20} />
                      </motion.button>
                      
                      <motion.button 
                        className={`w-16 h-16 ${isPlaying ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} rounded-full flex items-center justify-center text-white shadow-lg`}
                        onClick={togglePlayback}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                      </motion.button>
                      
                      <motion.button 
                        className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        onClick={() => seekAudio(10)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FastForward size={20} />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-600 mr-2">Vitesse:</span>
                      <motion.button 
                        className={`px-3 py-1 text-sm rounded-md ${playbackSpeed === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => changePlaybackSpeed(1)}
                        whileHover={{ scale: 1.05 }}
                      >
                        1x
                      </motion.button>
                      <motion.button 
                        className={`px-3 py-1 text-sm rounded-md ml-2 ${playbackSpeed === 1.5 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => changePlaybackSpeed(1.5)}
                        whileHover={{ scale: 1.05 }}
                      >
                        1.5x
                      </motion.button>
                      <motion.button 
                        className={`px-3 py-1 text-sm rounded-md ml-2 ${playbackSpeed === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                        onClick={() => changePlaybackSpeed(2)}
                        whileHover={{ scale: 1.05 }}
                      >
                        2x
                      </motion.button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <motion.button 
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md flex items-center"
                        onClick={() => setShowSettings(!showSettings)}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Settings size={14} className="mr-1" />
                        Options
                      </motion.button>
                      
                      <motion.button 
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md flex items-center"
                        onClick={() => setShowSummaryModal(true)}
                        whileHover={{ scale: 1.05 }}
                      >
                        <FileText size={14} className="mr-1" />
                        Résumé
                      </motion.button>
                      
                      <motion.button 
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md flex items-center"
                        onClick={downloadAudio}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Download size={14} className="mr-1" />
                        Télécharger
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Sidebar - Informations */}
            <div>
              <motion.div 
                className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b">
                  <h2 className="font-semibold text-purple-700">Informations</h2>
                </div>
                <div className="p-6">
                  <dl className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Titre</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{conferenceInfo?.title}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{conferenceInfo?.description}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Conférencier</dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        {conferenceInfo?.speakerName}
                        {conferenceInfo?.speakerTitle && (
                          <div className="text-xs text-gray-500 mt-1">{conferenceInfo.speakerTitle}</div>
                        )}
                      </dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Langue d'origine</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{conferenceInfo?.sourceLanguage}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{conferenceInfo?.date}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Durée</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{formatTime(duration)}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Participants</dt>
                      <dd className="text-sm text-gray-900 col-span-2">
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
                      <dt className="text-sm font-medium text-gray-500">Langues disponibles</dt>
                      <dd className="text-sm text-gray-900 col-span-2">
                        <div className="flex flex-wrap gap-2">
                          {languages.map(lang => (
                            <span 
                              key={lang} 
                              className={`px-2 py-1 rounded-md text-xs ${
                                lang === selectedLanguage 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b">
                  <h2 className="font-semibold text-green-700">Chapitres</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {transcript.map((segment, index) => (
                      <li 
                        key={segment.id}
                        className={`rounded-lg p-3 cursor-pointer transition-colors ${
                          currentTime >= segment.startTime && currentTime < segment.endTime
                            ? 'bg-green-50 border border-green-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentTime(segment.startTime)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{index + 1}. {segment.topic}</span>
                          <span className="text-xs text-gray-500">{formatTime(segment.startTime)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        )}
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
                <p>Pas de messages pour cette conférence</p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className="mb-4">
                  <div className="inline-block max-w-[85%] rounded-lg p-3 bg-gray-100 text-gray-800">
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
          
          <div className="p-4 border-t text-center text-gray-500">
            <p className="text-sm">
              Ce chat montre l'historique de la conférence. Elle est terminée, vous ne pouvez plus envoyer de messages.
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Sidebar pour transcript */}
      {showTranscript && (
        <motion.div 
          className="fixed inset-y-0 right-0 bg-white shadow-xl w-full sm:max-w-md z-30 flex flex-col"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="bg-blue-500 p-4 text-white flex justify-between items-center">
            <h3 className="font-bold text-lg">Transcription complète</h3>
            <button 
              className="text-white/80 hover:text-white"
              onClick={() => setShowTranscript(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {transcript.map((segment) => (
              <div 
                key={segment.id} 
                className={`mb-6 p-4 rounded-lg ${
                  currentTime >= segment.startTime && currentTime < segment.endTime
                    ? 'bg-blue-50 border border-blue-200'
                    : 'border border-gray-100'
                }`}
              >
                <h4 className="font-medium text-lg mb-2 flex justify-between">
                  <span>{segment.topic}</span>
                  <button 
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    onClick={() => setCurrentTime(segment.startTime)}
                  >
                    {formatTime(segment.startTime)}
                  </button>
                </h4>
                <p className="text-gray-700">{segment.text}</p>
                <p className="mt-2 text-sm text-gray-500">{segment.speaker}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Modal de paramètres */}
      {showSettings && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSettings(false)}
        >
          <motion.div 
            className="bg-white rounded-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Paramètres de lecture</h3>
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
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="high">Haute qualité</option>
                  <option value="medium">Qualité standard</option>
                  <option value="low">Économie de données</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualité vidéo
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="high">Haute qualité (1080p)</option>
                  <option value="medium">Qualité standard (720p)</option>
                  <option value="low">Économie de données (480p)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  defaultValue="0.8"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="autoplay" 
                  defaultChecked={true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoplay" className="ml-2 block text-sm text-gray-900">
                  Lecture automatique
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="show_subtitles" 
                  defaultChecked={true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show_subtitles" className="ml-2 block text-sm text-gray-900">
                  Afficher les sous-titres
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
                {conferenceInfo?.participantsCount || participantsList.length} participants ont assisté à cette conférence
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

export default ConferencePlayerScreen;