import { Block } from "../models/Block";
import { Node, NodeType } from "../models/Node";

export enum ConsensusType {
  PoW,
  PoS,
  SatoshiPlus,
}

export abstract class Consensus {
  abstract validateBlock(block: Block, node: Node): boolean;
}

export class ProofOfWork extends Consensus {
  validateBlock(block: Block, node: Node): boolean {
    if (node.type !== NodeType.MINING_NODE || block.difficulty === undefined) {
      return false;
    }

    return node.hashPower > block.difficulty;
  }
}

export class ProofOfStake extends Consensus {
  validateBlock(block: Block, node: Node): boolean {
    if (
      node.type !== NodeType.VALIDATOR_NODE ||
      block.stakeThreshold === undefined
    ) {
      return false;
    }

    return node.stake >= block.stakeThreshold;
  }
}

export class SatoshiPlus extends Consensus {
  validateBlock(block: Block, node: Node): boolean {
    if (!block.difficulty || !block.stakeThreshold) return false;

    const powFactor =
      node.type === NodeType.MINING_NODE
        ? node.hashPower / (block.difficulty * 2)
        : 0;

    const posFactor =
      node.type === NodeType.VALIDATOR_NODE
        ? node.stake / (block.stakeThreshold * 2)
        : 0;

    const finalProbability = 0.6 * posFactor + 0.4 * powFactor;

    return Math.random() < finalProbability;
  }
}

export class ConsensusFactory {
  static createConsensus(type: ConsensusType): Consensus {
    switch (type) {
      case ConsensusType.PoW:
        return new ProofOfWork();
      case ConsensusType.PoS:
        return new ProofOfStake();
      case ConsensusType.SatoshiPlus:
        return new SatoshiPlus();
    }
  }
}
