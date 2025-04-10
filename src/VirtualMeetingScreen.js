import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, ArrowLeft, Video, Plus, LogIn, Users } from 'lucide-react';

const VirtualMeetingScreen = () => {
  const navigate = useNavigate();

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
            <Link to="/">
              <motion.button
                className="flex items-center text-gray-600 hover:text-gray-900"
                whileHover={{ scale: 1.05 }}
              >
                <ArrowLeft size={20} className="mr-1" />
                Retour à l'accueil
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <motion.div
          className="max-w-4xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-block p-3 bg-green-100 text-green-600 rounded-full mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Video size={32} />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Conférences virtuelles</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Créez ou rejoignez une conférence virtuelle avec traduction simultanée en temps réel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Meeting Card */}
            <motion.div
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Plus size={24} />
                  </div>
                  <h2 className="text-xl font-bold ml-2">Créer une réunion</h2>
                </div>
                <p className="opacity-80">
                  Créez votre propre réunion et invitez d'autres participants en partageant le code unique.
                </p>
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="text-green-500 mr-2">•</div>
                    <p className="text-gray-600">Définissez la langue principale de la conférence</p>
                  </li>
                  <li className="flex items-start">
                    <div className="text-green-500 mr-2">•</div>
                    <p className="text-gray-600">Choisissez les langues de traduction disponibles</p>
                  </li>
                  <li className="flex items-start">
                    <div className="text-green-500 mr-2">•</div>
                    <p className="text-gray-600">Obtenez un code unique à partager avec les participants</p>
                  </li>
                </ul>

                <Link to="/virtual-meeting/create">
                  <motion.button
                    className="w-full py-3 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center"
                    whileHover={{ backgroundColor: "#16a34a" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={18} className="mr-2" />
                    Créer une réunion
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Join Meeting Card */}
            <motion.div
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <LogIn size={24} />
                  </div>
                  <h2 className="text-xl font-bold ml-2">Rejoindre une réunion</h2>
                </div>
                <p className="opacity-80">
                  Rejoignez une réunion existante en saisissant le code fourni par l'organisateur.
                </p>
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="text-blue-500 mr-2">•</div>
                    <p className="text-gray-600">Entrez le code de la réunion</p>
                  </li>
                  <li className="flex items-start">
                    <div className="text-blue-500 mr-2">•</div>
                    <p className="text-gray-600">Choisissez votre langue préférée pour la traduction</p>
                  </li>
                  <li className="flex items-start">
                    <div className="text-blue-500 mr-2">•</div>
                    <p className="text-gray-600">Connectez-vous immédiatement à la conférence</p>
                  </li>
                </ul>

                <Link to="/virtual-meeting/join">
                  <motion.button
                    className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center"
                    whileHover={{ backgroundColor: "#2563eb" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn size={18} className="mr-2" />
                    Rejoindre une réunion
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Features section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              Fonctionnalités des conférences virtuelles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Video className="text-green-500" />,
                  title: "Vidéoconférence HD",
                  description: "Profitez d'une qualité audio et vidéo optimale pour vos réunions."
                },
                {
                  icon: <Globe className="text-blue-500" />,
                  title: "Traduction en temps réel",
                  description: "Écoutez et participez dans votre langue maternelle sans barrière."
                },
                {
                  icon: <Users className="text-purple-500" />,
                  title: "Jusqu'à 30 participants",
                  description: "Idéal pour des petites et moyennes équipes internationales."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <motion.div
                    className="p-3 bg-gray-100 inline-block rounded-full mb-4"
                    whileHover={{ rotate: 10 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 VoiceTranslate - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};

export default VirtualMeetingScreen;