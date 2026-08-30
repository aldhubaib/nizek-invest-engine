import type { Assumptions, CapTableEntry, Round } from "./types";

export const buildRounds = (a: Assumptions): Round[] => {
  const rounds: Round[] = [];
  const post = a.preMoney + a.roundSize;
  rounds.push({
    name: "Current round",
    year: 0,
    size: a.roundSize,
    preMoney: a.preMoney,
    postMoney: post,
    dilution: post > 0 ? a.roundSize / post : 0,
  });
  if (a.followOnSize > 0 && a.followOnYear <= a.exitYear) {
    const fPost = a.followOnPre + a.followOnSize;
    rounds.push({
      name: "Follow-on",
      year: a.followOnYear,
      size: a.followOnSize,
      preMoney: a.followOnPre,
      postMoney: fPost,
      dilution: fPost > 0 ? a.followOnSize / fPost : 0,
    });
  }
  return rounds;
};

export const buildCapTable = (a: Assumptions, rounds: Round[]): CapTableEntry[] => {
  const current = rounds[0]!;
  const follow = rounds[1];

  const pool = a.optionPool / 100;
  const investor = current.postMoney > 0 ? a.investorTicket / current.postMoney : 0;
  const roundOthers = Math.max(current.dilution - investor, 0);
  let founders = Math.max(1 - current.dilution - pool, 0);
  let poolShare = pool;
  let investorShare = investor;
  let otherShare = roundOthers;
  let followShare = 0;

  if (follow) {
    const keep = 1 - follow.dilution;
    founders *= keep;
    poolShare *= keep;
    investorShare *= keep;
    otherShare *= keep;
    followShare = follow.dilution;
  }

  return [
    { name: "Founders & team", ownership: founders },
    { name: "Option pool", ownership: poolShare },
    { name: "You", ownership: investorShare },
    { name: "Other round investors", ownership: otherShare },
    ...(follow ? [{ name: "Follow-on investors", ownership: followShare }] : []),
  ];
};
