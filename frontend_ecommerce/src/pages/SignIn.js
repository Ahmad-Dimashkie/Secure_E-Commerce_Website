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
import { jwtDecode } from "jwt-decode";
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

        // Decode JWT to extract role and identity
        const decodedToken = jwtDecode(token);
        const role = decodedToken.role_id; // Ensure your backend includes `role_id` in the JWT payload

        // Store the token in localStorage (or implement secure cookie storage)
        localStorage.setItem("authToken", token);

        // Redirect based on role
        if (role === 1) {
          navigate("/admin"); // Admin role redirects to admin dashboard
        } else {
          navigate("/"); // Non-admins redirect to the home page
        }
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to sign in. Please try again."
      );
    } finally {
      setLoading(false);
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
