import { Tooltip } from "antd";
import React, { FC } from "react";
import { PositionValue } from "../../actions/bonfida";
import { formatUSD } from "../../utils/utils";

export const PositionValueCell: FC<PositionValue> = ({
  totalValue,
  assetBalances,
}) => {
  const labels = Object.entries(assetBalances).map<JSX.Element>(
    ([token, amount]) => (
      <div>
        {token}: {amount.value}
      </div>
    )
  );

  return (
    <div
      className="cell-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          fontFamily: "Plus Jakarta Sans",
          fontStyle: "normal",
          fontWeight: 800,
          fontSize: "14px",
          lineHeight: "0px",
        }}
      >
        <strong>{formatUSD.format(totalValue)}</strong>
      </div>
      <div className="assets">
        <Tooltip placement="bottomLeft" title={labels}>
          <span style={{ fontSize: "10px" }}>
            Accross {labels.length} Asset{labels.length > 1 ? "s" : ""}
          </span>
        </Tooltip>
      </div>
    </div>
  );
};
