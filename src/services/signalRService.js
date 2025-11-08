import * as signalR from "@microsoft/signalr";

let connection = null;
let started = false;
let connectionStatus = "disconnected"; // "disconnected", "connecting", "connected", "reconnecting"
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const SIGNALR_HUB_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/chathub`
  : "http://localhost:5068/chathub";

/**
 * Get the current connection status
 * @returns {string} Current status: "disconnected", "connecting", "connected", or "reconnecting"
 */
export const getConnectionStatus = () => connectionStatus;

/**
 * Start a shared SignalR connection.
 * options:
 *  - url: hub url
 *  - retryDelayMs: retry delay
 *  - accessTokenFactory: () => token (optional)
 */
export const startConnection = async (options = {}) => {
  const {
    url = SIGNALR_HUB_URL,
    retryDelayMs = 2000,
    accessTokenFactory = null,
  } = options;

  if (started && connection && connectionStatus === "connected") {
    console.log("✅ SignalR already connected, reusing connection");
    return connection;
  }

  // Check if we have a token
  if (accessTokenFactory) {
    const token = accessTokenFactory();
    if (!token) {
      console.error("❌ No authentication token available for SignalR");
      throw new Error("Authentication token required for SignalR connection");
    }
    console.log("🔐 Using authentication token for SignalR connection");
  }

  connectionStatus = "connecting";
  console.log("🔌 SignalR status: connecting...", reconnectAttempts + 1);

  // Build connection with token in query string for SignalR authentication
  const connectionOptions = accessTokenFactory
    ? {
        accessTokenFactory,
        // This ensures the token is sent as a query parameter for SignalR
        skipNegotiation: false,
      }
    : undefined;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(url, connectionOptions)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: () => {
        reconnectAttempts++;
        if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
          console.error("❌ Max reconnection attempts reached");
          return null; // Stop reconnecting
        }
        return retryDelayMs;
      },
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.onreconnecting((err) => {
    connectionStatus = "reconnecting";
    console.warn("⚠️ SignalR status: reconnecting", err?.message || "");
  });

  connection.onreconnected((connectionId) => {
    connectionStatus = "connected";
    reconnectAttempts = 0; // Reset on successful reconnection
    console.log("✅ SignalR status: reconnected", connectionId);
  });

  connection.onclose((err) => {
    connectionStatus = "disconnected";
    console.warn("🔌 SignalR status: closed", err?.message || "");
    started = false;
    reconnectAttempts = 0;
  });

  // start with simple retry loop
  let attempts = 0;
  const maxAttempts = 3;
  while (!started && attempts < maxAttempts) {
    try {
      await connection.start();
      started = true;
      connectionStatus = "connected";
      reconnectAttempts = 0;
      console.log("✅ SignalR connected successfully");
    } catch (err) {
      attempts += 1;
      console.error(
        `❌ SignalR connection failed (attempt ${attempts}/${maxAttempts}):`,
        err.message
      );

      if (attempts >= maxAttempts) {
        connectionStatus = "disconnected";
        started = false;
        connection = null;
        throw new Error(
          "Failed to establish SignalR connection after " +
            maxAttempts +
            " attempts"
        );
      }

      // wait then retry
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }

  return connection;
};

export const registerHandler = (methodName, handler) => {
  if (!connection) {
    console.warn("SignalR: registerHandler called before connection exists");
    return () => {};
  }
  connection.on(methodName, handler);
  return () => {
    try {
      connection.off(methodName, handler);
    } catch (e) {
      console.warn("SignalR: failed to remove handler", e);
    }
  };
};

export const unregisterHandler = (methodName, handler) => {
  if (!connection) return;
  try {
    connection.off(methodName, handler);
  } catch (e) {
    console.warn("SignalR: failed to remove handler", e);
  }
};

export const sendMessageToUser = async (userId, message) => {
  if (!connection || !started) throw new Error("SignalR not connected");
  return connection.invoke("SendMessageToUser", userId, message);
};

export const broadcastNotification = async (title, body, level = "info") => {
  if (!connection || !started) throw new Error("SignalR not connected");
  return connection.invoke("BroadcastNotification", title, body, level);
};

export const joinGroup = async (groupName) => {
  if (!connection || !started) throw new Error("SignalR not connected");
  return connection.invoke("JoinGroup", groupName);
};

export const leaveGroup = async (groupName) => {
  if (!connection || !started) throw new Error("SignalR not connected");
  return connection.invoke("LeaveGroup", groupName);
};

export const invokeHubMethod = async (methodName, ...args) => {
  if (!connection || !started) throw new Error("SignalR not connected");
  return connection.invoke(methodName, ...args);
};

export const stopConnection = async () => {
  if (!connection) {
    console.log("ℹ️ SignalR: No connection to stop");
    return;
  }
  try {
    await connection.stop();
    started = false;
    connectionStatus = "disconnected";
    connection = null;
    console.log("✅ SignalR stopped successfully");
  } catch (err) {
    console.error("❌ SignalR stop failed:", err);
  }
};

export const getConnection = () => connection;
