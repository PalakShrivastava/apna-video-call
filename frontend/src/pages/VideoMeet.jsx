import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";

import styles from "../styles/videoMeet.module.css";
import server from "../environment";

const server_url = server;

const peerConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:relay1.expressturn.com:3478",
      username: "efU8TxJXOz2wCRYc",
      credential: "S8f7eA2DzfWx9NRv",
    },
  ],
};

const VideoMeet = () => {
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);

  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [remoteStreams, setRemoteStreams] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenAvailable] = useState(!!navigator.mediaDevices.getDisplayMedia);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [newMessages, setNewMessages] = useState(0);

  const [username, setUsername] = useState("");
  const [askForUsername, setAskForUsername] = useState(true);

  const roomId = window.location.pathname.split("/")[2];

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [askForUsername]);

  const joinCall = async () => {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }

    if (socketRef.current) return;

    socketRef.current = io(server_url, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    cameraStreamRef.current = stream;
    localStreamRef.current = stream;

    setAskForUsername(false);

    socketRef.current.emit("join-room", roomId, username);

    socketRef.current.on("user-connected", ({ userId, username }) => {
      peersRef.current[userId] = { username };

      setTimeout(() => {
        createOffer(userId, localStreamRef.current);
      }, 300);
    });

    socketRef.current.on("offer", ({ offer, from, username }) => {
      peersRef.current[from] = { ...peersRef.current[from], username };
      handleOffer(offer, from, localStreamRef.current);
    });

    socketRef.current.on("answer", ({ answer, from, username }) => {
      peersRef.current[from] = { ...peersRef.current[from], username };
      handleAnswer(answer, from);
    });

    socketRef.current.on("ice-candidate", ({ candidate, from }) => {
      handleNewIceCandidate(candidate, from);
    });

    socketRef.current.on("user-disconnected", (id) => {
      removePeer(id);
    });

    socketRef.current.on("chat-message", ({ sender, message, socketId }) => {
      setMessages((prev) => [...prev, { sender, data: message }]);

      if (socketId !== socketRef.current.id && !showChat) {
        setNewMessages((prev) => prev + 1);
      }
    });
  };

  const createPeer = (userId) => {
    const peer = new RTCPeerConnection(peerConfig);

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          candidate: event.candidate,
          to: userId,
        });
      }
    };

    peer.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const exists = prev.find((s) => s.id === userId);
        if (exists) return prev;

        return [
          ...prev,
          {
            id: userId,
            stream: event.streams[0],
            username: peersRef.current[userId]?.username,
          },
        ];
      });
    };

    return peer;
  };

  const createOffer = (userId, localStream) => {
    const peer = createPeer(userId);

    peersRef.current[userId] = { ...peersRef.current[userId], peer };

    localStream.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
    });

    peer
      .createOffer()
      .then((offer) =>
        peer.setLocalDescription(offer).then(() => {
          socketRef.current.emit("offer", { offer, to: userId, username });
        })
      )
      .catch((err) => console.error("Offer error", err));
  };

  const handleOffer = async (offer, from, localStream) => {
    const peer = createPeer(from);

    peersRef.current[from] = { ...peersRef.current[from], peer };

    localStream.getTracks().forEach((track) =>
      peer.addTrack(track, localStream)
    );

    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socketRef.current.emit("answer", { answer, to: from, username });
  };

  const handleAnswer = (answer, from) => {
    const peer = peersRef.current[from]?.peer;
    if (!peer) return;
    peer.setRemoteDescription(answer);
  };

  const handleNewIceCandidate = (candidate, from) => {
    const peer = peersRef.current[from]?.peer;
    if (!peer) return;
    peer.addIceCandidate(candidate);
  };

  const removePeer = (id) => {
    if (peersRef.current[id]?.peer) {
      peersRef.current[id].peer.close();
      delete peersRef.current[id];
    }
    setRemoteStreams((prev) => prev.filter((v) => v.id !== id));
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (!tracks) return;
    tracks.forEach((t) => (t.enabled = !videoEnabled));
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (!tracks) return;
    tracks.forEach((t) => (t.enabled = !audioEnabled));
    setAudioEnabled(!audioEnabled);
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];

      Object.values(peersRef.current).forEach((obj) => {
        const peer = obj.peer;
        if (!peer) return;
        const sender = peer
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });

      localStreamRef.current = screenStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setScreenSharing(true);

      screenTrack.onended = () => stopScreenShare();
    } catch (error) {
      console.error("Screen share error", error);
    }
  };

  const stopScreenShare = () => {
    const videoTrack = cameraStreamRef.current.getVideoTracks()[0];

    Object.values(peersRef.current).forEach((obj) => {
      const peer = obj.peer;
      if (!peer) return;
      const sender = peer
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender) sender.replaceTrack(videoTrack);
    });

    localStreamRef.current = cameraStreamRef.current;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = cameraStreamRef.current;
    }

    setScreenSharing(false);
  };

  const handleEndCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());

    Object.values(peersRef.current).forEach((obj) => obj.peer?.close());
    peersRef.current = {};

    socketRef.current?.disconnect();
    setRemoteStreams([]);

    window.location.href = "/";
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socketRef.current.emit("chat-message", {
      sender: username,
      message,
      socketId: socketRef.current.id,
    });

    setMessage("");
  };

  return (
    <div>
      {askForUsername ? (
        <div className={styles.lobbyContainer}>
          <h2 style={{ marginBottom: "16px", fontSize: "2rem", color: "white" }}>
            Enter Name
          </h2>

          <TextField
            label="Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#d4d4d4" } }}
            sx={{ width: "260px", mb: 2 }}
          />

          <Button
            variant="contained"
            onClick={joinCall}
            sx={{
              backgroundColor: "#FF9839",
              ":hover": { backgroundColor: "#D97500" },
              paddingInline: "24px",
              mb: 3,
            }}
          >
            Connect
          </Button>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showChat && (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>
                  {messages.length > 0 ? (
                    messages.map((item, index) => (
                      <div key={index} style={{ marginBottom: 20 }}>
                        <p
                          style={{
                            fontWeight: "bold",
                            color:
                              item.sender === username ? "#ff9839" : "black",
                          }}
                        >
                          {item.sender === username ? "You" : item.sender}
                        </p>
                        <p>{item.data}</p>
                      </div>
                    ))
                  ) : (
                    <p>No messages yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    label="Type message"
                    fullWidth
                  />

                  <div className={styles.buttonsRow}>
                    <Button variant="contained" onClick={sendMessage}>
                      Send
                    </Button>

                    <Button variant="text" onClick={() => setShowChat(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={toggleVideo} style={{ color: "white" }}>
              {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={toggleAudio} style={{ color: "white" }}>
              {audioEnabled ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable && (
              <IconButton
                onClick={screenSharing ? stopScreenShare : startScreenShare}
                style={{ color: "white" }}
              >
                {screenSharing ? (
                  <StopScreenShareIcon />
                ) : (
                  <ScreenShareIcon />
                )}
              </IconButton>
            )}

            <Badge badgeContent={newMessages} color="secondary">
              <IconButton
                onClick={() => setShowChat(!showChat)}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={styles.meetUserVideo}
          />

          <div className={styles.conferenceView}>
            {remoteStreams.map((v) => (
              <div
                key={v.id}
                style={{
                  textAlign: "center",
                  margin: "10px",
                }}
              >
                <video
                  autoPlay
                  playsInline
                  muted={false}
                  className={styles.remoteVideo}
                  ref={(ref) => {
                    if (ref) ref.srcObject = v.stream;
                  }}
                />

                <p
                  style={{
                    marginTop: "6px",
                    color: "white",
                    background: "rgba(0,0,0,0.6)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    display: "inline-block",
                  }}
                >
                  {v.username || "User"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoMeet;
