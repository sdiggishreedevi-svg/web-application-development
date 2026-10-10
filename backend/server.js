
import express from "express";
import cors from "cors";
import db from "./database.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ==============================
// Home route
// ==============================

app.get("/", (req, res) => {
  res.send("Organ Donation Management System Backend is running");
});

// ==============================
// Test route
// ==============================

app.get("/api/health", (req, res) => {
  res.json({
    message: "Organ Donation Management System API is running",
  });
});

// ==============================
// Register a new donor
// ==============================

app.post("/api/donors", (req, res) => {
  try {
    const {
      full_name,
      age,
      gender,
      blood_group,
      phone,
      email,
      city,
      organ,
      medical_conditions,
      consent,
    } = req.body;

    if (
      !full_name ||
      !age ||
      !gender ||
      !blood_group ||
      !phone ||
      !email ||
      !city ||
      !organ
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    if (!consent) {
      return res.status(400).json({
        message: "Donor consent is required.",
      });
    }

    const statement = db.prepare(`
      INSERT INTO donors (
        full_name,
        age,
        gender,
        blood_group,
        phone,
        email,
        city,
        organ,
        medical_conditions,
        consent
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = statement.run(
      full_name,
      age,
      gender,
      blood_group,
      phone,
      email,
      city,
      organ,
      medical_conditions || "",
      consent ? 1 : 0
    );

    res.status(201).json({
      message: "Donor registered successfully.",
      donorId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to register donor.",
    });
  }
});

// ==============================
// Get all donors
// ==============================

app.get("/api/donors", (req, res) => {
  try {
    const donors = db
      .prepare("SELECT * FROM donors ORDER BY id DESC")
      .all();

    res.json(donors);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch donors.",
    });
  }
});

// ==============================
// Get available donor count
// ==============================

app.get("/api/donors/available/count", (req, res) => {
  try {
    const result = db
      .prepare(
        "SELECT COUNT(*) AS count FROM donors WHERE consent = 1"
      )
      .get();

    res.json({
      count: result.count,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch available donor count.",
    });
  }
});

// ==============================
// Update a donor
// ==============================

app.put("/api/donors/:id", (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      age,
      gender,
      blood_group,
      phone,
      email,
      city,
      organ,
      medical_conditions,
      consent,
    } = req.body;

    if (
      !full_name ||
      !age ||
      !gender ||
      !blood_group ||
      !phone ||
      !email ||
      !city ||
      !organ
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const statement = db.prepare(`
      UPDATE donors
      SET
        full_name = ?,
        age = ?,
        gender = ?,
        blood_group = ?,
        phone = ?,
        email = ?,
        city = ?,
        organ = ?,
        medical_conditions = ?,
        consent = ?
      WHERE id = ?
    `);

    const result = statement.run(
      full_name,
      age,
      gender,
      blood_group,
      phone,
      email,
      city,
      organ,
      medical_conditions || "",
      consent ? 1 : 0,
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Donor not found.",
      });
    }

    res.json({
      message: "Donor updated successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update donor.",
    });
  }
});

// ==============================
// Delete a donor
// ==============================

app.delete("/api/donors/:id", (req, res) => {
  try {
    const { id } = req.params;

    const result = db
      .prepare("DELETE FROM donors WHERE id = ?")
      .run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Donor not found.",
      });
    }

    res.json({
      message: "Donor deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete donor.",
    });
  }
});

// ==================================================
// ORGAN DONATIONS API
// ==================================================

// ==============================
// Create a donation record
// POST /api/donations
// ==============================

app.post("/api/donations", (req, res) => {
  try {
    const {
      donor_id,
      organ,
      donation_date,
      status,
      notes,
    } = req.body;

    const validStatuses = [
      "Pending",
      "Completed",
      "Cancelled",
    ];

    if (!organ || !donation_date) {
      return res.status(400).json({
        message: "Organ and donation date are required.",
      });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid donation status.",
      });
    }

    let donorId = null;

    if (donor_id !== undefined && donor_id !== null && donor_id !== "") {
      donorId = Number(donor_id);

      if (!Number.isInteger(donorId) || donorId <= 0) {
        return res.status(400).json({
          message: "Please provide a valid donor ID.",
        });
      }

      const donor = db
        .prepare("SELECT id FROM donors WHERE id = ?")
        .get(donorId);

      if (!donor) {
        return res.status(404).json({
          message: "The selected donor was not found.",
        });
      }
    }

    const statement = db.prepare(`
      INSERT INTO organ_donations (
        donor_id,
        organ,
        donation_date,
        status,
        notes
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = statement.run(
      donorId,
      organ,
      donation_date,
      status || "Pending",
      notes || ""
    );

    res.status(201).json({
      message: "Donation record created successfully.",
      donationId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create donation record.",
    });
  }
});

// ==============================
// Get all donation records
// GET /api/donations
// ==============================

app.get("/api/donations", (req, res) => {
  try {
    const donations = db.prepare(`
      SELECT
        organ_donations.*,
        donors.full_name AS donor_name
      FROM organ_donations
      LEFT JOIN donors
        ON organ_donations.donor_id = donors.id
      ORDER BY organ_donations.id DESC
    `).all();

    res.json(donations);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch donation records.",
    });
  }
});

// ==============================
// Get donation record count
// GET /api/donations/count
// ==============================

app.get("/api/donations/count", (req, res) => {
  try {
    const result = db
      .prepare("SELECT COUNT(*) AS count FROM organ_donations")
      .get();

    res.json({
      count: result.count,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch donation count.",
    });
  }
});

// ==============================
// Update a donation record
// PUT /api/donations/:id
// ==============================



app.put("/api/donations/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid donation status.",
      });
    }

    const result = db
      .prepare(
        "UPDATE organ_donations SET status = ? WHERE id = ?"
      )
      .run(status, Number(id));

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Donation record not found.",
      });
    }

    res.json({
      message: "Donation status updated successfully.",
    });
  } catch (error) {
    console.error("Donation status update error:", error);

    res.status(500).json({
      message: "Failed to update donation status.",
    });
  }
});

 
// ==============================
// Delete a donation record
// DELETE /api/donations/:id
// ==============================

app.delete("/api/donations/:id", (req, res) => {
  try {
    const { id } = req.params;

    const result = db
      .prepare("DELETE FROM organ_donations WHERE id = ?")
      .run(Number(id));

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Donation record not found.",
      });
    }

    res.json({
      message: "Donation record deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete donation record.",
    });
  }
});

// ==============================
// Start server
// ==============================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

