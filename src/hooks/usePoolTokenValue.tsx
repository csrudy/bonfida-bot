import { PoolAssetBalance } from "@bonfida/bot";
import { TokenAmount } from "@solana/web3.js";
import { useMarkets } from "../contexts/market";

export const usePoolTokenValue = (
  tokenAmount: TokenAmount,
  poolAssetBalance: PoolAssetBalance[]
): number => {
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
  return tokenPrice;
};
