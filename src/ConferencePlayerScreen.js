// ConferencePlayerScreen.jsx (version corrigée)
import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronLeft, Download, Volume2, Play, Pause, Clock, FastForward, Rewind, Settings, 
  HeadphonesMic, List, X, MessageSquare, Users, Camera, FileText, Search, Calendar, Lock, 
  Edit, Trash2, AlertTriangle, VolumeX, Volume1 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const ConferencePlayerScreen = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();
  
  // États pour la liste des conférences
  const [conferences, setConferences] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConferences, setFilteredConferences] = useState([]);
  
  // États pour le lecteur de conférence
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
  const [volume, setVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(false);
  
  // États pour la sécurité
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [showPinRecovery, setShowPinRecovery] = useState(false);
  const [pinError, setPinError] = useState('');
  const [currentConferenceId, setCurrentConferenceId] = useState(null);
  
  // États pour la modification et suppression
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPin, setEditPin] = useState('');
  const [deletePin, setDeletePin] = useState('');
  const [actionError, setActionError] = useState('');
  
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const chatEndRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  
  // API_BASE_URL avec correction du problème de Mixed Content
  const API_BASE_URL = "http://localhost:8000/api";
  
  // Charger la liste des conférences enregistrées ou les détails d'une conférence spécifique
  useEffect(() => {
    if (conferenceId) {
      // Charger une conférence spécifique
      fetchConferenceInfo(conferenceId);
    } else {
      // Charger la liste des conférences
      fetchConferencesList();
    }
    
    // Cleanup
    return () => {
      // Nettoyer les intervalles et timeouts
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
      
      // Arrêter la lecture si elle est en cours
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
      }
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, [conferenceId]);
  
  // Filtrer les conférences en fonction de la recherche
  useEffect(() => {
    if (conferences.length > 0) {
      const filtered = conferences.filter(conf => {
        // Assurer que chaque conférence a un titre et une date valides
        const title = conf.title || conf.conferenceTitle || "Conférence sans titre";
        const date = conf.date || (conf.createdAt ? new Date(conf.createdAt).toLocaleDateString() : "Date inconnue");
        
        return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               date.toLowerCase().includes(searchQuery.toLowerCase());
      });
      
      setFilteredConferences(filtered);
    }
  }, [searchQuery, conferences]);
  
  // Initialiser le lecteur média quand les données de conférence sont disponibles
  useEffect(() => {
    if (conferenceInfo && audioRef.current) {
      initializeMediaPlayer();
    }
  }, [conferenceInfo, selectedLanguage]);
  
  // Pré-remplir les champs de modification quand les infos de conférence changent
  useEffect(() => {
    if (conferenceInfo) {
      setEditTitle(conferenceInfo.title);
      setEditDescription(conferenceInfo.description || '');
    }
  }, [conferenceInfo]);
  
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
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          
          // Analyser le niveau audio pour la visualisation
          setAudioLevel(Math.random() * 0.8 + 0.2); // Simule un niveau audio pour la visualisation
        }
      }, 100);
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);
  
  // Masquer les contrôles vidéo après un délai d'inactivité
  useEffect(() => {
    if (showControls && videoEnabled) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isPlaying) return; // Ne pas masquer si en pause
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying, videoEnabled]);
  
