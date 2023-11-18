const express = require("express");
const cors = require("cors");require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

app.get("/gpa", (req, res) => {
  const data = req.body;
  // Check if the request body is an array of objects
  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: "Invalid input. Please send an array of objects." });
  }

  let totalWeight = 0;
  let totalGradePoints = 0;

  // Iterate through the array and calculate the total grade points and total weight
  data.forEach(item => {
    if (typeof item[0] === 'number' && typeof item[1] === 'number') {
      totalGradePoints += item[0] * item[1];
      totalWeight += item[1];
    }
  });

  // Calculate the GPA
  const gpa = totalWeight > 0 ? totalGradePoints / totalWeight : 0;

  res.json({ gpa });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});