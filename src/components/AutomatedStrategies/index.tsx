import { Connection, PublicKey } from "@solana/web3.js";
import React, { useEffect } from "react"
import { useConnection } from "../../contexts/connection";
import { useUserAccounts } from "../../hooks";
import { fetchPoolInfo, getPoolsSeedsBySigProvider, getPoolTokenMintFromSeed } from "@bonfida/bot";
import { MARKETS } from "@project-serum/serum";

function abbreviateAddress(address: PublicKey | undefined, size = 4) {
  if (!address) {
    return null;
  }
  const base58 = address.toBase58();
  return base58.slice(0, size) + '…' + base58.slice(-size);
}

const marketNameFromAddress = (address: PublicKey) => {
  const market = MARKETS.find(m => m.address.toBase58() === address.toBase58())
  if (!market) {
    return abbreviateAddress(address);
  }
  return market.name;
};

interface UserPoolData {
  markets: (string | null)[]
}

const getBonfidaPools = async (connection: Connection, userTokenMints: Set<string>): Promise<UserPoolData[]> => {
  const bonfidaPoolSeeds = await getPoolsSeedsBySigProvider(connection);
  const userPoolSeeds: Buffer[] = []
  for (const seed of bonfidaPoolSeeds) {
    // some pools are in bad states and cannot be fetched
    const mint = await getPoolTokenMintFromSeed(seed).catch(()=>{});
    if (mint && userTokenMints.has(mint.toBase58())) {
      userPoolSeeds.push(seed)
    }
  }
  const userPoolsData = []
  for (const seed of userPoolSeeds) {
    const poolInfo = await fetchPoolInfo(
      connection,
      seed,
    )
    const markets = poolInfo.authorizedMarkets.map(marketNameFromAddress)
    console.log('[POOL INFO]', poolInfo)
    console.log('[MARKETS]', markets)
    const poolData = {
      markets
    }
    userPoolsData.push(poolData)
  }

  return userPoolsData;
 
}

export const AutomatedStrategies = () => {
  const connection = useConnection();
  const { userAccounts } = useUserAccounts();
  const userTokenMints = new Set<string>(userAccounts.map(userTokenAccount => userTokenAccount.info.mint.toBase58()))

  useEffect(() => {
    getBonfidaPools(connection, userTokenMints).then(console.log);
  }, [connection, userTokenMints.size])


  


  return (
  <div>
    <h1>AUTOMATED STRATEGIES MODULE</h1>
  </div>
  )
}