import React, { useState, useEffect } from 'react';
import { Mic, Radio, PlaySquare, ChevronRight, ArrowLeft, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ConferencePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Calcul de la progression du défilement
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = documentHeight - windowHeight;
      const progress = Math.min(window.scrollY / scrollableHeight, 1);
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header avec effet de verre au défilement */}
      <header className={`fixed w-full z-10 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col w-full">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/">
                <motion.div 
                  className="bg-blue-500 text-white p-2 rounded-full flex items-center"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Globe size={24} />
                  <h1 className="text-xl font-bold ml-2 text-white">VoiceTranslate</h1>
                  </motion.div>
             </Link>
           </motion.div>
           <Link to="/" className="flex items-center text-blue-500 hover:text-blue-600 transition-colors">
             <ArrowLeft size={16} className="mr-1" />
             <span>Retour à l'accueil</span>
           </Link>
         </div>
         
         {/* Barre de progression sous le header */}
         <div className="w-full h-1 bg-gray-200 mt-2">
           <motion.div 
             className="h-full bg-blue-500"
             initial={{ width: '0%' }}
             animate={{ width: `${scrollProgress * 100}%` }}
             transition={{ type: 'spring', damping: 15 }}
           />
         </div>
       </div>
     </header>

     {/* Espace pour compenser le header fixe */}
     <div className="pt-16"></div>

     

     {/* Options de conférences présentielles */}
     <section className="py-16">
       <div className="max-w-6xl mx-auto px-4">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <motion.div
             className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.1 }}
             whileHover={{ y: -10 }}
           >
             <div className="flex flex-col items-center text-center">
               <motion.div
                 className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6"
                 whileHover={{ scale: 1.1, rotate: 10 }}
                 transition={{ type: "spring", stiffness: 400, damping: 10 }}
               >
                 <Mic size={32} className="text-white" />
               </motion.div>
               <h3 className="text-2xl font-bold mb-4 text-gray-800">Organiser une conférence</h3>
               <p className="text-gray-600 mb-6">
                 Créez une conférence et partagez le QR code avec vos participants pour qu'ils accèdent à la traduction en temps réel.
               </p>
               <Link to="/conference/create">
                 <motion.button
                   className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium shadow-md hover:bg-blue-600 transition duration-300"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   Organiser maintenant
                   <motion.div
                     animate={{ x: [0, 5, 0] }}
                     transition={{ repeat: Infinity, duration: 1.5 }}
                   >
                     <ChevronRight size={20} className="ml-2" />
                   </motion.div>
                 </motion.button>
               </Link>
             </div>
           </motion.div>

           <motion.div
             className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.2 }}
             whileHover={{ y: -10 }}
           >
             <div className="flex flex-col items-center text-center">
               <motion.div
                 className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6"
                 whileHover={{ scale: 1.1, rotate: 10 }}
                 transition={{ type: "spring", stiffness: 400, damping: 10 }}
               >
                 <Radio size={32} className="text-white" />
               </motion.div>
               <h3 className="text-2xl font-bold mb-4 text-gray-800">Rejoindre une conférence</h3>
               <p className="text-gray-600 mb-6">
                 Scannez le QR code fourni par l'organisateur ou saisissez le code de la conférence pour la rejoindre.
               </p>
               <Link to="/conference/join">
                 <motion.button
                   className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-medium shadow-md hover:bg-green-600 transition duration-300"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   Rejoindre maintenant
                   <motion.div
                     animate={{ x: [0, 5, 0] }}
                     transition={{ repeat: Infinity, duration: 1.5 }}
                   >
                     <ChevronRight size={20} className="ml-2" />
                   </motion.div>
                 </motion.button>
               </Link>
             </div>
           </motion.div>

           <motion.div
             className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.7, delay: 0.3 }}
             whileHover={{ y: -10 }}
           >
             <div className="flex flex-col items-center text-center">
               <motion.div
                 className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-6"
                 whileHover={{ scale: 1.1, rotate: 10 }}
                 transition={{ type: "spring", stiffness: 400, damping: 10 }}
               >
                 <PlaySquare size={32} className="text-white" />
               </motion.div>
               <h3 className="text-2xl font-bold mb-4 text-gray-800">Conférences enregistrées</h3>
               <p className="text-gray-600 mb-6">
                 Accédez aux conférences précédemment enregistrées et écoutez-les dans la langue de votre choix.
               </p>
               <Link to="/conference/player">
                 <motion.button
                   className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg font-medium shadow-md hover:bg-purple-600 transition duration-300"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   Voir les enregistrements
                   <motion.div
                     animate={{ x: [0, 5, 0] }}
                     transition={{ repeat: Infinity, duration: 1.5 }}
                   >
                     <ChevronRight size={20} className="ml-2" />
                   </motion.div>
                 </motion.button>
               </Link>
             </div>
           </motion.div>
         </div>
       </div>
     </section>

     {/* Section explicative avec animation */}
     <section className="py-16 bg-blue-50">
       <div className="max-w-6xl mx-auto px-4">
         <motion.div 
           className="bg-white rounded-2xl shadow-xl overflow-hidden"
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.7 }}
         >
           <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
             <div className="p-8 md:p-12 flex flex-col justify-center">
               <motion.h3 
                 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800"
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: 0.3 }}
               >
                 Comment fonctionnent les conférences présentielles
               </motion.h3>
               <motion.p 
                 className="text-gray-600 mb-8"
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: 0.4 }}
               >
                 L'organisateur diffuse la voix du conférencier, les participants scannent un QR code et écoutent la traduction en temps réel dans leur langue préférée. Idéal pour les conférences, séminaires et réunions internationales.
               </motion.p>
               <motion.ol 
                 className="space-y-4 list-decimal pl-4"
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: 0.5 }}
               >
                 <li className="text-gray-700">L'organisateur crée une conférence et démarre la diffusion.</li>
                 <li className="text-gray-700">Les participants scannent le QR code partagé par l'organisateur.</li>
                 <li className="text-gray-700">Chaque participant sélectionne sa langue d'écoute préférée.</li>
                 <li className="text-gray-700">La traduction en temps réel se fait automatiquement et est diffusée sur les appareils des participants.</li>
               </motion.ol>
             </div>
             <motion.div 
               className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 flex items-center justify-center relative overflow-hidden"
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.7 }}
             >
               <div className="absolute inset-0 opacity-10 bg-pattern-dots"></div>
               <div className="relative z-10 text-white text-center">
                 <div className="flex flex-col items-center space-y-8">
                   <motion.div 
                     className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center"
                     animate={{ 
                       y: [0, -10, 0],
                       boxShadow: [
                         "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                         "0 10px 15px -3px rgba(255, 255, 255, 0.2)",
                         "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                       ]
                     }}
                     transition={{ 
                       repeat: Infinity, 
                       duration: 3
                     }}
                   >
                     <Mic size={64} className="text-white" />
                   </motion.div>
                   <div className="relative w-full">
                     <motion.div
                       className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
                       animate={{
                         y: [-20, 0, -20],
                         opacity: [0, 1, 0]
                       }}
                       transition={{
                         repeat: Infinity,
                         duration: 2,
                         ease: "easeInOut"
                       }}
                     >
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                         <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                         <line x1="12" y1="19" x2="12" y2="22"></line>
                       </svg>
                     </motion.div>
                     <svg className="w-full h-20" viewBox="0 0 100 30">
                       <motion.path
                         d="M0,15 Q7.5,5 15,15 T30,15 T45,15 T60,15 T75,15 T90,15 T100,15"
                         stroke="white"
                         strokeWidth="1"
                         fill="none"
                         strokeDasharray="0,0,5,10"
                         initial={{ pathLength: 0 }}
                         animate={{ pathLength: 1 }}
                         transition={{
                           duration: 2,
                           repeat: Infinity,
                           ease: "linear"
                         }}
                       />
                     </svg>
                   </div>
                   <div className="flex space-x-6">
                     {[1, 2, 3].map((num) => (
                       <motion.div 
                         key={num}
                         className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
                         animate={{ 
                           scale: [1, 1.05, 1],
                           y: [-2, 2, -2],
                         }}
                         transition={{ 
                           repeat: Infinity, 
                           duration: 3,
                           delay: num * 0.3
                         }}
                       >
                         <Radio size={32} className="text-white" />
                       </motion.div>
                     ))}
                   </div>
                   <motion.div 
                     className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mt-4"
                     whileHover={{ scale: 1.05 }}
                   >
                     <div className="text-center">
                       <p className="font-semibold mb-1">Conférence: DEMO-2025</p>
                       <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center">
                         {/* Faux QR code */}
                         <div className="w-24 h-24 grid grid-cols-6 grid-rows-6 gap-1">
                           {Array(36).fill(0).map((_, i) => (
                             <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                           ))}
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 </div>
               </div>
             </motion.div>
           </div>
         </motion.div>
       </div>
     </section>

     {/* CTA avec animation */}
     <section className="bg-blue-500 text-white py-12 relative overflow-hidden">
       <motion.div 
         className="absolute inset-0 opacity-10"
         animate={{ 
           scale: [1, 1.1, 1],
           rotate: [0, 3, 0]
         }}
         transition={{ 
           repeat: Infinity,
           duration: 15
         }}
         style={{
           backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")'
         }}
       />
       <div className="max-w-6xl mx-auto px-4 text-center relative z-0">
         <motion.h3 
           className="text-2xl md:text-3xl font-bold mb-6"
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
         >
           Prêt à créer votre conférence multilingue?
         </motion.h3>
         <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <Link to="/conference/create">
             <motion.button 
               className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center"
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: 0.2 }}
             >
               <Mic size={20} className="mr-2" />
               Organiser une conférence
             </motion.button>
           </Link>
         </div>
       </div>
     </section>

     {/* Footer avec animation d'apparition */}
     <footer className="bg-gray-800 text-white py-8">
       <div className="max-w-6xl mx-auto px-4">
         <div className="flex flex-col md:flex-row justify-between">
           <motion.div 
             className="mb-6 md:mb-0"
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
           >
             <div className="flex items-center">
               <motion.div 
                 className="bg-blue-500 text-white p-2 rounded-full"
                 whileHover={{ rotate: 360 }}
                 transition={{ duration: 0.5 }}
               >
                 <Globe size={20} />
               </motion.div>
               <h2 className="text-lg font-bold ml-2">VoiceTranslate</h2>
             </div>
             <p className="mt-2 text-gray-400 max-w-md">
               Solution de traduction vocale en temps réel basée sur des technologies open-source.
             </p>
           </motion.div>
           
           <motion.div 
             className="text-center text-gray-400"
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.3 }}
           >
             <p>&copy; 2025 VoiceTranslate - Tous droits réservés</p>
           </motion.div>
         </div>
       </div>
     </footer>
   </div>
 );
};

export default ConferencePage;  