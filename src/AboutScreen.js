import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Zap, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutScreen = () => {
  const features = [
    {
      icon: <Zap size={32} className="text-blue-500" />,
      title: "Technologie de Pointe",
      description: "Notre solution utilise les dernières avancées en intelligence artificielle et en traduction automatique pour offrir des traductions précises et en temps réel."
    },
    {
      icon: <Globe size={32} className="text-green-500" />,
      title: "Couverture Multilingue",
      description: "Nous supportons plus de 12 langues, permettant une communication sans frontières dans divers contextes professionnels et académiques."
    },
    {
      icon: <Shield size={32} className="text-purple-500" />,
      title: "Confidentialité Garantie",
      description: "Vos données sont protégées. Nous utilisons des protocoles de sécurité avancés pour garantir la confidentialité de vos conversations."
    },
    {
      icon: <Users size={32} className="text-orange-500" />,
      title: "Accessibilité Universelle",
      description: "Conçu pour être simple et intuitif, VoiceTranslate rend la traduction accessible à tous, sans nécessiter de compétences techniques."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <Globe size={24} />
            </div>
            <h1 className="text-xl font-bold ml-2 text-gray-800">VoiceTranslate</h1>
          </div>
          <nav>
            <Link to="/" className="text-gray-600 hover:text-blue-500">Retour à l'accueil</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h2 
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            À propos de VoiceTranslate
          </motion.h2>
          <motion.p 
            className="text-xl max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Une solution révolutionnaire de traduction vocale en temps réel, conçue pour éliminer les barrières linguistiques et faciliter la communication globale.
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-md flex items-center"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="mr-6">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h3 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Notre Mission
          </motion.h3>
          <motion.p 
            className="text-xl max-w-3xl mx-auto text-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Nous croyons que la communication sans frontières est essentielle dans notre monde interconnecté. 
            VoiceTranslate vise à rendre l'information accessible à tous, indépendamment de la langue parlée, 
            en utilisant les technologies les plus avancées de traduction en temps réel.
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-500 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h3 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Prêt à briser les barrières linguistiques?
          </motion.h3>
          <Link to="/Language">
            <motion.button 
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Commencer maintenant
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 VoiceTranslate - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutScreen;