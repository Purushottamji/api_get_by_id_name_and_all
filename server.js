const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(bodyParser.json());

// Secret key (store in .env in production)
const JWT_SECRET = "my_super_secret_key";

// Mock database (replace with real DB later)
const users = [];

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  // Check if user exists
  const existingUser = users.find((u) => u.email === email);
  if (existingUser)
    return res.status(400).json({ message: "User already registered" });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, name, email, password: hashedPassword };

  users.push(newUser);

  res.status(201).json({ message: "User registered successfully", user: { id: newUser.id, email } });
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  // Payload for token
  const payload = { id: user.id, email: user.email, name: user.name };

  // Generate token (valid for 1 hour)
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  res.json({ message: "Login successful", token });
});

/* =============================
   3️⃣ JWT Middleware (Verify)
============================= */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });

    req.user = decoded; // Save decoded data for use in next routes
    next();
  });
}

/* =============================
   4️⃣ Protected Route
============================= */
app.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Access granted to protected route",
    user: req.user,
  });
});

/* =============================
   5️⃣ Decode Token (Without Verify)
============================= */
app.post("/decode-token", (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ message: "Token is required" });

  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) return res.status(400).json({ message: "Invalid token" });

  res.json({
    message: "Decoded token data (no verification done)",
    decoded,
  });
});

/* =============================
   6️⃣ Logout (Client-side handled)
============================= */
app.post("/logout", (req, res) => {
  // JWT is stateless; just tell client to delete token
  res.json({ message: "Logout successful (delete token on client side)" });
});

/* =============================
   🚀 Start Server
============================= */
app.listen(3000, () => {
  console.log("✅ JWT Auth Server running on port 3000");
});
