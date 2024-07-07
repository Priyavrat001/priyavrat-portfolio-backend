const express = require('express');
const contact = require("./routes/contact")
const db = require("./db")
const cors = require("cors")

db();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json())


app.use('/api/v1', contact)


app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});