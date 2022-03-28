const jwt = require("jsonwebtoken");

// Athentication methods

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "لطفا ابتدا وارد شوید" });
      } else {
        next();
      }
    });
  } else {
    return res.status(401).json({ message: "لطفا ابتدا وارد شوید" });
  }
};

// Athorization methods

// check user is "admin" or not
const isAdmin = (req, res, next) => {
  const token = req.cookies.jwt;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (decodedToken.role !== 1) {
      return res.status(403).json({ message: "دسترسی غیر مجاز" });
    } else {
      next();
    }
  });
};

// check user is "specialized group manager" or not
const isSgm = (req, res, next) => {
  const token = req.cookies.jwt;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (decodedToken.role !== 2) {
      return res.status(403).json({ message: "دسترسی غیر مجاز" });
    } else {
      next();
    }
  });
};

// check user is "general group manager" or not
const isGgm = (req, res, next) => {
  const token = req.cookies.jwt;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (decodedToken.role !== 3) {
      return res.status(403).json({ message: "دسترسی غیر مجاز" });
    } else {
      next();
    }
  });
};

// check user is expert or not
const isExpert = (req, res, next) => {
  const token = req.cookies.jwt;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (decodedToken.role !== 4) {
      return res.status(403).json({ message: "دسترسی غیر مجاز" });
    } else {
      next();
    }
  });
};

// check user either is admin or once who wants to change their own informaitions not others
// for baseUrl/users (PUT)
const isAdmin_or_Self_updating = (req, res, next) => {
  const token = req.cookies.jwt;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (decodedToken.role !== 1 && Number(req.body.id) !== decodedToken.id) {
      return res.status(403).json({ message: "دسترسی غیر مجاز" });
    } else {
      next();
    }
  });
};

module.exports = {
  requireAuth,
  isAdmin,
  isSgm,
  isGgm,
  isExpert,
  isAdmin_or_Self_updating
};
