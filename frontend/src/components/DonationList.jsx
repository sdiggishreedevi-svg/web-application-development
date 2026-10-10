
import { useCallback, useEffect, useState } from "react";

function DonationList({ refreshKey, onDonationChange }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/donations");

      if (!response.ok) {
        throw new Error("Failed to load donation records.");
      }

      const data = await response.json();
      setDonations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations, refreshKey]);

  
async function updateStatus(donation, status) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/donations/${donation.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donor_id: donation.donor_id,
          organ: donation.organ,
          donation_date: donation.donation_date,
          status: status,
          notes: donation.notes || "",
        }),
      }
    );

    const data = await response.json();

   if (!response.ok) {
  console.error("Status update failed:", data);
  throw new Error(
    data.message || data.error || `Request failed: ${response.status}`
  );
}
    await fetchDonations();

    if (onDonationChange) {
      onDonationChange();
    }
  } catch (err) {
    setError(err.message);
  }
}


  async function deleteDonation(id) {
    if (!window.confirm("Delete this donation record?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/donations/${id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete record.");
      }

      await fetchDonations();
      if (onDonationChange) onDonationChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="donation-list-section">
      <h2>Donation Records</h2>
      <p>Total records: {donations.length}</p>

      {loading && <p>Loading donation records...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && donations.length === 0 && (
        <p>No donation records yet. Add one using the form above.</p>
      )}

      {!loading && donations.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Donor</th>
                <th>Organ</th>
                <th>Record Date</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td>{donation.id}</td>
                  <td>
                    {donation.full_name || `Donor #${donation.donor_id}`}
                  </td>
                  <td>{donation.organ}</td>
                  <td>{donation.donation_date}</td>
                  <td>
                    <select
                      value={donation.status}
                      onChange={(event) =>
                        updateStatus(donation, event.target.value)
                      }
                      aria-label={`Status for donation ${donation.id}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{donation.notes || "—"}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => deleteDonation(donation.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default DonationList;
