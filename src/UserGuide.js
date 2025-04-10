import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic, VolumeX, Volume2, Headphones, RotateCw, Download, Clock, Moon, Settings, Languages } from 'lucide-react';

const UserGuide = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center text-blue-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            <span>Retour à l'accueil</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Guide d'utilisation</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Guide d'utilisation de VoiceTranslate</h1>
            <p className="text-lg text-gray-600 mb-8">
              Ce guide vous présente, étape par étape, comment utiliser VoiceTranslate pour traduire des conférences et des présentations en temps réel.
            </p>

            <div className="space-y-12">
              {/* Section 1: Démarrage rapide */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <Clock size={24} className="mr-2 text-blue-500" />
                  Démarrage rapide
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p>
                    Voici les étapes essentielles pour commencer à utiliser VoiceTranslate en moins d'une minute :
                  </p>
                  
                  <ol className="mt-4 space-y-4">
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">1</span>
                      <div>
                        <strong>Ouvrez VoiceTranslate</strong> dans votre navigateur ou application mobile et cliquez sur le bouton "Commencer la traduction" depuis la page d'accueil.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">2</span>
                      <div>
                        <strong>Sélectionnez la langue source</strong> (la langue parlée par l'orateur) dans le premier menu déroulant.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">3</span>
                      <div>
                        <strong>Sélectionnez votre langue cible</strong> (la langue dans laquelle vous souhaitez écouter) dans le second menu déroulant.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">4</span>
                      <div>
                        <strong>Cliquez sur "Démarrer la traduction"</strong> et placez votre appareil à proximité de la source audio ou connectez-le au système de sonorisation si possible.
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">5</span>
                      <div>
                        <strong>Mettez vos écouteurs</strong> et ajustez le volume à un niveau confortable.
                      </div>
                    </li>
                  </ol>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
                    <p className="text-yellow-700">
                      <strong>Conseil :</strong> Pour une expérience optimale, utilisez des écouteurs et assurez-vous que votre appareil est suffisamment chargé ou connecté à une source d'alimentation.
                    </p>
                  </div>
                </div>
              </section>
              
              {/* Section 2: Interface utilisateur */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <Settings size={24} className="mr-2 text-blue-500" />
                  Interface utilisateur
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p>
                    L'interface de VoiceTranslate est conçue pour être simple et intuitive. Voici les principaux éléments que vous retrouverez sur l'écran de traduction :
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <Languages size={20} className="text-blue-500 mr-2" />
                        <h4 className="font-semibold">Sélecteurs de langues</h4>
                      </div>
                      <p className="text-sm">
                        En haut de l'écran, vous trouverez deux menus déroulants pour sélectionner la langue source et la langue cible.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <Mic size={20} className="text-blue-500 mr-2" />
                        <h4 className="font-semibold">Statut du microphone</h4>
                      </div>
                      <p className="text-sm">
                        Un indicateur visuel qui montre si le microphone capture correctement l'audio, avec un niveau d'intensité sonore.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <Volume2 size={20} className="text-blue-500 mr-2" />
                        <h4 className="font-semibold">Contrôles de volume</h4>
                      </div>
                      <p className="text-sm">
                        Un curseur pour ajuster le volume de la traduction audio, ainsi qu'un bouton de sourdine rapide.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <RotateCw size={20} className="text-blue-500 mr-2" />
                        <h4 className="font-semibold">Bouton de réinitialisation</h4>
                      </div>
                      <p className="text-sm">
                        Permet de réinitialiser la session de traduction en cas de problème ou pour changer de langues.
                      </p>
                    </div>
                  </div>
                  
                  <p>
                    Si vous activez la transcription écrite (optionnelle), un panneau s'affichera sous les contrôles principaux pour montrer le texte traduit en temps réel.
                  </p>
                </div>
              </section>
              
              {/* Section 3: Conseils pratiques */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <Headphones size={24} className="mr-2 text-blue-500" />
                  Conseils pratiques
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p>
                    Pour tirer le meilleur parti de VoiceTranslate, voici quelques conseils pratiques :
                  </p>
                  
                  <div className="space-y-4 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex">
                      <div className="flex-shrink-0 mr-3">
                        <Mic size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Optimisez la capture audio</h4>
                        <p className="text-sm">
                          Placez votre appareil aussi près que possible de la source audio. Si possible, utilisez un microphone externe ou connectez-vous directement au système de sonorisation de la conférence.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex">
                      <div className="flex-shrink-0 mr-3">
                        <VolumeX size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Réduisez les bruits de fond</h4>
                        <p className="text-sm">
                          Choisissez un emplacement avec peu de bruits ambiants. Si vous êtes dans un environnement bruyant, utilisez l'option "Réduction de bruit" dans les paramètres avancés.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex">
                      <div className="flex-shrink-0 mr-3">
                        <Headphones size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Utilisez des écouteurs de qualité</h4>
                        <p className="text-sm">
                          Des écouteurs de bonne qualité amélioreront significativement votre expérience d'écoute. Les écouteurs avec réduction de bruit sont particulièrement recommandés.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex">
                      <div className="flex-shrink-0 mr-3">
                        <Moon size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Activez le mode économie d'énergie</h4>
                        <p className="text-sm">
                          Pour les longues sessions, activez le "Mode économie d'énergie" dans les paramètres pour prolonger l'autonomie de votre batterie.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Section 4: Fonctionnalités avancées */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <Settings size={24} className="mr-2 text-blue-500" />
                  Fonctionnalités avancées
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p>
                    VoiceTranslate propose plusieurs fonctionnalités avancées pour répondre à des besoins spécifiques :
                  </p>
                  
                  <div className="mt-4 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold flex items-center">
                        <Download size={18} className="text-blue-500 mr-2" />
                        Mode hors ligne
                      </h4>
                      <p className="mt-1">
                        Pour utiliser VoiceTranslate sans connexion internet :
                      </p>
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>Allez dans "Paramètres" {'>'}  "Téléchargement des langues"</li>
                        <li>Sélectionnez les paires de langues que vous souhaitez utiliser hors ligne</li>
                        <li>Cliquez sur "Télécharger" et attendez que les modèles soient téléchargés</li>
                        <li>Une fois téléchargés, les modèles resteront disponibles même sans connexion</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold flex items-center">
                        <Download size={18} className="text-blue-500 mr-2" />
                        Transcription et enregistrement
                      </h4>
                      <p className="mt-1">
                        Pour enregistrer la traduction sous forme de texte :
                      </p>
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>Pendant une session de traduction, activez l'option "Transcription" en bas de l'écran</li>
                        <li>Le texte traduit s'affichera en temps réel sous les contrôles principaux</li>
                        <li>À la fin de la session, cliquez sur "Enregistrer la transcription"</li>
                        <li>Choisissez le format (TXT, PDF, DOCX) et l'emplacement d'enregistrement</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold flex items-center">
                        <Settings size={18} className="text-blue-500 mr-2" />
                        Personnalisation du vocabulaire
                      </h4>
                      <p className="mt-1">
                        Pour améliorer la traduction de termes spécifiques :
                      </p>
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>Accédez à "Paramètres" {'>'}  "Vocabulaire personnalisé"</li>
                        <li>Cliquez sur "Ajouter un terme"</li>
                        <li>Entrez le terme dans la langue source et sa traduction dans la langue cible</li>
                        <li>Vous pouvez aussi importer une liste de termes au format CSV</li>
                      </ol>
                      <p className="mt-2">
                        Cette fonctionnalité est particulièrement utile pour les conférences techniques ou spécialisées où des termes spécifiques sont utilisés.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Section 5: Dépannage */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <RotateCw size={24} className="mr-2 text-blue-500" />
                  Dépannage
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p>
                    Si vous rencontrez des problèmes avec VoiceTranslate, voici les solutions aux problèmes les plus courants :
                  </p>
                  
                  <div className="mt-4 space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold">La traduction ne démarre pas</h4>
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>Vérifiez que vous avez autorisé l'accès au microphone dans votre navigateur</li>
                        <li>Assurez-vous que votre microphone fonctionne correctement</li>
                        <li>Essayez de rafraîchir la page et de redémarrer la session</li>
                        <li>Vérifiez votre connexion internet (sauf si vous utilisez le mode hors ligne)</li>
                      </ol>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold">La qualité de la traduction est mauvaise</h4>
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>Vérifiez que vous avez sélectionné les bonnes langues</li>
                        <li>Rapprochez votre appareil de la source audio</li>
                        <li>Réduisez les bruits de fond</li>
                        <li>Utilisez la personnalisation du vocabulaire pour les termes spécifiques</li>
                        <li>Si vous êtes en mode hors ligne, passez en mode en ligne pour une meilleure qualité si possible</li>
                      </ol>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold">L'application consomme beaucoup de batterie</h4>
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>Activez le "Mode économie d'énergie" dans les paramètres</li>
                        <li>Réduisez la luminosité de votre écran</li>
                        <li>Fermez les autres applications en arrière-plan</li>
                        <li>Connectez votre appareil à une source d'alimentation si possible</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                    <h4 className="font-semibold mb-2">Besoin d'aide supplémentaire ?</h4>
                    <p>
                      Si vous rencontrez toujours des problèmes, consultez notre <Link to="/faq" className="text-blue-500 hover:underline">FAQ</Link> ou contactez notre support technique à <a href="mailto:support@voicetranslate.com" className="text-blue-500 hover:underline">support@voicetranslate.com</a>.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
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

export default UserGuide;