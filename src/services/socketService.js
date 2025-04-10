import io from 'socket.io-client';
import Peer from 'simple-peer';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:5000';

let socket;
let peers = {};
let reconnectTimer = null;
let isConnecting = false;

export const initializeSocket = () => {
  // Éviter les connexions multiples
  if (isConnecting) return socket;
  isConnecting = true;
  
  // Nettoyer toute tentative précédente de reconnexion
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  // Options de connexion pour améliorer la stabilité
  const options = {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: false
  };
  
  // Créer une nouvelle connexion
  socket = io(API_URL, options);
  
  socket.on('connect', () => {
    console.log('Connected to socket server with ID:', socket.id);
    isConnecting = false;
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
    // Essayer de se reconnecter après un court délai
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        socket.connect();
      }, 2000);
    }
  });
  
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    isConnecting = false;
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initializeSocket();
  }
  return socket;
};

export const createRoom = async (hostLanguage, supportedLanguages, meetingName) => {
  try {
    console.log(`Tentative de création de salle avec l'URL: ${API_URL}/api/rooms`);
    const response = await fetch(`${API_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hostLanguage, supportedLanguages, meetingName }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur serveur:', errorText);
      throw new Error('Failed to create room');
    }
    
    const data = await response.json();
    return data.roomCode;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

export const checkRoomExists = async (roomCode) => {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomCode}`);
    if (!response.ok) throw new Error('Failed to check room');
    
    return await response.json();
  } catch (error) {
    console.error('Error checking room:', error);
    throw error;
  }
};

// Fonction pour quitter la salle proprement
export const leaveRoom = (roomCode) => {
  if (socket && socket.connected) {
    socket.emit('leave-room', { roomCode });
    
    // Nettoyer les connexions peer
    Object.keys(peers).forEach(peerId => {
      try {
        if (peers[peerId] && !peers[peerId].destroyed) {
          peers[peerId].destroy();
        }
      } catch (err) {
        console.error('Error destroying peer during room leave:', err);
      }
    });
    peers = {};
  }
};

// Fonction pour terminer la réunion (organisateur uniquement)
export const endMeeting = (roomCode) => {
  if (socket && socket.connected) {
    socket.emit('end-meeting', { roomCode });
  }
};

// Fonction pour retirer un participant (organisateur uniquement)
export const removeParticipant = (roomCode, participantId) => {
  if (socket && socket.connected) {
    socket.emit('remove-participant', { roomCode, participantId });
  }
};

// Variable globale pour stocker le stream local
let localStream = null;

// Fonction pour rejoindre une réunion
export const joinRoom = ({
  roomCode,
  username,
  speakLanguage,
  listenLanguage,
  isHost = false,
  onUserJoined,
  onUserLeft,
  onRoomJoined,
  onError,
  onNewMessage,
  onTranslatedAudio,
  onMeetingEnded,
  onRemoved
}) => {
  const socket = getSocket();
  
  // Clear existing listeners to prevent duplicates
  socket.off('user-joined');
  socket.off('user-left');
  socket.off('room-joined');
  socket.off('room-error');
  socket.off('user-signaling');
  socket.off('signal-returned');
  socket.off('new-message');
  socket.off('translated-audio');
  socket.off('meeting-ended');
  socket.off('removed-from-meeting');
  
  // Set up listeners
  socket.on('user-joined', (user) => {
    console.log('User joined:', user);
    if (onUserJoined) onUserJoined(user);
    
    try {
      // Create a peer connection for the new user
      const peer = createPeer(user.id, socket.id, localStream);
      peers[user.id] = peer;
    } catch (err) {
      console.error('Error creating peer for new user:', err);
    }
  });
  
  socket.on('user-left', ({ userId }) => {
    console.log('User left:', userId);
    if (onUserLeft) onUserLeft(userId);
    
    // Clean up the peer connection
    if (peers[userId]) {
      try {
        peers[userId].destroy();
      } catch (err) {
        console.error('Error destroying peer:', err);
      }
      delete peers[userId];
    }
  });
  
  socket.on('room-joined', (roomData) => {
    console.log('Room joined:', roomData);
    
    // Vérifier que nous avons bien reçu tous les participants
    console.log('Participants dans la salle:', roomData.participants.length);
    
    // Create peer connections for existing users
    roomData.participants.forEach(participant => {
      if (participant.id !== socket.id) {
        try {
          console.log('Creating peer connection to existing participant:', participant.username);
          const peer = createPeer(participant.id, socket.id, localStream);
          peers[participant.id] = peer;
        } catch (err) {
          console.error('Error creating peer for existing participant:', err);
        }
      }
    });
    
    // Demander une mise à jour de la liste complète des participants
    setTimeout(() => {
      if (socket.connected) {
        console.log('Requesting full participant list refresh');
        socket.emit('request-participants', { roomCode: roomData.roomCode });
      }
    }, 1000);
    
    if (onRoomJoined) onRoomJoined(roomData);
  });
  
  // Ajout d'un événement pour recevoir la liste mise à jour des participants
  socket.on('participants-list', (participantsData) => {
    console.log('Received updated participants list:', participantsData);
    if (onRoomJoined) {
      // Simuler un événement room-joined avec les données mises à jour
      onRoomJoined({
        roomCode: participantsData.roomCode,
        meetingName: participantsData.meetingName,
        participants: participantsData.participants,
        messageHistory: participantsData.messageHistory || []
      });
    }
  });
  
  socket.on('room-error', (error) => {
    console.error('Room error:', error);
    if (onError) onError(error);
  });
  
  socket.on('user-signaling', ({ signal, callerID, callerData }) => {
    try {
      // Handle incoming signal from another user
      const peer = addPeer(signal, callerID, localStream);
      peers[callerID] = peer;
    } catch (err) {
      console.error('Error handling incoming signal:', err);
    }
  });
  
  socket.on('signal-returned', ({ signal, callerID }) => {
    // Vérifier que le pair existe et n'est pas détruit
    if (peers[callerID] && !peers[callerID].destroyed) {
      try {
        peers[callerID].signal(signal);
      } catch (err) {
        console.error('Error signaling to peer:', err);
        // Si une erreur se produit, nettoyez et recréez peut-être le pair
        if (peers[callerID]) {
          try {
            peers[callerID].destroy();
          } catch (e) {}
          delete peers[callerID];
          
          // Tenter de recréer la connexion
          setTimeout(() => {
            if (socket.connected) {
              const newPeer = createPeer(callerID, socket.id, localStream);
              peers[callerID] = newPeer;
            }
          }, 1000);
        }
      }
    } else {
      console.warn('Received signal for non-existent or destroyed peer:', callerID);
      // Tenter de créer une nouvelle connexion
      if (socket.connected && localStream) {
        const newPeer = createPeer(callerID, socket.id, localStream);
        peers[callerID] = newPeer;
      }
    }
  });
  
  socket.on('new-message', (messageData) => {
    console.log('New message:', messageData);
    if (onNewMessage) onNewMessage(messageData);
  });
  
  socket.on('translated-audio', (audioData) => {
    if (onTranslatedAudio) onTranslatedAudio(audioData);
  });
  
  // Écouter l'événement de fin de réunion
  socket.on('meeting-ended', (data) => {
    console.log('Meeting ended by host:', data);
    if (onMeetingEnded) onMeetingEnded(data);
  });
  
  // Écouter l'événement de suppression de participant
  socket.on('removed-from-meeting', (data) => {
    console.log('You have been removed from the meeting:', data);
    if (onRemoved) onRemoved(data);
  });
  
  // Join the room
  socket.emit('join-room', {
    roomCode,
    username,
    speakLanguage,
    listenLanguage,
    isHost
  });
  
  return () => {
    // Clean up function to leave the room
    leaveRoom(roomCode);
  };
};

