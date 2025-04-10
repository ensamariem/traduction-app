import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openQuestions, setOpenQuestions] = useState([0]);

  const toggleQuestion = (index) => {
    if (openQuestions.includes(index)) {
      setOpenQuestions(openQuestions.filter(i => i !== index));
    } else {
      setOpenQuestions([...openQuestions, index]);
    }
  };

  const faqItems = [
    {
      question: "Comment fonctionne VoiceTranslate ?",
      answer: (
        <>
          <p>
            VoiceTranslate utilise des technologies avancées de reconnaissance vocale, de traduction automatique et de synthèse vocale pour permettre la traduction en temps réel.
          </p>
          <p className="mt-2">
            Le processus se déroule en trois étapes :
          </p>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            <li>Votre appareil capte l'audio de la conférence ou de la présentation.</li>
            <li>Notre moteur de reconnaissance vocale convertit cet audio en texte dans la langue source.</li>
            <li>Ce texte est traduit dans la langue cible puis converti en parole que vous entendez dans vos écouteurs.</li>
          </ol>
          <p className="mt-2">
            Tout ce processus se déroule en quelques millisecondes, vous permettant de suivre la conversation presque sans délai.
          </p>
        </>
      )
    },
    {
      question: "VoiceTranslate est-il vraiment gratuit ?",
      answer: (
        <>
          <p>
            Oui, VoiceTranslate est entièrement gratuit pour un usage personnel. Nous sommes convaincus que la barrière de la langue ne devrait pas être un obstacle à la communication et au partage des connaissances.
          </p>
          <p className="mt-2">
            Notre service est financé par des dons de la communauté et par des licences d'entreprise pour les utilisations professionnelles à grande échelle.
          </p>
          <p className="mt-2">
            Il n'y a pas de limitations artificielles, de publicités, ni de fonctionnalités premium cachées derrière un paywall.
          </p>
        </>
      )
    },
    {
      question: "Ai-je besoin d'une connexion Internet pour utiliser VoiceTranslate ?",
      answer: (
        <>
          <p>
            VoiceTranslate fonctionne principalement dans votre navigateur, et bien qu'une connexion Internet soit recommandée pour des performances optimales, vous pouvez précharger des paires de langues pour une utilisation hors ligne.
          </p>
          <p className="mt-2">
            Pour utiliser le mode hors ligne :
          </p>
          <ol className="list-decimal pl-6 mt-2 space-y-1">
            <li>Assurez-vous d'être connecté à Internet.</li>
            <li>Accédez aux paramètres et sélectionnez "Télécharger les langues".</li>
            <li>Choisissez les paires de langues dont vous aurez besoin.</li>
            <li>Une fois téléchargées, ces paires de langues fonctionneront même sans connexion Internet.</li>
          </ol>
          <p className="mt-2">
            Notez que les modèles hors ligne sont légèrement moins précis que les modèles en ligne, mais ils sont parfaitement adaptés à la plupart des situations.
          </p>
        </>
      )
    },
    {
      question: "Quelles langues sont prises en charge ?",
      answer: (
        <>
          <p>
            VoiceTranslate prend actuellement en charge 12 langues principales :
          </p>
          <ul className="grid grid-cols-2 gap-2 mt-2">
            <li>Français</li>
            <li>Anglais</li>
            <li>Espagnol</li>
            <li>Allemand</li>
            <li>Italien</li>
            <li>Portugais</li>
            <li>Russe</li>
            <li>Arabe</li>
            <li>Chinois (Mandarin)</li>
            <li>Japonais</li>
            <li>Coréen</li>
            <li>Néerlandais</li>
          </ul>
          <p className="mt-2">
            Nous travaillons continuellement à l'ajout de nouvelles langues. Vous pouvez consulter notre page de documentation pour la liste complète et à jour des langues disponibles.
          </p>
        </>
      )
    },
    {
      question: "La traduction est-elle précise ?",
      answer: (
        <>
          <p>
            La précision de VoiceTranslate est généralement très bonne, surtout pour les conversations générales et les présentations structurées. Nos modèles de traduction sont régulièrement améliorés et mis à jour.
          </p>
          <p className="mt-2">
            Cependant, comme tout système de traduction automatique, la précision peut varier en fonction de plusieurs facteurs :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>La clarté de la parole source</li>
            <li>La présence de bruit de fond</li>
            <li>Les accents ou particularités de prononciation</li>
            <li>L'utilisation de jargon technique ou de termes très spécifiques</li>
            <li>Les expressions idiomatiques ou culturelles</li>
          </ul>
          <p className="mt-2">
            Pour les contextes techniques ou spécialisés, nous recommandons d'utiliser notre fonction de vocabulaire personnalisé pour améliorer la précision de la traduction des termes spécifiques.
          </p>
        </>
      )
    },
    {
      question: "Comment puis-je améliorer la qualité de la traduction ?",
      answer: (
        <>
          <p>
            Plusieurs facteurs peuvent améliorer significativement la qualité de la traduction :
          </p>
          <ol className="list-decimal pl-6 mt-2 space-y-2">
            <li>
              <strong>Minimisez le bruit de fond</strong> - Essayez d'utiliser VoiceTranslate dans un environnement aussi calme que possible ou placez votre appareil près de la source audio.
            </li>
            <li>
              <strong>Utilisez un microphone externe</strong> - Si disponible, un microphone externe peut améliorer considérablement la capture audio.
            </li>
            <li>
              <strong>Connexion directe</strong> - Si possible, connectez votre appareil directement à la source audio (comme le système de sonorisation d'une conférence).
            </li>
            <li>
              <strong>Personnalisez le vocabulaire</strong> - Pour les conférences techniques ou spécialisées, ajoutez les termes spécifiques au vocabulaire personnalisé.
            </li>
            <li>
              <strong>Mise à jour</strong> - Assurez-vous d'utiliser la dernière version de VoiceTranslate en rafraîchissant régulièrement votre navigateur.
            </li>
          </ol>
        </>
      )
    },
    {
      question: "VoiceTranslate respecte-t-il ma vie privée ?",
      answer: (
        <>
          <p>
            La confidentialité est une priorité absolue pour nous. Voici comment nous protégeons vos données :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Traitement local</strong> - La majeure partie du traitement se fait directement sur votre appareil, sans envoyer les données audio à nos serveurs.
            </li>
            <li>
              <strong>Aucun enregistrement</strong> - Nous ne stockons pas les conversations traduites.
            </li>
            <li>
              <strong>Données anonymisées</strong> - Les statistiques d'utilisation sont entièrement anonymisées et utilisées uniquement pour améliorer le service.
            </li>
            <li>
              <strong>Aucune publicité</strong> - Nous ne vendons pas vos données à des annonceurs.
            </li>
          </ul>
          <p className="mt-2">
            Pour plus de détails, veuillez consulter notre <Link to="/privacy" className="text-blue-500 hover:underline">Politique de confidentialité</Link>.
          </p>
        </>
      )
    },
    {
      question: "Puis-je utiliser VoiceTranslate pour des événements professionnels ?",
      answer: (
        <>
          <p>
            Absolument ! VoiceTranslate est parfaitement adapté aux événements professionnels comme :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Conférences internationales</li>
            <li>Réunions d'entreprise multilingues</li>
            <li>Webinaires</li>
            <li>Sessions de formation</li>
            <li>Négociations commerciales</li>
          </ul>
          <p className="mt-2">
            Pour les événements de grande envergure ou les utilisations commerciales intensives, nous proposons également des licences d'entreprise avec des fonctionnalités supplémentaires comme :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Support technique dédié</li>
            <li>Intégration avec les systèmes de conférence existants</li>
            <li>Personnalisation avancée du vocabulaire spécifique à votre industrie</li>
            <li>Formation pour les administrateurs</li>
          </ul>
          <p className="mt-2">
            Contactez-nous à <a href="mailto:enterprise@voicetranslate.com" className="text-blue-500 hover:underline">enterprise@voicetranslate.com</a> pour plus d'informations sur nos solutions professionnelles.
          </p>
        </>
      )
    },
    {
      question: "Comment puis-je contribuer au projet VoiceTranslate ?",
      answer: (
        <>
          <p>
            VoiceTranslate est un projet open-source et nous accueillons avec enthousiasme les contributions de la communauté. Voici comment vous pouvez participer :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              <strong>Développement</strong> - Si vous êtes développeur, vous pouvez contribuer au code sur notre dépôt GitHub. Nous sommes particulièrement intéressés par les améliorations des modèles de reconnaissance vocale, de traduction et de synthèse vocale.
            </li>
            <li>
              <strong>Traduction</strong> - Aidez-nous à traduire l'interface dans de nouvelles langues ou à améliorer les traductions existantes.
            </li>
            <li>
              <strong>Tests</strong> - Testez VoiceTranslate dans différentes conditions et langues, et signalez les problèmes ou suggérez des améliorations.
            </li>
            <li>
              <strong>Documentation</strong> - Contribuez à améliorer notre documentation pour aider les autres utilisateurs.
            </li>
            <li>
              <strong>Dons</strong> - Si vous appréciez VoiceTranslate et souhaitez soutenir son développement, vous pouvez faire un don via notre page de dons.
            </li>
            <li>
              <strong>Partage</strong> - Partagez VoiceTranslate avec votre réseau et aidez-nous à faire connaître le projet.
            </li>
          </ul>
          <p className="mt-2">
            Pour plus d'informations sur la façon de contribuer, consultez notre page GitHub ou contactez-nous directement.
          </p>
        </>
      )
    },
    {
      question: "VoiceTranslate fonctionne-t-il sur tous les appareils ?",
      answer: (
        <>
          <p>
            VoiceTranslate est une application web qui fonctionne dans la plupart des navigateurs modernes sur différents types d'appareils :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Ordinateurs</strong> - Windows, MacOS, Linux avec les navigateurs Chrome, Firefox, Safari, ou Edge.
            </li>
            <li>
              <strong>Smartphones et tablettes</strong> - iOS et Android avec les navigateurs mobiles Chrome, Safari, ou Firefox.
            </li>
          </ul>
          <p className="mt-2">
            Pour des performances optimales, nous recommandons :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Des navigateurs à jour</li>
            <li>Un minimum de 4GB de RAM pour les ordinateurs</li>
            <li>Des appareils mobiles de moyenne à haute gamme pour une expérience fluide</li>
          </ul>
          <p className="mt-2">
            Nous avons également des applications natives pour iOS et Android qui offrent des fonctionnalités supplémentaires et des performances optimisées. Elles sont disponibles gratuitement sur l'App Store et Google Play.
          </p>
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
          <h1 className="text-xl font-bold text-gray-800">Foire Aux Questions</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Questions fréquemment posées</h1>
            <p className="text-gray-600 mb-8">
              Trouvez rapidement des réponses aux questions les plus courantes sur VoiceTranslate. Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à consulter notre <Link to="/documentation" className="text-blue-500 hover:underline">documentation complète</Link> ou à nous <a href="mailto:support@voicetranslate.com" className="text-blue-500 hover:underline">contacter directement</a>.
            </p>

            <div className="space-y-4 mt-8">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex items-center justify-between font-medium transition-colors"
                    onClick={() => toggleQuestion(index)}
                  >
                    <span>{item.question}</span>
                    {openQuestions.includes(index) ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </button>
                  
                  {openQuestions.includes(index) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="px-6 py-4 bg-gray-50 border-t border-gray-200"
                    >
                      <div className="prose max-w-none text-gray-700">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold mb-2 text-blue-800">Vous avez une autre question ?</h3>
              <p className="text-blue-700 mb-4">
                Si vous ne trouvez pas la réponse que vous cherchez, n'hésitez pas à nous contacter directement.
              </p>
              <a 
                href="mailto:support@voicetranslate.com" 
                className="inline-block px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Contactez notre support
              </a>
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

export default FAQ;