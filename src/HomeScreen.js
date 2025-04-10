import React, { useState, useEffect } from 'react';
import { Globe, Video, Zap, Check, ChevronRight, Users, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomeScreen = () => {
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

  const languages = ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand', 'Portugais', 'Italien', 'Russe', 'Chinois', 'Japonais', 'Coréen', 'Néerlandais'];

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
            <nav className="hidden md:flex items-center space-x-6">
              {['features', 'how-it-works', 'faq'].map((item, index) => (
                <motion.a 
                  key={item}
                  href={`#${item}`} 
                  className="text-gray-600 hover:text-gray-900 relative"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {item === 'features' ? 'Fonctionnalités' : 
                   item === 'how-it-works' ? 'Comment ça marche' : 'FAQ'}
                  <motion.span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.a>
              ))}
            </nav>
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

      {/* Hero Section avec animation d'entrée */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden relative">
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{ 
            repeat: Infinity,
            repeatType: "mirror",
            duration: 20
          }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: '300px 300px'
          }}
        />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center relative z-0">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Écoutez n'importe quelle conférence dans votre langue
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-3xl opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Traduction vocale en temps réel, totalement gratuite et sans installation
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 flex-wrap justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link to="/conference">
              <motion.button 
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users size={20} className="mr-2" />
                Conférences présentielles
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronRight size={20} className="ml-2" />
                </motion.div>
              </motion.button>
            </Link>
            <Link to="/virtual-meeting">
              <motion.button 
                className="px-8 py-4 bg-purple-500 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Video size={20} className="mr-2" />
                Conférences virtuelles
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ChevronRight size={20} className="ml-2" />
                </motion.div>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features avec animation au défilement */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h3 
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            Pourquoi choisir VoiceTranslate?
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Zap size={32} className="text-blue-500" />, 
                color: "blue", 
                title: "Traduction en temps réel", 
                desc: "Écoutez les traductions instantanément avec une latence minimale."
              },
              { 
                icon: <Check size={32} className="text-green-500" />, 
                color: "green", 
                title: "Totalement gratuit", 
                desc: "Basé sur des technologies open-source, sans frais cachés."
              },
              { 
                icon: <Headphones size={32} className="text-purple-500" />, 
                color: "purple", 
                title: "Autonome", 
                desc: "Fonctionne sans intervention humaine ni configuration complexe."
              },
              { 
                icon: <Users size={32} className="text-blue-500" />, 
                color: "blue", 
                title: "Conférences présentielles", 
                desc: "Écoutez chaque conférence dans votre langue préférée sur votre appareil."
              },
              { 
                icon: <Video size={32} className="text-green-500" />, 
                color: "green", 
                title: "Réunions virtuelles", 
                desc: "Organisez des conférences en ligne avec traduction simultanée."
              },
              { 
                icon: <Globe size={32} className="text-purple-500" />, 
                color: "purple", 
                title: "Multi-plateforme", 
                desc: "Fonctionne sur tous les appareils sans installation."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                <motion.div 
                  className={`bg-${feature.color}-100 p-4 rounded-full mb-4`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works avec animation au défilement */}
      <section id="how-it-works" className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h3 
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            Comment ça marche
          </motion.h3>
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            {[
              { 
                number: 1, 
                title: "Choisissez votre type de conférence", 
                desc: "Sélectionnez entre conférence présentielle ou virtuelle selon vos besoins."
              },
              { 
                number: 2, 
                title: "Configurez votre session", 
                desc: "Créez ou rejoignez une conférence en quelques clics."
              },
              { 
                number: 3, 
                title: "Profitez de la traduction en direct", 
                desc: "Écoutez dans votre langue préférée grâce à notre technologie de traduction en temps réel."
              }
            ].map((step, index) => (
              <React.Fragment key={index}>
                <motion.div 
                  className="flex flex-col items-center text-center md:w-1/3 mb-8 md:mb-0"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ 
                      y: [0, -5, 0],
                      boxShadow: [
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      ]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatDelay: 2,
                      duration: 1, 
                      delay: index * 0.5
                    }}
                  >
                    {step.number}
                  </motion.div>
                  <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                  <p className="text-gray-600">{step.desc}</p>
                </motion.div>
                
                {index < 2 && (
                  <motion.div 
                    className="hidden md:block text-gray-300"
                    animate={{ 
                      x: [0, 5, 0],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5
                    }}
                  >
                    <ChevronRight size={40} />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Languages avec animation */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h3 
            className="text-2xl md:text-3xl font-bold mb-12 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            Langues disponibles
          </motion.h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {languages.map((lang, index) => (
              <motion.div 
                key={lang} 
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ 
                  y: -5, 
                  backgroundColor: "#EBF5FF",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
              >
                <span className="text-lg font-medium">{lang}</span>
              </motion.div>
            ))}
          </div>
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
            Prêt à essayer VoiceTranslate?
          </motion.h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/conference">
              <motion.button 
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Users size={20} className="mr-2" />
                Conférences présentielles
              </motion.button>
            </Link>
            <Link to="/virtual-meeting">
              <motion.button 
                className="px-8 py-4 bg-purple-500 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                animate={{
                  boxShadow: [
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    "0 20px 25px -5px rgba(161, 94, 255, 0.2)",
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  ]
                }}
              >
                <Video size={20} className="mr-2" />
                Conférences virtuelles
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Liens",
                  links: [
                    { name: "Accueil", href: "/" },
                    { name: "Conférences présentielles", href: "/conference" },
                    { name: "Conférences virtuelles", href: "/virtual-meeting" },
                    { name: "Fonctionnalités", href: "#features" },
                    { name: "Comment ça marche", href: "#how-it-works" }
                  ]
                },
                {
                  title: "Ressources",
                  links: [
                    { name: "Documentation", href: "/documentation" },
                    { name: "FAQ", href: "/faq" },
                    { name: "Guide d'utilisation", href: "/guide" }
                  ]
                },
                {
                  title: "Légal",
                  links: [
                    { name: "Conditions d'utilisation", href: "/conditions" },
                    { name: "Politique de confidentialité", href: "/privacy" }
                  ]
                }
              ].map((section, sectionIndex) => (
                <motion.div 
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + (sectionIndex * 0.1) }}
                >
                  <h4 className="font-semibold mb-3">{section.title}</h4>
                  <ul className="space-y-2 text-gray-400">
                    {section.links.map((link, linkIndex) => (
                      <motion.li 
                        key={link.name}
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.href.startsWith('#') ? (
                          <a href={link.href} className="hover:text-white">{link.name}</a>
                        ) : (
                          <Link to={link.href} className="hover:text-white">
                            {link.name}
                          </Link>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div 
            className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p>&copy; 2025 VoiceTranslate - Tous droits réservés</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;