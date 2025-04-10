import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, Mic, Volume2, CheckCircle, X } from 'lucide-react';

const Documentation = () => {
  const [openSection, setOpenSection] = useState('getting-started');

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  const sections = [
    {
      id: 'getting-started',
      title: 'Premiers pas',
      content: (
        <>
          <p className="mb-4">
            VoiceTranslate est une solution de traduction vocale en temps réel qui permet d'écouter des conférences ou des présentations dans la langue de votre choix, sans installation ni matériel supplémentaire.
          </p>
          <h3 className="text-xl font-semibold mb-2 mt-4">Pour commencer :</h3>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>Depuis la page d'accueil, cliquez sur le bouton <strong>"Commencer la traduction"</strong>.</li>
            <li>Sélectionnez la langue source (celle que parle le présentateur) dans le menu déroulant.</li>
            <li>Sélectionnez votre langue cible (celle dans laquelle vous souhaitez écouter) dans le deuxième menu.</li>
            <li>Cliquez sur <strong>"Démarrer la traduction"</strong> pour commencer.</li>
            <li>Placez votre appareil près de la source audio ou connectez-le au système sonore.</li>
          </ol>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
            <p className="text-blue-700">
              <strong>Conseil :</strong> Pour une meilleure expérience, utilisez des écouteurs ou un casque pour écouter la traduction.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'interface',
      title: 'Interface utilisateur',
      content: (
        <>
          <p className="mb-4">
            L'interface de VoiceTranslate est conçue pour être simple et intuitive. Voici les principaux éléments que vous rencontrerez :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <Mic size={20} className="text-blue-500 mr-2" />
                <h4 className="font-semibold">Contrôles d'entrée audio</h4>
              </div>
              <p className="text-gray-700">
                Affiche le statut de l'entrée audio et permet d'ajuster la sensibilité du microphone.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <Volume2 size={20} className="text-blue-500 mr-2" />
                <h4 className="font-semibold">Contrôles de sortie audio</h4>
              </div>
              <p className="text-gray-700">
                Permet d'ajuster le volume de la traduction et de choisir le périphérique de sortie audio.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <CheckCircle size={20} className="text-green-500 mr-2" />
                <h4 className="font-semibold">Indicateur de qualité</h4>
              </div>
              <p className="text-gray-700">
                Affiche la qualité de la reconnaissance vocale et de la traduction en temps réel.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-2">
                <X size={20} className="text-red-500 mr-2" />
                <h4 className="font-semibold">Bouton d'arrêt</h4>
              </div>
              <p className="text-gray-700">
                Arrête la traduction en cours et réinitialise l'application.
              </p>
            </div>
          </div>
          <p className="mt-4">
            Toutes les commandes sont accessibles depuis un seul écran pour faciliter l'utilisation pendant une conférence ou une présentation.
          </p>
        </>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Dépannage',
      content: (
        <>
          <h3 className="text-xl font-semibold mb-4">Problèmes courants et solutions</h3>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h4 className="font-semibold text-lg mb-2">La traduction ne fonctionne pas ou est incorrecte</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Vérifiez que vous avez sélectionné la bonne langue source.</li>
                <li>Assurez-vous que votre appareil est suffisamment proche de la source audio.</li>
                <li>Réduisez les bruits de fond si possible.</li>
                <li>Si vous utilisez un système de sonorisation, essayez de connecter directement votre appareil à la sortie audio.</li>
              </ul>
            </div>
            <div className="border-b pb-4">
              <h4 className="font-semibold text-lg mb-2">Le son est trop faible ou inaudible</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Augmentez le volume de votre appareil.</li>
                <li>Vérifiez que vos écouteurs ou haut-parleurs sont correctement connectés.</li>
                <li>Ajustez le niveau de volume dans les paramètres de l'application.</li>
              </ul>
            </div>
            <div className="border-b pb-4">
              <h4 className="font-semibold text-lg mb-2">L'application se bloque ou s'arrête</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Rafraîchissez la page pour redémarrer l'application.</li>
                <li>Vérifiez votre connexion internet (bien que la plupart des fonctionnalités fonctionnent hors ligne).</li>
                <li>Si le problème persiste, essayez de fermer et de rouvrir votre navigateur.</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
            <p className="text-yellow-700">
              <strong>Note :</strong> La qualité de la traduction dépend fortement de la clarté de la source audio et de l'absence de bruit de fond. Les environnements bruyants peuvent réduire significativement la précision.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'advanced',
      title: 'Fonctionnalités avancées',
      content: (
        <>
          <p className="mb-4">
            VoiceTranslate offre plusieurs fonctionnalités avancées pour les utilisateurs qui souhaitent personnaliser leur expérience :
          </p>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">Mode hors ligne</h3>
          <p className="mb-4">
            Vous pouvez précharger des paires de langues pour une utilisation ultérieure sans connexion internet. Pour cela :
          </p>
          <ol className="list-decimal pl-6 mb-4 space-y-1">
            <li>Accédez aux paramètres de l'application.</li>
            <li>Sélectionnez "Télécharger les langues".</li>
            <li>Choisissez les paires de langues que vous souhaitez utiliser hors ligne.</li>
            <li>Cliquez sur "Télécharger" et attendez que le téléchargement soit terminé.</li>
          </ol>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">Personnalisation du vocabulaire</h3>
          <p className="mb-4">
            Pour améliorer la précision de la traduction pour des termes spécifiques ou techniques :
          </p>
          <ol className="list-decimal pl-6 mb-4 space-y-1">
            <li>Accédez aux paramètres avancés.</li>
            <li>Sélectionnez "Vocabulaire personnalisé".</li>
            <li>Ajoutez des termes spécifiques et leur traduction dans les langues que vous utilisez.</li>
            <li>Ces termes seront prioritaires lors de la traduction.</li>
          </ol>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">Transcription écrite</h3>
          <p className="mb-4">
            En plus de la traduction audio, vous pouvez activer la transcription écrite :
          </p>
          <ol className="list-decimal pl-6 mb-4 space-y-1">
            <li>Pendant une session de traduction, activez le bouton "Transcription" en bas de l'écran.</li>
            <li>La transcription apparaîtra en temps réel sous les contrôles audio.</li>
            <li>Vous pouvez télécharger la transcription complète à la fin de la session.</li>
          </ol>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
            <p className="text-blue-700">
              <strong>Conseil pro :</strong> La combinaison du mode hors ligne et du vocabulaire personnalisé est particulièrement utile pour les conférences techniques ou spécialisées où des termes spécifiques sont fréquemment utilisés.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'technologies',
      title: 'Technologies utilisées',
      content: (
        <>
          <p className="mb-6">
            VoiceTranslate utilise plusieurs technologies open-source pour fournir une traduction vocale en temps réel de haute qualité :
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Reconnaissance vocale</h3>
              <p>
                Basée sur des modèles de deep learning optimisés pour fonctionner dans le navigateur. Ces modèles sont entraînés sur des millions d'heures d'audio dans diverses langues pour assurer une reconnaissance précise même dans des environnements bruyants.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Traduction automatique</h3>
              <p>
                Utilise des réseaux de neurones de type transformer, similaires à ceux utilisés par les systèmes de traduction professionnels. Ces modèles sont capables de comprendre le contexte et de produire des traductions naturelles et fluides.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Synthèse vocale</h3>
              <p>
                Convertit le texte traduit en parole naturelle en utilisant des techniques avancées de génération vocale. Les voix sont optimisées pour être claires et compréhensibles tout en conservant un débit naturel.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Traitement en temps réel</h3>
              <p>
                Toutes ces technologies sont optimisées pour fonctionner ensemble avec une latence minimale, permettant une expérience de traduction fluide et naturelle même sur des appareils mobiles ou plus anciens.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Contributions</h3>
            <p>
              VoiceTranslate est un projet open-source et nous accueillons les contributions de la communauté. Si vous souhaitez participer au développement, visitez notre dépôt GitHub pour plus d'informations.
            </p>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center text-blue-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            <span>Retour à l'accueil</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Documentation</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <motion.div 
            className="md:w-64 shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Table des matières</h2>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                        openSection === section.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleSection(section.id)}
                    >
                      <span>{section.title}</span>
                      {openSection === section.id ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Documentation VoiceTranslate</h1>
                <p className="text-lg text-gray-600 mb-8">
                  Bienvenue dans la documentation de VoiceTranslate. Cette guide vous aidera à tirer le meilleur parti de notre service de traduction vocale en temps réel.
                </p>

                <div className="space-y-8">
                  {sections.map((section) => (
                    <motion.div
                      key={section.id}
                      id={section.id}
                      className={`border-t pt-6 ${openSection === section.id ? 'block' : 'hidden'}`}
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">{section.title}</h2>
                      <div className="prose max-w-none text-gray-700">
                        {section.content}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer simplifié */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 VoiceTranslate - Tous droits réservés</p>
          <div className="flex justify-center mt-2 space-x-4">
            <Link to="/conditions" className="text-gray-400 hover:text-white transition">Conditions d'utilisation</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white transition">Politique de confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Documentation;