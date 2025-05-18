// config.js
// Adresses et ports réels de tes serveurs
window.ESP1_URL      = "http://192.168.1.59";        // ESP1 – API HTTP
window.ESP1_WS       = "ws://192.168.1.59:81";       // ESP1 – WebSocket (UART, BT status)

window.RASPIZ_URL    = "http://192.168.1.121:5000";  // Raspiz – API HTTP (Flask)
window.RASPIZ_SOCKET = "http://192.168.1.121:5000";  // Raspiz – Socket.IO (BT events, etc.)
window.RASPIZ_WS     = "ws://192.168.1.121:8765";    // Raspiz – WebSocket audio stream