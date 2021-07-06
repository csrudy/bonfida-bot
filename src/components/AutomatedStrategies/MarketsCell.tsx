import React, { FC } from "react";
import { PoolIcon } from "../TokenIcon";
import { Tooltip } from "antd";
import { PoolMarketData } from "../../actions/bonfida";

export const MarketsCell: FC<PoolMarketData> = ({
  name,
  mintA,
  mintB,
  otherMarkets,
}) => {
  return (
    <div>
      <div
        className="market-wrapper"
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <PoolIcon mintA={mintA} mintB={mintB}></PoolIcon>
        <span>{name}</span>
      </div>
      {!!otherMarkets.length && (
        <div>
          <Tooltip placement="bottomLeft" title={otherMarkets.join(",")}>
            <span>+{otherMarkets.length} more</span>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
