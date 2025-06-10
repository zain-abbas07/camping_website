require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const rateLimit = require("express-rate-limit");
const app = express();
const prisma = new PrismaClient();
const helmet = require("helmet");
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require("path");
const axios = require('axios');
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Add PATCH here
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  })
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
}));
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/", (req, res) => {
  res.send("Welcome to the Camping Booking API!");
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique filename
  },
});

const upload = multer({ storage });



// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ========== CAMPSITES ==========

// Create a campsite
app.post('/campsites', upload.array('images'), async (req, res) => {
  const { ownerId, name, description, price, location, amenities } = req.body;
  const parsedLocation = JSON.parse(location);
  const address = `${parsedLocation.street || ''} ${parsedLocation.houseNumber || ''}, ${parsedLocation.city}, ${parsedLocation.state || ''}, ${parsedLocation.country}`;
  // Geocode using Google Maps API
  try {
    const geoRes = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (
      geoRes.data.status !== 'OK' ||
      !geoRes.data.results ||
      geoRes.data.results.length === 0
    ) {
      return res.status(400).json({ success: false, error: 'Unable to geocode address.' });
    }

    const { lat, lng } = geoRes.data.results[0].geometry.location;

    // Save to DB with coordinates
    const campsite = await prisma.campsite.create({
      data: {
        owner: { connect: { id: parseInt(ownerId) } },
        name,
        description,
        price: parseFloat(price),
        location: {
          create: {
            ...parsedLocation,
            latitude: lat,
            longitude: lng,
          },
        },
        amenity: {
          create: JSON.parse(amenities).map((name) => ({ name })),
        },
        image: {
          create: req.files.map((file) => ({ url: `uploads/${file.filename}` })),
        },
      },
    });

    res.json({ success: true, campsite });
  } catch (err) {
    console.error('Error creating campsite:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
    return res.status(400).json({ success: false, error: 'Unable to verify address. Please enter a valid address.' });
  
  }
});

// Fetch all campsites
// Fetch all campsites
app.get("/campsites", async (req, res) => {
  const { minPrice, maxPrice, location, amenities, ownerId } = req.query;

  // Build amenity filters for AND logic
  const amenitiesArray = amenities ? amenities.split(",") : [];
  const amenityFilters = amenitiesArray.map(name => ({
    amenity: { some: { name } }
  }));

  try {
    const where = {
      AND: [
        ownerId ? { ownerId: parseInt(ownerId) } : {},
        minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
        maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
        location
          ? {
              location: {
                is: {
                  city: {
                    contains: location,
                  },
                },
              },
            }
          : {},
        ...amenityFilters, // <-- This is the key change!
      ],
    };
    const campsites = await prisma.campsite.findMany({
      where,
      include: {
        location: true,
        amenity: true,
        image: true,
      },
    });

    // Transform the location object into a string (e.g., "City, Country")
    const transformedCampsites = campsites.map((campsite) => ({
      ...campsite,
      location: campsite.location
        ? `${campsite.location.city}, ${campsite.location.country}`
        : "Unknown Location",
    }));

    res.json(transformedCampsites);
  } catch (err) {
    console.error("Error fetching campsites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Fetch a single campsite by ID
app.get("/campsites/:id", async (req, res) => {
  const { id } = req.params;
  // console.log('Fetching campsite with ID:', id);

  try {
    const campsite = await prisma.campsite.findUnique({
      where: { id: parseInt(id) },
      include: {
        location: true, // Include location details
        amenity: true, // Include amenities
        image: true, // Include images
        owner: { // Include owner details
          select: {
            id: true,
            name: true,
            email: true,
          },
        }
      },
    });
    // console.log('Campsite fetched:', campsite);
    if (!campsite) {
      return res.status(404).json({ error: "Campsite not found" });
    }

     // Ensure latitude and longitude are part of the location object
     const locationWithCoordinates = {
      ...campsite.location,
      latitude: campsite.location?.latitude || 0, // Default to 0 if undefined
      longitude: campsite.location?.longitude || 0, // Default to 0 if undefined
    };

    res.json({ ...campsite, location: locationWithCoordinates })
  } catch (err) {
    console.error("Error fetching campsite:", err)
    res.status(500).json({ error: "Internal server error" })
  }
});

// Update a campsite
app.patch('/campsites/:id', upload.array('newImages'), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, location, amenities, imagesToRemove } = req.body;

  try {
    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);

    if (location) {
      updateData.location = {
        update: JSON.parse(location),
      };
    }

    if (amenities) {
      updateData.amenity = {
        deleteMany: {},
        create: JSON.parse(amenities).map((name) => ({ name })),
      };
    }

    if (imagesToRemove) {
      const imageIds = JSON.parse(imagesToRemove);
      await prisma.image.deleteMany({
        where: { id: { in: imageIds } },
      });
    }

    if (req.files.length > 0) {
      updateData.image = {
        create: req.files.map((file) => ({ url: `uploads/${file.filename}` })),
      };
    }

    const updatedCampsite = await prisma.campsite.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        location: true,
        amenity: true,
        image: true,
      },
    });

    res.json({ success: true, campsite: updatedCampsite });
  } catch (err) {
    console.error('Error updating campsite:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
// ========== AUTH ==========

// User signup

app.post("/signup", async (req, res) => {
  const { name, email, username, password, phoneNumber, role } = req.body;

  // Phone number validation: allow empty/null or only digits, 7-15 chars
  if (phoneNumber && !/^\d{7,15}$/.test(phoneNumber)) {
    return res.status(400).json({ success: false, error: "Invalid phone number. Please enter digits only." });
  }

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
      // Prisma returns the field name in err.meta.target
      let field = err.meta?.target;
      if (Array.isArray(field)) field = field[0];
      if (field === 'User_email_key' || field === 'email') {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }
      if (field === 'User_username_key' || field === 'username') {
        return res.status(400).json({ success: false, error: 'Username already in use' });
      }
      if (field === 'User_phoneNumber_key' || field === 'phoneNumber') {
        return res.status(400).json({ success: false, error: 'Phone number already in use' });
      }
      return res.status(400).json({ success: false, error: 'Field already in use' });
    }
    res.status(500).json({ success: false, error: "Internal server error" });
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
        updatedAt: new Date(),
      },
    });

    res.json({ success: true, booking });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
app.get('/bookings/check-duplicate', async (req, res) => {
  const { userId, campsiteId, checkIn, checkOut } = req.query;

  try {
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId: parseInt(userId),
        campsiteId: parseInt(campsiteId),
        OR: [
          {
            checkIn: {
              lte: new Date(checkOut),
            },
            checkOut: {
              gte: new Date(checkIn),
            },
          },
        ],
      },
    });

    if (existingBooking) {
      return res.json({ isDuplicate: true });
    }

    res.json({ isDuplicate: false });
  } catch (err) {
    console.error('Error checking for duplicate bookings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a booking
app.patch('/bookings/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
    });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to cancel booking.' });
  }
});


