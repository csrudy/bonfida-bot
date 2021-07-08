import { Tag } from "antd";
import React, { FC } from "react";
import { InceptionPerformance } from "../../actions/bonfida";

interface InceptionPerfomanceProps {
  inceptionPerformance: InceptionPerformance;
}
export const InceptionPerformanceCell: FC<InceptionPerfomanceProps> = ({
  inceptionPerformance,
}) => {
  let color, backgroundColor;
  let sign = "";
  if (inceptionPerformance !== null && inceptionPerformance > 0) {
    color = "#06D6A0";
    backgroundColor = "rgba(6, 214, 160, 0.5)";
    sign = "+";
  } else if (inceptionPerformance !== null && inceptionPerformance < 0) {
    color = "#FF5A00";
    backgroundColor = "rgba(217, 76, 0, 0.4)";
  }
  const tagStyles = {
    color,
    backgroundColor,
    border: "none",
    borderRadius: "2px",
  };
  return (
    <>
      <Tag style={tagStyles}>
        {inceptionPerformance !== null
          ? `${sign}${inceptionPerformance.toFixed(2)}%`
          : "-"}
      </Tag>
    </>
  );
};
