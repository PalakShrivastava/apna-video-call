import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext(null);


const client = axios.create({
    baseURL: server + "/api/v1/users",
    timeout: 15000, 
});

export const AuthProvider = ({ children }) => {

    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    // REGISTER
    const handleRegister = async (name, username, password) => {
        try {
            const response = await client.post("/register", {
                name,
                username,
                password,
            });

            if (response.status === httpStatus.CREATED) {
                return response.data.message;
            }

        } catch (err) {
            console.log("REGISTER ERROR:", err);
            throw err.response?.data || { message: "Server not responding" };
        }
    };

    // LOGIN
    const handleLogin = async (username, password) => {
        try {
            const response = await client.post("/login", {
                username,
                password,
            });

            if (response.status === httpStatus.OK) {
                localStorage.setItem("token", response.data.token);
                setUserData({ username });

                navigate("/home");
            }

        } catch (err) {
            console.log("LOGIN ERROR:", err);
            throw err.response?.data || { message: "Server not responding" };
        }
    };

    // GET HISTORY
    const getHistoryOfUser = async () => {
        try {
            const response = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token"),
                },
            });

            return response.data;

        } catch (err) {
            console.log("HISTORY ERROR:", err);
            throw err.response?.data || { message: "Server not responding" };
        }
    };

    // ADD HISTORY
    const addToUserHistory = async (meetingCode) => {
        try {
            const response = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode,
            });

            return response;

        } catch (error) {
            console.log("ADD ACTIVITY ERROR:", error);
            throw error.response?.data || { message: "Server not responding" };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                userData,
                setUserData,
                handleRegister,
                handleLogin,
                getHistoryOfUser,
                addToUserHistory,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
