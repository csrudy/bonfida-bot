import { PoolAssetBalance, PoolInfo } from "@bonfida/bot";
import { PublicKey, TokenAmount } from "@solana/web3.js";
import { Tag } from "antd";
import { debug } from "console";
import React, { FC } from "react";
import { BONFIDA_OFFICIAL_POOLS_MAP } from "../../constants/bonfidaBots";
import { useConnectionConfig } from "../../contexts/connection";
import { useUserBalance } from "../../hooks";
import { usePoolTokenValue } from "../../hooks/usePoolTokenValue";
import { formatAmount, formatUSD } from "../../utils/utils";

interface PositionValueCellProps {
  mint: PublicKey;
  tokenAmount: TokenAmount;
  poolAssetBalance: PoolAssetBalance[];
}
declare type PoolLabels = (string | number | undefined)[];
export const PositionValueCell: FC<PositionValueCellProps> = ({
  mint,
  tokenAmount,
  poolAssetBalance,
}) => {
  const { tokenMap } = useConnectionConfig();
  const userBalance = useUserBalance(mint);
  const poolTokenValue = usePoolTokenValue(tokenAmount, poolAssetBalance);
  if (!tokenAmount.uiAmount) {
    return null;
  }
  const positionRatio = userBalance.balance / tokenAmount.uiAmount;
  const poolPositions = poolAssetBalance.map(
    (asset): PoolLabels => {
      const { tokenAmount } = asset;
      if (tokenAmount && tokenAmount.uiAmount) {
        const userAssetAmount = tokenAmount.uiAmount * positionRatio;
        const token = tokenMap.get(asset.mint);
        return [
          token?.symbol,
          formatAmount(userAssetAmount, tokenAmount.decimals, false),
        ];
      }
      return [];
    }
  );

  if (!mint) {
    return null;
  }
  const totalValue = poolTokenValue * userBalance.balance;
  const labels = poolPositions.map<JSX.Element>(([token, amount]) => (
    <div>
      {token}: {amount}
    </div>
  ));
  debugger;
  return (
    <div className="cell-container">
      <strong>{formatUSD.format(totalValue)}</strong>
      <div>{labels}</div>
    </div>
  );
};
