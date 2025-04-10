import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="flex items-center text-blue-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            <span>Retour à l'accueil</span>
          </Link>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Politique de Confidentialité</h1>
            <p className="text-gray-500 mb-8">Dernière mise à jour : 1 avril 2025</p>

            <div className="prose max-w-none text-gray-700">
              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Introduction</h2>
              <p className="mb-4">
                Bienvenue sur la politique de confidentialité de VoiceTranslate. Chez VoiceTranslate, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre service de traduction vocale en temps réel.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Informations que nous collectons</h2>
              <p className="mb-4">
                <strong>Informations d'utilisation :</strong> Nous recueillons des données sur la façon dont vous utilisez notre service, notamment les langues sélectionnées, la fréquence d'utilisation et les fonctionnalités que vous utilisez le plus souvent.
              </p>
              <p className="mb-4">
                <strong>Données audio :</strong> Pour fournir notre service de traduction vocale, nous traitons les données audio que vous nous fournissez pendant l'utilisation du service. Ces données sont traitées en temps réel et ne sont pas stockées de manière permanente sur nos serveurs.
              </p>
              <p className="mb-4">
                <strong>Informations sur l'appareil :</strong> Nous collectons des informations sur l'appareil que vous utilisez pour accéder à notre service, y compris le modèle de l'appareil, le système d'exploitation, la version du navigateur et d'autres identifiants uniques.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Comment nous utilisons vos informations</h2>
              <p className="mb-4">Nous utilisons les informations que nous collectons pour :</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Fournir, maintenir et améliorer notre service de traduction</li>
                <li>Développer de nouvelles fonctionnalités et services</li>
                <li>Comprendre comment nos utilisateurs utilisent le service</li>
                <li>Détecter, prévenir et résoudre les problèmes techniques</li>
                <li>Protéger contre les utilisations frauduleuses ou illégales</li>
              </ul>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Partage de vos informations</h2>
              <p className="mb-4">
                Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons partager vos informations dans les circonstances suivantes :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Avec des fournisseurs de services qui nous aident à fournir notre service</li>
                <li>Pour se conformer à la loi, à une procédure judiciaire ou à une demande gouvernementale</li>
                <li>Pour protéger les droits, la propriété ou la sécurité de VoiceTranslate, de nos utilisateurs ou du public</li>
              </ul>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Sécurité de vos données</h2>
              <p className="mb-4">
                La sécurité de vos données est importante pour nous. Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations contre tout accès, utilisation, divulgation, altération ou destruction non autorisés.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Vos droits</h2>
              <p className="mb-4">
                En fonction de votre lieu de résidence, vous pouvez avoir certains droits concernant vos données personnelles, notamment :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Le droit d'accéder à vos données personnelles</li>
                <li>Le droit de rectifier vos données personnelles si elles sont inexactes ou incomplètes</li>
                <li>Le droit de supprimer vos données personnelles</li>
                <li>Le droit de limiter le traitement de vos données personnelles</li>
                <li>Le droit de vous opposer au traitement de vos données personnelles</li>
                <li>Le droit à la portabilité des données</li>
              </ul>
              <p className="mb-4">
                Pour exercer ces droits, veuillez nous contacter à l'adresse indiquée ci-dessous.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Modifications de cette politique</h2>
              <p className="mb-4">
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page et en mettant à jour la date de "dernière mise à jour" en haut de cette politique.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Nous contacter</h2>
              <p className="mb-4">
                Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à :
                <br />
                <a href="mailto:contact@voicetranslate.com" className="text-blue-500 hover:underline">contact@voicetranslate.com</a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer simplifié */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 VoiceTranslate - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;