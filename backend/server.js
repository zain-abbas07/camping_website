const express = require('express');
// const app = express();
const app = require('./index'); 
// const campsiteRoutes = require('./routes/campsiteRoutes');

// app.use(express.json());
// app.use('/api/campsites', campsiteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
