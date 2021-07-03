export interface Pool {
  [poolSeed: string]: {
    name: string;
    strategyType?: STRATEGY_TYPES;
    initialPoolTokenUsdValue?: number;
  };
}
export interface ExternalSignalProvider {
  [publicKey: string]: {
    name: string;
    displayName: string;
  };
}
export const BOT_STRATEGY_BASE_URL = "https://bots.bonfida.org/#/pool/";
export const TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE =
  "https://tradingview-cranker.bonfida.com/performance/";
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

export const BONFIDA_OFFICIAL_POOLS_MAP: Pool = {
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

export const COMPETITION_BOTS_POOLS_MAP: Pool = {
  HmNYssreA6VhUVjocB5q7SJfcdymu2Hvtv7vsRLX2HXA: {
    name: 'CompendiumFi "Son of Sam"',
    initialPoolTokenUsdValue: 26,
  },
  "3Xi6B6bpoSHk9qC441tQKBxMhXLvYzwFS3V947wEUFhk": {
    name: "Overhead Gains (Earthshaker)",
    initialPoolTokenUsdValue: 64.91,
  },
  GB2EUdLbQHbYw3mbm8GLzLHKsyo6LE7BqpmEVHAr8XcJ: {
    name: "Overhead Gains (Dreamcatcher)",
    initialPoolTokenUsdValue: 120,
  },
  "6nbesY9CGoA4yxTvw3ADHKVgjVkuabr181BdJCnobwDY": {
    name: "Overhead Gains (Fireshaper)",
    initialPoolTokenUsdValue: 42,
  },
  GnAGDkrdNbyTsnySxmQhvxhPSa4R2pcjM5hJr4qTrFRG: {
    name: "FTT/USDC - Super Guppy 2H TF",
    initialPoolTokenUsdValue: 28.83,
  },
  BXWYUyNiT7DUWgcYMcV7BKECqFnUGhQ4yEty3Ut5YJuU: {
    name: "OpTeslaBot ETH/USDT 4H",
    initialPoolTokenUsdValue: 66.51,
  },
  "9zzJCwJScSHWi9apYx3TWNtkaeSEnUJr4knP1ThhVk3X": {
    name: "Dukun Cloud",
    initialPoolTokenUsdValue: 10,
  },
  "26aWL7YPvagsaWUZKZGcCUcqwRyx2SyzyzM1LNgRZwtz": {
    name: "Nova Kapital",
    initialPoolTokenUsdValue: 80,
  },
  "4MnYvfVwi6wp4bQE3qx7q15FozQujPCZzkLu4oPFDXKr": {
    name: "Kagamibot",
    initialPoolTokenUsdValue: 50,
  },
  "5T2zfmtMvxmcrFXXvnHncs7cf43Yt366PAsUip7uxDin": {
    name: "FIDACOMP SOL-bot",
    initialPoolTokenUsdValue: 1,
  },
  "3i3DGa7xCb43y4vDXsxxCkz9PzRtM71WiaMvRigEVwW5": {
    name: "HD Research Bitcoin",
    initialPoolTokenUsdValue: 100,
  },
  EiHUJMQJFXqofY2VvyrK5kEfi8nrjX1iSXfcQ57iy2QM: {
    name: "Francium-Media by TV",
    initialPoolTokenUsdValue: 142.62,
  },
  HAnUjzdBxD2twyzTDTtU9LKwU8GRgair47axEGQbTMBT: {
    name: "Awesome_Bonfida",
    initialPoolTokenUsdValue: 131.38,
  },
  "8sttLgF6NzJ3GWfrf1LarSqrtvv9vrBatJPAb3wpdnyj": {
    name: "Bonfida007",
    initialPoolTokenUsdValue: 5,
  },
  CitkcPD3WhpbDR4cEsnh1RmyhvGChkrwnLMVgxNNAL6R: {
    name: "TYCHE BTC 8/41",
    initialPoolTokenUsdValue: 0.76,
  },
  "9JJfyiQMuhoBeXqchizmDSv1bq7igsR7ooY2NysBhQKF": {
    name: "eth_swingtrader",
    initialPoolTokenUsdValue: 20,
  },
  EEVHhNvFw5m3ABEJsaKNxsx18RGEQdtzyJ1DekE7QMSn: {
    name: "FIDA/SOL/USDT SHORT SIDE STRATEGY",
    initialPoolTokenUsdValue: 66.54,
  },
  DvsRbqYjALeW3LeczPnBxQeLqo1eeP89F3yWbuJtFVA6: {
    name: "Stepper",
    initialPoolTokenUsdValue: 96.25,
  },
  GKxkBGr1N7c4xgLZjGFJgwiWwZH5DN6weXQYtcF5ZbqP: {
    name: "hamfida1",
    initialPoolTokenUsdValue: 10,
  },
  "7KBPgMqgyNh7AipwfcSPUmUYd1zweybp22ZemGte7ZtJ": {
    name: "Corn Hustler",
    initialPoolTokenUsdValue: 27.44,
  },
  "3wjcwLwc1UifSgTAn19qvpKqU6aNYxUvKwmg4NnbLuWe": {
    name: "Yummy Sushi",
    initialPoolTokenUsdValue: 9.04,
  },
  "3QppyVyApA3e9sfmiNkfJjgmateBDjN528nNxTCqZT33": {
    name: "Dzengo's 30m Bot",
    initialPoolTokenUsdValue: 0.81,
  },
  FHBg4wswP9VD5vavJMJeVzCfLvahyEvYFdFCLiKCra9t: {
    name: "CsakCakk",
    initialPoolTokenUsdValue: 110.41,
  },
  "4DpqEwKWn7XQQop5RAb7Nsbb53MEY4VcuKdptiPU1oUz": {
    name: "Fools Gold ETH",
    initialPoolTokenUsdValue: 1,
  },
  HNx6vtmnBBLweBuebUDcVxKRNGySWjaDr66iTq34m2j8: {
    name: "Shogun ETH",
    initialPoolTokenUsdValue: 1,
  },
  Cov97uBEhzYBi4USuywkruKttx41CbSGjWrJ9qKH2mQr: {
    name: "SRM never flinch",
    initialPoolTokenUsdValue: 3.86,
  },
  CifHWYZhXtTUuM3SnAucGvRXqVnKvR3sV1Xyjozsrjd7: {
    name: "AKG",
    initialPoolTokenUsdValue: 950,
  },
  F39VxYLKKiZ2Qp7HD1YeehfQZbEJ4KC9tpxJMKnskYAa: {
    name: "CryptoJ",
    initialPoolTokenUsdValue: 1757,
  },
  "8yjYAkak8xwin4BfyHTSQRjDAVLQFdbhqg8ukuetDsnM": {
    name: "Seafood",
    initialPoolTokenUsdValue: 100,
  },
  "96qckGt8FkMkpaafshC9ZK99RbjdrmN1cj96Xq62v5ga": {
    name: "BTC Pikach",
    initialPoolTokenUsdValue: 10,
  },
  BfYjh1txvxXhg5wckR1j74eEEGbfR1C7AqsxFmChooNs: {
    name: "SOL Pikachu",
    initialPoolTokenUsdValue: 10,
  },
  "2TXg5L86sGbNSvFwMR1Hyo2UvM2uCD9aEe2bwDt1Hb4h": {
    name: "Anonymous Leo",
    initialPoolTokenUsdValue: 10,
  },
  KmiFrnRNo7NcUv7ZqKMiUvhQen7qfhKbCgmSHDygVLi: {
    name: "Unnamed Bot",
    initialPoolTokenUsdValue: 10,
  },
  BrDUmLGwwFxs45XopjBMNuZio2AnrKkJKdV3Gf8Szv46: {
    name: "BbandsRSI",
    initialPoolTokenUsdValue: 10,
  },
  PHm1arqMaTqDjmsPq7fWBNdyNx6j5244xx1XvTS2Q3Q: {
    name: "RSI trade 25 75",
    initialPoolTokenUsdValue: 1.2,
  },
  D2Lp7FUWuddj488Tcred3QcPnHbE9Y6FyYLG5m9mGQMZ: {
    name: "FIDA RSI",
    initialPoolTokenUsdValue: 3.17,
  },
  CNVXygXKDFprKx2wRHYVbWmCQ3MWhvA4cwTejHdEgv61: {
    name: "RobotTrade.AI ETH",
    initialPoolTokenUsdValue: 36.26,
  },
  HTEkF3QLXce6fDNoWrgWFpbYHRV22jYGqChTJjfuugnr: {
    name: "Na Bot",
    initialPoolTokenUsdValue: 16.39,
  },
  HK1FXRKRjueRq9pXVfNY6Lrk2MXCZUALcy2ef374QoRA: {
    name: "First Bot",
    initialPoolTokenUsdValue: 1,
  },
  Eh1ox13JMCtSVVLPFcVSb48hEh5GAk8o6gQwPuBgZDWD: {
    name: "9seed_trade_bot",
    initialPoolTokenUsdValue: 1,
  },
  CyWBGZLmZDaJXir3ZNgFgfKCypWdvw899G8rWQ9arkEA: {
    name: "DBC TK Strategy",
    initialPoolTokenUsdValue: 0.952,
  },
  GHfAXZMWeqxKrXBCSxEWgTcqyUwSEzkhVUod3MLDAiYm: {
    name: "Solmate",
    initialPoolTokenUsdValue: 317.951,
  },
  "4vEh7YN4mQu28CWaBJnrhyNAcmFx4vqQ6KzB3idUeFHn": {
    name: "Liuchaojin",
    initialPoolTokenUsdValue: 5.87,
  },
  "7xYcH8kCRYFchGbDWkHbte9dh5Mg6egFNgSdzrkbLCb6": {
    name: "MultiContrarianStrategy",
    initialPoolTokenUsdValue: 10,
  },
  "6Bd3jE8A9RaTf7pKPAT43k1XhFhzH2Ptr3Y2UoFYmJqi": {
    name: "SOL-69",
    initialPoolTokenUsdValue: 167.058,
  },
  BVxdr99VgYXAPcYnxqKJWUpWwyhyJzijP6ZatPTMDq9G: {
    name: "Final TF Bot",
    initialPoolTokenUsdValue: 480.568,
  },
  "48cRebYNkoBfxGWWoeLouAAhTRDBDdKaNdiLCfnm3zbP": {
    name: "TENDON",
    initialPoolTokenUsdValue: 20,
  },
  ErGsNXDMtmCNrTUTpj5GqMY5KRafyNuSzKhsy9QWt8Sr: {
    name: "Doka",
    initialPoolTokenUsdValue: 20,
  },
  CJbrB4zPL6wRLRSFfLewqUXuKH6a1jGBTwajw7SHcZbr: {
    name: "srmbot",
    initialPoolTokenUsdValue: 104.264,
  },
  C4coStn5iLbDVwNtXYQ17TZLMrUkTnNsHxhDTxbLaGC6: {
    name: "TEMPERA",
    initialPoolTokenUsdValue: 279.442,
  },
  "8o6MsppAT7yzjkXd5zMPgqByqE6KZJNtnHDk8FX1KyCF": {
    name: "goodluck",
    initialPoolTokenUsdValue: 997.44,
  },
  HM4sVgDkNebzf1JWQKghhsU58cbHU3Kf1zm6iQw6zz4L: {
    name: "fida",
    initialPoolTokenUsdValue: 111.85,
  },
  CkDrQX1L2PqpQsjVDp7HLmVJkvr6d3fuX1o6FQLsB5YR: {
    name: "sushigogo",
    initialPoolTokenUsdValue: 6212,
  },
  E6oU7AiKvJHvusTXKGvQgvxSbdid2BcSe3JUT2VTC2fg: {
    name: "Ryto Granville Signal",
    initialPoolTokenUsdValue: 1,
  },
  AkVrQXYdR11sh6sB9exxBwioDchggGM2k6gXjjKU9emb: {
    name: "Na Bot 2",
    initialPoolTokenUsdValue: 100.171,
  },
  "6GSB8fMZ2nTQ3G8jpLecS4Ky9kbagBB6feA72X8w6837": {
    name: "2610",
    initialPoolTokenUsdValue: 191.288,
  },
  "2y45kfqJNaPU4MsVhx5ibXEYc6o8ioNjYUytiCCRZDfK": {
    name: "ray",
    initialPoolTokenUsdValue: 102.159,
  },
  "7vv4qWGicKH9R4h63NkwshK5qYtTnVcdEVH3GPfiNVin": {
    name: "OldSchool",
    initialPoolTokenUsdValue: 0.886,
  },
  CpAkcyejcYjRnQLvGBGebPpgg9bDK5kzmN3MetyRoJp5: {
    name: "OldSchool 2",
    initialPoolTokenUsdValue: 700.634,
  },
  Hca2zb6HaHvJ4frssfpizrfKh9TCzDyAUo9GmXAFBaSZ: {
    name: "迪迦奥特",
    initialPoolTokenUsdValue: 257.8,
  },
  "6k1Gy8Q5dvyFvCVhincjfG49bTfUsrNXQF4yD7EszLje": {
    name: "OldSchool RAY",
    initialPoolTokenUsdValue: 1,
  },
  GMT24XGeDTAr1ctRJh2x8xCiTaVmhxFMdEHGgGgNkRky: {
    name: "KuoYeh",
    initialPoolTokenUsdValue: 95.621,
  },
  "9etxii34HgBhqFAQbg7nkeA39cVS89zhcYobjhpDaVk7": {
    name: "SRM new",
    initialPoolTokenUsdValue: 9.369,
  },
  "7Lz8r5Lbh236PPMMbTtng4162S1UX4oCEGZP7nNwYak2": {
    name: "Na 16621",
    initialPoolTokenUsdValue: 147.816,
  },
  DoqG6MSS9Re5WYZgxjkSeiwzN1sWMCF59LFLyEddGCAJ: {
    name: "Yuan Bot(BTC/USDC)",
    initialPoolTokenUsdValue: 99,
  },
};
