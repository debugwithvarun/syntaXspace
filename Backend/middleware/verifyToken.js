import jwt from "jsonwebtoken"

function verifyToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "No Token Provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.data = decoded
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or Expired Token" })
    }
}
export default verifyToken;