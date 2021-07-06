import { Tag } from "antd";
import React, { FC } from "react";
import { InceptionPerformance } from "../../actions/bonfida";

interface InceptionPerfomanceProps {
  inceptionPerformance: InceptionPerformance;
}
export const InceptionPerformanceCell: FC<InceptionPerfomanceProps> = ({
  inceptionPerformance,
}) => {
  return (
    <>
      <Tag>
        {inceptionPerformance !== null
          ? `${inceptionPerformance.toFixed(2)}%`
          : "Not Available"}
      </Tag>
    </>
  );
};
