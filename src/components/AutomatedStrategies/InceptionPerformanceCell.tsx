import { PoolAssetBalance, PoolInfo } from "@bonfida/bot";
import { TokenAmount } from "@solana/web3.js";
import { Tag } from "antd";
import React, { FC } from "react";
import { PoolSeed } from ".";
import { BONFIDA_OFFICIAL_POOLS_MAP } from "../../constants/bonfidaBots";
import { usePoolTokenValue } from "../../hooks/usePoolTokenValue";

interface InceptionPerformanceCellProps {
  poolSeed: PoolSeed;
  tokenAmount: TokenAmount;
  poolAssetBalance: PoolAssetBalance[];
}

const getInceptionUsdValue = (poolSeed: string): number | null => {
  const inceptionPerfomance =
    BONFIDA_OFFICIAL_POOLS_MAP[poolSeed]?.initialPoolTokenUsdValue || null;
  return inceptionPerfomance;
};

export const InceptionPerformanceCell: FC<InceptionPerformanceCellProps> = ({
  poolSeed,
  tokenAmount,
  poolAssetBalance,
}) => {
  let performance;
  const initialPoolTokenUsdValue = getInceptionUsdValue(poolSeed);
  const poolTokenValue = usePoolTokenValue(tokenAmount, poolAssetBalance);
  if (initialPoolTokenUsdValue == null) {
    // TODO Fetch from https://tradingview-cranker.bonfida.com/performance/<PoolSeed>
    performance = null;
  } else {
    performance = 100 * (poolTokenValue / initialPoolTokenUsdValue - 1);
  }

  return (
    <>
      <Tag>
        {performance !== null ? `${performance.toFixed(2)}%` : "Not Available"}
      </Tag>
    </>
  );
};
