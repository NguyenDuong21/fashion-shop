const JWT = require("jsonwebtoken");
const client = require("../services/RedisService");

let that = (module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {
        userId,
      };
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const option = {
        expiresIn: "1h", // 10m 10s
      };

      JWT.sign(payload, secret, option, (err, token) => {
        if (err) return reject(err);
        return resolve(token);
      });
    });
  },
  signRefreshsToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {
        userId,
      };
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const option = {
        expiresIn: "1y", // 10m 10s
      };

      JWT.sign(payload, secret, option, async (err, token) => {
        if (err) reject(err);
        try {
          await client.set(userId.toString(), token, {
            EX: 365 * 24 * 60 * 60,
          });
          return resolve(token);
        } catch (error) {
          return reject(error);
        }
      });
    });
  },
  verifyAccessToken: (token) => {
    return new Promise((resolve, reject) => {
      JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, playload) => {
        if (err) reject(err);
        resolve(playload);
      });
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, playload) => {
          if (err) return reject(err);
          try {
            const { userId } = playload;
            const rfToken = await client.get(userId);
            console.log("Rf tokent redis " + rfToken);
            console.log("rf tokent send " + refreshToken);
            if (refreshToken === rfToken) return resolve(playload);
          } catch (error) {
            return reject(error);
          }
        }
      );
    });
  },
});
