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

/** ✅ Proof of Work (PoW) */
export class ProofOfWork extends Consensus {
  validateBlock(block: Block, node: Node): boolean {
    if (node.type !== NodeType.MINING_NODE || block.difficulty === undefined) {
      return false;
    }

    return node.hashPower > block.difficulty;
  }
}

/** ✅ Proof of Stake (PoS) */
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

/** ✅ Satoshi Plus (Hybrid PoW + PoS) */
export class SatoshiPlus extends Consensus {
  validateBlock(block: Block, node: Node): boolean {
    if (block.difficulty !== undefined && block.stakeThreshold !== undefined) {
      // Kiểm tra cả PoW & PoS
      const powValid =
        node.type === NodeType.MINING_NODE && node.hashPower > block.difficulty;
      const posValid =
        node.type === NodeType.VALIDATOR_NODE &&
        node.stake >= block.stakeThreshold;

      return powValid || posValid;
    }

    return false;
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
