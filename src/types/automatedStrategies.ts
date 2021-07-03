import { PublicKey } from "@solana/web3.js";

export type PoolMarketData = {
  mintA: string | undefined;
  mintB: string | undefined;
  name: string;
  otherMarkets: string[];
};
export type PoolNameData = {
  name: string;
  poolUrl: string;
  address: PublicKey;
};