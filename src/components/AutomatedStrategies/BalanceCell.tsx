import { PoolInfo } from "@bonfida/bot";
import React, { FC } from "react";
import { useUserBalance } from "../../hooks";

interface BalanceCellProps {
  poolInfo: PoolInfo;
}
export const BalanceCell: FC<BalanceCellProps> = ({ poolInfo }) => {
  const { mintKey } = poolInfo;
  const balance = useUserBalance(mintKey);
  if (!mintKey) {
    return null;
  }
  return <>{balance.balance}</>;
};
