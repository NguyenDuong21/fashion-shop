const JWT = require('jsonwebtoken');
const creatError = require('http-errors');
const { client } = require('./RedisService');
const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId
    }
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const option = {
      expiresIn: '1h' // 10m 10s
    }

    JWT.sign(payload, secret, option, (err, token) => {
      if (err) return reject(err)
      return resolve(token);
    });
  })
};
const signRefreshsToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId
    }
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const option = {
      expiresIn: '60d' // 10m 10s
    }

    JWT.sign(payload, secret, option, async(err, token) => {
      if (err) reject(err)
      try {
        await client.set(userId.toString(), token, "EX", 60 * 24 * 60 * 60);
        return resolve(token);
      } catch (error) {
        return reject(error);
      }
    });
  })
};
const verifyAccessToken = (req, res, next) => {
  if (!req.signedCookies.accessToken) {
    return res.redirect('/login');
  }
  const accessToken = req.signedCookies.accessToken;
  JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async(err, playload) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        const refreshToken = req.signedCookies.refreshToken;
        if (!refreshToken) {
          return res.redirect('/login');
        }
        try {
          const playload = await verifyRefreshToken(refreshToken);
          if (!playload.userId) {
            return res.redirect('/login');
          }
          const accessToken = await signAccessToken(playload.userId);
          res.cookie('accessToken', accessToken, { signed: true, httpOnly: true, secure: true });
          req.payload = playload;
          return next();
        } catch (error) {
          console.log(error);
          return res.redirect('/login');
        }
      } else {
        return res.redirect('/login');
      }
    }
    req.payload = playload;
    return next();
  });
}
const addUserToRequest = async(req, res, next) => {
  if (req.signedCookies.accessToken) {
    const accessToken = req.signedCookies.accessToken;
    JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, playload) => {
      req.playload = playload;
    })
  }
  next();
}
const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err, playload) => {
      if (err) return reject(err);
      try {
        const { userId } = playload;
        const rfToken = await client.get(userId);
        if (refreshToken === rfToken) return resolve(playload);
        else {
          return reject(false);
        }
      } catch (error) {
        return reject(error);
      }

    })
  })
}
module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshsToken,
  verifyRefreshToken,
  addUserToRequest
}