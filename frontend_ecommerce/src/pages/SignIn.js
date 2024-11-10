import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", {
        username: username,
        password: password,
      });
      if (response.data && response.data.access_token) {
        const token = response.data.access_token;
        const role = response.data.role; // Get the role from the response

        // Store the token in localStorage or sessionStorage
        localStorage.setItem("authToken", token);

        // Redirect based on role
        if (role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/"); // Redirect non-admins to the home page
        }
      } else {
        setError("No token received. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to sign in. Please try again."
      );
    }
  };
  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
        <Typography variant="h4" gutterBottom>
          Sign In
        </Typography>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSignIn}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Sign In"}
        </Button>
      </Box>
    </Container>
  );
};

export default SignIn;
