import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Conditions d'utilisation</h1>
            <p className="text-gray-500 mb-8">Dernière mise à jour : 1 avril 2025</p>

            <div className="prose max-w-none text-gray-700">
              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">1. Acceptation des conditions</h2>
              <p className="mb-4">
                En accédant ou en utilisant le service VoiceTranslate, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas accéder ou utiliser notre service.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">2. Description du service</h2>
              <p className="mb-4">
                VoiceTranslate est un service de traduction vocale en temps réel qui permet aux utilisateurs d'écouter des conférences ou des discours dans la langue de leur choix. Le service utilise des technologies de reconnaissance vocale et de traduction pour convertir la parole d'une langue source en une langue cible.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">3. Utilisation du service</h2>
              <p className="mb-4">
                Vous acceptez d'utiliser le service conformément à toutes les lois et réglementations applicables et à ces conditions d'utilisation. Vous ne pouvez pas utiliser notre service à des fins illégales ou non autorisées.
              </p>
              <p className="mb-4">
                En particulier, vous vous engagez à ne pas :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Utiliser le service pour violer les droits de propriété intellectuelle d'autrui</li>
                <li>Interférer avec ou perturber le service ou les serveurs ou réseaux connectés au service</li>
                <li>Contourner les mesures que nous pouvons utiliser pour empêcher ou restreindre l'accès au service</li>
                <li>Utiliser le service pour des communications illégales, harcelantes, diffamatoires, abusives, menaçantes, nuisibles ou autrement répréhensibles</li>
              </ul>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">4. Propriété intellectuelle</h2>
              <p className="mb-4">
                Le service et son contenu original, ses fonctionnalités et ses fonctionnalités sont et resteront la propriété exclusive de VoiceTranslate et de ses concédants de licence. Le service est protégé par le droit d'auteur, les marques et d'autres lois de la France et d'autres pays.
              </p>
              <p className="mb-4">
                Nos marques commerciales et notre habillage commercial ne peuvent pas être utilisés en relation avec un produit ou un service sans notre consentement écrit préalable.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">5. Limitation de responsabilité</h2>
              <p className="mb-4">
                Dans toute la mesure permise par la loi applicable, VoiceTranslate ne sera pas responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ou de toute perte de bénéfices ou de revenus, qu'ils résultent directement ou indirectement de votre accès ou de votre utilisation du service, ou autrement en relation avec ces conditions.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">6. Indemnisation</h2>
              <p className="mb-4">
                Vous acceptez de défendre, d'indemniser et de dégager de toute responsabilité VoiceTranslate et ses concédants de licence et concédants contre toute réclamation, dommage, obligation, perte, responsabilité, coût ou dette, et dépense (y compris, mais sans s'y limiter, les honoraires d'avocat) résultant de (i) votre utilisation et accès au service; (ii) votre violation de ces conditions d'utilisation; (iii) votre violation des droits d'un tiers, y compris, mais sans s'y limiter, les droits d'auteur, de propriété ou de confidentialité.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">7. Modifications du service et des conditions</h2>
              <p className="mb-4">
                Nous nous réservons le droit de modifier ou d'interrompre, temporairement ou définitivement, le service ou toute partie de celui-ci avec ou sans préavis. Nous ne serons pas responsables envers vous ou un tiers pour toute modification, suspension ou interruption du service.
              </p>
              <p className="mb-4">
                Nous nous réservons également le droit de modifier ces conditions d'utilisation à tout moment. Les conditions modifiées entreront en vigueur dès leur publication sur le site. Il est de votre responsabilité de consulter régulièrement les conditions d'utilisation mises à jour.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">8. Droit applicable et juridiction</h2>
              <p className="mb-4">
                Ces conditions d'utilisation sont régies et interprétées conformément aux lois de la France, sans égard aux principes de conflit de lois.
              </p>
              <p className="mb-4">
                Tout litige découlant de ou lié à ces conditions d'utilisation sera soumis à la juridiction exclusive des tribunaux de Paris, France.
              </p>

              <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">9. Nous contacter</h2>
              <p className="mb-4">
                Si vous avez des questions concernant ces conditions d'utilisation, veuillez nous contacter à :
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

export default TermsOfService;