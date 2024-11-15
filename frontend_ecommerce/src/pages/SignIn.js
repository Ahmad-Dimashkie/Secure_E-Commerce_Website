import React, { useState, useContext } from "react";
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
import AuthContext from "../services/authContext";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { validateToken } = useContext(AuthContext); // Access validateToken

  const handleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Sending login request...");
      await api.post("/login", { username, password });

      console.log("Login successful, validating token...");
      const role = await validateToken(); // Call validateToken from context
      console.log("Token validated, role:", role);

      if ([1, 2, 3, 4].includes(role)) {
        console.log("Redirecting to /admin...");
        navigate("/admin");
      } else {
        console.error("Unauthorized role:", role);
        setError("You do not have permission to access the admin dashboard.");
      }
    } catch (err) {
      console.error("Error during login or token validation:", err);
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
        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSignIn();
          }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSignIn();
          }}
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
