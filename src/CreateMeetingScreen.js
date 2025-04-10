import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, ArrowLeft, Video, Plus, Check, Copy, Share2 } from 'lucide-react';
import { createRoom } from './services/socketService';


const CreateMeetingScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mainLanguage, setMainLanguage] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [meetingName, setMeetingName] = useState('');
  const [meetingCode, setMeetingCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleLanguageToggle = (code) => {
    if (selectedLanguages.includes(code)) {
      setSelectedLanguages(selectedLanguages.filter(lang => lang !== code));
    } else {
      setSelectedLanguages([...selectedLanguages, code]);
    }
  };

  const handleNextStep = async () => {
    if (step === 1 && mainLanguage) {
      setStep(2);
    } else if (step === 2 && selectedLanguages.length > 0) {
      setStep(3);
    } else if (step === 3 && meetingName) {
      setIsLoading(true);
      setError('');
      
      try {
        // Création réelle de la salle sur le serveur
        const roomCode = await createRoom(
          mainLanguage,
          [...selectedLanguages, mainLanguage], // Inclure la langue principale dans les langues supportées
          meetingName
        );
        
        setMeetingCode(roomCode);
        setStep(4);
      } catch (err) {
        console.error('Error creating room:', err);
        setError('Erreur lors de la création de la salle. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingCode).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const startMeeting = () => {
    // Naviguer vers la salle de réunion avec les paramètres nécessaires
    navigate(`/virtual-meeting/room/${meetingCode}`, {
      state: {
        username: 'Organisateur',
        speakLanguage: mainLanguage,
        listenLanguage: mainLanguage,
        isHost: true
      }
    });
  };

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
          className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 p-2 rounded-full">
                <Video size={24} />
              </div>
              <h2 className="text-xl font-bold ml-2">Créer une nouvelle réunion</h2>
            </div>
            <p className="opacity-80">
              {step === 1 && "Étape 1: Sélectionnez la langue principale de la conférence"}
              {step === 2 && "Étape 2: Choisissez les langues de traduction disponibles"}
              {step === 3 && "Étape 3: Donnez un nom à votre réunion"}
              {step === 4 && "Votre réunion est prête!"}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100">
            <motion.div 
              className="h-1 bg-green-500" 
              initial={{ width: `${(step - 1) * 25}%` }}
              animate={{ width: `${step * 25}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error message */}
            {error && (
              <motion.div
                className="mb-4 p-3 bg-red-100 text-red-700 rounded-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Step 1: Select main language */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="text-lg font-semibold mb-4">Sélectionnez la langue principale</h3>
                <p className="text-gray-600 mb-6">
                  Cette langue sera celle dans laquelle vous allez parler pendant la conférence.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {languages.map(lang => (
                    <motion.button
                      key={lang.code}
                      className={`p-3 rounded-lg border text-left ${
                        mainLanguage === lang.code 
                          ? 'bg-green-100 border-green-500 text-green-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMainLanguage(lang.code)}
                    >
                      <div className="flex items-center">
                        {mainLanguage === lang.code && (
                          <Check size={16} className="text-green-500 mr-1" />
                        )}
                        <span>{lang.name}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Select translation languages */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="text-lg font-semibold mb-4">Sélectionnez les langues de traduction</h3>
                <p className="text-gray-600 mb-6">
                  Choisissez les langues dans lesquelles votre conférence sera traduite.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {languages
                    .filter(lang => lang.code !== mainLanguage)
                    .map(lang => (
                      <motion.button
                        key={lang.code}
                        className={`p-3 rounded-lg border text-left ${
                          selectedLanguages.includes(lang.code) 
                            ? 'bg-blue-100 border-blue-500 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLanguageToggle(lang.code)}
                      >
                        <div className="flex items-center">
                          {selectedLanguages.includes(lang.code) && (
                            <Check size={16} className="text-blue-500 mr-1" />
                          )}
                          <span>{lang.name}</span>
                        </div>
                      </motion.button>
                    ))}
                </div>
                
                <div className="mb-2">
                  <p className="text-sm text-gray-500">
                    Langues sélectionnées: {selectedLanguages.length}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Meeting name */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="text-lg font-semibold mb-4">Nommez votre réunion</h3>
                <p className="text-gray-600 mb-6">
                  Donnez un nom à votre réunion pour vous aider à l'identifier.
                </p>
                
                <div className="mb-8">
                  <label htmlFor="meeting-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la réunion
                  </label>
                  <input
                    type="text"
                    id="meeting-name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="Ex: Réunion équipe marketing"
                    value={meetingName}
                    onChange={(e) => setMeetingName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Meeting created */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="mb-6">
                  <motion.div
                    className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <Check size={32} className="text-green-500" />
                  </motion.div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">Votre réunion est prête!</h3>
                <p className="text-gray-600 mb-6">
                  Partagez ce code avec les participants pour qu'ils puissent rejoindre votre réunion.
                </p>
                
                <div className="mb-8">
                  <div className="relative">
                    <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-center font-mono text-2xl font-bold tracking-wider border border-gray-200">
                      {meetingCode}
                    </div>
                    <motion.button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-blue-500"
                      whileTap={{ scale: 0.9 }}
                      onClick={copyToClipboard}
                    >
                      {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </motion.button>
                  </div>
                  {isCopied && (
                    <motion.p 
                      className="text-green-500 text-sm mt-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Code copié dans le presse-papier!
                    </motion.p>
                  )}
                </div>
                
                <div className="flex space-x-3 mb-4">
                  <motion.button
                    className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium flex items-center justify-center"
                    whileHover={{ backgroundColor: "#dbeafe" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      // Share functionality (basic clipboard + confirm)
                      const shareText = `Rejoignez ma réunion VoiceTranslate avec le code: ${meetingCode}`;
                      navigator.clipboard.writeText(shareText).then(() => {
                        alert("Lien d'invitation copié dans le presse-papier!");
                      });
                    }}
                  >
                    <Share2 size={18} className="mr-2" />
                    Partager l'invitation
                  </motion.button>
                  
                  <motion.button
                    className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center"
                    whileHover={{ backgroundColor: "#16a34a" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startMeeting}
                  >
                    <Video size={18} className="mr-2" />
                    Démarrer la réunion
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            {step < 4 && (
              <div className="flex justify-between">
                <motion.button
                  className={`px-4 py-2 rounded-lg ${step === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  whileHover={step !== 1 ? { backgroundColor: "#f3f4f6" } : {}}
                  whileTap={step !== 1 ? { scale: 0.98 } : {}}
                  onClick={handlePrevStep}
                  disabled={step === 1}
                >
                  Précédent
                </motion.button>
                
                <motion.button
                  className={`px-4 py-2 bg-green-500 text-white rounded-lg ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 
                    (step === 1 && !mainLanguage) || 
                    (step === 2 && selectedLanguages.length === 0) || 
                    (step === 3 && !meetingName) 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:bg-green-600'
                  }`}
                  whileHover={!isLoading && ((step === 1 && mainLanguage) || 
                             (step === 2 && selectedLanguages.length > 0) || 
                             (step === 3 && meetingName)) 
                               ? { backgroundColor: "#16a34a" } : {}}
                  whileTap={!isLoading && ((step === 1 && mainLanguage) || 
                           (step === 2 && selectedLanguages.length > 0) || 
                           (step === 3 && meetingName)) 
                             ? { scale: 0.98 } : {}}
                  onClick={handleNextStep}
                  disabled={isLoading || 
                           (step === 1 && !mainLanguage) || 
                           (step === 2 && selectedLanguages.length === 0) || 
                           (step === 3 && !meetingName)}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création...
                    </span>
                  ) : 'Suivant'}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Info section */}
        {step < 4 && (
          <motion.div
            className="max-w-2xl w-full mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100"
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
              Info
            </h3>
            <p className="text-blue-700 opacity-80">
              {step === 1 && "La langue principale est celle que vous allez parler pendant la conférence. Tous les participants vous entendront dans cette langue ou dans une de leurs langues de traduction sélectionnées."}
              {step === 2 && "Vous pouvez sélectionner plusieurs langues dans lesquelles votre conférence sera traduite en temps réel. Les participants pourront choisir une de ces langues pour écouter la traduction."}
              {step === 3 && "Le nom de la réunion est une information qui vous aide à identifier votre réunion, mais il ne sera pas utilisé comme identifiant pour y accéder."}
            </p>
          </motion.div>
        )}
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

export default CreateMeetingScreen;