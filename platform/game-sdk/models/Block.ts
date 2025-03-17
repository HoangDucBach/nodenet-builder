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
export class Block {
  id: Id;
  gasPrice: number;
  processedBy?: Node;
  status: BlockStatus;
  difficulty?: number; // For PoW
  stakeThreshold?: number; // For PoS

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
}

enum BlockWithConsensusType {
  PoW,
  PoS,
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

    return new Block(id, gasPrice, difficulty, stakeThreshold);
  }
}
