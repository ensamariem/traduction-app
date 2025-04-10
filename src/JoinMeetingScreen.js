import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, ArrowLeft, Video, LogIn, User, Check } from 'lucide-react';
import { checkRoomExists } from './services/socketService';

const JoinMeetingScreen = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const [username, setUsername] = useState('');
  const [speakLanguage, setSpeakLanguage] = useState('');
  const [listenLanguage, setListenLanguage] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'Anglais' },
    { code: 'es', name: 'Espagnol' },
    { code: 'de', name: 'Allemand' },
    { code: 'it', name: 'Italien' },
    { code: 'pt', name: 'Portugais' },
    { code: 'ar', name: 'Arabe' },
    { code: 'ru', name: 'Russe' },
    { code: 'zh', name: 'Chinois' },
    { code: 'ja', name: 'Japonais' },
    { code: 'ko', name: 'Coréen' },
    { code: 'nl', name: 'Néerlandais' }
  ];

  // Vérification du code de réunion avec debounce
  useEffect(() => {
    if (meetingCode.length >= 6) {
      const checkRoom = async () => {
        setIsChecking(true);
        setCodeError('');
        
        try {
          const data = await checkRoomExists(meetingCode);
          
          if (data.exists) {
            setRoomData(data);
          } else {
            setRoomData(null);
            setCodeError('Aucune réunion trouvée avec ce code');
          }
        } catch (error) {
          console.error('Error checking room:', error);
          setCodeError('Erreur lors de la vérification du code');
          setRoomData(null);
        } finally {
          setIsChecking(false);
        }
      };
      
      // Debounce pour éviter trop de requêtes
      const timer = setTimeout(() => {
        checkRoom();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setRoomData(null);
      if (meetingCode.length > 0) {
        setCodeError('Le code doit contenir au moins 6 caractères');
      }
    }
  }, [meetingCode]);

  const handleCodeChange = (e) => {
    const code = e.target.value.toUpperCase();
    setMeetingCode(code);
  };

  const handleJoinMeeting = () => {
    if (!isFormValid) return;
    
    setIsLoading(true);
    
    // Navigation vers la salle de réunion avec les données de l'utilisateur
    navigate(`/virtual-meeting/room/${meetingCode}`, {
      state: {
        username,
        speakLanguage,
        listenLanguage,
        isHost: false
      }
    });
  };

  // Vérifier si tous les champs sont remplis
  const isFormValid = meetingCode && username && speakLanguage && listenLanguage && roomData && !codeError;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/">
                <motion.div 
                  className="bg-blue-500 text-white p-2 rounded-full flex items-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Globe size={24} />
                  <h1 className="text-xl font-bold ml-2 text-white">VoiceTranslate</h1>
                </motion.div>
              </Link>
            </div>
            <Link to="/virtual-meeting">
              <motion.button
                className="flex items-center text-gray-600 hover:text-gray-900"
                whileHover={{ scale: 1.05 }}
              >
                <ArrowLeft size={20} className="mr-1" />
                Retour
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 p-2 rounded-full">
                <LogIn size={24} />
              </div>
              <h2 className="text-xl font-bold ml-2">Rejoindre une réunion</h2>
            </div>
            <p className="opacity-80">
              Entrez le code de la réunion et choisissez votre langue
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Meeting Code */}
            <div className="mb-6">
              <label htmlFor="meeting-code" className="block text-sm font-medium text-gray-700 mb-1">
                Code de la réunion
              </label>
              <input
                type="text"
                id="meeting-code"
                className={`w-full p-3 border ${codeError ? 'border-red-500' : roomData ? 'border-green-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                placeholder="Ex: ABCD123"
                value={meetingCode}
                onChange={handleCodeChange}
              />
              
              {isChecking && (
                <motion.p 
                  className="mt-1 text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Vérification...
                </motion.p>
              )}
              
              {codeError && !isChecking && (
                <motion.p 
                  className="mt-1 text-sm text-red-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {codeError}
                </motion.p>
              )}
              
              {roomData && !isChecking && (
                <motion.div 
                  className="mt-1 text-sm text-green-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-medium">{roomData.meetingName}</p>
                  <p>{roomData.participantsCount} participants actifs</p>
                </motion.div>
              )}
            </div>

            {/* Your Name */}
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Votre nom
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Comment les autres participants vous verront"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Your Speaking Language */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue dans laquelle vous allez parler
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {languages.map(lang => (
                  <motion.button
                    key={`speak-${lang.code}`}
                    className={`p-3 rounded-lg border text-left ${
                      speakLanguage === lang.code 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSpeakLanguage(lang.code)}
                  >
                    <div className="flex items-center">
                      {speakLanguage === lang.code && (
                        <Check size={16} className="text-green-500 mr-1" />
                      )}
                      <span>{lang.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Listening Language Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue dans laquelle vous voulez écouter
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {roomData && languages.filter(lang => 
                  roomData.supportedLanguages.includes(lang.code)
                ).map(lang => (
                  <motion.button
                    key={`listen-${lang.code}`}
                    className={`p-3 rounded-lg border text-left ${
                      listenLanguage === lang.code 
                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setListenLanguage(lang.code)}
                  >
                    <div className="flex items-center">
                      {listenLanguage === lang.code && (
                        <Check size={16} className="text-blue-500 mr-1" />
                      )}
                      <span>{lang.name}</span>
                    </div>
                  </motion.button>
                ))}
                
                {!roomData && (
                  <div className="col-span-3 p-3 bg-gray-100 rounded-lg text-gray-500 text-center">
                    Entrez un code de réunion valide pour voir les langues disponibles
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Vous écouterez la traduction dans cette langue
              </p>
            </div>

            {/* Join Button */}
            <motion.button
              className={`w-full py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center ${
                isFormValid && !isLoading ? 'hover:bg-blue-600' : 'opacity-70 cursor-not-allowed'
              }`}
              whileHover={isFormValid && !isLoading ? { backgroundColor: "#2563eb" } : {}}
              whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
              onClick={handleJoinMeeting}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </span>
              ) : (
                <>
                  <Video size={18} className="mr-2" />
                  Rejoindre la réunion
                </>
              )}
            </motion.button>

            {/* Demo code hint */}
            <div className="mt-4 text-center">
              <motion.button
                className="text-sm text-blue-600 hover:text-blue-800"
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setMeetingCode('DEMO123');
                  setCodeError('');
                }}
              >
                Utiliser le code de démo
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Info card */}
        <motion.div
          className="max-w-md w-full mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-2 text-blue-700 flex items-center">
            <div className="mr-2 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            Comment ça fonctionne
          </h3>
          <p className="text-blue-700 opacity-80 mb-4">
            Pour rejoindre une réunion avec traduction en temps réel:
          </p>
          <ul className="space-y-2 text-blue-700 opacity-80">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full mr-2 flex-shrink-0 text-xs">1</span>
              <span>Entrez le code fourni par l'organisateur de la réunion</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full mr-2 flex-shrink-0 text-xs">2</span>
              <span>Choisissez la langue dans laquelle vous allez parler</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full mr-2 flex-shrink-0 text-xs">3</span>
              <span>Sélectionnez la langue dans laquelle vous souhaitez entendre les autres participants</span>
            </li>
          </ul>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 VoiceTranslate - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};

export default JoinMeetingScreen;