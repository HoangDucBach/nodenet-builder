import { BlockchainNetwork } from "../networks";
import { Block } from "./Block";

export enum NodeType {
    FULL_NODE,
    LIGHT_NODE,
    MINING_NODE,
    VALIDATOR_NODE
}

export interface NodeConfig {
    id: string;
    type: NodeType;
    stake?: number; // Only for ValidatorNode
    hashPower?: number; // Only for MiningNode
    latency?: number; // Network latency in ms
}

class NodeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NodeError";
    }

    static INVALID_TYPE = new NodeError("Invalid node type.");
    static INVALID_STAKE = new NodeError("Invalid stake.");
    static INVALID_HASH_POWER = new NodeError("Invalid hash power.");
    static INVALID_LATENCY = new NodeError("Invalid latency.");
}

interface INode {
    id: string;
    isBusy: boolean;
    isValidNode(): boolean;
    setBusy(busy: boolean): void;
}

interface IFullNode extends INode {
    canProcessTransactions(): boolean;
}

interface ILightNode extends INode {
    canRelayTransactions(): boolean;
}

interface IMiningNode extends INode {
    hashPower: number;
    canMine(): boolean;
}

interface IValidatorNode extends INode {
    stake: number;
    canValidate(): boolean;
}

interface INeedSync {
    needSync: boolean;

    isSynced(network: BlockchainNetwork): boolean;
    sync(network: BlockchainNetwork): void;
}

export class Node implements IFullNode, ILightNode, IMiningNode, IValidatorNode, INeedSync {
    id: string;
    type: NodeType;
    stake: number;
    hashPower: number;
    latency: number;
    isBusy: boolean;

    lastBlockProcessed?: Block;
    needSync: boolean;

    constructor(config: NodeConfig) {
        this.id = config.id;
        this.type = config.type;
        this.stake = config.stake || 0;
        this.hashPower = config.hashPower || 0;
        this.latency = config.latency ?? 100;
        this.isBusy = false;
        this.needSync = false;

        if (this.latency < 0) throw NodeError.INVALID_LATENCY;
        if (this.type === NodeType.VALIDATOR_NODE && this.stake < 0) throw NodeError.INVALID_STAKE;
        if (this.type === NodeType.MINING_NODE && this.hashPower < 0) throw NodeError.INVALID_HASH_POWER;
    }

    isSynced(network: BlockchainNetwork): boolean {
        const lastBlock = network.lastBlock;

        if (!lastBlock) return false;

        if (!this.lastBlockProcessed) return false;

        return this.lastBlockProcessed.id === lastBlock.id;
    }

    sync(network: BlockchainNetwork): void {
        if (this.isSynced(network)) return;

        this.lastBlockProcessed = network.lastBlock;
        this.needSync = false;
    }

    canMine(): boolean {
        return this.type === NodeType.MINING_NODE && this.hashPower > 0;
    }

    canValidate(): boolean {
        return this.type === NodeType.VALIDATOR_NODE && this.stake > 0;
    }

    canProcessTransactions(): boolean {
        return this.type === NodeType.FULL_NODE;
    }

    canRelayTransactions(): boolean {
        return this.type === NodeType.LIGHT_NODE;
    }

    isValidNode(): boolean {
        if (this.type === NodeType.VALIDATOR_NODE && this.stake <= 0) return false;
        if (this.type === NodeType.MINING_NODE && this.hashPower <= 0) return false;
        return true;
    }

    setBusy(busy: boolean): void {
        this.isBusy = busy;
    }
}