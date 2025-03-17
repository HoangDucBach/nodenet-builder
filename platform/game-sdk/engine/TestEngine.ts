export enum TestType {
  TRANSACTION,
  BLOCK_VALIDITY,
  NETWORK_LOAD,
  GAS_PRICE,
  SECURITY,
  CONSENSUS_EFFICIENCY,
}

export interface ITestTransaction {
  execute(): boolean;
}

export interface ITestBlockValidity {
  validateBlock(): boolean;
}

export interface ITestNetworkLoad {
  simulateLoad(): number;
}

export interface ITestGasPrice {
  analyzeGasCost(): number;
}

export interface ITestSecurity {
  checkVulnerabilities(): boolean;

  simulateSybilAttack(): boolean;
  simulate51Attack(): boolean;
}

export interface ITestConsensusEfficiency {
  measureConsensusTime(): number;
}
