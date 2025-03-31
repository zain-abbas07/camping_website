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

// User signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const user = await prisma.user.create({
    data: { name, email, password },
  });
  res.json(user);
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));
