import { PoolAssetBalance } from "@bonfida/bot";
import { TokenAmount } from "@solana/web3.js";
import React, { FC } from "react";
import { usePoolTokenValue } from "../../hooks/usePoolTokenValue";
import { formatUSD } from "../../utils/utils";

type TokenPriceProps = {
  tokenAmount: TokenAmount;
  poolAssetBalance: PoolAssetBalance[];
};

export const TokenPrice: FC<TokenPriceProps> = ({
  tokenAmount,
  poolAssetBalance,
}) => {
  const tokenPrice = usePoolTokenValue(tokenAmount, poolAssetBalance);
  return <>{formatUSD.format(tokenPrice)}</>;
};
