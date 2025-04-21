require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const rateLimit = require("express-rate-limit");
const app = express();
const prisma = new PrismaClient();
const helmet = require("helmet");
const bcrypt = require('bcrypt');

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/", (req, res) => {
  res.send("Welcome to the Camping Booking API!");
});

// ========== CAMPSITES ==========

// Create a campsite
app.post('/campsites', upload.array('images'), async (req, res) => {
  const { ownerId, name, description, price, location, amenities, availability } = req.body;
  const images = req.files.map((file) => file.path);

  try {
    const campsite = await prisma.campsite.create({
      data: {
        ownerId: parseInt(ownerId),
        name,
        description,
        price: parseFloat(price),
        location: JSON.parse(location),
        amenities: {
          create: JSON.parse(amenities).map((name) => ({ name })),
        },
        availability: {
          create: JSON.parse(availability).map((slot) => ({
            date: new Date(slot.date),
            available: slot.available,
          })),
        },
        images: {
          create: images.map((url) => ({ url })),
        },
      },
    });
    res.json({ success: true, campsite });
  } catch (err) {
    console.error('Error creating campsite:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Fetch all campsites
app.get("/campsites", async (req, res) => {
  const { ownerId } = req.query;

  try {
    const campsites = await prisma.campsite.findMany({
      where: ownerId ? { ownerId: parseInt(ownerId) } : {}, // Filter by ownerId if provided
    });
    res.json(campsites);
  } catch (err) {
    console.error("Error fetching campsites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
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

// ========== AUTH ==========

// User signup

app.post("/signup", async (req, res) => {
  const { name, email,username, password, phoneNumber, role } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        phoneNumber,
        role: role || "USER"
      },
    });

     // Remove password from response
     const { password: _, ...userWithoutPassword } = user;
     res.json({ success: true, user: userWithoutPassword });
 
} catch (err) {
  console.error("Signup error:", err);

  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(400).json({ success: false, error: `${field} already in use` });
  }

  res.status(500).json({ success: false, error: "Internal server error", message: err.message });
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

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ success: false, error: "Invalid email or password" });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

// ========== BOOKINGS ==========


//get bookings by user id
app.get("/bookings", async (req, res) => {
  const { userId } = req.query;
  const bookings = await prisma.booking.findMany({
    where: { userId: parseInt(userId) },
    include: { campsite: true },
  });
  res.json(bookings);
});

// Get bookings for an owner's campsites
app.get("/owner/bookings", async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    return res.status(400).json({ error: "Missing ownerId" });
  }

  try {
    // Get all campsite IDs owned by this owner
    const campsites = await prisma.campsite.findMany({
      where: {
        ownerId: parseInt(ownerId),
      },
      select: {
        id: true,
      },
    });

    if (campsites.length === 0) {
      return res.json([]); // No campsites found for this owner
    }

    const campsiteIds = campsites.map(c => c.id);

    // Get bookings for those campsites
    const bookings = await prisma.booking.findMany({
      where: {
        campsiteId: { in: campsiteIds },
      },
      include: {
        campsite: true,
        user: true, // optional: to show who booked
      },
    });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching owner bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Create a booking
app.post("/bookings", async (req, res) => {
  const { userId, campsiteId, checkIn, checkOut, totalPrice } = req.body;

  if (new Date(checkIn) >= new Date(checkOut)) {
    return res.status(400).json({ success: false, error: "Check-in must be before check-out" });
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        userId: parseInt(userId),
        campsiteId: parseInt(campsiteId),
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalPrice: parseFloat(totalPrice),
      },
    });

    res.json({ success: true, booking });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ========== ACCOUNT ==========

// See Account details
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
    },
  });

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  res.json({ success: true, user });
});

// Update Name/Email
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email },
    });

    res.json({ success: true, user: updated });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: "Could not update profile" });
  }
});

// change password

// Change password
app.put("/users/:id/password", async (req, res) => {
  const { id } = req.params;
  const { current, new: newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, error: "Incorrect current password" });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: parseInt(id) },
    data: { password: hashedNewPassword },
  });

  res.json({ success: true });
});

module.exports = app;

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));