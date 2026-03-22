import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // FIX 6: Check cookie first, then Authorization: Bearer <token> header
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log("Decoded token:", decoded); // Debugging log
    // CRITICAL
    req.data = decoded

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyToken;