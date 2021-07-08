import React, { FC } from "react";
import { PoolNameData } from "../../actions/bonfida";
import { abbreviateAddress, copyToClipboard } from "../../utils/utils";
import { ReactComponent as CopyIcon } from "../../assets/copy.svg";

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
          color: "#06D6A0",
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
        className="address-copy"
        onClick={() => copyToClipboard(address.toBase58())}
      >
        <span id="pool-address">{abbreviatedAddress}</span>
        <CopyIcon />
      </div>
    </>
  );
};
