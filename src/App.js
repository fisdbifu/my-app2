import {
    LocalUser,
    RemoteUser,
    useIsConnected,
    useJoin,
    useLocalMicrophoneTrack,
    useLocalCameraTrack,
    usePublish,
    useRemoteUsers,
    useConnectionState,
    useRemoteAudioTracks,
    useRemoteVideoTracks
} from "agora-rtc-react";
import React, { useState, useEffect } from "react";
import "./styles.css";
import logo from "./logo.png";

export const Basics = () => {
    const [calling, setCalling] = useState(false);
    const isConnected = useIsConnected();
    const connectionState = useConnectionState();

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

    // 添加状态用于错误处理和加载状态
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

    const {isLoading: isLoadingMic, error: micError} = useLocalMicrophoneTrack(micOn);
    const {isLoading: isLoadingCam, error: camError} = useLocalCameraTrack(cameraOn);

    useEffect(() => {
        if (micError) {
            setError(`麦克风错误: ${micError.message}`);
            setMic(false);
        }
        if (camError) {
            setError(`摄像头错误: ${camError.message}`);
            setCamera(false);
        }
    }, [micError, camError]);

    const uid = useJoin({
        appid: appId,
        channel: channel,
        token: token ? token : null
    }, calling);

    //local user
    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn);

    // 发布音视频轨道
    usePublish([localMicrophoneTrack, localCameraTrack]);

    //remote users
    const remoteUsers = useRemoteUsers();
    useRemoteAudioTracks(remoteUsers);
    useRemoteVideoTracks(remoteUsers);

    const handleJoin = async () => {
        setError("");
        setLoading(true);

        if (!appId || !channel) {
            setError("App ID和频道名不能为空");
            setLoading(false);
            return;
        }

        try {
            setCalling(true);
            // 等待一段时间让连接建立
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
            setError(`加入频道失败: ${err.message}`);
            setCalling(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = () => {
        setCalling(false);
        setError("");
    };

    return (
        <div className="container">
            <h1>Agora视频通话</h1>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError("")}>×</button>
                </div>
            )}

            <div className="room">
                {isConnected ? (
                    <div className="user-list">
                        <div className="user local-user">
                            <div className="user-header">
                                <span className="user-name">我 (UID: {uid})</span>
                                <div className="user-status">
                                    <span className={`status-indicator ${cameraOn ? 'active' : 'inactive'}`}>
                                        摄像头 {cameraOn ? '开启' : '关闭'}
                                    </span>
                                    <span className={`status-indicator ${micOn ? 'active' : 'inactive'}`}>
                                        麦克风 {micOn ? '开启' : '关闭'}
                                    </span>
                                </div>
                            </div>
                            <LocalUser
                                audioTrack={localMicrophoneTrack}
                                cameraOn={cameraOn}
                                micOn={micOn}
                                videoTrack={localCameraTrack}
                                cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                                playVideo={cameraOn}
                                playAudio={micOn}
                                className="video-container"
                            />
                        </div>

                        {remoteUsers.length > 0 ? (
                            remoteUsers.map((user) => (
                                <div className="user remote-user" key={user.uid}>
                                    <div className="user-header">
                                        <span className="user-name">远程用户 {user.uid}</span>
                                        <span className="user-status">
                                            状态: {user.hasVideo ? '有视频' : '无视频'}
                                        </span>
                                    </div>
                                    <RemoteUser
                                        user={user}
                                        cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                                        className="video-container"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="no-remote-users">
                                等待其他用户加入...
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="join-room">
                        <img alt="agora-logo" className="logo" src={logo} />
                        <h2>加入频道</h2>

                        <div className="input-group">
                            <label>App ID</label>
                            <input
                                onChange={e => setAppId(e.target.value)}
                                placeholder="请输入App ID"
                                value={appId}
                            />
                        </div>

                        <div className="input-group">
                            <label>频道名称</label>
                            <input
                                onChange={e => setChannel(e.target.value)}
                                placeholder="请输入频道名称"
                                value={channel}
                            />
                        </div>

                        <div className="input-group">
                            <label>Token (可选)</label>
                            <input
                                onChange={e => setToken(e.target.value)}
                                placeholder="请输入Token (可选)"
                                value={token}
                            />
                        </div>

                        <button
                            className={`join-button ${!appId || !channel ? "disabled" : ""}`}
                            disabled={!appId || !channel || loading}
                            onClick={handleJoin}
                        >
                            {loading ? "加入中..." : "加入频道"}
                        </button>

                        <div className="connection-status">
                            连接状态: <span className={connectionState}>{connectionState}</span>
                        </div>
                    </div>
                )}
            </div>

            {isConnected && (
                <div className="control">
                    <div className="control-buttons">
                        <button
                            className={`control-btn ${!micOn ? "muted" : ""}`}
                            onClick={() => setMic(a => !a)}
                            title={micOn ? "关闭麦克风" : "开启麦克风"}
                        >
                            {micOn ? "🔊" : "🔇"}
                        </button>

                        <button
                            className={`control-btn ${!cameraOn ? "muted" : ""}`}
                            onClick={() => setCamera(a => !a)}
                            title={cameraOn ? "关闭摄像头" : "开启摄像头"}
                        >
                            {cameraOn ? "📹" : "📷"}
                        </button>

                        <button
                            className="control-btn leave-btn"
                            onClick={handleLeave}
                            title="离开频道"
                        >
                            📞
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Basics;