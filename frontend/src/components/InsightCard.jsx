import React from "react";

const InsightCard = ({ title, value, note }) => {
  return (
    <div className="insight-card">
      <div className="insight-title">{title}</div>
      <div className="insight-value">{value}</div>
      <div className="insight-note">{note}</div>
    </div>
  );
};

export default InsightCard;
