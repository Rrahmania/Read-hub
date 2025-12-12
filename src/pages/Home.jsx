import React from "react";
import WelcomeSection from "../components/sections/WelcomeSection/WelcomeSection";
import TentangKami from "../components/sections/TentangKami/TentangKami";

const Home = () => {
  return (
    <div className="home-wrapper">
      <WelcomeSection />
      <TentangKami />
    </div>
  );
};

export default Home;
