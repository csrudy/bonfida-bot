import React, { FC } from "react";
import { TokenIcon } from "../TokenIcon";

interface PlatformCellProps {
  label: string;
  tokenMint: string;
}
export const PlatformCell: FC<PlatformCellProps> = ({ label, tokenMint }) => {
  return (
    <div style={{ display: "inline-flex" }}>
      <TokenIcon mintAddress={tokenMint} />
      <span>{label}</span>
    </div>
  );
};
