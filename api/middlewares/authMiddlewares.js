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
        req.user = decodedToken;
        next();
      }
    });
  } else {
    return res.status(401).json({ message: "لطفا ابتدا وارد شوید" });
  }
};

// Athorization methods
// admin = 1, sgm = 2, ggm = 3, expert = 4

// check user is "admin" or not
const isAdmin = (req, res, next) => {
  if (req.user.role === 1) {
    next();
  } else {
    return res.status(403).json({ message: "دسترسی غیر مجاز" });
  }
};

// check user is "specialized group manager" or not
const isSgm = (req, res, next) => {
  if (req.user.role === 2) {
    next();
  } else {
    return res.status(403).json({ message: "دسترسی غیر مجاز" });
  }
};

// check user is "general group manager" or not
const isGgm = (req, res, next) => {
  if (req.user.role === 3) {
    next();
  } else {
    return res.status(403).json({ message: "دسترسی غیر مجاز" });
  }
};

// check user is "general group manager" or "specialized group manager" or non of them
const isSgm_or_Ggm = (req, res, next) => {
  if (req.user.role === 2 || req.user.role === 3) {
    next();
  } else {
    return res.status(403).json({ message: "دسترسی غیر مجاز" });
  }
};

// check user is expert or not
const isExpert = (req, res, next) => {
  if (req.user.role === 4) {
    next();
  } else {
    return res.status(403).json({ message: "دسترسی غیر مجاز" });
  }
};

// check user either is admin or once who wants to change their own informaitions not others
// for baseUrl/users (PUT)
const isAdmin_or_Self_updating = (req, res, next) => {
  if (req.user.role === 1 || Number(req.body.data.id) === req.user.id) {
    next();
  } else {
    return res.status(403).json({ message: "دسترسی غیر مجاز" });
  }
};

module.exports = {
  requireAuth,
  isAdmin,
  isSgm,
  isGgm,
  isSgm_or_Ggm,
  isExpert,
  isAdmin_or_Self_updating,
};
