require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const cookieParser = require('cookie-parser');
const app = express();


app.use(express.json());
app.use(cookieParser());



const connect = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://Ramneek:iamunique@cluster0.cyzml.mongodb.net/JWT', { useNewUrlParser: true, useUnifiedTopology: true, createIndexes: true });
    console.log('Database Connected:', conn.connection.host)
  }
  catch {
    console.log("Database coudn't connect")
  }
}

connect()

app.use("/api", authRoutes)
app.use("/contact" ,contactRoutes )
app.use("/api/dashboard/workspace" , workspaceRoutes)



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
