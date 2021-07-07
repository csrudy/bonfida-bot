import { Tooltip } from "antd";
import React, { FC } from "react";
import { PositionValueData } from "../../actions/bonfida";
import { formatUSD } from "../../utils/utils";

export const PositionValueCell: FC<PositionValueData> = ({
  totalValue,
  assetBalances,
}) => {
  const labels = Object.entries(assetBalances)
    .sort((a, b) => Number(b[1].value) - Number(a[1].value))
    .map<JSX.Element>(([token, amount]) => (
      <div>
        {token}: {amount.value}
      </div>
    ));

  return (
    <div className="cell-container">
      <div>
        <strong>{formatUSD.format(totalValue)}</strong>
      </div>
      <div className="more">
        <Tooltip placement="bottomLeft" title={labels}>
          <span>
            Across {labels.length} Asset{labels.length > 1 ? "s" : ""}
          </span>
          <i className="fas fa-info-circle 2x"></i>
        </Tooltip>
      </div>
    </div>
  );
};
