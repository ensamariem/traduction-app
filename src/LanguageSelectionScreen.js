import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, Star, Clock, ChevronLeft, Info, RotateCw, Users, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';


const LanguageSelectionScreen = () => {
  const [sourceLanguage, setSourceLanguage] = useState('Français');
  const [targetLanguage, setTargetLanguage] = useState('Anglais');
  const [recentPairs, setRecentPairs] = useState([]);
  
  // Langues complètement supportées (reconnaissance, traduction, synthèse)
  const [fullySupportedLanguages, setFullySupportedLanguages] = useState([]);
  
  // Langues partiellement supportées (traduction + reconnaissance, synthèse par fallback)
  const [partiallySupportedLanguages, setPartiallySupportedLanguages] = useState([]);
  
  // Toutes les langues disponibles (au moins pour la traduction)
  const [allAvailableLanguages, setAllAvailableLanguages] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Charger les langues disponibles depuis l'API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true);
        
        // Tenter de récupérer les langues du backend
        try {
          const response = await fetch('https://localhost:5001/api/languages');
          const data = await response.json();
          
          // Filtrer les langues en fonction du support
          const fullSupport = data.filter(lang => 
            lang.whisper_supported && 
            lang.translation_supported && 
            lang.tts_supported && 
            !lang.tts_fallback
          ).map(lang => lang.name);
          
          const partialSupport = data.filter(lang => 
            lang.whisper_supported && 
            lang.translation_supported && 
            (lang.tts_fallback || !lang.tts_supported)
          ).map(lang => lang.name);
          
          const allLanguages = data.map(lang => lang.name);
          
          setFullySupportedLanguages(fullSupport);
          setPartiallySupportedLanguages(partialSupport);
          setAllAvailableLanguages(allLanguages);
        } catch (error) {
          console.error('Erreur API, utilisation des langues par défaut:', error);
          
          // Langues avec support complet (reconnaissance, traduction, synthèse native)
          const defaultFullySupported = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien'];
          
          // Langues avec support intermédiaire
          const defaultPartiallySupported = ['Néerlandais', 'Russe', 'Chinois', 'Japonais', 'Portugais', 'Arabe'];
          
          // Langues principales pour la traduction mais limitations pour reconnaissance/synthèse
          const defaultOtherLanguages = [
            'Polonais', 'Tchèque', 'Suédois', 'Coréen', 'Turc', 'Ukrainien',
            'Hindi', 'Bengali', 'Thaï', 'Vietnamien', 'Indonésien', 'Malais',
            'Hébreu', 'Persan', 'Kurde', 'Swahili', 'Afrikaans'
          ];
          
          setFullySupportedLanguages(defaultFullySupported);
          setPartiallySupportedLanguages(defaultPartiallySupported);
          setAllAvailableLanguages([...defaultFullySupported, ...defaultPartiallySupported, ...defaultOtherLanguages]);
        }
        
        // Charger les paires récentes du localStorage
        const savedPairs = localStorage.getItem('recentPairs');
        if (savedPairs) {
          setRecentPairs(JSON.parse(savedPairs));
        } else {
          // Initialiser avec quelques paires par défaut
          const defaultPairs = [
            { source: 'Français', target: 'Anglais' },
            { source: 'Anglais', target: 'Français' },
            { source: 'Français', target: 'Espagnol' }
          ];
          setRecentPairs(defaultPairs);
          localStorage.setItem('recentPairs', JSON.stringify(defaultPairs));
        }
        
        // Charger les langues actuelles depuis sessionStorage si disponibles
        const currentSource = sessionStorage.getItem('sourceLanguage');
        const currentTarget = sessionStorage.getItem('targetLanguage');
        
        if (currentSource) {
          setSourceLanguage(currentSource);
        }
        
        if (currentTarget) {
          setTargetLanguage(currentTarget);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des langues:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLanguages();
  }, []);
  
  const handleContinue = () => {
    // Vérifier que les langues choisies sont différentes
    if (sourceLanguage === targetLanguage) {
      alert("Veuillez choisir des langues source et cible différentes.");
      return;
    }
    
    // Sauvegarder la paire de langues sélectionnée
    const currentPair = { source: sourceLanguage, target: targetLanguage };
    
    // Mettre à jour les paires récentes
    const updatedPairs = [currentPair];
    
    // Ajouter les autres paires en évitant les doublons
    recentPairs.forEach(pair => {
      if (pair.source !== currentPair.source || pair.target !== currentPair.target) {
        updatedPairs.push(pair);
      }
      
      // Limiter à 5 paires récentes
      if (updatedPairs.length >= 5) {
        return;
      }
    });
    
    setRecentPairs(updatedPairs);
    localStorage.setItem('recentPairs', JSON.stringify(updatedPairs));
    
    // Sauvegarder les langues sélectionnées dans le sessionStorage pour les utiliser dans la page de traduction
    sessionStorage.setItem('sourceLanguage', sourceLanguage);
    sessionStorage.setItem('targetLanguage', targetLanguage);
    
    // Naviguer vers la page de traduction
    navigate('/translation');
  };
  
  const handleRecentPair = (source, target) => {
    setSourceLanguage(source);
    setTargetLanguage(target);
  };
  
  // Fonction pour échanger les langues source et cible
  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };
  
  // Fonction pour déterminer le niveau de support d'une langue
  const getLanguageSupport = (language) => {
    if (fullySupportedLanguages.includes(language)) {
      return 'full';
    } else if (partiallySupportedLanguages.includes(language)) {
      return 'partial';
    } else {
      return 'limited';
    }
  };
  
  // Fonction pour afficher l'indicateur de support
  const renderSupportIndicator = (language) => {
    const support = getLanguageSupport(language);
    
    if (support === 'full') {
      return <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2" title="Support complet"></span>;
    } else if (support === 'partial') {
      return <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full ml-2" title="Support partiel"></span>;
    } else {
      return <span className="inline-block w-2 h-2 bg-orange-400 rounded-full ml-2" title="Support limité"></span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header avec style cohérent avec la page d'accueil */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/">
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
              <h1 className="text-xl font-bold ml-2 text-white">VoiceTranslate</h1>
            </div>
          </motion.div>
          <motion.button 
            className="text-white/80 hover:text-white transition-colors flex items-center bg-white/10 rounded-full py-2 px-4"
            onClick={() => setShowDetails(!showDetails)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Info size={18} className="mr-2" />
            <span className="text-sm">Infos sur le support</span>
          </motion.button>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Sélectionnez vos langues
          </motion.h2>
          
          {/* Support info */}
          {showDetails && (
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4">Niveau de support des langues</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  className="flex items-start"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mt-1 mr-2"></span>
                  <div>
                    <p className="font-medium text-gray-800">Support complet</p>
                    <p className="text-sm text-gray-600">Reconnaissance, traduction et synthèse vocale natives</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mt-1 mr-2"></span>
                  <div>
                    <p className="font-medium text-gray-800">Support partiel</p>
                    <p className="text-sm text-gray-600">Reconnaissance et traduction, synthèse avec voix de substitution</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="inline-block w-3 h-3 bg-orange-400 rounded-full mt-1 mr-2"></span>
                  <div>
                    <p className="font-medium text-gray-800">Support limité</p>
                    <p className="text-sm text-gray-600">Principalement pour la traduction de texte</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">
              <motion.div 
                className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
                animate={{ 
                  rotate: 360
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear"
                }}
              ></motion.div>
              <p className="mt-2 text-gray-600">Chargement des langues disponibles...</p>
            </div>
          ) : (
            <>
              {/* Language Selection */}
              <motion.div 
                className="bg-white rounded-lg shadow-md p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0">
                  <div className="w-full md:w-2/5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Langue source (ce que vous entendez)</label>
                    <div className="relative">
                      <select 
                        className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        value={sourceLanguage}
                        onChange={(e) => setSourceLanguage(e.target.value)}
                      >
                        {/* Grouper les langues par niveau de support */}
                        <optgroup label="Support complet">
                          {fullySupportedLanguages.map(lang => (
                            <option key={`source-full-${lang}`} value={lang}>{lang}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Support partiel">
                          {partiallySupportedLanguages.map(lang => (
                            <option key={`source-partial-${lang}`} value={lang}>{lang}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Support limité">
                          {allAvailableLanguages
                            .filter(lang => !fullySupportedLanguages.includes(lang) && !partiallySupportedLanguages.includes(lang))
                            .map(lang => (
                              <option key={`source-limited-${lang}`} value={lang}>{lang}</option>
                            ))
                          }
                        </optgroup>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center md:w-1/5">
                    <motion.button 
                      className="hidden md:flex w-16 h-16 rounded-full bg-blue-100 items-center justify-center hover:bg-blue-200 transition-colors"
                      onClick={swapLanguages}
                      title="Échanger les langues"
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: "#93C5FD" 
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RotateCw size={24} className="text-blue-500" />
                    </motion.button>
                    <div className="md:hidden w-full flex items-center justify-center py-2">
                      <motion.button
                        className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                        onClick={swapLanguages}
                        title="Échanger les langues"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RotateCw size={24} className="text-blue-500" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Langue cible (ce que vous voulez entendre)</label>
                    <div className="relative">
                      <select 
                        className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                      >
                        {/* Grouper les langues par niveau de support */}
                        <optgroup label="Support complet">
                          {fullySupportedLanguages.map(lang => (
                            <option key={`target-full-${lang}`} value={lang}>{lang}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Support partiel">
                          {partiallySupportedLanguages.map(lang => (
                            <option key={`target-partial-${lang}`} value={lang}>{lang}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Support limité">
                          {allAvailableLanguages
                            .filter(lang => !fullySupportedLanguages.includes(lang) && !partiallySupportedLanguages.includes(lang))
                            .map(lang => (
                              <option key={`target-limited-${lang}`} value={lang}>{lang}</option>
                            ))
                          }
                        </optgroup>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Translation Preview */}
                <motion.div 
                  className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  whileHover={{ y: -5, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Aperçu de la traduction</h4>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="font-medium text-gray-800 flex items-center">
                      {sourceLanguage}
                      {renderSupportIndicator(sourceLanguage)}
                    </span>
                    <motion.div
                      animate={{ 
                        x: [0, 5, 0]
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 1.5
                      }}
                    >
                      <ArrowRight size={16} className="text-gray-400" />
                    </motion.div>
                    <span className="font-medium text-blue-600 flex items-center">
                      {targetLanguage}
                      {renderSupportIndicator(targetLanguage)}
                    </span>
                  </div>
                </motion.div>
                
                {/* Support level warning */}
                {(getLanguageSupport(sourceLanguage) === 'limited' || getLanguageSupport(targetLanguage) === 'limited') && (
                  <motion.div 
                    className="mt-4 p-3 bg-orange-50 text-orange-800 rounded-lg border border-orange-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm flex items-start">
                      <svg className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>
                        <strong>Note :</strong> Une ou plusieurs langues sélectionnées ont un support limité. 
                        La reconnaissance vocale ou la synthèse vocale pourrait être de qualité inférieure.
                      </span>
                    </p>
                  </motion.div>
                )}
                
                {/* Warning message if same languages are selected */}
                {sourceLanguage === targetLanguage && (
                  <motion.div 
                    className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm flex items-start">
                      <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>
                        <strong>Attention :</strong> Vous avez sélectionné la même langue pour la source et la cible. Veuillez choisir des langues différentes.
                      </span>
                    </p>
                  </motion.div>
                )}
              </motion.div>
              
              {/* Recent Selections */}
              <motion.div 
                className="bg-white rounded-lg shadow-md p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <Clock size={20} className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-800">Sélections récentes</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentPairs.map((pair, index) => (
                    <motion.button 
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      onClick={() => handleRecentPair(pair.source, pair.target)}
                      whileHover={{ 
                        y: -3,
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        backgroundColor: "#F9FAFB"
                      }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800 flex items-center">
                          {pair.source}
                          {renderSupportIndicator(pair.source)}
                        </span>
                        <ArrowRight size={16} className="mx-2 text-gray-400" />
                        <span className="font-medium text-blue-600 flex items-center">
                          {pair.target}
                          {renderSupportIndicator(pair.target)}
                        </span>
                      </div>
                      <Star size={16} className={`${index === 0 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
          
          {/* Continue Button */}
          <div className="flex justify-center">
            <motion.button 
              className={`px-8 py-4 bg-blue-500 text-white rounded-lg font-bold text-lg shadow-md hover:bg-blue-600 transition duration-300 flex items-center ${(isLoading || sourceLanguage === targetLanguage) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleContinue}
              disabled={isLoading || sourceLanguage === targetLanguage}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span>Continuer vers la traduction</span>
              <motion.div
                animate={{ 
                  x: [0, 5, 0]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 1.5
                }}
              >
                <ChevronRight size={20} className="ml-2" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </main>
      
      {/* Footer pour cohérence avec la page d'accueil */}
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

export default LanguageSelectionScreen;