import { Node } from "./Node";

export enum BlockStatus {
  PENDING,
  SOLVED,
  REJECTED,
}

export class BlockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockError";
  }

  static INVALID_DIFFICULTY = new BlockError("Invalid difficulty.");
  static INVALID_STAKE_THRESHOLD = new BlockError("Invalid stake threshold.");
}

interface IBlock {
  solve(node: Node): boolean;
}

export class Block implements IBlock {
  id: Id;
  gasPrice: number;
  processedBy?: Node;
  status: BlockStatus;
  difficulty?: number; // For PoW
  stakeThreshold?: number; // For PoS
  timestamp?: number; // Time when the block was solved

  constructor(
    id: Id,
    gasPrice: number,
    difficulty?: number,
    stakeThreshold?: number,
  ) {
    this.id = id;
    this.gasPrice = gasPrice;
    this.difficulty = difficulty;
    this.stakeThreshold = stakeThreshold;
    this.status = BlockStatus.PENDING;
  }

  solve(node: Node): boolean {
    if (this.status === BlockStatus.SOLVED) return true;

    if (this.processedBy) {
      return false;
    }

    this.processedBy = node;
    this.status = BlockStatus.SOLVED;
    this.timestamp = Date.now();

    return true;
  }
}

enum BlockWithConsensusType {
  PoW,
  PoS,
  SatoshiPlus,
}

export class BlockFactory {
  static createBlock(
    id: Id,
    gasPrice: number,
    type: BlockWithConsensusType,
    difficulty?: number,
    stakeThreshold?: number,
  ): Block {
    if (type === BlockWithConsensusType.PoW) {
      if (!difficulty) throw BlockError.INVALID_DIFFICULTY;
    }
    if (type === BlockWithConsensusType.PoS) {
      if (!stakeThreshold) throw BlockError.INVALID_STAKE_THRESHOLD;
    }

    if (type === BlockWithConsensusType.SatoshiPlus) {
      if (!difficulty || !stakeThreshold) {
        throw BlockError.INVALID_DIFFICULTY;
      }
    }

    return new Block(id, gasPrice, difficulty, stakeThreshold);
  }
}
