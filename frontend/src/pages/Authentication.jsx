import '../App.css';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import React, { useState, useContext } from "react";
import { Snackbar } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";


const theme = createTheme();

export default function Authentication() {
    const [name, setName] = useState("");
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [formState, setFormState] = useState(0);
    const [open, setOpen] = useState(false);

    const { handleRegister, handleLogin } = useContext(AuthContext);

    const handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }

            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setUserName("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
                setName("");
            }

        } catch (err) {
            let message = err.response?.data?.message;
            setError(message);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            <Grid container component="main" sx={{ height: "100vh" }} direction="row-reverse">

                {/* Right Side Form */}
                <Grid item xs={12} sm={4} md={7} component="div" elevation={6} square
                    sx={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="authRightPanel">

                    <Box sx={{
                        width: "100%",
                        maxWidth: 550,
                        px: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>

                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <div>
                            <Button variant={formState === 0 ? "contained" : ""} onClick={() => setFormState(0)}>
                                Sign In
                            </Button>

                            <Button variant={formState === 1 ? "contained" : ""} onClick={() => setFormState(1)}>
                                Sign Up
                            </Button>
                        </div>

                        <Box sx={{ mt: 2, width: "100%" }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Username"
                                value={username}
                                onChange={(e) => setUserName(e.target.value)}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleAuth}>
                                {formState === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>

                {/* Left Side Image */}
                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={5}
                    className="authImageSection"
                />

            </Grid>

            {/* Success Snackbar */}
            <Snackbar open={open} autoHideDuration={4000} message={message} />

            {/* Error Snackbar */}
            <Snackbar open={!!error} autoHideDuration={4000} message={error} />
        </ThemeProvider>
    );
}
