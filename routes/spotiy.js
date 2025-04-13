import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const router = express.Router();

let accessToken = "";
let refreshToken = "";

const SPOTIFY_API = "https://api.spotify.com/v1";

// Utility to attach auth headers
const withAuth = () => ({
  headers: { Authorization: `Bearer ${accessToken}` },
});

// Redirect user to Spotify login
router.get("/login", (req, res) => {
  const scopes = [
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-top-read",
    "user-modify-playback-state",
    "streaming",
    "user-read-private"
  ];

  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes.join(" "),
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams.toString()}`);
});

// Callback from Spotify after login
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
        },
      }
    );

    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;

    res.send("✅ Spotify login successful! You can now access /top-tracks or /now-playing.");
  } catch (error) {
    console.error("Callback Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to authenticate with Spotify." });
  }
});

// Refresh the access token when needed
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = response.data.access_token;
    console.log("🔁 Access token refreshed.");
  } catch (err) {
    console.error("Refresh token error:", err.message);
  }
};

// Get user's top 10 tracks
router.get("/top-tracks", async (req, res) => {
  try {
    const result = await axios.get(
      `${SPOTIFY_API}/me/top/tracks?limit=10`,
      withAuth()
    );
    res.json(result.data);
  } catch (err) {
    if (err.response?.status === 401) {
      await refreshAccessToken();
      return res.redirect("/api/spotify/top-tracks");
    }
    res.status(400).json({ error: err.message });
  }
});

// Get currently playing song
router.get("/now-playing", async (req, res) => {
  try {
    const result = await axios.get(
      `${SPOTIFY_API}/me/player/currently-playing`,
      withAuth()
    );
    res.json(result.data || { message: "Nothing is playing." });
  } catch (err) {
    if (err.response?.status === 401) {
      await refreshAccessToken();
      return res.redirect("/api/spotify/now-playing");
    }
    res.status(400).json({ error: err.message });
  }
});

// Stop currently playing song
router.put("/stop", async (req, res) => {
  try {
    await axios.put(`${SPOTIFY_API}/me/player/pause`, {}, withAuth());
    res.json({ message: "Playback stopped." });
  } catch (err) {
    if (err.response?.status === 401) {
      await refreshAccessToken();
      return res.redirect("/api/spotify/stop");
    }
    res.status(400).json({ error: err.message });
  }
});

// Play a specific track by ID
router.put("/play/:id", async (req, res) => {
  const trackId = req.params.id;
  try {
    await axios.put(
      `${SPOTIFY_API}/me/player/play`,
      { uris: [`spotify:track:${trackId}`] },
      withAuth()
    );
    res.json({ message: `🎶 Playing track ${trackId}` });
  } catch (err) {
    if (err.response?.status === 401) {
      await refreshAccessToken();
      return res.redirect(`/api/spotify/play/${trackId}`);
    }
    res.status(400).json({ error: err.message });
  }
});

export default router;
