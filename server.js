const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5001;

app.post("/gpa", async (req, res) => {
  const student = req.body;

  // Check if the request body is an object with the expected properties
  if (
    !student ||
    typeof student !== "object" ||
    !student.grades ||
    !Array.isArray(student.grades)
  ) {
    return res.status(400).json({
      error:
        "Invalid input. Please send a valid student object with an array of grades.",
    });
  }

  let totalWeight = 0;
  let totalGradePoints = 0;

  // Iterate through the grades array and calculate the total grade points and total weight
  student.grades.forEach((grade) => {
    if (typeof grade.credit === "number" && typeof grade.grade === "string") {
      const gradePoints = convertGradeToPoints(grade.grade);
      totalGradePoints += gradePoints * grade.credit;
      totalWeight += grade.credit;
    }
  });

  // Calculate the GPA
  const gpa = totalWeight > 0 ? totalGradePoints / totalWeight : 0;
  let result = {
    name: student.name,
    credits: totalWeight,
    GPA: gpa,
    grades: student.grades,
    pdfFile: null,
  };
  if (student.isPDF) {
    try {
      const genPdfUrl = process.env.GENERATE_PDF_URL || "http://localhost:5000";
      const pdfResponse = await axios.post(
        genPdfUrl + "/generate-pdf/grade-calculator",
        result,
        {
          responseType: "arrayBuffer", // Specify responseType as 'arraybuffer' to receive binary data
        }
        // Add other data needed for PDF generation
      );
      result.pdfFile = pdfResponse.data

      res.send(result);
    } catch (error) {
      console.error("Error generating PDF:", error.message);
      res.status(500).json({ error: "Error generating PDF" });
    }
  } else {
    res.json(result);
  }
});

// Helper function to convert letter grades to grade points
function convertGradeToPoints(grade) {
  // You can customize this function based on your grading scale
  switch (grade) {
    case "A":
      return 4.0;
    case "B+":
      return 3.5;
    case "B":
      return 3.0;
    case "C+":
      return 2.5;
    case "C":
      return 2.0;
    case "D+":
      return 1.5;
    case "D":
      return 1.0;
    case "F":
      return 0.0;
    default:
      return 0.0; // default to 0.0 for unknown grades
  }
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