// Fonction pour rejoindre à nouveau une réunion après actualisation de la page
export const rejoinRoom = (options) => {
  console.log('Attempting to rejoin room with options:', options);
  return joinRoom(options);
};

export const initializeMedia = async (videoEnabled = true, audioEnabled = true) => {
  try {
    // Si nous avons déjà un flux, arrêtons-le d'abord
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Obtenir un nouveau flux média
    localStream = await navigator.mediaDevices.getUserMedia({
      video: videoEnabled,
      audio: audioEnabled
    });
    
    return localStream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

export const toggleAudio = (enabled) => {
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};

export const toggleVideo = (enabled) => {
  if (localStream) {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};

// Create a new peer connection as the initiator
const createPeer = (userToSignal, callerID, stream) => {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  });
  
  peer.on('error', (err) => {
    console.error('Peer connection error:', err);
    // Tentative de récupération, peut-être recréer le pair après un délai
    if (peers[userToSignal]) {
      try {
        peers[userToSignal].destroy();
      } catch (e) {}
      delete peers[userToSignal];
      
      // Recréer après un délai si la connexion socket est toujours active
      setTimeout(() => {
        if (socket && socket.connected && localStream) {
          const newPeer = createPeer(userToSignal, callerID, localStream);
          peers[userToSignal] = newPeer;
        }
      }, 2000);
    }
  });
  
  peer.on('signal', signal => {
    const socket = getSocket();
    if (socket.connected && !peer.destroyed) {
      try {
        socket.emit('send-signal', {
          userToSignal,
          callerID,
          signal,
          callerData: {
            // Add any additional data you want to send about the caller
          }
        });
      } catch (err) {
        console.error('Error sending signal:', err);
      }
    }
  });
  
  return peer;
};

// Add a peer connection as the receiver
const addPeer = (incomingSignal, callerID, stream) => {
  const peer = new Peer({
    initiator: false,
    trickle: false,
    stream,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  });
  
  peer.on('error', (err) => {
    console.error('Peer receiver connection error:', err);
    // Nettoyer en cas d'erreur
    if (peers[callerID]) {
      try {
        peers[callerID].destroy();
      } catch (e) {}
      delete peers[callerID];
      
      // Tenter de recréer la connexion
      setTimeout(() => {
        if (socket && socket.connected && localStream) {
          socket.emit('request-reconnect', { userId: callerID });
        }
      }, 2000);
    }
  });
  
  peer.on('signal', signal => {
    const socket = getSocket();
    // Vérifier si le pair n'est pas détruit avant d'envoyer un signal
    if (socket.connected && !peer.destroyed) {
      try {
        socket.emit('return-signal', { signal, userToSignal: callerID });
      } catch (err) {
        console.error('Error returning signal:', err);
      }
    }
  });
  
  // Vérifier si le pair n'est pas détruit avant de signaler
  if (!peer.destroyed) {
    try {
      peer.signal(incomingSignal);
    } catch (err) {
      console.error('Error when signaling to peer:', err);
    }
  }
  
  return peer;
};

export const sendChatMessage = (roomCode, message) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('send-message', { roomCode, message });
  }
};

// This will be used for audio processing and sending to the server for translation
export const processAndSendAudio = (roomCode, audioData) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('audio-data', { roomCode, audioData });
  }
};