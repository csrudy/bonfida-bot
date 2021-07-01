export interface VerifiedPool {
  [poolSeed: string]: {
    name: string;
    strategyType: STRATEGY_TYPES;
    initialPoolTokenUsdValue?: number;
  };
}
export interface ExternalSignalProvider {
  [publicKey: string]: {
    name: string;
    displayName: string;
  };
}
export enum STRATEGY_TYPES {
  RSI = "RSI",
  MACD = "MACD",
  VOLATILITY_EXPANSION = "Volatility Expansion",
  SUPER_TREND = "Super Trend",
  SENTIMENT_BENSON = "Sentiment Strategy Pro [Benson]",
  COMPENDIUML = "CompendiuML",
  BART = "BartBot",
  CUSTOM = "Custom",
}

export const BONFIDA_OFFICIAL_POOLS_MAP: VerifiedPool = {
  // Super Trend
  CmGfYkZD7sXp3tCUNKdiUHV2cg2KscqAoY6EMKehNM4S: {
    name: "BTC Super Trend",
    strategyType: STRATEGY_TYPES.SUPER_TREND,
    initialPoolTokenUsdValue: 1,
  },
  Fm9m2muT5pSSsugiq8Ro7XVBnQoPopZpQVLDKgqY71LJ: {
    name: "ETH Super Trend",
    strategyType: STRATEGY_TYPES.SUPER_TREND,
    initialPoolTokenUsdValue: 1,
  },
  "8uSTbreQ9ywGw3AYA7yP74KBsa78Y3wEEiDfnBKDFss": {
    name: "SRM Super Trend",
    strategyType: STRATEGY_TYPES.SUPER_TREND,
    initialPoolTokenUsdValue: 1,
  },
  "9Wrpzph39RPbkKtgap3xak4Dga7SgHedLwWEcTF2zSpV": {
    name: "FIDA Super Trend",
    strategyType: STRATEGY_TYPES.SUPER_TREND,
    initialPoolTokenUsdValue: 1,
  },
  // Benson
  GjrAkn4wu1ijif7SYhnQc4uDMxMdW5X8AW3MLig5X33t: {
    name: "Sentiment Strategy Pro [Benson]",
    strategyType: STRATEGY_TYPES.SENTIMENT_BENSON,
    initialPoolTokenUsdValue: 1,
  },
  // Volatility Expanson
  "5tLDije3S75K8wgwnuk941cQuJGKu6EVAgEwN6jB6WVk": {
    name: "Volatility Expansion BTC",
    strategyType: STRATEGY_TYPES.VOLATILITY_EXPANSION,
    initialPoolTokenUsdValue: 1,
  },
  // RSI
  CShN6X5S8vKkbECJzZj6M1cKBiMGxKkZyJBmzkBRbUJA: {
    name: "RSI BTC",
    strategyType: STRATEGY_TYPES.RSI,
    initialPoolTokenUsdValue: 1,
  },
  HgBwzZPEQi1fmj9UKdDuHMry15seykh9KQiTnMR5ZkF7: {
    name: "RSI ETH",
    strategyType: STRATEGY_TYPES.RSI,
    initialPoolTokenUsdValue: 1,
  },
  "69aKAxbteNuPYeEamWSSsY3QQ58SxW275xftRJHW9wmX": {
    name: "RSI SRM",
    strategyType: STRATEGY_TYPES.RSI,
    initialPoolTokenUsdValue: 1,
  },
  Bv3Acsiojxtj15f2tADwRA2VyLsQVm6CQqpaRsH8wHiN: {
    name: "RSI FIDA",
    strategyType: STRATEGY_TYPES.RSI,
    initialPoolTokenUsdValue: 1,
  },
  // MACD Strategies
  CwAcCoFZRxUppbwU1xp5qv8hUqNvDWasuRdAibKLXnj8: {
    name: "MACD BTC",
    strategyType: STRATEGY_TYPES.MACD,
    initialPoolTokenUsdValue: 1,
  },
  "7nmoqCBGzHcFgpiDCx25kJp4zLnUMdEnb1k3kAN36YuK": {
    name: "MACD ETH",
    strategyType: STRATEGY_TYPES.MACD,
    initialPoolTokenUsdValue: 1,
  },
  "2ekyVKS2Sq54mPUwx4eybA3gnrHKR9nBZP6DFRDcZn9j": {
    name: "MACD SRM",
    strategyType: STRATEGY_TYPES.MACD,
    initialPoolTokenUsdValue: 1,
  },
  "3u6zrpaW9uRfpVqZYwCAiQLvQpiY1JmCCdvZV8ydro4r": {
    name: "MACD FIDA",
    strategyType: STRATEGY_TYPES.MACD,
    initialPoolTokenUsdValue: 1,
  },
  // CompendiumFi
  "77WNkckkVG1vGePs35azez8C8PqcqwepExZG1kFzpm2m": {
    name: "CompendiuML Bitcoin 4H",
    strategyType: STRATEGY_TYPES.COMPENDIUML,
  },
  HLSW8oP7aCzUbkBYfYqXTmHNRx1KRGATKuoje1xG8pVb: {
    name: "CompendiuML SOL 4H",
    strategyType: STRATEGY_TYPES.COMPENDIUML,
  },
  HZyfPT9Dun8mSPX9m7ezbedasc8owdtPqHQVDzHtdE1U: {
    name: "BartBot",
    strategyType: STRATEGY_TYPES.BART,
  },
};

export const EXTERNAL_SIGNAL_PROVIDERS_MAP: ExternalSignalProvider = {
  "8km6prR9BNjvZFVGRh7YoU2PnsQPn7XnVeYKJfWJvhqa": {
    name: "Weekly DCA (8km...hqa)",
    displayName: "Custom Weekly DCA",
  },
  "9vsePNS3HfZtLHoP4tPCpa16wdq19DJWzifuMjX7keCP": {
    name: "Monthly DCA (9vs...eCP)",
    displayName: "Custom Monthly DCA",
  },
  FukKpDC8AX76sHjU8p717qUneDgpR35nHyFjqT8LaZ4x: {
    name: "Daily DCA (Fuk...Z4x)",
    displayName: "Custom Daily DCA",
  },
  "3hhmaQycsGNEocctmkCnTLgZboNeF7bM3DARB63N2BeA": {
    name: "TradingView Alerts",
    displayName: "Custom TradingView Alert",
  },
};
