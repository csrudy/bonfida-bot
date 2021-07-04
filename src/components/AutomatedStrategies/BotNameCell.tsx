import { CopyFilled } from "@ant-design/icons";
import React, { FC } from "react";
import { PoolNameData } from ".";
import { abbreviateAddress, copyToClipboard } from "../../utils/utils";

export const BotNameCell: FC<PoolNameData> = ({ name, poolUrl, address }) => {
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
        <span style={{ cursor: "pointer" }} id="pool-address">
          {abbreviatedAddress}
        </span>
        <CopyFilled />
      </div>
    </>
  );
};
