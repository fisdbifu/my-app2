import {
    LocalUser,
    RemoteUser,
    useIsConnected,
    useJoin,
    useLocalMicrophoneTrack,
    useLocalCameraTrack,
    usePublish,
    useRemoteUsers,
} from "agora-rtc-react";
import React, { useState, useEffect } from "react"; // 添加 useEffect

import "./styles.css";
import logo from "./logo.png";

export const Basics = () => {
    const [calling, setCalling] = useState(false);
    const isConnected = useIsConnected();

    // 从 localStorage 初始化状态
    const [appId, setAppId] = useState(() => {
        return localStorage.getItem('agora_appId') || "";
    });
    const [channel, setChannel] = useState(() => {
        return localStorage.getItem('agora_channel') || "";
    });
    const [token, setToken] = useState(() => {
        return localStorage.getItem('agora_token') || "";
    });

    // 当状态变化时保存到 localStorage
    useEffect(() => {
        localStorage.setItem('agora_appId', appId);
    }, [appId]);

    useEffect(() => {
        localStorage.setItem('agora_channel', channel);
    }, [channel]);

    useEffect(() => {
        localStorage.setItem('agora_token', token);
    }, [token]);

    const uid= useJoin({appid: appId, channel: channel, token: token ? token : null}, calling);
    console.log('uid',uid)
    //local user
    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn);
    usePublish([localMicrophoneTrack, localCameraTrack]);
    //remote users
    const remoteUsers = useRemoteUsers();

    return (
        <>
            <div className="room">
                {isConnected ? (
                    <div className="user-list">
                        <div className="user">
                            <LocalUser
                                audioTrack={localMicrophoneTrack}
                                cameraOn={cameraOn}
                                micOn={micOn}
                                videoTrack={localCameraTrack}
                                cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                            >
                                <samp className="user-name">You</samp>
                            </LocalUser>
                        </div>
                        {remoteUsers.map((user) => (
                            <div className="user" key={user.uid}>
                                <RemoteUser cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg" user={user}>
                                    <samp className="user-name">{user.uid}</samp>
                                </RemoteUser>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="join-room">
                        <img alt="agora-logo" className="logo" src={logo} />
                        <input
                            onChange={e => setAppId(e.target.value)}
                            placeholder="<Your app ID>"
                            value={appId}
                        />
                        <input
                            onChange={e => setChannel(e.target.value)}
                            placeholder="<Your channel Name>"
                            value={channel}
                        />
                        <input
                            onChange={e => setToken(e.target.value)}
                            placeholder="<Your token>"
                            value={token}
                        />

                        <button
                            className={`join-channel ${!appId || !channel ? "disabled" : ""}`}
                            disabled={!appId || !channel}
                            onClick={() => setCalling(true)}
                        >
                            <span>Join Channel</span>
                        </button>
                    </div>
                )}
            </div>
            {isConnected && (
                <div className="control">
                    <div className="left-control">
                        <button className="btn" onClick={() => setMic(a => !a)}>
                            <i className={`i-microphone ${!micOn ? "off" : ""}`} />
                        </button>
                        <button className="btn" onClick={() => setCamera(a => !a)}>
                            <i className={`i-camera ${!cameraOn ? "off" : ""}`} />
                        </button>
                    </div>
                    <button
                        className={`btn btn-phone ${calling ? "btn-phone-active" : ""}`}
                        onClick={() => setCalling(a => !a)}
                    >
                        {calling ? <i className="i-phone-hangup" /> : <i className="i-mdi-phone" />}
                    </button>
                </div>
            )}
        </>
    );
};

export default Basics;