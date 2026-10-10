
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import DonorForm from "./components/DonorForm";
import DonorList from "./components/DonorList";
import DonationForm from "./components/DonationForm";
import DonationList from "./components/DonationList";

function App() {
  const [donorCount, setDonorCount] = useState(0);
  const [availableDonorCount, setAvailableDonorCount] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [donationRefreshKey, setDonationRefreshKey] = useState(0);

  const refreshDashboard = useCallback(async () => {
    try {
      const [
        donorsResponse,
        availableResponse,
        donationsResponse,
      ] = await Promise.all([
        fetch("http://localhost:5000/api/donors"),
        fetch("http://localhost:5000/api/donors/available/count"),
        fetch("http://localhost:5000/api/donations/count"),
      ]);

      if (
        !donorsResponse.ok ||
        !availableResponse.ok ||
        !donationsResponse.ok
      ) {
        throw new Error("Failed to fetch dashboard counts.");
      }

      const donors = await donorsResponse.json();
      const availableData = await availableResponse.json();
      const donationsData = await donationsResponse.json();

      setDonorCount(donors.length);
      setAvailableDonorCount(availableData.count);
      setDonationCount(donationsData.count);
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
    }
  }, []);

  const handleDonationChange = useCallback(() => {
    setDonationRefreshKey((current) => current + 1);
    refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">🫀 OrganCare</div>

        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#donors">Donors</a>
          <a href="#register">Register Donor</a>
          <a href="#donations">Donations</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="dashboard">
          <div className="hero-text">
            <p className="tagline">
              ORGAN DONATION MANAGEMENT SYSTEM
            </p>

            <h1>Give the gift of life.</h1>

            <p>
              A simple platform to manage organ donors, donor information,
              and donation records efficiently.
            </p>

            <button
              type="button"
              onClick={() =>
                document.getElementById("register")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Register as Donor
            </button>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <h2>{donorCount}</h2>
            <p>Total Donors</p>
          </div>

          <div className="stat-card">
            <h2>{availableDonorCount}</h2>
            <p>Available Donors</p>
          </div>

          <div className="stat-card">
            <h2>{donationCount}</h2>
            <p>Organ Donations</p>
          </div>

          <div className="stat-card">
            <h2>0</h2>
            <p>Successful Matches</p>
          </div>
        </section>

        <DonorList onDonorsChange={refreshDashboard} />

        <DonorForm onDonorsChange={refreshDashboard} />

        <DonationForm onDonationAdded={handleDonationChange} />

        <DonationList
          refreshKey={donationRefreshKey}
          onDonationChange={handleDonationChange}
        />
      </main>
    </div>
  );
}

export default App;
