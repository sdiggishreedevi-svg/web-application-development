
import { useEffect, useState } from "react";

function DonationForm({ onDonationAdded }) {
  const [donors, setDonors] = useState([]);
  const [form, setForm] = useState({
    donor_id: "",
    organ: "",
    donation_date: "",
    notes: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/donors")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load donors");
        return response.json();
      })
      .then(setDonors)
      .catch(() => setMessage("Could not load donors. Check the backend."));
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!form.donor_id || !form.organ || !form.donation_date) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          donor_id: Number(form.donor_id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not add donation record.");
      }

      setMessage("Donation record added successfully!");
      setForm({
        donor_id: "",
        organ: "",
        donation_date: "",
        notes: "",
      });

      if (onDonationAdded) onDonationAdded();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="donation-form-section" id="donations">
      <h2>Add Donation Record</h2>
      <p>Record a donation for project tracking purposes.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="donor_id">Select Registered Donor *</label>
        <select
          id="donor_id"
          name="donor_id"
          value={form.donor_id}
          onChange={handleChange}
          required
        >
          <option value="">Choose a donor</option>
          {donors.map((donor) => (
            <option key={donor.id} value={donor.id}>
              {donor.full_name} — {donor.blood_group}
            </option>
          ))}
        </select>

        <label htmlFor="organ">Organ *</label>
        <select
          id="organ"
          name="organ"
          value={form.organ}
          onChange={handleChange}
          required
        >
          <option value="">Select organ</option>
          <option value="Kidney">Kidney</option>
          <option value="Liver">Liver</option>
          <option value="Heart">Heart</option>
          <option value="Lungs">Lungs</option>
          <option value="Pancreas">Pancreas</option>
          <option value="Cornea">Cornea</option>
        </select>

        <label htmlFor="donation_date">Record Date *</label>
        <input
          id="donation_date"
          type="date"
          name="donation_date"
          value={form.donation_date}
          onChange={handleChange}
          required
        />

        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Enter notes"
        />

        <button type="submit">Add Donation Record</button>
      </form>

      {message && <p role="status">{message}</p>}
    </section>
  );
}

export default DonationForm;
