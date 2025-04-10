import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, Settings, Pause, Play, Sliders, ChevronLeft, AlertTriangle, Eye, EyeOff, X, Globe } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const TranslationMainScreen = () => {
  const location = useLocation();
  
  // Fonction pour convertir les noms de langues en codes
  const getLanguageCode = (languageName) => {
    const languageMap = {
      'Français': 'fr',
      'Anglais': 'en',
      'Espagnol': 'es',
      'Allemand': 'de',
      'Arabe': 'ar',
      'Chinois': 'zh',
      'Russe': 'ru',
      'Portugais': 'pt',
      'Italien': 'it',
      'Japonais': 'ja'
    };
    return languageMap[languageName] || 'en'; // Par défaut 'en' si non trouvé
  };

  const [isListening, setIsListening] = useState(true);
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [partialSourceText, setPartialSourceText] = useState(''); // Pour le texte en cours de reconnaissance
  const [partialTranslatedText, setPartialTranslatedText] = useState(''); // Pour la traduction en temps réel
  const [audioLevel, setAudioLevel] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [latency, setLatency] = useState(0.8);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Initialisation...');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false); // Nouvel état pour indiquer une transcription en cours
  const [audioConfig, setAudioConfig] = useState({
    noise_reduction_level: 0.7,
    gain: 1.5, // S'assurer que gain est initialisé
    beamforming_enabled: true,
    speech_detection_threshold: 0.3,
    normalize_speech_rate: true,
    target_speech_rate: 140,
    clear_previous_segments: true,
    continuous_mode: true // Nouvelle option pour la transcription continue
  });
  const [speechRate, setSpeechRate] = useState({ 
    original_rate: 0, 
    normalized_rate: null, 
    quality: 'normal',
    adjustment_applied: false
  });
  const [audioQuality, setAudioQuality] = useState('normal');
  
  const wsRef = useRef(null);
  const clientId = useRef(`client-${Math.random().toString(36).substring(2, 9)}`);
  const recognitionRef = useRef(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const lastSpeechTimestamp = useRef(null);
  const shouldClearOnNextSpeech = useRef(false);
  const silenceTimer = useRef(null);
  const currentSegmentId = useRef(null); // Pour suivre le segment actuel
  const navigate = useNavigate();
  
  // Variable pour suivre si on a besoin de réinitialiser la connexion WebSocket
  const needReconnect = useRef(false);
  
  // Fonction pour lire le texte à voix haute
  const speakTranslatedText = useCallback((text) => {
    // Vérifier si la synthèse vocale est disponible et activée
    if ('speechSynthesis' in window && text && isSpeechEnabled) {
      // Mapper le nom de la langue vers le code ISO
      const languageMap = {
        'Anglais': 'en-US',
        'Français': 'fr-FR',
        'Espagnol': 'es-ES',
        'Allemand': 'de-DE',
        'Arabe': 'ar-SA',
        'Chinois': 'zh-CN',
        'Russe': 'ru-RU',
        'Portugais': 'pt-BR',
        'Italien': 'it-IT',
        'Japonais': 'ja-JP'
      };
      
      // Arrêter toute synthèse vocale en cours
      window.speechSynthesis.cancel();
      
      // Créer un nouvel objet d'énoncé
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Définir la langue
      utterance.lang = languageMap[targetLanguage] || 'en-US';
      
      // Définir le volume
      utterance.volume = 1;
      
      // Lire le texte
      window.speechSynthesis.speak(utterance);
      
      console.log(`Lecture vocale démarrée: ${text.substring(0, 50)}...`);
    } else if (!isSpeechEnabled) {
      console.log("Synthèse vocale désactivée par l'utilisateur");
    } else {
      console.error("La synthèse vocale n'est pas prise en charge par ce navigateur ou le texte est vide");
    }
  }, [targetLanguage, isSpeechEnabled]);

  // Fonction pour envoyer du texte pour traduction
  const sendTextForTranslation = useCallback((text, isPartial = false) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !text.trim()) {
      return;
    }
    
    const sourceCode = getLanguageCode(sourceLanguage);
    const targetCode = getLanguageCode(targetLanguage);
    
    console.log('Langues sélectionnées:', sourceLanguage, '->', targetLanguage);
    console.log('Codes de langue mappés:', sourceCode, '->', targetCode);
    
    const message = {
      type: 'translation',
      text: text,
      source: sourceCode,
      target: targetCode,
      is_partial: isPartial,
      segment_id: currentSegmentId.current
    };
    
    console.log(`Envoi de la demande de traduction${isPartial ? ' partielle' : ''}:`, message);
    wsRef.current.send(JSON.stringify(message));
  }, [sourceLanguage, targetLanguage]);

  // Fonction pour mettre à jour la configuration audio
  const updateAudioConfig = useCallback((updates) => {
    const newConfig = { ...audioConfig, ...updates };
    setAudioConfig(newConfig);
    
    // Envoyer les mises à jour au serveur
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'config',
        config: updates
      }));
    }
  }, [audioConfig]);

  // Génère les barres de visualisation audio
  const generateWaveform = () => {
    return Array(20).fill(0).map((_, i) => {
      const height = isListening ? 
        Math.min(20, Math.max(4, Math.floor(Math.sin(i/3 + Date.now()/200) * 10 * audioLevel + 10))) : 
        4;
      return (
        <motion.div 
          key={i} 
          className="bg-blue-500 rounded-full mx-px" 
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

  // Fonction pour activer/désactiver la synthèse vocale
  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    // Arrêter toute synthèse vocale en cours si on désactive
    if (isSpeechEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Gérer le changement d'état d'écoute
  // Fonction modifiée pour gérer correctement la pause
  const toggleListening = () => {
    const newListeningState = !isListening;
    setIsListening(newListeningState);
    
    // Envoyer un signal au serveur pour mettre à jour l'état d'écoute
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'status_update',
        listening: newListeningState
      }));
    }
    
    // Si on passe en mode pause, arrêter immédiatement la reconnaissance vocale
    if (!newListeningState && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecognizing(false);
      } catch (e) {
        console.error("Erreur lors de l'arrêt de la reconnaissance:", e);
      }
    }
    
    // Réinitialiser le texte partiel quand on passe en pause
    if (!newListeningState) {
      setPartialSourceText('');
      setPartialTranslatedText('');
      setIsTranscribing(false);
    }
    
    // Réinitialiser tout lorsqu'on reprend l'écoute après une pause
    if (newListeningState) {
      setSourceText('');
      setTranslatedText('');
      setPartialSourceText('');
      setPartialTranslatedText('');
      shouldClearOnNextSpeech.current = false;
      currentSegmentId.current = null;
    }
  };

  // Fonction pour fermer les connexions WebSocket actuelles
  const closeWebSocketConnections = useCallback(() => {
    console.log("Fermeture des connexions WebSocket actuelles");
    
    // Fermer la connexion WebSocket principale
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Arrêter la reconnaissance vocale
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        setIsRecognizing(false);
      } catch (e) {
        console.error("Erreur lors de l'arrêt de la reconnaissance:", e);
      }
    }
    
    // Réinitialiser les états
    setIsConnected(false);
    setStatus('Déconnecté');
    setSourceText('');
    setTranslatedText('');
    setPartialSourceText('');
    setPartialTranslatedText('');
    setAudioLevel(0);
    
    // Marquer pour reconnexion
    needReconnect.current = true;
  }, []);

  // Fonction pour établir la connexion WebSocket
  const connectWebSocket = useCallback(() => {
    setStatus('Connexion au serveur...');
    
    // Créer une nouvelle connexion WebSocket
    const ws = new WebSocket(`wss://localhost:5001/ws/${clientId.current}`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setIsConnected(true);
      setStatus('Connecté');
      console.log('WebSocket connecté');
      
      // Envoyer les langues sélectionnées au serveur
      ws.send(JSON.stringify({
        type: 'set_languages',
        source: getLanguageCode(sourceLanguage),
        target: getLanguageCode(targetLanguage)
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection':
            console.log('Connexion établie:', data.client_id);
            // Récupérer la configuration initiale si disponible
            if (data.config) {
              // S'assurer que toutes les propriétés importantes existent
              const receivedConfig = {
                ...audioConfig, // Garder les valeurs par défaut
                ...data.config  // Écraser avec les valeurs du serveur
              };
              setAudioConfig(receivedConfig);
            }
            break;
            
          case 'translation_result':
            // Traitement des résultats de traduction complets
            if (data.clear_previous) {
              console.log('Effacement des textes précédents demandé par le serveur');
              setSourceText('');
              setTranslatedText(data.translated_text);
            } else {
              // Sinon, ajouter au texte existant
              setTranslatedText(data.translated_text);
            }
            
            // Effacer la traduction partielle
            setPartialTranslatedText('');
            
            console.log('Traduction reçue:', data.translated_text, 'clear_previous:', data.clear_previous);
            
            // Lire le texte traduit à voix haute si ce n'est pas une traduction partielle
            if (!data.is_partial) {
              speakTranslatedText(data.translated_text);
            }
            
            // Mettre à jour la latence
            if (data.time_ms) {
              setLatency(data.time_ms / 1000);
            }
            
            // Mettre à jour les informations de débit de parole si disponibles
            if (data.speech_rate) {
              setSpeechRate(data.speech_rate);
            }
            break;
            
          case 'continuous_translation':
            // Mise à jour de la traduction en temps réel
            console.log('Traduction partielle reçue:', data.translated_text);
            setPartialTranslatedText(data.translated_text);
            break;
            
          case 'continuous_transcription':
            // Mise à jour de la transcription en temps réel
            console.log('Transcription partielle reçue:', data.text);
            setPartialSourceText(data.text);
            setIsTranscribing(true);
            break;
            
          case 'segment_start':
            // Début d'un nouveau segment vocal
            console.log('Nouveau segment démarré:', data.segment_id);
            currentSegmentId.current = data.segment_id;
            setIsTranscribing(true);
            break;
            
          case 'segment_end':
            // Fin d'un segment vocal
            console.log('Segment terminé:', data.segment_id);
            setIsTranscribing(false);
            
            // Garder l'ID du segment pour attendre la transcription complète
            setTimeout(() => {
              // Si aucune nouvelle transcription n'est arrivée, effacer le texte partiel
              if (currentSegmentId.current === data.segment_id) {
                setPartialSourceText('');
                setPartialTranslatedText('');
                currentSegmentId.current = null;
              }
            }, 1000);
            break;
          
          case 'clear_previous':
            // Ne pas effacer immédiatement, mais marquer pour effacement à la prochaine parole
            console.log('Signal d\'effacement reçu du serveur, sera appliqué à la prochaine parole');
            shouldClearOnNextSpeech.current = true;
            break;
            
          case 'audio_level':
            // Mettre à jour le niveau audio mesuré
            setAudioLevel(data.level);
            // Mettre à jour la qualité audio
            setAudioQuality(data.level > 0.3 ? 'good' : 'low');
            break;
            
          case 'speech_rate_info':
            // Mettre à jour les informations de débit de parole
            setSpeechRate({
              original_rate: data.original_rate,
              normalized_rate: data.normalized_rate,
              quality: data.quality,
              adjustment_applied: data.normalized_rate !== null
            });
            break;
            
          case 'config_updated':
            // Mettre à jour la configuration audio
            if (data.config) {
              setAudioConfig(prevConfig => ({...prevConfig, ...data.config}));
            }
            break;
            
          case 'error':
            console.error('Erreur WebSocket:', data.message);
            setStatus(`Erreur: ${data.message}`);
            break;
            
          case 'pong':
            // Mettre à jour le ping
            break;
            
          case 'speech_status':
            if (data.status === 'ok' && data.text) {
              speakTranslatedText(data.text);
            }
            break;
            
          case 'transcription':
            // Traitement des transcriptions finales
            const isFinal = !data.is_partial;
            
            if (data.clear_previous) {
              console.log('Nouvelle transcription avec effacement:', data.text);
              setSourceText(data.text);
            } else if (isFinal) {
              console.log('Transcription finale:', data.text);
              setSourceText(prev => prev ? `${prev} ${data.text}` : data.text);
              setPartialSourceText(''); // Effacer le texte partiel
            } else {
              // Mise à jour partielle
              console.log('Mise à jour partielle de la transcription:', data.text);
              setPartialSourceText(data.text);
            }
            break;
            
          case 'translation':
            // Traitement des traductions
            if (data.clear_previous) {
              console.log('Nouvelle traduction avec effacement:', data.translated_text);
              setTranslatedText(data.translated_text);
            } else if (!data.is_partial) {
              console.log('Traduction finale:', data.translated_text);
              setTranslatedText(prev => prev ? `${prev} ${data.translated_text}` : data.translated_text);
              setPartialTranslatedText(''); // Effacer la traduction partielle
              
              // Lire le texte traduit
              speakTranslatedText(data.translated_text);
            } else {
              // Mise à jour partielle
              console.log('Mise à jour partielle de la traduction:', data.translated_text);
              setPartialTranslatedText(data.translated_text);
            }
            break;
            
          default:
            console.log('Message reçu:', data);
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message:', error);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setStatus('Déconnecté');
      console.log('WebSocket déconnecté, tentative de reconnexion dans 3 secondes...');
      setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
      setStatus('Erreur de connexion');
    };
  }, [sourceLanguage, targetLanguage, speakTranslatedText, audioConfig]);

  // Effet pour détecter les changements dans l'URL et gérer les reconnexions
  useEffect(() => {
    // Récupérer les langues sélectionnées depuis le sessionStorage
    const srcLang = sessionStorage.getItem('sourceLanguage') || 'Français';
    const tgtLang = sessionStorage.getItem('targetLanguage') || 'Anglais';
    
    // Si les langues ont changé ou si needReconnect est vrai, on ferme et réinitialise les connexions
    if (srcLang !== sourceLanguage || tgtLang !== targetLanguage || needReconnect.current) {
      // Si on a une connexion active, la fermer d'abord
      closeWebSocketConnections();
      
      // Mettre à jour les langues
      setSourceLanguage(srcLang);
      setTargetLanguage(tgtLang);
      
      console.log(`Langues mises à jour - Source: ${srcLang}, Cible: ${tgtLang}`);
      
      // Réinitialiser needReconnect
      needReconnect.current = false;
      
      // Établir les nouvelles connexions
      connectWebSocket();
    } else if (!wsRef.current && isConnected === false) {
      // Si aucune connexion n'est active, en établir une nouvelle
      connectWebSocket();
    }
  }, [location.pathname, sourceLanguage, targetLanguage, connectWebSocket, closeWebSocketConnections, isConnected]);

  // Reconnaissance vocale via le navigateur Web comme fallback
  useEffect(() => {
    // Ne pas activer la reconnaissance si on n'écoute pas ou si on n'est pas connecté
    if (!isListening || !isConnected) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Erreur lors de l'arrêt de la reconnaissance:", e);
        }
        setIsRecognizing(false);
      }
      return;
    }

    // Vérifier si l'API est disponible
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("La reconnaissance vocale n'est pas supportée par ce navigateur");
      setStatus("Reconnaissance vocale non supportée");
      return;
    }
    
    // Initialiser la reconnaissance
    if (!recognitionRef.current) {
      // Tableau de correspondance des langues pour l'API Speech Recognition
      const languageMap = {
        'Français': 'fr-FR',
        'Anglais': 'en-US',
        'Espagnol': 'es-ES',
        'Allemand': 'de-DE',
        'Arabe': 'ar-SA',
        'Chinois': 'zh-CN',
        'Russe': 'ru-RU',
        'Portugais': 'pt-BR',
        'Italien': 'it-IT',
        'Japonais': 'ja-JP'
      };
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = languageMap[sourceLanguage] || 'en-US';
      
      recognition.onstart = () => {
        console.log('Reconnaissance vocale du navigateur démarrée');
        setIsRecognizing(true);
      };
      
      recognition.onend = () => {
        console.log('Reconnaissance vocale du navigateur terminée');
        setIsRecognizing(false);
        
        // Marquer le début d'une période de silence
        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current);
        }
        
        silenceTimer.current = setTimeout(() => {
          // Si le silence dure assez longtemps, considérer qu'une nouvelle parole débutera ensuite
          console.log('Période de silence détectée, prochain segment effacera les textes précédents');
          shouldClearOnNextSpeech.current = true;
        }, 3000);
        
        // Redémarrer si on est toujours en mode écoute
        if (isListening && isConnected) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error("Erreur au redémarrage de la reconnaissance:", e);
            }
          }, 1000);
        }
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Si nous avons une transcription provisoire, la mettre à jour (temps réel)
        if (interimTranscript) {
          setPartialSourceText(interimTranscript);
          
          // Envoyer pour traduction en temps réel si assez long
          if (interimTranscript.length > 5) {
            sendTextForTranslation(interimTranscript, true);
          }
        }
        
        if (finalTranscript) {
          const now = Date.now();
          
          // Vérifier s'il faut effacer les textes précédents
          if (shouldClearOnNextSpeech.current || 
              (audioConfig.clear_previous_segments && 
               (!lastSpeechTimestamp.current || now - lastSpeechTimestamp.current > 3000))) {
            
            console.log('Nouvelle parole après silence ou signal d\'effacement, effacement des textes précédents');
            setSourceText(finalTranscript);
            setPartialSourceText('');
            sendTextForTranslation(finalTranscript, false);
            shouldClearOnNextSpeech.current = false;
            
          } else {
            // Ajouter au texte existant
            setSourceText(prevText => {
              const updatedText = prevText ? `${prevText} ${finalTranscript}` : finalTranscript;
              sendTextForTranslation(updatedText, false);
              return updatedText;
            });
            setPartialSourceText('');
          }
          
          // Mettre à jour le timestamp de dernière parole
          lastSpeechTimestamp.current = now;
          
          // Annuler tout timer de silence en cours
          if (silenceTimer.current) {
            clearTimeout(silenceTimer.current);
            silenceTimer.current = null;
          }
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setStatus(`Erreur audio: ${event.error}`);
      };
      
      recognitionRef.current = recognition;
    }
    
    // Mettre à jour la langue si elle a changé
    if (recognitionRef.current) {
      const languageMap = {
        'Français': 'fr-FR',
        'Anglais': 'en-US',
        'Espagnol': 'es-ES',
        'Allemand': 'de-DE',
        'Arabe': 'ar-SA',
        'Chinois': 'zh-CN',
        'Russe': 'ru-RU',
        'Portugais': 'pt-BR',
        'Italien': 'it-IT',
        'Japonais': 'ja-JP'
      };
      
      recognitionRef.current.lang = languageMap[sourceLanguage] || 'en-US';
      console.log(`Langue de reconnaissance définie: ${languageMap[sourceLanguage]}`);
    }
    
    // Démarrer la reconnaissance si elle n'est pas déjà active
    if (!isRecognizing && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Erreur au démarrage de la reconnaissance:", e);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Erreur lors du nettoyage de la reconnaissance:", e);
        }
      }
      
      // Nettoyer les timers
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
      }
    };
  }, [isListening, isConnected, sourceLanguage, sendTextForTranslation, isRecognizing, audioConfig.clear_previous_segments]);

  // Connexion WebSocket pour les niveaux audio en temps réel
  useEffect(() => {
    if (!isConnected) return;
    
    // Établir une connexion WebSocket séparée pour les niveaux audio
    const audioWs = new WebSocket(`wss://localhost:5001/ws/audio-levels/${clientId.current}`);
    
    audioWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'audio_level') {
          setAudioLevel(data.level);
          setAudioQuality(data.quality || (data.level > 0.3 ? 'good' : 'low'));
        }
      } catch (error) {
        console.error('Erreur lors du traitement des niveaux audio:', error);
      }
    };
    
    return () => {
      if (audioWs && audioWs.readyState === WebSocket.OPEN) {
        audioWs.close();
      }
    };
  }, [isConnected]);

  // Envoyer un ping régulier pour maintenir la connexion active
  useEffect(() => {
    if (!isConnected) return;
    
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000);
    
    return () => clearInterval(pingInterval);
  }, [isConnected]);

  // Gérer les changements de route - marquer pour reconnexion si on navigue vers/depuis d'autres pages
  useEffect(() => {
    // Nettoyer lorsqu'on quitte la page
    return () => {
      console.log("Composant démonté - nettoyage des ressources");
      closeWebSocketConnections();
    };
  }, [closeWebSocketConnections]);

  // Fonction pour revenir à la page de sélection des langues avec réinitialisation
  const handleLanguageSelection = () => {
    // Marquer pour reconnexion au retour
    needReconnect.current = true;
    
    // Naviguer vers la page de sélection des langues
    navigate('/Language');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/Language">
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
              <h1 className="text-xl font-bold ml-2 text-white">Traduction en cours</h1>
            </div>
          </motion.div>
          <div className="flex items-center space-x-4">
            <motion.div 
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${isConnected ? (isListening ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800') : 'bg-red-100 text-red-800'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? (isListening ? 'bg-green-500' : 'bg-yellow-500') : 'bg-red-500'} animate-pulse`}></span>
              {isConnected ? (isListening ? 'En écoute' : 'En pause') : status}
            </motion.div>
            <motion.button 
              className="p-2 text-white/80 hover:text-white"
              onClick={() => setShowControls(!showControls)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              {showControls ? <EyeOff size={20} /> : <Eye size={20} />}
            </motion.button>
          </div>
        </div>
      </header>
      
      {/* Panneau de configuration audio */}
      {showConfigPanel && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Configuration audio avancée</h2>
              <motion.button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfigPanel(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Réduction de bruit ({Math.round(audioConfig.noise_reduction_level * 100)}%)
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={audioConfig.noise_reduction_level} 
                  onChange={(e) => updateAudioConfig({ noise_reduction_level: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gain audio ({audioConfig.gain ? audioConfig.gain.toFixed(1) : "1.5"}x)
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3" 
                  step="0.1" 
                  value={audioConfig.gain || 1.5} 
                  onChange={(e) => updateAudioConfig({ gain: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="beamforming" 
                  checked={audioConfig.beamforming_enabled} 
                  onChange={(e) => updateAudioConfig({ beamforming_enabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="beamforming" className="ml-2 block text-sm text-gray-900">
                  Activer le beamforming (optimisation directionnelle)
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="continuous_mode" 
                  checked={audioConfig.continuous_mode} 
                  onChange={(e) => updateAudioConfig({ continuous_mode: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="continuous_mode" className="ml-2 block text-sm text-gray-900">
                  Mode temps réel (transcription et traduction continues)
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="normalize_speech" 
                  checked={audioConfig.normalize_speech_rate} 
                  onChange={(e) => updateAudioConfig({ normalize_speech_rate: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="normalize_speech" className="ml-2 block text-sm text-gray-900">
                  Normaliser le débit de parole
                </label>
              </div>
              
              {audioConfig.normalize_speech_rate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Débit cible (mots/min): {audioConfig.target_speech_rate}
                  </label>
                  <input 
                    type="range" 
                    min="100" 
                    max="180" 
                    step="5" 
                    value={audioConfig.target_speech_rate} 
                    onChange={(e) => updateAudioConfig({ target_speech_rate: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seuil de détection de parole
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.5" 
                  step="0.05" 
                  value={audioConfig.speech_detection_threshold} 
                  onChange={(e) => updateAudioConfig({ speech_detection_threshold: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Réduisez ce seuil si la reconnaissance vocale ne détecte pas votre voix, augmentez-le pour réduire les fausses détections.
                </p>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="clear_previous_segments" 
                  checked={audioConfig.clear_previous_segments} 
                  onChange={(e) => updateAudioConfig({ clear_previous_segments: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="clear_previous_segments" className="ml-2 block text-sm text-gray-900">
                  Effacer le texte précédent lors d'une nouvelle prise de parole
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <motion.button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setShowConfigPanel(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fermer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto px-4 py-6">
        {/* Language Selection Bar */}
        {showControls && (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="font-medium text-gray-800 mr-2">{sourceLanguage}</span>
              <motion.div 
                className="w-20 h-px bg-blue-300 mx-3"
                animate={{ 
                  backgroundColor: ['#93C5FD', '#3B82F6', '#93C5FD'],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.div>
              <span className="font-medium text-blue-600">{targetLanguage}</span>
            </div>
            
            <div className="flex items-center">
              <motion.button 
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 mr-3"
                onClick={handleLanguageSelection}
                whileHover={{ scale: 1.05, backgroundColor: "#F9FAFB" }}
                whileTap={{ scale: 0.95 }}
              >
                <Sliders size={16} className="mr-2" />
                <span>Langues</span>
              </motion.button>
              <motion.button 
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                onClick={() => setShowConfigPanel(true)}
                whileHover={{ scale: 1.05, backgroundColor: "#F9FAFB" }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings size={16} className="mr-2" />
                <span>Configuration</span>
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Translation Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Source Text Panel */}
          <motion.div 
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-700">Texte original ({sourceLanguage})</h2>
              <div className="flex items-center">
                <Mic size={16} className={`${isTranscribing ? 'text-red-500' : 'text-gray-500'} mr-2`} />
                <div className="flex items-center h-6">
                  {generateWaveform()}
                </div>
              </div>
            </div>
            <div className="h-72 overflow-y-auto p-4">
              <p className="text-gray-800 whitespace-pre-line">
                {sourceText}
                {partialSourceText && (
                  <motion.span 
                    className="text-gray-500 italic"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  > {partialSourceText}</motion.span>
                )}
              </p>
            </div>
          </motion.div>
          
          {/* Translated Text Panel */}
          <motion.div 
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold text-blue-700">Texte traduit ({targetLanguage})</h2>
              <div className="flex items-center">
                <motion.button 
                  className={`p-2 ${isSpeechEnabled ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-700 transition-colors`}
                  onClick={toggleSpeech}
                  title={isSpeechEnabled ? "Désactiver la lecture vocale" : "Activer la lecture vocale"}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Volume2 size={18} />
                </motion.button>
              </div>
            </div>
            <div className="h-72 overflow-y-auto p-4">
              <p className="text-blue-600 whitespace-pre-line">
                {translatedText}
                {partialTranslatedText && (
                  <motion.span 
                    className="text-blue-400 italic"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  > {partialTranslatedText}</motion.span>
                )}
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Controls Section */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex justify-center mb-8">
            <motion.button 
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition ${isListening ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'} ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={toggleListening}
              disabled={!isConnected}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              animate={isListening ? {
                boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0)", "0 0 0 10px rgba(239, 68, 68, 0.2)", "0 0 0 20px rgba(239, 68, 68, 0)"]
              } : {}}
              transition={isListening ? {
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              } : {}}
            >
              {isListening ? 
                <Pause size={36} className="text-white" /> : 
                <Play size={36} className="text-white ml-1" />
              }
            </motion.button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <motion.div 
              className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
              whileHover={{ y: -2, backgroundColor: "#EFF6FF" }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-700">Latence: {latency.toFixed(1)}s</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
              whileHover={{ y: -2, backgroundColor: "#EFF6FF" }}
            >
              <div className={`w-2 h-2 rounded-full ${audioLevel > 0.3 ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
              <span className="text-gray-700">Niveau audio: {Math.round(audioLevel * 100)}%</span>
            </motion.div>
            
            {speechRate.original_rate > 0 && (
              <motion.div 
                className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                whileHover={{ y: -2, backgroundColor: "#EFF6FF" }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  speechRate.quality === 'normal' ? 'bg-green-500' : 
                  speechRate.quality === 'trop rapide' ? 'bg-yellow-500' : 
                  speechRate.quality === 'trop lent' ? 'bg-orange-500' : 'bg-gray-500'
                } mr-2`}></div>
                <span className="text-gray-700">Débit: {speechRate.original_rate} mots/min</span>
              </motion.div>
            )}
            
            <motion.div 
              className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
              whileHover={{ y: -2, backgroundColor: "#EFF6FF" }}
            >
              <div className={`w-2 h-2 rounded-full ${isSpeechEnabled ? 'bg-green-500' : 'bg-gray-500'} mr-2`}></div>
              <span className="text-gray-700">Synthèse vocale: {isSpeechEnabled ? 'Activée' : 'Désactivée'}</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
              whileHover={{ y: -2, backgroundColor: "#EFF6FF" }}
            >
              <div className={`w-2 h-2 rounded-full ${audioConfig.continuous_mode ? 'bg-green-500' : 'bg-gray-500'} mr-2`}></div>
              <span className="text-gray-700">Mode temps réel: {audioConfig.continuous_mode ? 'Activé' : 'Désactivé'}</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
              whileHover={{ y: -2, backgroundColor: "#EFF6FF" }}
            >
              <div className={`w-2 h-2 rounded-full ${audioConfig.clear_previous_segments ? 'bg-green-500' : 'bg-gray-500'} mr-2`}></div>
              <span className="text-gray-700">Effacement auto: {audioConfig.clear_previous_segments ? 'Activé' : 'Désactivé'}</span>
            </motion.div>
            
            {audioConfig.normalize_speech_rate && speechRate.adjustment_applied && (
              <motion.div 
                className="flex items-center bg-blue-50 px-3 py-1 rounded-full"
                whileHover={{ y: -2, backgroundColor: "#DBEAFE" }}
              >
                <span className="text-gray-700">Débit normalisé à {speechRate.normalized_rate} mots/min</span>
              </motion.div>
            )}
            
            <motion.div 
              className="flex items-center bg-yellow-50 px-3 py-1 rounded-full"
              whileHover={{ y: -2, backgroundColor: "#FEF3C7" }}
            >
              <AlertTriangle size={14} className="text-yellow-500 mr-2" />
              <span className="text-gray-700">Pour de meilleurs résultats, réduisez le bruit ambiant</span>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Section d'information sur la captation audio */}
        {showControls && audioQuality === 'low' && (
          <motion.div 
            className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="font-semibold text-yellow-700 mb-2 flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              Qualité audio faible détectée
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Le niveau audio capté est faible. Voici quelques suggestions pour améliorer la captation:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Rapprochez-vous de la source sonore
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Augmentez le gain audio dans les paramètres de configuration
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Utilisez un microphone externe si disponible
              </li>
            </ul>
            <div className="mt-3">
              <motion.button 
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                onClick={() => setShowConfigPanel(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ajuster les paramètres audio
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Footer Tips */}
        {showControls && (
          <motion.footer 
            className="max-w-6xl mx-auto px-4 py-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-semibold text-blue-700 mb-2">Conseils pour une meilleure traduction</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Placez votre appareil à proximité de l'orateur pour une meilleure captation audio
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Utilisez des écouteurs pour éviter les interférences entre le micro et les haut-parleurs
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Pour les grandes salles, connectez votre appareil directement au système audio si possible
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Ajustez les paramètres de réduction de bruit dans la configuration pour les environnements bruyants
                </li>
              </ul>
            </div>
          </motion.footer>
        )}
      </main>
      
      {/* Footer pour cohérence avec les autres pages */}
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="bg-blue-500 text-white p-2 rounded-full"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Globe size={16} />
              </motion.div>
              <span className="text-sm font-bold ml-2">VoiceTranslate</span>
            </motion.div>
            <motion.p 
              className="text-xs text-gray-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              &copy; 2025 VoiceTranslate - Tous droits réservés
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TranslationMainScreen;