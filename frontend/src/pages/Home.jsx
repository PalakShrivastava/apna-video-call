import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {

    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const { addToUserHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;  

        await addToUserHistory(meetingCode);
        navigate(`/meet/${meetingCode}`);
    };

    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center"}}>
                    <h2>Apna Video Call</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>

                    <IconButton style={{color:"white"}} onClick={() => navigate("/history")}>
                        <RestoreIcon />
                    </IconButton>
                    <p style={{ marginLeft: "4px" }}>History</p>

                    <Button style={{textDecoration:"none" , color:"#FF9839" , marginLeft: "20px"}} onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/auth");
                    }}>
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>

                        <div style={{ display: 'flex', gap: "10px" }}>
                            <TextField
                                onChange={e => setMeetingCode(e.target.value)}
                                label="Meeting Code"
                                variant="outlined"
                            />
                            <Button onClick={handleJoinVideoCall} variant='contained'>
                                Join
                            </Button>
                        </div>
                    </div>
                </div>

                <div className='rightPanel'>
                    <img src='/images/logo3.png' alt="logo" />
                </div>
            </div>
        </>
    );
}

export default HomeComponent;   
