
import { useEffect, useState } from "react";

function DonorList({ onDonorsChange }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [organ, setOrgan] = useState("");
  const [city, setCity] = useState("");

  // Edit state
  const [editingDonor, setEditingDonor] = useState(null);

  // Fetch all donors
  const fetchDonors = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/donors"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch donors");
      }

      const data = await response.json();
      setDonors(data);
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // Delete donor
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this donor?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/donors/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDonors((currentDonors) =>
          currentDonors.filter((donor) => donor.id !== id)
        );

        // Refresh dashboard counts after successful deletion
        onDonorsChange();
      } else {
        alert(data.message || "Unable to delete donor.");
      }
    } catch (error) {
      console.error("Error deleting donor:", error);
      alert("Unable to delete donor. Please check your connection.");
    }
  };

  // Start editing a donor
  const handleEdit = (donor) => {
    setEditingDonor({
      ...donor,
      consent: Boolean(donor.consent),
    });
  };

  // Handle changes in the edit form
  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditingDonor((currentDonor) => ({
      ...currentDonor,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save edited donor
  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/donors/${editingDonor.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingDonor),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update the donor in the displayed list
        setDonors((currentDonors) =>
          currentDonors.map((donor) =>
            donor.id === editingDonor.id
              ? { ...editingDonor, consent: Number(editingDonor.consent) }
              : donor
          )
        );

        // Refresh dashboard counts after successful update
        onDonorsChange();

        setEditingDonor(null);
        alert("Donor updated successfully!");
      } else {
        alert(data.message || "Unable to update donor.");
      }
    } catch (error) {
      console.error("Error updating donor:", error);
      alert("Unable to update donor. Please check your connection.");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setBloodGroup("");
    setOrgan("");
    setCity("");
  };

  // Filter donors
  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = (donor.full_name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesBloodGroup =
      bloodGroup === "" || donor.blood_group === bloodGroup;

    const matchesOrgan =
      organ === "" || donor.organ === organ;

    const matchesCity =
      city === "" ||
      (donor.city || "")
        .toLowerCase()
        .includes(city.toLowerCase());

    return (
      matchesSearch &&
      matchesBloodGroup &&
      matchesOrgan &&
      matchesCity
    );
  });

  return (
    <section className="donor-list-section" id="donors">
      <h2>Registered Donors</h2>

      <p>
        View, search and filter registered organ donors.
      </p>

      {/* Search and filters */}
      <div className="donor-filters">
        <input
          type="text"
          placeholder="Search by donor name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={bloodGroup}
          onChange={(event) => setBloodGroup(event.target.value)}
        >
          <option value="">All Blood Groups</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <select
          value={organ}
          onChange={(event) => setOrgan(event.target.value)}
        >
          <option value="">All Organs</option>
          <option value="Kidney">Kidney</option>
          <option value="Liver">Liver</option>
          <option value="Heart">Heart</option>
          <option value="Lungs">Lungs</option>
          <option value="Eyes">Eyes</option>
          <option value="Pancreas">Pancreas</option>
          <option value="Multiple">Multiple organs</option>
        </select>

        <input
          type="text"
          placeholder="Search by city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />

        <button
          type="button"
          className="clear-filter-button"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Edit donor form */}
      {editingDonor && (
        <div className="edit-donor-box">
          <h3>Edit Donor</h3>

          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={editingDonor.full_name || ""}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  value={editingDonor.age ?? ""}
                  onChange={handleEditChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={editingDonor.gender || ""}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Blood Group</label>
                <select
                  name="blood_group"
                  value={editingDonor.blood_group || ""}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editingDonor.phone || ""}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingDonor.email || ""}
                  onChange={handleEditChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={editingDonor.city || ""}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Organ</label>
                <select
                  name="organ"
                  value={editingDonor.organ || ""}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select Organ</option>
                  <option value="Kidney">Kidney</option>
                  <option value="Liver">Liver</option>
                  <option value="Heart">Heart</option>
                  <option value="Lungs">Lungs</option>
                  <option value="Eyes">Eyes</option>
                  <option value="Pancreas">Pancreas</option>
                  <option value="Multiple">Multiple organs</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Medical Conditions</label>
              <textarea
                name="medical_conditions"
                value={editingDonor.medical_conditions || ""}
                onChange={handleEditChange}
                rows="3"
              />
            </div>

            <div className="consent-group">
              <label>
                <input
                  type="checkbox"
                  name="consent"
                  checked={Boolean(editingDonor.consent)}
                  onChange={handleEditChange}
                />
                I confirm that the donor information is correct.
              </label>
            </div>

            <div className="edit-buttons">
              <button type="submit">
                Save Changes
              </button>

              <button
                type="button"
                className="cancel-edit-button"
                onClick={() => setEditingDonor(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Donor table */}
      {loading ? (
        <p>Loading donors...</p>
      ) : filteredDonors.length === 0 ? (
        <p>No donors match your search.</p>
      ) : (
        <div className="donor-table-container">
          <table className="donor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>City</th>
                <th>Organ</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDonors.map((donor) => (
                <tr key={donor.id}>
                  <td>{donor.full_name}</td>
                  <td>{donor.age}</td>
                  <td>{donor.gender}</td>
                  <td>{donor.blood_group}</td>
                  <td>{donor.city}</td>
                  <td>{donor.organ}</td>
                  <td>{donor.phone}</td>

                  <td>
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => handleEdit(donor)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDelete(donor.id)}
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

      <p className="donor-count">
        Showing {filteredDonors.length} of {donors.length} donors
      </p>
    </section>
  );
}

export default DonorList;
