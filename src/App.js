import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TranslationMainScreen from './TranslationMainScreen';
import LanguageSelectionScreen from './LanguageSelectionScreen';
import HomeScreen from './HomeScreen'; // Conservé HomeScreen
import ConferencePage from './ConferencePage'; // Ajout de la nouvelle page
import AboutScreen from './AboutScreen';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import Documentation from './Documentation';
import FAQ from './FAQ';
import UserGuide from './UserGuide';
import VirtualMeetingScreen from './VirtualMeetingScreen';
import CreateMeetingScreen from './CreateMeetingScreen';
import JoinMeetingScreen from './JoinMeetingScreen';
import MeetingRoomScreen from './MeetingRoomScreen';
import ConferenceCreateScreen from './ConferenceCreateScreen';
import ConferenceBroadcastScreen from './ConferenceBroadcastScreen';
import ConferenceJoinScreen from './ConferenceJoinScreen';
import ConferencePlayerScreen from './ConferencePlayerScreen';
import './process-polyfill.js';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        
        {/* Routes pour les conférences présentielles */}
        <Route path="/conference" element={<ConferencePage />} /> {/* Nouvelle route pour la page des conférences présentielles */}
        <Route path="/conference/create" element={<ConferenceCreateScreen />} />
        <Route path="/conference/broadcast/:conferenceId" element={<ConferenceBroadcastScreen />} />
        <Route path="/conference/join" element={<ConferenceJoinScreen />} />
        <Route path="/conference/join/:conferenceId" element={<ConferenceJoinScreen />} />
        <Route path="/conference/player" element={<ConferencePlayerScreen />} /> {/* Route sans ID pour accéder à la liste */}
        <Route path="/conference/player/:conferenceId" element={<ConferencePlayerScreen />} />
        
        {/* Routes pour la traduction individuelle (anciennes routes) */}
        <Route path="/translation" element={<TranslationMainScreen />} />
        <Route path="/Language" element={<LanguageSelectionScreen />} />
        
        {/* Routes pour les conférences virtuelles */}
        <Route path="/virtual-meeting" element={<VirtualMeetingScreen />} />
        <Route path="/virtual-meeting/create" element={<CreateMeetingScreen />} />
        <Route path="/virtual-meeting/join" element={<JoinMeetingScreen />} />
        <Route path="/virtual-meeting/room/:meetingId" element={<MeetingRoomScreen />} />
        
        {/* Routes d'information et légales */}
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/conditions" element={<TermsOfService />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/guide" element={<UserGuide />} />
      </Routes>
    </Router>
  );
};

export default App;