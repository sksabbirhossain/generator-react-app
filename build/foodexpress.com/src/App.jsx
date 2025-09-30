import React from "react";
import Contact from "./components/Contact";
import Heading from "./components/Heading";

export default function App() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 24 }}>
      <section style={{ padding: "48px 0", textAlign: "center" }}>
        <Heading />
      </section>

      <section style={{ padding: "48px 0", borderTop: "1px solid #eee" }}>
        <Contact phone="01712345678" address="House 12, Road 5, Banani, Dhaka" />
      </section>
    </div>
  );
}
