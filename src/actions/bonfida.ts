import { TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE } from "../constants/bonfidaBots"

declare type BotPerfomance = {
  time: number;
  poolSeed: string,
  poolTokenUsdValue: number
}
export declare type TradingBotPerformanceResponse = {
  performance: BotPerfomance[]
}

export const getTradingviewBotPerformance = async (poolSeed: string): Promise<TradingBotPerformanceResponse> => {
  const url = `${TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE}${poolSeed}`
  const response = await fetch(url);
  return response.json()
}
