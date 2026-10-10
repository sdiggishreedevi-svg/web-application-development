import { useState } from "react";

function DonorForm({ onDonorsChange }) {
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    blood_group: "",
    phone: "",
    email: "",
    city: "",
    organ: "",
    medical_conditions: "",
    consent: false
  });

  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/donors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Donor registered successfully!");
        onDonorsChange();

        setFormData({
          full_name: "",
          age: "",
          gender: "",
          blood_group: "",
          phone: "",
          email: "",
          city: "",
          organ: "",
          medical_conditions: "",
          consent: false
        });
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the backend.");
    }
  };

  return (
    <section className="registration-section" id="register">
      <h2>Register as an Organ Donor</h2>

      <p>
        Please provide the following information to register as a donor.
      </p>

      <form className="donor-form" onSubmit={handleSubmit}>

        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="full_name"
              placeholder="Enter full name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Age</label>

            <input
              type="number"
              name="age"
              placeholder="Enter age"
              value={formData.age}
              onChange={handleChange}
            />
          </div>
        </div>


        <div className="form-row">
          <div className="form-group">
            <label>Gender</label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Blood Group</label>

            <select
              name="blood_group"
              value={formData.blood_group}
              onChange={handleChange}
            >
              <option value="">Select blood group</option>
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
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>


        <div className="form-row">
          <div className="form-group">
            <label>City</label>

            <input
              type="text"
              name="city"
              placeholder="Enter city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Organ Willing to Donate</label>

            <select
              name="organ"
              value={formData.organ}
              onChange={handleChange}
            >
              <option value="">Select organ</option>
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


        <div className="form-group full-width">
          <label>Medical Conditions</label>

          <textarea
            name="medical_conditions"
            placeholder="Enter relevant medical conditions (optional)"
            rows="4"
            value={formData.medical_conditions}
            onChange={handleChange}
          ></textarea>
        </div>


        <div className="consent">
          <label>
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
            />

            I confirm that I voluntarily consent to organ donation.
          </label>
        </div>


        <button type="submit" className="register-button">
          Register Donor
        </button>

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

      </form>
    </section>
  );
}

export default DonorForm;