import { PoolAssetBalance } from "@bonfida/bot";
import { TokenAmount } from "@solana/web3.js";
import { Tag } from "antd";
import React, { FC, useEffect, useRef } from "react";
import { PoolSeed } from ".";
import { getTradingviewBotPerformance } from "../../actions/bonfida";
import { BONFIDA_OFFICIAL_POOLS_MAP } from "../../constants/bonfidaBots";
import { usePoolTokenValue } from "../../hooks/usePoolTokenValue";

interface InceptionPerformanceCellProps {
  poolSeed: PoolSeed;
  tokenAmount: TokenAmount;
  poolAssetBalance: PoolAssetBalance[];
}

const getInceptionUsdValue = (poolSeed: string): number | null => {
  const inceptionUsdValue =
    BONFIDA_OFFICIAL_POOLS_MAP[poolSeed]?.initialPoolTokenUsdValue || null;
  return inceptionUsdValue;
};

export const InceptionPerformanceCell: FC<InceptionPerformanceCellProps> = ({
  poolSeed,
  tokenAmount,
  poolAssetBalance,
}) => {
  const initialPoolTokenUsdValue = useRef<number | null>(null);
  const value = getInceptionUsdValue(poolSeed);
  initialPoolTokenUsdValue.current = value;
  const poolTokenValue = usePoolTokenValue(tokenAmount, poolAssetBalance);
  useEffect(() => {
    (async () => {
      if (initialPoolTokenUsdValue.current == null) {
        // try to get performance data from tradingview
        const { performance } = await getTradingviewBotPerformance(poolSeed);
        if (performance.length) {
          initialPoolTokenUsdValue.current = performance[0].poolTokenUsdValue;
        }
      }
    })();
    //eslint-disable-next-line
  }, []);

  const performanceValue =
    initialPoolTokenUsdValue.current !== null
      ? 100 * (poolTokenValue / initialPoolTokenUsdValue.current - 1)
      : initialPoolTokenUsdValue.current;
  return (
    <>
      <Tag>
        {performanceValue !== null
          ? `${performanceValue.toFixed(2)}%`
          : "Not Available"}
      </Tag>
    </>
  );
};
