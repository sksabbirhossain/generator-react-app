import React from "react";
export default function Heading({ phone, address }) {
  return (
    <>
      <p>Phone: {phone}</p>
      <p>Address: {address}</p>
    </>
  );
}