// Récupérer la liste des conférences enregistrées
const fetchConferencesList = async () => {
  setIsLoadingList(true);
  setError('');
  
  try {
    // Ajouter un timestamp pour éviter la mise en cache
    const timestamp = Date.now();
    const response = await axios.get(`${API_BASE_URL}/recordings?t=${timestamp}`);
    
    if (response.data && response.data.success) {
      // Filtrer pour n'afficher que les conférences qui ont effectivement un enregistrement
      const formattedRecordings = response.data.recordings
        .filter(recording => recording.path || recording.audio_path || recording.video_path) // S'assurer qu'il y a un chemin d'enregistrement
        .map(recording => ({
          id: recording.id,
          conferenceId: recording.conferenceId,
          title: recording.conferenceTitle || recording.title || "Conférence sans titre",
          date: new Date(recording.createdAt).toLocaleDateString(),
          duration: recording.duration || 0,
          hasPin: Boolean(recording.hasPin),
          // Utilisation de toutes les sources possibles pour le nombre de participants
          participantsCount: recording.participantsCount || 
                          recording.participants_count || 
                          recording.total_participants || 
                          (recording.participants ? recording.participants.length : 0) || 0,
          sourceLanguage: recording.sourceLanguage || "Français",
          targetLanguages: recording.targetLanguages || [],
          hasVideo: Boolean(recording.hasVideo),
          hasChat: Boolean(recording.hasChat)
        }));
      
      setConferences(formattedRecordings);
      setFilteredConferences(formattedRecordings);
    } else {
      setError("Aucune conférence trouvée");
    }
  } catch (error) {
    console.error("Erreur lors du chargement des conférences:", error);
    setError("Erreur de connexion au serveur. Veuillez réessayer plus tard.");
  } finally {
    setIsLoadingList(false);
  }
};
  
  // Récupérer les informations d'une conférence spécifique
  const fetchConferenceInfo = async (id) => {
    setIsLoading(true);
    setCurrentConferenceId(id);
    setError('');
    
    try {
      // Vérifier si l'authentification est requise
      const authResponse = await axios.get(`${API_BASE_URL}/recordings/${id}/auth-status`);
      
      if (authResponse.data && authResponse.data.requiresPin) {
        // Afficher la modal de PIN
        setShowPinModal(true);
        setIsLoading(false);
      } else {
        // Directement charger les données sans vérifier le PIN pour la visualisation
        await loadConferenceData(id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la conférence:", error);
      setError("Erreur lors de la vérification de l'authentification. Veuillez réessayer.");
      setIsLoading(false);
    }
  };
  
  // Initialiser le lecteur média
  const initializeMediaPlayer = () => {
    try {
      if (!conferenceInfo) return;
      
      console.log("🔵 Initialisation du lecteur média avec les infos:", conferenceInfo);
      
      // Générer des URLs avec timestamp pour éviter le cache
      const timestamp = Date.now();
      
      // Définir la source audio
      const audioSource = `${API_BASE_URL}/recordings/${currentConferenceId}/media?language=${selectedLanguage}&type=audio&t=${timestamp}`;
      console.log("🔵 Source audio:", audioSource);
      
      if (audioRef.current) {
        audioRef.current.src = audioSource;
        audioRef.current.load();
        
        // Configurer les événements audio en toute sécurité
        audioRef.current.onloadedmetadata = () => {
          if (!audioRef.current) return; // Vérification supplémentaire
          
          console.log("🔵 Métadonnées audio chargées, durée:", audioRef.current.duration);
          // Correction pour gérer le cas où la durée est Infinity
          if (audioRef.current.duration && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          } else {
            // Si la durée est invalide, utiliser celle de conferenceInfo ou une valeur par défaut
            setDuration(conferenceInfo.duration || 0);
            console.warn("⚠️ Durée invalide détectée, utilisation de la valeur de secours:", conferenceInfo.duration);
          }
        };
        
        audioRef.current.ontimeupdate = () => {
          if (!audioRef.current) return; // Vérification supplémentaire
          setCurrentTime(audioRef.current.currentTime);
        };
        
        audioRef.current.onended = () => {
          console.log("🔵 Lecture audio terminée");
          setIsPlaying(false);
        };
        
        // Régler la vitesse de lecture
        audioRef.current.playbackRate = playbackSpeed;
        
        // Régler le volume
        audioRef.current.volume = volume;
      }
      
      // Forcer la vérification si la vidéo est disponible d'après les données
      const hasVideoAvailable = Boolean(conferenceInfo.hasVideo);
      console.log("🟠 Vérification de la disponibilité vidéo:", hasVideoAvailable);
      
      // Si vidéo disponible et élément vidéo existe
      if (hasVideoAvailable && videoRef.current) {
        console.log("🔵 Configuration de la vidéo");
        setVideoEnabled(true);
        
        // Définir la source vidéo
        const videoSource = `${API_BASE_URL}/recordings/${currentConferenceId}/media?language=${selectedLanguage}&type=video&t=${timestamp}`;
        console.log("🔵 Source vidéo:", videoSource);
        
        videoRef.current.src = videoSource;
        videoRef.current.load();
        
        // S'assurer que la vidéo est visible avec des styles optimisés pour la qualité
        videoRef.current.controls = false; // Désactiver les contrôles natifs
        videoRef.current.style.display = 'block';
        videoRef.current.style.width = '100%';
        videoRef.current.style.height = '100%';
        videoRef.current.style.objectFit = 'contain'; // Maintenir le ratio d'aspect
        videoRef.current.style.backgroundColor = '#000'; // Fond noir pour éviter les artefacts visuels
        videoRef.current.playsInline = true; // Pour la lecture mobile
        
        // Optimisations pour la qualité vidéo
        videoRef.current.style.imageRendering = 'high-quality'; // Forcer le rendu de haute qualité
        
        // Synchroniser la vidéo avec l'audio avec une gestion d'erreur robuste
        videoRef.current.onloadedmetadata = () => {
          if (!videoRef.current) return; // Vérification supplémentaire
          
          console.log("🔵 Métadonnées vidéo chargées, durée:", videoRef.current.duration);
          
          if (audioRef.current) {
            // Fonction pour synchroniser avec vérification de null
            const syncVideoWithAudio = () => {
              if (!videoRef.current || !audioRef.current) return;
              
              if (Math.abs(videoRef.current.currentTime - audioRef.current.currentTime) > 0.3) {
                videoRef.current.currentTime = audioRef.current.currentTime;
              }
            };
            
            // Synchroniser lors de la lecture avec gestion d'erreur
            audioRef.current.onplay = () => {
              if (!videoRef.current || !audioRef.current) return;
              
              console.log("🔵 Lecture audio démarrée, synchronisation vidéo");
              try {
                videoRef.current.currentTime = audioRef.current.currentTime;
                videoRef.current.play().catch(err => {
                  console.error("❌ Erreur lors de la lecture de la vidéo:", err);
                  setTimeout(() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(e => 
                        console.error("❌ Nouvelle tentative échouée:", e)
                      );
                    }
                  }, 1000);
                });
              } catch (error) {
                console.error("❌ Erreur lors de la synchronisation au play:", error);
              }
            };
            
            // Synchroniser lors de la pause avec gestion d'erreur
            audioRef.current.onpause = () => {
              if (!videoRef.current) return;
              
              console.log("🔵 Audio en pause, pause vidéo");
              try {
                videoRef.current.pause();
              } catch (error) {
                console.error("❌ Erreur lors de la pause vidéo:", error);
              }
            };
            
            // Synchroniser pendant la recherche avec gestion d'erreur
            audioRef.current.onseeking = () => {
              if (!videoRef.current || !audioRef.current) return;
              
              console.log("🔵 Recherche audio, synchronisation vidéo:", audioRef.current.currentTime);
              try {
                syncVideoWithAudio();
              } catch (error) {
                console.error("❌ Erreur lors de la synchronisation seeking:", error);
              }
            };
            
            // Synchroniser périodiquement avec gestion d'erreur
            if (syncIntervalRef.current) {
              clearInterval(syncIntervalRef.current);
              syncIntervalRef.current = null;
            }
            
            syncIntervalRef.current = setInterval(() => {
              try {
                syncVideoWithAudio();
              } catch (error) {
                console.error("❌ Erreur lors de la synchronisation périodique:", error);
                // Arrêter l'intervalle en cas d'erreur répétée
                if (syncIntervalRef.current) {
                  clearInterval(syncIntervalRef.current);
                  syncIntervalRef.current = null;
                }
              }
            }, 2000);
          }
        };
        
        // Régler la vitesse de lecture vidéo
        videoRef.current.playbackRate = playbackSpeed;
        
        // CORRECTION: Assurez-vous que le volume vidéo est synchronisé avec le volume audio
        videoRef.current.volume = volume;
        
        // Gestionnaire d'erreur vidéo amélioré et sécurisé
        videoRef.current.onerror = (e) => {
          console.error("❌ Erreur vidéo:", e);
          
          // Vérifier que videoRef.current existe toujours avant d'accéder à ses propriétés
          if (videoRef.current && videoRef.current.error) {
            console.error("❌ Code d'erreur:", videoRef.current.error.code);
            console.error("❌ Message d'erreur:", videoRef.current.error.message);
          } else {
            console.error("❌ Erreur vidéo, mais l'objet videoRef.current ou videoRef.current.error n'est plus disponible");
          }
          
          setVideoEnabled(false); // Désactiver l'affichage vidéo en cas d'erreur
          
          // Vérifier que le conteneur existe avant de tenter d'y ajouter un overlay
          const container = videoContainerRef.current;
          if (container) {
            // Vérifier d'abord si un overlay d'erreur existe déjà
            const existingOverlay = container.querySelector('.video-error-overlay');
            if (existingOverlay) {
              existingOverlay.remove();
            }
            
            const errorOverlay = document.createElement('div');
            errorOverlay.className = 'video-error-overlay absolute inset-0 flex items-center justify-center bg-blue-900 bg-opacity-80';
            errorOverlay.innerHTML = `
              <div class="text-center text-white p-4">
                <div class="rounded-full bg-blue-800 w-20 h-20 mx-auto mb-2 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <p class="text-xl">Erreur de chargement vidéo</p>
                <p class="text-sm opacity-70">L'audio continue de fonctionner</p>
                <button class="mt-4 px-4 py-2 bg-blue-700 rounded hover:bg-blue-600 text-sm" id="retry-video">
                  Réessayer
                </button>
              </div>
            `;
            container.appendChild(errorOverlay);
            
            setTimeout(() => {
              const retryBtn = document.getElementById('retry-video');
              if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                  const overlay = document.querySelector('.video-error-overlay');
                  if (overlay) {
                    overlay.remove();
                  }
                  try {
                    initializeMediaPlayer();
                  } catch (error) {
                    console.error("❌ Erreur lors de la réinitialisation du lecteur:", error);
                  }
                });
              }
            }, 100);
          }
        };
      } else {
        setVideoEnabled(false);
        console.log("🔵 La vidéo n'est pas disponible pour cette conférence");
      }
      
      console.log("🟢 Lecteur média initialisé avec succès");
    } catch (error) {
      console.error("❌ Erreur critique lors de l'initialisation du lecteur:", error);
      setVideoEnabled(false);
      setError("Une erreur est survenue lors de l'initialisation du lecteur média. Veuillez réessayer.");
    }
  };
  
  // Gérer l'interaction avec le conteneur vidéo
  const handleVideoContainerInteraction = () => {
    setShowControls(true);
    
    // Réinitialiser le délai d'expiration
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };
  
  // Charger les données de la conférence une fois authentifié
  const loadConferenceData = async (id, pinCode = null) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Préparer les paramètres avec ou sans PIN
      let params = {};
      if (pinCode) {
        params = { pin: pinCode };
      }
      
      // Récupérer les données de la conférence
      const conferenceResponse = await axios.get(`${API_BASE_URL}/recordings/${id}`, { params });
      
      if (conferenceResponse.data && conferenceResponse.data.success) {
        const conference = conferenceResponse.data.recording;
        
        // Vérification explicite de hasVideo
        const hasVideoField = conference.hasVideo === true || 
                              Boolean(conference.has_video) === true ||
                              Boolean(conference.video_path);
                              
        console.log("🔍 Champ vidéo détecté:", hasVideoField, 
                    "hasVideo:", conference.hasVideo,
                    "has_video:", conference.has_video,
                    "video_path:", Boolean(conference.video_path));
        
        // Vérifier la validité de la date
        let formattedDate = "Date inconnue";
        try {
          if (conference.created_at && conference.created_at !== 'None') {
            formattedDate = new Date(conference.created_at).toLocaleDateString();
          } else if (conference.conference_created_at && conference.conference_created_at !== 'None') {
            formattedDate = new Date(conference.conference_created_at).toLocaleDateString();
          }
        } catch (e) {
          console.error("❌ Erreur lors du formatage de la date:", e);
        }
        
        // Vérifier si le titre est valide
        const title = conference.title || conference.conferenceTitle || "Sans titre";
        console.log("🔍 Titre détecté:", title);
        
        // Récupérer la description - CORRECTION: Utiliser le résumé ou la description
        const description = conference.summary || conference.description || "Pas de description disponible";
        console.log("🔍 Description détectée:", description);
        
        // S'assurer que tous les champs nécessaires sont disponibles et correctement formatés
        const updatedConferenceInfo = {
          id: conference.id,
          title: title,
          description: description, // CORRECTION: Utiliser la description récupérée
          sourceLanguage: conference.sourceLanguage || conference.source_language,
          date: formattedDate,
          duration: conference.duration || 0,
          availableLanguages: conference.availableLanguages || 
                            (conference.targetLanguages ? 
                              [conference.sourceLanguage, ...conference.targetLanguages] : 
                              [conference.sourceLanguage || "Français"]),
          speakerName: conference.speakerName || "Présentateur",
          speakerTitle: conference.speakerTitle || "",
          hasVideo: hasVideoField,
          hasChat: Boolean(conference.hasChat || conference.has_chat),
          participantsCount: conference.participantsCount || 
                          conference.participants_count || 
                          conference.total_participants || 
                          (conference.participants ? conference.participants.length : 0),
          participants: conference.participants || [],
          messages: conference.messages || [],
          summary: conference.summary || ""
        };
        
        // Mettre à jour les informations de conférence
        setConferenceInfo(updatedConferenceInfo);
        
        // Mettre à jour aussi le titre de document (onglet navigateur) pour refléter le changement
        document.title = `${updatedConferenceInfo.title} - VoiceTranslate`;
        
        // Mettre à jour les états dépendants
        setLanguages(conference.availableLanguages || 
                    (conference.targetLanguages ? 
                      [conference.sourceLanguage, ...conference.targetLanguages] : 
                      [conference.sourceLanguage || "Français"]));
        setSelectedLanguage(conference.sourceLanguage || "Français");
        setDuration(conference.duration || 0);
        
        // Mise à jour explicite de l'état de la vidéo
        setVideoEnabled(hasVideoField);
        console.log("🟠 Vidéo activée:", hasVideoField);
        
        // Utiliser le nombre de participants historique total si disponible
        const participantsList = conference.participants || [];
        setParticipantsList(participantsList);
        console.log("👥 Nombre de participants:", participantsList.length);
        
        setMessages(conference.messages || []);
        setConferenceSummary(conference.summary || "");
        
        // Fermer la modal de PIN
        setShowPinModal(false);
        
        // Utiliser la transcription fournie par l'API ou définir une liste vide
        setTranscript(conference.transcript || []);
      } else {
        throw new Error("Conférence non trouvée ou accès refusé");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la conférence:", error);
      
      if (error.response && error.response.status === 403) {
        setPinError("Code PIN incorrect. Veuillez réessayer.");
      } else {
        setError("Impossible de charger les données de la conférence. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Vérifier le code PIN
  const verifyPin = async () => {
    setPinError("");
    
    // Vérifier que le PIN a le bon format
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError("Le code PIN doit contenir entre 4 et 6 chiffres");
      return;
    }
    
    // Charger les données de la conférence avec le PIN
    await loadConferenceData(currentConferenceId, pin);
  };
  
  // Demander la récupération du code PIN
  const requestPinRecovery = async () => {
    if (!email) {
      setPinError("Veuillez entrer une adresse email valide");
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/recordings/${currentConferenceId}/recover-pin`, { email });
      
      alert("Si cette adresse email est associée à l'enregistrement, vous recevrez le code PIN. Veuillez vérifier votre boîte de réception.");
      setShowPinRecovery(false);
    } catch (error) {
      console.error("Erreur lors de la demande de récupération:", error);
      setPinError("Erreur lors de la demande de récupération. Veuillez réessayer.");
    }
  };
  
  // Fonction pour modifier une conférence
  const updateConference = async () => {
    setActionError("");
    
    if (!editPin) {
      setActionError("Veuillez entrer le code PIN pour confirmer la modification");
      return;
    }
  
    try {
      // Vérifier si le titre existe déjà (uniquement si le titre a changé)
      if (editTitle !== conferenceInfo?.title) {
        const checkResponse = await axios.get(`${API_BASE_URL}/conferences/check-title?title=${encodeURIComponent(editTitle)}`);
        
        if (checkResponse.data && checkResponse.data.exists) {
          setActionError("Ce titre de conférence existe déjà. Veuillez en choisir un autre.");
          return;
        }
      }
      
      // Préparer les données à envoyer
      const updateData = {
        title: editTitle,
        description: editDescription,
        pin: editPin
      };
      
      console.log("🔵 Envoi de la demande de modification:", { 
        id: currentConferenceId, 
        title: updateData.title 
      });
      
      const response = await axios.put(
        `${API_BASE_URL}/recordings/${currentConferenceId}`, 
        updateData
      );
  
      if (response.data && response.data.success) {
        console.log("🟢 Conférence modifiée avec succès");
        
        // Rafraîchir les données
        await loadConferenceData(currentConferenceId, editPin);
        
        // Fermer la modale et nettoyer
        setShowEditModal(false);
        setActionError('');
        setEditPin('');
        
        // Actualiser la liste des conférences dans l'état
        if (!conferenceId) {
          fetchConferencesList();
        } else {
          // Si nous sommes sur la page de détail, actualiser le titre dans l'onglet du navigateur
          document.title = `${editTitle} - VoiceTranslate`;
        }
        
        alert("La conférence a été modifiée avec succès.");
      } else {
        console.error("❌ Échec de la modification:", response.data);
        setActionError(response.data.error || "Une erreur est survenue lors de la modification");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la modification:", error);
      
      if (error.response) {
        if (error.response.status === 403) {
          setActionError("Code PIN incorrect. Veuillez vérifier et réessayer.");
        } else {
          setActionError(`Erreur (${error.response.status}): ${error.response.data.error || "Erreur inconnue"}`);
        }
      } else {
        setActionError("Erreur de connexion au serveur. Veuillez réessayer.");
      }
    }
  };

  // Fonction pour supprimer une conférence
  const deleteConference = async () => {
    setActionError("");
    
    if (!deletePin) {
      setActionError("Veuillez entrer le code PIN pour confirmer la suppression");
      return;
    }
  
    try {
      console.log("🔵 Envoi de la demande de suppression:", { id: currentConferenceId });
      
      const response = await axios.delete(
        `${API_BASE_URL}/recordings/${currentConferenceId}`, 
        { params: { pin: deletePin } }
      );
  
      if (response.data && response.data.success) {
        console.log("🟢 Conférence supprimée avec succès");
        
        // IMPORTANT: Nettoyer les intervalles et arrêter la lecture AVANT de naviguer
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
        
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = null;
        }
        
        // Arrêter la lecture et nettoyer les références
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load();
        }
        
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = '';
          videoRef.current.load();
        }
        
        alert("La conférence a été supprimée avec succès.");
        
        // Maintenant que tout est nettoyé, naviguer vers la liste des conférences
        navigate('/conference/player');
      } else {
        console.error("❌ Échec de la suppression:", response.data);
        setActionError(response.data.error || "Une erreur est survenue lors de la suppression");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      
      if (error.response) {
        if (error.response.status === 403) {
          setActionError("Code PIN incorrect. Veuillez vérifier et réessayer.");
        } else {
          setActionError(`Erreur (${error.response.status}): ${error.response.data.error || "Erreur inconnue"}`);
        }
      } else {
        setActionError("Erreur de connexion au serveur. Veuillez réessayer.");
      }
    }
  };
  
  // Fonction pour démarrer/pauser la lecture
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        // La vidéo sera mise en pause via l'événement onpause de l'audio
      } else {
        audioRef.current.play().catch(error => {
          console.error("❌ Erreur de lecture audio:", error);
          setError("Impossible de lire ce média");
        });
        // La vidéo sera démarrée via l'événement onplay de l'audio
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Fonction pour avancer/reculer de 10 secondes
  const seekAudio = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
      setCurrentTime(audioRef.current.currentTime);
      
      // Synchroniser la vidéo immédiatement
      if (videoRef.current && videoEnabled) {
        videoRef.current.currentTime = audioRef.current.currentTime;
      }
    }
  };
  
  // Fonction pour mettre à jour le curseur de lecture - CORRIGÉE
  const handleSeek = (e) => {
    const percent = e.target.value / 100;
    const newTime = percent * duration;
    
    if (audioRef.current) {
      console.log("🔵 Recherche manuelle à:", newTime);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime); // Mise à jour immédiate pour l'UI
      
      // Synchroniser la vidéo immédiatement sans attendre l'événement
      if (videoRef.current && videoEnabled) {
        console.log("🔵 Synchronisation vidéo à:", newTime);
        videoRef.current.currentTime = newTime;
      }
    }
  };
  
  // Fonction pour ajuster le volume - CORRIGÉE
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      console.log("🔊 Volume audio modifié à:", newVolume);
    }
    
    // CORRECTION: Synchroniser le volume vidéo avec le volume audio
    if (videoRef.current && videoEnabled) {
      videoRef.current.volume = newVolume;
      console.log("🔊 Volume vidéo synchronisé à:", newVolume);
    }
  };
  
  // Fonction pour changer la vitesse de lecture
  // Fonction pour changer la vitesse de lecture
  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    
    // Appliquer la même vitesse à la vidéo si elle est active
    if (videoRef.current && videoEnabled) {
      videoRef.current.playbackRate = speed;
    }
    
    setShowSettings(false);
  };
  
  // Fonction pour télécharger l'audio
  const downloadAudio = () => {
    try {
      const downloadUrl = `${API_BASE_URL}/recordings/${currentConferenceId}/download?language=${selectedLanguage}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `conference-${currentConferenceId}-${selectedLanguage}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
     alert("Impossible de télécharger l'enregistrement. Veuillez réessayer plus tard.");
   }
 };
 
 // Formater le temps en HH:MM:SS
 const formatTime = (seconds) => {
   if (isNaN(seconds) || seconds === null) seconds = 0;
   
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
 
 // Formater la durée en texte
 const formatDuration = (durationInSeconds) => {
   if (isNaN(durationInSeconds) || durationInSeconds === null || durationInSeconds <= 0) {
     return "Durée inconnue";
   }
   
   const hours = Math.floor(durationInSeconds / 3600);
   const minutes = Math.floor((durationInSeconds % 3600) / 60);
   
   if (hours > 0) {
     return `${hours}h ${minutes}min`;
   } else {
     return `${minutes} minutes`;
   }
 };
 
 // Trouver le segment de transcript actuel
 const getCurrentSegment = () => {
   if (!transcript || transcript.length === 0) return null;
   
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

 // Si on est sur la page de liste des conférences
 if (!conferenceId) {
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
               <h1 className="text-xl font-bold ml-2 text-white">Conférences enregistrées</h1>
             </div>
           </motion.div>
         </div>
       </header>
       
       <main className="flex-grow max-w-6xl mx-auto px-4 py-8">
         {/* Barre de recherche */}
         <div className="mb-6">
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search size={20} className="text-gray-400" />
             </div>
             <input
               type="text"
               className="bg-white w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               placeholder="Rechercher une conférence..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
         </div>
         
         {isLoadingList ? (
           <div className="flex flex-col items-center justify-center h-64">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-gray-600">Chargement des conférences...</p>
           </div>
         ) : error ? (
           <div className="bg-red-50 rounded-lg shadow-md p-6 text-center">
             <AlertTriangle size={48} className="mx-auto text-red-400 mb-3" />
             <h3 className="text-xl font-medium text-gray-700 mb-2">Erreur lors du chargement</h3>
             <p className="text-red-500">{error}</p>
           </div>
         ) : filteredConferences.length === 0 ? (
           <div className="bg-white rounded-lg shadow-md p-6 text-center">
             <FileText size={48} className="mx-auto text-gray-300 mb-3" />
             <h3 className="text-xl font-medium text-gray-700 mb-2">Aucune conférence trouvée</h3>
             <p className="text-gray-500">
               {searchQuery ? "Aucune conférence ne correspond à votre recherche." : "Aucune conférence enregistrée n'est disponible pour le moment."}
             </p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredConferences.map(conference => (
               <motion.div
                 key={conference.id}
                 className="bg-white rounded-lg shadow-md overflow-hidden"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                 transition={{ duration: 0.2 }}
               >
                 <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
                   <div className="flex justify-between items-center">
                     <h3 className="font-semibold text-blue-700 truncate" title={conference.title}>
                       {conference.title}
                     </h3>
                     {conference.hasPin && (
                       <Lock size={16} className="text-blue-500 flex-shrink-0" />
                     )}
                   </div>
                 </div>
                 <div className="p-4">
                   <div className="mb-3 flex items-center text-sm text-gray-500">
                     <Calendar size={14} className="mr-1" />
                     <span>{conference.date || "Date inconnue"}</span>
                   </div>
                   <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                     <span className="flex items-center">
                       <Clock size={14} className="mr-1" />
                       {formatDuration(conference.duration || 0)}
                     </span>
                     <span className="flex items-center">
                      <Users size={14} className="mr-1" />
                      {conference.participantsCount || 0} participants
                    </span>
                  </div>
                  <button
                    className="w-full mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => navigate(`/conference/player/${conference.id}`)}
                  >
                    <Play size={16} className="mr-2" />
                    Regarder
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      
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
}

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
          <Link to="/conference/player">
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
          <Link to="/conference/player" className="text-blue-500 hover:underline mt-2 inline-block">
            Retour à la liste
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section principale - Player */}
          <div className="lg:col-span-2">
             {videoEnabled && (
               <motion.div 
                 ref={videoContainerRef}
                 className="bg-black rounded-lg overflow-hidden mb-6 shadow-md aspect-video flex items-center justify-center relative"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
                 onMouseMove={handleVideoContainerInteraction}
                 onClick={() => {
                   handleVideoContainerInteraction();
                   if (!showControls) return;
                   togglePlayback();
                 }}
               >
                 {/* Overlay tant que la vidéo charge */}
                 <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-0">
                   <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 
                 <video 
                   ref={videoRef}
                   className="w-full h-full object-contain z-10" 
                   controls={false}
                   autoPlay={false}
                   muted={false}
                   playsInline
                   crossOrigin="anonymous"
                 />
                 
                 {/* Contrôles sur la vidéo */}
                 {showControls && (
                   <div className="absolute inset-0 z-20 flex flex-col justify-between bg-gradient-to-t from-black/70 to-transparent">
                     {/* Contrôles supérieurs */}
                     <div className="p-4 flex justify-between items-center">
                       <div className="text-white font-medium drop-shadow-lg">
                         {conferenceInfo?.title}
                       </div>
                       <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm flex items-center">
                         <Clock size={14} className="mr-1" />
                         {formatTime(currentTime)} / {formatTime(duration)}
                       </div>
                     </div>
                     
                     {/* Bouton central de lecture/pause */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <motion.button 
                         className={`w-20 h-20 ${isPlaying ? 'bg-blue-500/80' : 'bg-green-500/80'} rounded-full flex items-center justify-center text-white shadow-xl backdrop-blur-sm pointer-events-auto`}
                         onClick={(e) => {
                           e.stopPropagation();
                           togglePlayback();
                         }}
                         whileHover={{ scale: 1.1 }}
                         whileTap={{ scale: 0.9 }}
                       >
                         {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
                       </motion.button>
                     </div>
                     
                     {/* Contrôles inférieurs */}
                     <div className="p-4 space-y-2">
                       {/* Barre de progression - CORRIGÉE avec onInput */}
                       <div className="flex items-center space-x-2">
                         <button 
                           className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
                           onClick={(e) => {
                             e.stopPropagation();
                             seekAudio(-10);
                           }}
                         >
                           <Rewind size={16} />
                         </button>
                         
                         <input 
                           type="range" 
                           min="0" 
                           max="100" 
                           value={(currentTime / duration) * 100 || 0} 
                           onChange={handleSeek}
                           onInput={handleSeek}
                           onClick={(e) => e.stopPropagation()}
                           className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-white/30"
                         />
                         
                         <button 
                           className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
                           onClick={(e) => {
                             e.stopPropagation();
                             seekAudio(10);
                           }}
                         >
                           <FastForward size={16} />
                         </button>
                       </div>
                       
                       {/* Contrôles supplémentaires */}
                       <div className="flex justify-between items-center">
                         {/* Volume - CORRIGÉ pour synchroniser audio et vidéo */}
                         <div className="flex items-center space-x-2 text-white">
                           <button 
                             className="hover:bg-white/20 rounded-full p-1"
                             onClick={(e) => {
                               e.stopPropagation();
                               const newVol = volume === 0 ? 0.5 : 0;
                               setVolume(newVol);
                               if (audioRef.current) {
                                 audioRef.current.volume = newVol;
                               }
                               if (videoRef.current && videoEnabled) {
                                 videoRef.current.volume = newVol;
                               }
                             }}
                           >
                             {volume === 0 ? <VolumeX size={16} /> : volume < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}
                           </button>
                           
                           <input 
                             type="range" 
                             min="0" 
                             max="1" 
                             step="0.01" 
                             value={volume} 
                             onChange={handleVolumeChange}
                             onClick={(e) => e.stopPropagation()}
                             className="w-20 h-1 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-white/30"
                           />
                         </div>
                         
                         {/* Vitesse de lecture */}
                         <div className="flex items-center space-x-2 text-white">
                           <div className="text-sm">Vitesse:</div>
                           <div className="flex space-x-1">
                             <button 
                               className={`px-2 py-1 rounded-md text-xs ${playbackSpeed === 1 ? 'bg-blue-500' : 'bg-white/20'}`}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 changePlaybackSpeed(1);
                               }}
                             >
                               1x
                             </button>
                             <button 
                               className={`px-2 py-1 rounded-md text-xs ${playbackSpeed === 1.5 ? 'bg-blue-500' : 'bg-white/20'}`}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 changePlaybackSpeed(1.5);
                               }}
                             >
                               1.5x
                             </button>
                             <button 
                               className={`px-2 py-1 rounded-md text-xs ${playbackSpeed === 2 ? 'bg-blue-500' : 'bg-white/20'}`}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 changePlaybackSpeed(2);
                               }}
                             >
                               2x
                             </button>
                           </div>
                         </div>
                         
                         {/* Autres options */}
                         <div className="flex items-center space-x-1">
                           <button 
                             className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
                             onClick={(e) => {
                               e.stopPropagation();
                               setShowSettings(true);
                             }}
                           >
                             <Settings size={16} />
                           </button>
                           
                           <button 
                             className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
                             onClick={(e) => {
                               e.stopPropagation();
                               downloadAudio();
                             }}
                           >
                             <Download size={16} />
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
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
                  
                  <div className="bg-blue-50 p-6 rounded-lg mb-4">
                    {getCurrentSegment() ? (
                      <div className="w-full">
                        <h3 className="font-medium text-blue-800 mb-2 text-lg">
                          {getCurrentSegment().topic || "Segment actuel"}
                        </h3>
                        <p className="text-gray-700">
                          {getCurrentSegment().text || ""}
                        </p>
                        {(getCurrentSegment().speaker || getCurrentSegment().startTime) && (
                          <div className="mt-2 flex justify-between text-sm text-gray-500">
                            {getCurrentSegment().speaker && (
                              <span>{getCurrentSegment().speaker}</span>
                            )}
                            {getCurrentSegment().startTime && (
                              <span>
                                {formatTime(getCurrentSegment().startTime)} - {formatTime(getCurrentSegment().endTime)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : transcript && transcript.length > 0 ? (
                      <div className="w-full">
                        <p className="text-center text-gray-600">
                          Utilisez les contrôles pour naviguer entre les segments.
                        </p>
                      </div>
                    ) : (
                      <div className="w-full text-center text-gray-500">
                        <p>Aucune transcription disponible pour cette conférence</p>
                      </div>
                    )}
                  </div>
                  
                  {!videoEnabled && (
                    <>
                      <div className="mb-4">
                        {/* Barre de progression audio - CORRIGÉE avec onInput */}
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={(currentTime / duration) * 100 || 0} 
                          onChange={handleSeek}
                          onInput={handleSeek}
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
                    </>
                  )}
                </div>
                <div className="flex justify-between mt-8">
                  {!videoEnabled && (
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
                  )}
                  
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
                    
                    {!videoEnabled && (
                      <motion.button 
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md flex items-center"
                        onClick={downloadAudio}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Download size={14} className="mr-1" />
                        Télécharger
                      </motion.button>
                    )}
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
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b flex justify-between items-center">
                <h2 className="font-semibold text-purple-700">Informations</h2>
                <div className="flex space-x-2">
                  <button 
                    className="p-1 text-purple-700 hover:text-purple-900"
                    onClick={() => {
                      setEditTitle(conferenceInfo?.title || '');
                      setEditDescription(conferenceInfo?.description || '');
                      setShowEditModal(true);
                    }}
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-1 text-red-700 hover:text-red-900"
                    onClick={() => setShowDeleteModal(true)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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
                      {conferenceInfo?.participantsCount || 0}
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
                {transcript.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <p>Aucun chapitre disponible</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {transcript.map((segment, index) => (
                      <li 
                        key={segment.id || index}
                        className={`rounded-lg p-3 cursor-pointer transition-colors ${
                          currentTime >= segment.startTime && currentTime < segment.endTime
                            ? 'bg-green-50 border border-green-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setCurrentTime(segment.startTime);
                          if (audioRef.current) {
                            audioRef.current.currentTime = segment.startTime;
                            
                            // Synchroniser la vidéo si nécessaire
                            if (videoRef.current && videoEnabled) {
                              videoRef.current.currentTime = segment.startTime;
                            }
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{index + 1}. {segment.topic || "Segment " + (index + 1)}</span>
                          <span className="text-xs text-gray-500">{formatTime(segment.startTime)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
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
             <div key={message.id} className={`mb-4 ${message.senderId === 'presenter' || message.sender_id === 'presenter' ? 'text-right' : ''}`}>
               <div className={`inline-block max-w-[85%] rounded-lg p-3 ${
                 message.senderId === 'presenter' || message.sender_id === 'presenter'
                   ? 'bg-blue-100 text-blue-800'
                   : 'bg-gray-100 text-gray-800'
               }`}>
                 <div className="text-xs text-gray-500 mb-1 flex justify-between">
                   <span className="font-medium">{message.senderName || message.sender_name}</span>
                   <span className="ml-2">{message.originalLanguage || message.original_language}</span>
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
          {transcript.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <FileText size={48} className="mx-auto mb-3 opacity-20" />
              <p>Transcription non disponible pour cette conférence</p>
            </div>
          ) : (
            transcript.map((segment) => (
              <div 
                key={segment.id}
                className={`mb-6 p-4 rounded-lg ${
                  currentTime >= segment.startTime && currentTime < segment.endTime
                    ? 'bg-blue-50 border border-blue-200'
                    : 'border border-gray-100'
                }`}
              >
                <h4 className="font-medium text-lg mb-2 flex justify-between">
                  <span>{segment.topic || "Segment sans titre"}</span>
                  <button 
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    onClick={() => {
                      setCurrentTime(segment.startTime);
                      if (audioRef.current) {
                        audioRef.current.currentTime = segment.startTime;
                        
                        // Synchroniser la vidéo si nécessaire
                        if (videoRef.current && videoEnabled) {
                          videoRef.current.currentTime = segment.startTime;
                        }
                      }
                    }}
                  >
                    {formatTime(segment.startTime)}
                  </button>
                </h4>
                <p className="text-gray-700">{segment.text || "Pas de transcription disponible"}</p>
                <p className="mt-2 text-sm text-gray-500">{segment.speaker || "Intervenant non identifié"}</p>
              </div>
            ))
          )}
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
                value={volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  if (audioRef.current) {
                    audioRef.current.volume = newVolume;
                  }
                  // CORRECTION: Synchroniser aussi le volume vidéo
                  if (videoRef.current && videoEnabled) {
                    videoRef.current.volume = newVolume;
                  }
                }}
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
                        Rejoint à {new Date(participant.joinTime || participant.join_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          
          {conferenceSummary ? (
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">{conferenceSummary}</pre>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center">
              <p className="text-gray-500">Aucun résumé disponible pour cette conférence.</p>
            </div>
          )}
          
          <div className="flex justify-end gap-4">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => setShowSummaryModal(false)}
            >
              Fermer
            </button>
            {conferenceSummary && (
              <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([conferenceSummary], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = `résumé-${conferenceInfo?.id || 'conference'}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
            >
              Télécharger
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
  {/* Modal pour le code PIN */}
  {showPinModal && (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-xl p-8 max-w-md w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {showPinRecovery ? (
          <>
            <div className="flex items-center mb-6 text-blue-500">
              <Lock size={24} className="mr-2" />
              <h3 className="text-xl font-bold">Récupération du code PIN</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Veuillez entrer l'adresse email associée à cette conférence pour récupérer le code PIN.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de récupération
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {pinError && (
                <p className="mt-1 text-xs text-red-500">{pinError}</p>
              )}
            </div>
            
            <div className="flex justify-between">
              <button 
                className="text-blue-500 hover:text-blue-700 text-sm"
                onClick={() => {
                  setShowPinRecovery(false);
                  setEmail('');
                  setPinError('');
                }}
              >
                Retour
              </button>
              
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={requestPinRecovery}
              >
                Récupérer le PIN
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-6 text-blue-500">
              <Lock size={24} className="mr-2" />
              <h3 className="text-xl font-bold">Accès protégé</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Cette conférence enregistrée est protégée par un code PIN. Veuillez saisir le code PIN pour y accéder.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code PIN
              </label>
              <input 
                type="password" 
                maxLength="6"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Entrez le code PIN"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && verifyPin()}
              />
              {pinError && (
                <p className="mt-1 text-xs text-red-500">{pinError}</p>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <button 
                className="text-blue-500 hover:text-blue-700 text-sm"
                onClick={() => {
                  setShowPinRecovery(true);
                  setPinError('');
                }}
              >
                J'ai oublié mon code PIN
              </button>
              
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={verifyPin}
              >
                Valider
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )}
  
  {/* Modal de modification */}
  {showEditModal && (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowEditModal(false)}
    >
      <motion.div 
        className="bg-white rounded-xl p-6 max-w-lg w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Modifier la conférence</h3>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setShowEditModal(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        {actionError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {actionError}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de la conférence
            </label>
            <input 
              type="text" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea 
              value={editDescription} 
              onChange={(e) => setEditDescription(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code PIN (pour confirmer)
            </label>
            <input 
              type="password" 
              value={editPin} 
              onChange={(e) => setEditPin(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Entrez le code PIN pour confirmer"
            />
          </div>
          
          <div className="pt-4 border-t flex justify-end gap-4">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setShowEditModal(false);
                setActionError('');
              }}
            >
              Annuler
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={updateConference}
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}

  {/* Modal de suppression */}
  {showDeleteModal && (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowDeleteModal(false)}
    >
      <motion.div 
        className="bg-white rounded-xl p-6 max-w-md w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start mb-4 text-red-500">
          <AlertTriangle size={24} className="mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold">Supprimer la conférence</h3>
            <p className="text-gray-600 mt-1">
              Cette action est irréversible. Toutes les données associées à cette conférence seront supprimées.
            </p>
          </div>
        </div>
        
        {actionError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {actionError}
          </div>
        )}
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code PIN (pour confirmer)
          </label>
          <input 
            type="password" 
            value={deletePin} 
            onChange={(e) => setDeletePin(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez le code PIN pour confirmer"
          />
        </div>
        
        <div className="pt-4 mt-4 border-t flex justify-end gap-4">
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => {
              setShowDeleteModal(false);
              setActionError('');
            }}
          >
            Annuler
          </button>
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={deleteConference}
          >
            Supprimer définitivement
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
  
  {/* Audio element (caché) */}
  <audio 
    ref={audioRef} 
    className="hidden" 
    onPlay={() => setIsPlaying(true)} 
    onPause={() => setIsPlaying(false)} 
    onEnded={() => setIsPlaying(false)}
    onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
    onLoadedMetadata={() => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
        audioRef.current.playbackRate = playbackSpeed;
        // CORRECTION: S'assurer que le volume est bien initialisé
        audioRef.current.volume = volume;
      }
    }}
  />
  
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