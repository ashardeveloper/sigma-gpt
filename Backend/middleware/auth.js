import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);

  //No token
  if (!authHeader) {
    return res.status(401).json({
      error: "Access denied. No token provided.",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    console.log("token", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("after middleware", decoded);

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
