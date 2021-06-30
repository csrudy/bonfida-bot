import { Connection } from "@solana/web3.js";
import React, { useEffect, useState } from "react"
import { useConnection } from "../../contexts/connection";
import { useUserAccounts } from "../../hooks";
import { fetchPoolInfo, getPoolsSeedsBySigProvider, getPoolTokenMintFromSeed } from "@bonfida/bot";
import { Table } from "antd";
import { marketNameFromAddress } from "../../utils/utils";

enum AUTOMATED_STRATEGY_PLATFORMS {
  BONFIDA = 'Bonfida'
}

interface UserPoolData {
  platform: AUTOMATED_STRATEGY_PLATFORMS
  pool: {
    markets: string[]
  }
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
    const markets = 
      poolInfo.authorizedMarkets
        .map(marketNameFromAddress)
        .filter((e): e is string => e !== null)

    const poolData = {
      platform: AUTOMATED_STRATEGY_PLATFORMS.BONFIDA,
      pool: {
        markets
      },
    }
    userPoolsData.push(poolData)
  }

  return userPoolsData;
 
}

export const AutomatedStrategies = () => {
  const connection = useConnection();
  const { userAccounts } = useUserAccounts();
  const userTokenMints = new Set<string>(userAccounts.map(userTokenAccount => userTokenAccount.info.mint.toBase58()))
  const [strategyData, setStrategyData] = useState<UserPoolData[]>([])

  useEffect(() => {
    getBonfidaPools(connection, userTokenMints).then(data => setStrategyData(data));
  }, [connection, userTokenMints.size])

  const columns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: 'Pool',
      dataIndex: 'pool',
      key: 'pool',
      render: (pool: UserPoolData["pool"]) => (
        <>
        {pool.markets.map((element) => (<li>{element}</li>))}
        </>
      ),
    },
  ];
  


  return (
  <div>
    <h1>AUTOMATED STRATEGIES MODULE</h1>
      <Table
        columns={columns} dataSource={strategyData} pagination={false}>
      </Table>
  </div>
  )
}