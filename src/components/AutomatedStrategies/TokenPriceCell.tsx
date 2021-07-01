import { PoolAssetBalance } from "@bonfida/bot";
import { TokenAmount } from "@solana/web3.js";
import React, { FC } from "react";
import { useMarkets, useMidPriceInUSD } from "../../contexts/market";
import { formatUSD } from "../../utils/utils";

type TokenPriceProps = {
  tokenAmount: TokenAmount;
  poolAssetBalance: PoolAssetBalance[];
};

export const TokenPrice: FC<TokenPriceProps> = ({
  tokenAmount,
  poolAssetBalance,
}) => {
  const { midPriceInUSD } = useMarkets();
  const totalValueOfPool = poolAssetBalance.reduce<number>((acc, val) => {
    const price = midPriceInUSD(val.mint);
    return val.tokenAmount.uiAmount
      ? (acc += price * val.tokenAmount.uiAmount)
      : acc;
  }, 0);
  const tokenPrice = tokenAmount.uiAmount
    ? totalValueOfPool / tokenAmount.uiAmount
    : 0;

  return <>{formatUSD.format(tokenPrice)}</>;
};
