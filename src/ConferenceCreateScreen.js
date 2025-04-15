import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Globe, Settings, Download, QrCode, X, Copy, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

const ConferenceCreateScreen = () => {
  const navigate = useNavigate();
  const [conferenceId, setConferenceId] = useState('');
  const [title, setTitle] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('Français');
  const [targetLanguages, setTargetLanguages] = useState(['Anglais', 'Espagnol', 'Arabe']);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [settings, setSettings] = useState({
    audioQuality: 'medium',
    videoQuality: 'medium',
    enableChat: true
  });
  
  const API_BASE_URL = "http://localhost:8000/api";
  
  // Charger les langues disponibles
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true);
        
        // Appel API pour récupérer les langues
        const response = await axios.get(`${API_BASE_URL}/languages`);
        
        if (response.data && response.data.success && response.data.languages) {
          setAvailableLanguages(response.data.languages);
        } else {
          // Fallback vers des langues par défaut en cas d'erreur
          const mockLanguages = [
            'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais',
            'Arabe', 'Russe', 'Chinois', 'Japonais', 'Coréen', 'Néerlandais',
            'Polonais', 'Tchèque', 'Suédois', 'Danois', 'Norvégien', 'Finnois',
            'Turc', 'Grec', 'Hébreu', 'Hindi', 'Thaï', 'Vietnamien'
          ];
          setAvailableLanguages(mockLanguages);
        }
        
        // Générer un ID de conférence unique
        const newId = generateConferenceId();
        setConferenceId(newId);
      } catch (error) {
        console.error('Erreur lors du chargement des langues:', error);
        
        // En cas d'erreur, charger des langues par défaut
        const mockLanguages = [
          'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais',
          'Arabe', 'Russe', 'Chinois', 'Japonais', 'Coréen', 'Néerlandais',
          'Polonais', 'Tchèque', 'Suédois', 'Danois', 'Norvégien', 'Finnois',
          'Turc', 'Grec', 'Hébreu', 'Hindi', 'Thaï', 'Vietnamien'
        ];
        setAvailableLanguages(mockLanguages);
        
        // Générer un ID de conférence unique
        const newId = generateConferenceId();
        setConferenceId(newId);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLanguages();
  }, []);
  
  // Fonction pour générer un ID de conférence unique
  const generateConferenceId = () => {
    const timestamp = Date.now().toString(36).substring(2, 6).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CN-${timestamp}-${random}`;
  };
  
  // Gérer l'ajout d'une langue cible
  const handleAddLanguage = (language) => {
    if (!targetLanguages.includes(language)) {
      setTargetLanguages([...targetLanguages, language]);
    }
  };
  
  // Gérer la suppression d'une langue cible
  const handleRemoveLanguage = (language) => {
    setTargetLanguages(targetLanguages.filter(lang => lang !== language));
  };
  
  // Gérer les changements de paramètres
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
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
  
  // Vérifier si le titre existe déjà
  const checkTitleExists = async (title) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conferences/check-title?title=${encodeURIComponent(title)}`);
      return response.data && response.data.exists;
    } catch (error) {
      console.error("Erreur lors de la vérification du titre:", error);
      // En cas d'erreur, supposer que le titre n'existe pas pour permettre à l'utilisateur de continuer
      return false;
    }
  };
  
  // Démarrer la conférence
  const startConference = async () => {
    if (!title) {
      setTitleError("Veuillez ajouter un titre à votre conférence");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Vérifier si le titre existe déjà
      const titleExists = await checkTitleExists(title);
      
      if (titleExists) {
        setTitleError("Ce titre de conférence existe déjà. Veuillez en choisir un autre.");
        setIsSubmitting(false);
        return;
      }
      
      // Réinitialiser l'erreur de titre
      setTitleError('');
      
      // Sauvegarder les informations de la conférence
      const conferenceData = {
        id: conferenceId,
        title: title,
        sourceLanguage: sourceLanguage,
        targetLanguages: targetLanguages,
        hasVideo: true,
        hasChat: settings.enableChat,
        settings: settings
      };
      
      // Envoyer les données au serveur
      const response = await axios.post(`${API_BASE_URL}/conferences`, conferenceData);
      
      if (response.data && response.data.success) {
        // Stocker les données de la conférence localement
        localStorage.setItem('conferenceData', JSON.stringify(conferenceData));
        
        // Rediriger vers la page de diffusion
        navigate(`/conference/broadcast/${conferenceId}`);
      } else {
        alert("Erreur lors de la création de la conférence. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la conférence:", error);
      alert("Erreur lors de la création de la conférence. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Gérer le changement de titre
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    // Effacer le message d'erreur lorsque l'utilisateur modifie le titre
    if (titleError) {
      setTitleError('');
    }
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
              <h1 className="text-xl font-bold ml-2 text-white">Créer une conférence</h1>
            </div>
          </motion.div>
          <div className="flex items-center space-x-3">
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
      
      <main className="flex-grow max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détails de la conférence - 2/3 de la largeur */}
          <motion.div 
            className="bg-white rounded-lg shadow-md overflow-hidden lg:col-span-2 h-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
              <h2 className="font-semibold text-blue-700">Détails de la conférence</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="conference-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la conférence*
                  </label>
                  <input 
                    type="text" 
                    id="conference-title" 
                    value={title} 
                    onChange={handleTitleChange} 
                    placeholder="Ex: Réunion de la Bourse de Casablanca"
                    className={`w-full p-2 border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {(!title || titleError) && (
                    <div className="flex items-center mt-1 text-xs text-red-500">
                      {titleError ? <AlertCircle size={12} className="mr-1" /> : null}
                      <p>{titleError || (!title ? "Veuillez saisir un titre" : "")}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="conference-id" className="block text-sm font-medium text-gray-700 mb-1">
                    Identifiant unique
                  </label>
                  <div className="flex">
                    <input 
                      type="text" 
                      id="conference-id" 
                      value={conferenceId} 
                      className="w-full p-2 border border-gray-300 rounded-l-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                    <button 
                      className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-r-lg transition-colors flex items-center"
                      onClick={copyLinkToClipboard}
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="source-language" className="block text-sm font-medium text-gray-700 mb-1">
                    Langue du conférencier
                  </label>
                  <select 
                    id="source-language" 
                    value={sourceLanguage} 
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ajouter une langue de traduction
                  </label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddLanguage(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Sélectionner une langue...</option>
                    {availableLanguages
                      .filter(lang => !targetLanguages.includes(lang) && lang !== sourceLanguage)
                      .map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Langues de traduction disponibles
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                  {targetLanguages.map(lang => (
                    <div 
                      key={lang}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {lang}
                      <button 
                        className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                        onClick={() => handleRemoveLanguage(lang)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t">
                <button 
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={startConference}
                  disabled={isLoading || !title || isSubmitting}
                >
                  {isLoading ? "Chargement..." : isSubmitting ? "Création en cours..." : "Démarrer la conférence"}
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* QR Code section - 1/3 de la largeur */}
          <motion.div 
            className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden h-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 border-b">
              <h2 className="font-semibold text-purple-700">QR Code d'accès</h2>
            </div>
            <div className="p-5 flex flex-col items-center flex-grow justify-center">
              <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
                <QRCodeCanvas 
                  id="conference-qr-code"
                  value={`${window.location.origin}/conference/join/${conferenceId}`}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-center text-sm text-gray-600 mb-3">
                Les participants pourront scanner ce QR code pour rejoindre
              </p>
              <div className="flex gap-2 w-full">
                <button 
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                  onClick={downloadQRCode}
                >
                  <Download size={14} />
                  <span>Télécharger</span>
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  onClick={() => setShowQRModal(true)}
                >
                  <QrCode size={14} />
                  <span>Agrandir</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
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
              {title || "Nouvelle conférence"} - {conferenceId}
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
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Paramètres avancés</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowSettings(false)}
              >
                &times;
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
                >
                  <option value="medium">Standard (720p)</option>
                  <option value="high">Haute qualité (1080p)</option>
                  <option value="low">Économie de données (480p)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="enable_chat" 
                  checked={settings.enableChat}
                  onChange={(e) => handleSettingChange('enableChat', e.target.checked)}
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
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-3 mt-auto">
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

export default ConferenceCreateScreen;