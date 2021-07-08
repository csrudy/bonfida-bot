import React, { FC } from "react";
import { PoolIcon } from "../TokenIcon";
import { Tooltip } from "antd";
import { PoolMarketData } from "../../actions/bonfida";
import { ReactComponent as InfoIcon } from "../../assets/info.svg";

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
        <div className="more">
          <span className="more">+{otherMarkets.length} more</span>
          <Tooltip
            placement="bottomLeft"
            title={otherMarkets.join(", ")}
            arrowPointAtCenter={true}
          >
            <InfoIcon className="more-info" />
          </Tooltip>
        </div>
      )}
    </div>
  );
};
