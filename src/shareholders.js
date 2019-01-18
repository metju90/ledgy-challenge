import { calculateSharesinPercentage } from "./utils";

const investorsCommonVariables = {
  cap: 2,
  multiplier: 1,
  participating: true,
  payout: {
    liquidationPreference: 0,
    paricipation: 0
  }
};

const sharesHoldersData = {
  founders: {
    title: "Founders",
    shares: 1000000,
    participating: true,
    invested: 0,
    payout: {
      paricipation: 0
    }
  },
  serie_a: {
    title: "Serie A",
    shares: 200000,
    invested: 900000,
    ...investorsCommonVariables
  },
  serie_b: {
    title: "Serie B",
    shares: 300000,
    invested: 2100000,
    ...investorsCommonVariables
  },
  serie_c: {
    title: "Serie C",
    shares: 1500000,
    invested: 15000000,
    ...investorsCommonVariables
  }
};

export default () => {
  return calculateSharesinPercentage(sharesHoldersData);
};
