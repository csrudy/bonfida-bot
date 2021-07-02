import React, { FC } from "react";
import { useConnectionConfig } from "../../contexts/connection";
import { PoolIcon } from "../TokenIcon";
import { Tooltip } from "antd";
interface MarketsCellProps {
  markets: string[];
}

export const MarketsCell: FC<MarketsCellProps> = ({ markets }) => {
  const { tokenMap } = useConnectionConfig();
  const tokenMapBySympol = new Map();
  tokenMap.forEach((tokenInfo, mint) => {
    tokenMapBySympol.set(tokenInfo.symbol, mint);
  });

  const displayMarket = markets[0];
  const marketSymbols = displayMarket.split("/");
  const mintA = tokenMapBySympol.get(marketSymbols[0]);
  const mintB = tokenMapBySympol.get(marketSymbols[1]);
  const otherMarkets = markets.length > 1 ? markets.slice(1) : [];
  return (
    <div>
      <div
        className="market-wrapper"
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <PoolIcon mintA={mintA} mintB={mintB}></PoolIcon>
        <span>{displayMarket}</span>
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
