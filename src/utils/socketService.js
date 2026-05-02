import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId, role) {
    if (this.socket) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        userId,
        role,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');

      // Join user-specific room
      if (role === 'student') {
        this.socket.emit('joinUser', userId);
      } else if (role === 'admin') {
        this.socket.emit('joinAdmin', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Student: emit new complaint
  emitNewComplaint(complaintData) {
    if (this.socket) {
      this.socket.emit('newComplaint', complaintData);
    }
  }

  // Admin: emit complaint update
  emitComplaintUpdate(updateData) {
    if (this.socket) {
      this.socket.emit('complaintUpdated', updateData);
    }
  }

  // Listen for complaint updates (students)
  onComplaintUpdate(callback) {
    if (this.socket) {
      this.socket.on('complaintStatusChanged', callback);
    }
  }

  // Listen for complaint deletions (students)
  onComplaintDeleted(callback) {
    if (this.socket) {
      this.socket.on('complaintDeleted', callback);
    }
  }

  // Listen for new complaints (admins)
  onNewComplaint(callback) {
    if (this.socket) {
      this.socket.on('complaintCreated', callback);
    }
  }

  // Remove listeners
  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();
