import { Tooltip } from "antd";
import React, { FC } from "react";
import { PositionValueData } from "../../actions/bonfida";
import { formatUSD } from "../../utils/utils";
import { ReactComponent as InfoIcon } from "../../assets/info.svg";

export const PositionValueCell: FC<PositionValueData> = ({
  totalValue,
  assetBalances,
}) => {
  const labels = Object.entries(assetBalances)
    .sort((a, b) => Number(b[1].value) - Number(a[1].value))
    .map<JSX.Element>(([token, amount]) => (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ paddingRight: "8px" }}>{token}</span>
        <span>{amount.value}</span>
      </div>
    ));

  return (
    <div className="cell-container">
      <div className="pool-value">{formatUSD.format(totalValue)}</div>
      <div className="more">
        <span>
          Across {labels.length} Asset{labels.length > 1 ? "s" : ""}
        </span>
        <Tooltip placement="bottomLeft" title={labels} arrowPointAtCenter>
          <InfoIcon className="more-info" />
        </Tooltip>
      </div>
    </div>
  );
};
