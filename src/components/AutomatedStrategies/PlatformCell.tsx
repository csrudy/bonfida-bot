import React, { FC } from "react";
import { PlatformData } from "../../actions/bonfida";
import { TokenIcon } from "../TokenIcon";

export const PlatformCell: FC<PlatformData> = ({ label, tokenMint }) => {
  return (
    <div style={{ display: "inline-flex" }}>
      <TokenIcon mintAddress={tokenMint} />
      <span>{label}</span>
    </div>
  );
};
