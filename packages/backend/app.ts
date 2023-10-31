import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const port = 3000;

app.use(express.json());

const accessTokenSecret = "youraccesstokensecret";
const refreshTokenSecret = "yourrefreshtokensecrethere";
const refreshTokens: string[] = [];

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password || username !== "user" || password !== "123456") {
    return res.status(401).send("用户名或密码不正确");
  }

  const accessToken = jwt.sign({ username: username }, accessTokenSecret, {
    expiresIn: "20m",
  });
  const refreshToken = jwt.sign({ username: username }, refreshTokenSecret, {
    expiresIn: "48h",
  });

  refreshTokens.push(refreshToken);

  res.json({
    accessToken,
    refreshToken,
  });
});

app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).send("未提供refresh token");
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).send("refresh token不正确");
  }

  jwt.verify(refreshToken, refreshTokenSecret, (err: any, user: any) => {
    if (err) {
      return res.status(403).send("refresh token验证失败");
    }
    const newAccessToken = jwt.sign(
      { username: user.username },
      accessTokenSecret,
      { expiresIn: "20m" }
    );
    const newRefreshToken = jwt.sign(
      { username: user.username },
      refreshTokenSecret,
      {
        expiresIn: "48h",
      }
    );
    refreshTokens.push(newRefreshToken);
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

app.listen(port, () => {
  console.log(`服务器正在监听端口${port}`);
});
