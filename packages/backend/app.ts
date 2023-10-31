import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const port = 3000;

app.use(express.json());

const accessTokenSecret = "c1f497ae-0cf7-43fa-a29b-4a54e57f73da";
const refreshTokenSecret = "c7c3815c-e8d4-4291-9aba-dd5e81cb139a";
const refreshTokens: string[] = [];

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password || username !== "user" || password !== "123456") {
    return res.status(401).send("password or username incorrect");
  }
  const accessToken = generateAccessToken(username);
  const refreshToken = generateRefreshToken(username);
  refreshTokens.push(refreshToken);
  res.json({
    accessToken,
    refreshToken,
  });
});

app.post("/my", (req, res) => {
  const tokenWithBearer = req.headers.authorization;
  const accessToken = tokenWithBearer?.replace("Bearer ", "");
  if (!accessToken) {
    return res.status(401).send("access token");
  }
  jwt.verify(accessToken, accessTokenSecret, (err: any, user: any) => {
    if (err) {
      return res.status(403).send("access token verify failed");
    }
    return res.json({
      name: user.username,
      logo: "https://placehold.co/300x300?text=Avatar",
    });
  });
});

app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).send("no refresh token");
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).send("refresh token incorrect");
  }

  jwt.verify(refreshToken, refreshTokenSecret, (err: any, user: any) => {
    if (err) {
      return res.status(403).send("refresh token verify failed");
    }
    const newAccessToken = generateAccessToken(user.username);
    const newRefreshToken = generateRefreshToken(user.username);
    refreshTokens.push(newRefreshToken);
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

function generateAccessToken(username: string) {
  return jwt.sign({ username: username }, accessTokenSecret, {
    expiresIn: "20m",
  });
}

function generateRefreshToken(username: string) {
  return jwt.sign({ username: username }, refreshTokenSecret, {
    expiresIn: "48h",
  });
}

app.listen(port, () => {
  console.log(`server started: http://localhost:${port}`);
});
