import React, { FC } from "react";
import { formatUSD } from "../../utils/utils";

type TokenPriceProps = {
  tokenPrice: number;
};

export const TokenPrice: FC<TokenPriceProps> = ({ tokenPrice }) => {
  return <>{formatUSD.format(tokenPrice)}</>;
};
