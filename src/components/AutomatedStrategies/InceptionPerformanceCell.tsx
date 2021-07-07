import { Tag } from "antd";
import React, { FC } from "react";
import { InceptionPerformance } from "../../actions/bonfida";

interface InceptionPerfomanceProps {
  inceptionPerformance: InceptionPerformance;
}
export const InceptionPerformanceCell: FC<InceptionPerfomanceProps> = ({
  inceptionPerformance,
}) => {
  let color;
  let sign = "";
  if (inceptionPerformance !== null && inceptionPerformance > 0) {
    color = "#06D6A0";
    sign = "+";
  } else if (inceptionPerformance !== null && inceptionPerformance > 0) {
    color = "#FF5A00";
    sign = "-";
  }

  return (
    <>
      <Tag color={color}>
        {inceptionPerformance !== null
          ? `${sign}${inceptionPerformance.toFixed(2)}%`
          : "-"}
      </Tag>
    </>
  );
};
