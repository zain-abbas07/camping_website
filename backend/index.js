require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Camping Booking API!");
});

// Fetch all campsites
app.get("/campsites", async (req, res) => {
  const campsites = await prisma.campsite.findMany();
  res.json(campsites);
});
// Fetch a single campsite by ID
app.get("/campsites/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Looking for campsite with ID:", id);

  const campsite = await prisma.campsite.findUnique({
    where: { id: parseInt(id) },
  });
  if (!campsite) {
    console.log("Campsite not found");
    return res.status(404).json({ error: "Campsite not found" });
  }
  res.json(campsite);
});

// User signup
const bcrypt = require('bcrypt');

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Email already in use" });
  }
});
// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  
  // Remove password before sending
  const { password: _, ...userWithoutPassword } = user;

  res.json(userWithoutPassword);
});
//get bookings by user id
app.get("/bookings", async (req, res) => {
  const { userId } = req.query;
  const bookings = await prisma.booking.findMany({
    where: { userId: parseInt(userId) },
    include: { campsite: true },
  });
  res.json(bookings);
});
// Create a booking
app.post("/bookings", async (req, res) => {
  const { userId, campsiteId, checkIn, checkOut, totalPrice } = req.body;
  const booking = await prisma.booking.create({
    data: {
      userId: parseInt(userId),
      campsiteId: parseInt(campsiteId),
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      totalPrice: parseFloat(totalPrice),
    },
  });
  res.json(booking);
});
// See Account details
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: { id: true, name: true, email: true }
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});
// Update Name/Email
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email }
    });
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Could not update profile" });
  }
});
// change password
const bcrypt = require('bcrypt')

app.put("/users/:id/password", async (req, res) => {
  const { id } = req.params;
  const { current, new: newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return res.status(401).json({ error: "Incorrect current password" });

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: parseInt(id) },
    data: { password: hashedNewPassword }
  });

  res.json({ success: true });
});


// Start server
app.listen(3000, () => console.log("Server running on port 3000"));
