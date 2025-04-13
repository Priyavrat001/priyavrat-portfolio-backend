import express from 'express';
import cors from 'cors';
import spotify from "./routes/spotiy.js"

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/v1', spotify);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
