import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  //No token
  if (!authHeader) {
    return res.status(401).json({
      error: "Access denied. No token provided.",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};

export default authMiddleware;