// Approve a booking
app.patch('/bookings/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'CONFIRMED' },
    });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to approve booking.' });
  }
});

// ========== ACCOUNT ==========

// See Account details

// Verify password and fetch sensitive info
app.post('/users/:id/verify-password', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Incorrect password' });
  }

  res.json({ success: true, phoneNumber: user.phoneNumber });
});

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


// Update Name, Email, Phone Number, and Username
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const {name, email, username, phoneNumber } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    

    // Update the field
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(username && { username }),
        ...(phoneNumber && { phoneNumber }),
      },
    });

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error(err);
    // Handle unique constraint errors as before
    if (err.code === 'P2002') {
      let field = err.meta?.target;
      if (Array.isArray(field)) field = field[0];
      if (field === 'User_email_key' || field === 'email') {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }
      if (field === 'User_username_key' || field === 'username') {
        return res.status(400).json({ success: false, error: 'Username already in use' });
      }
      if (field === 'User_phoneNumber_key' || field === 'phoneNumber') {
        return res.status(400).json({ success: false, error: 'Phone number already in use' });
      }
      return res.status(400).json({ success: false, error: 'Field already in use' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Change password
app.put('/users/:id/password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect current password' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedNewPassword },
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = app;

// delete account
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete account.' });
  }
});

// ========== <Messages> ==========



// Send a message
app.post('/messages', async (req, res) => {
  const { senderId, receiverId, content, campsiteId } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: 'Missing senderId, receiverId, or content' });
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content,
        campsiteId: campsiteId ? parseInt(campsiteId) : null,
      },
    });

    res.json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Get messages between two users with optional campsiteId filter
app.get('/messages', async (req, res) => {
  const { senderId, receiverId, campsiteId } = req.query;

  if (!senderId || !receiverId || !campsiteId) {
    return res.status(400).json({ error: 'Missing senderId, receiverId, or campsiteId' });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        AND: [
          {
            OR: [
              { senderId: parseInt(senderId), receiverId: parseInt(receiverId) },
              { senderId: parseInt(receiverId), receiverId: parseInt(senderId) },
            ],
          },
          { campsiteId: parseInt(campsiteId) }, // Filter by campsiteId
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all conversations for a user (grouped by other user and listing)
app.get('/messages/inbox', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(userId) },
          { receiverId: parseInt(userId) }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    });

    // Group by other user (the "chat partner") and (optionally) listing
    const conversationsMap = {};
    for (const msg of messages) {
      // Find the chat partner (the other user)
      const partner = msg.senderId === parseInt(userId) ? msg.receiver : msg.sender;
      const key = `${partner.id}-${msg.campsiteId}`; // group by partner and campsite
      if (!conversationsMap[key]) {
        conversationsMap[key] = {
          partnerId: partner.id,
          partnerName: partner.name,
          campsiteId: msg.campsiteId, // always include this
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
        };
      }
    }

    const conversations = Object.values(conversationsMap);
    res.json(conversations);
  } catch (err) {
    console.error('Error fetching inbox:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));