import { CopyFilled } from "@ant-design/icons";
import { PublicKey } from "@solana/web3.js";
import React, { FC } from "react";
import { abbreviateAddress } from "../../utils/utils";

interface BotNameCellProps {
  name: string;
  poolSeed: string;
  address: PublicKey;
}
const BOT_STRATEGY_BASE_URL = "https://bots.bonfida.org/#/pool/";
export const BotNameCell: FC<BotNameCellProps> = ({
  name,
  poolSeed,
  address,
}) => {
  const copyToClipboard = (text: string) => {
    var input = document.createElement("textarea");
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand("copy");
    document.body.removeChild(input);
    return result;
  };
  const poolUrl = `${BOT_STRATEGY_BASE_URL}${poolSeed}`;
  const abbreviatedAddress = abbreviateAddress(address);
  return (
    <>
      <div
        style={{
          display: "block",
          flexDirection: "column",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "150px",
          whiteSpace: "nowrap",
        }}
      >
        <a
          style={{ color: "#06D6A0" }}
          href={poolUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>
      </div>
      <div
        style={{
          fontSize: "10px",
          color: "#B2B2B2",
          display: "inline-block",
        }}
        onClick={() => copyToClipboard(address.toBase58())}
      >
        <text style={{ cursor: "pointer" }} id="pool-address">
          {abbreviatedAddress}
        </text>
        <CopyFilled />
      </div>
    </>
  );
};
