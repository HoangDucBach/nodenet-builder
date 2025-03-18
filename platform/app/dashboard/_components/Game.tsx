"use client";

import React, { useState, useCallback, useRef } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Controls,
    Background,
    Panel,
    NodeProps,
    Handle,
    Position,
    Connection,
    Edge,
    Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import * as GameComponents from "@/game-sdk";

import { Button } from "@heroui/button";
import { Input } from '@heroui/input';
import NotificationPanel from './NotificationPanel';

type GameNodeData = GameComponents.NodeConfig;
type GameNode = Node<GameNodeData, 'id'>;

type GameEdgeData = GameComponents.EdgeConfig;
type GameEdge = Edge<GameEdgeData, 'id'>;

// Custom Node Components
const ValidatorNode = ({ data, isConnectable }: NodeProps<GameNode>) => (
    <div className="p-2 border-2 border-purple-500 bg-purple-100 rounded-md w-40">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <div className="font-bold text-purple-800">{data.type}</div>
        <div className="text-xs text-gray-600">Validator</div>
        <div className="text-xs">Stake: {data.stake}</div>
        <div className="text-xs">Latency: {data.latency}ms</div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
);

const MiningNode = ({ data, isConnectable }: NodeProps<GameNode>) => (
    <div className="p-2 border-2 border-orange-500 bg-orange-100 rounded-md w-40">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <div className="font-bold text-orange-800">{data.type}</div>
        <div className="text-xs text-gray-600">Mining</div>
        <div className="text-xs">Hash Power: {data.hashPower}</div>
        <div className="text-xs">Latency: {data.latency}ms</div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
);

const FullNode = ({ data, isConnectable }: NodeProps<GameNode>) => (
    <div className="p-2 border-2 border-blue-500 bg-blue-100 rounded-md w-40">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <div className="font-bold text-blue-800">{data.type}</div>
        <div className="text-xs text-gray-600">Full Node</div>
        <div className="text-xs">Latency: {data.latency}ms</div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
);

const LightNode = ({ data, isConnectable }: NodeProps<GameNode>) => (
    <div className="p-2 border-2 border-green-500 bg-green-100 rounded-md w-40">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <div className="font-bold text-green-800">{data.type}</div>
        <div className="text-xs text-gray-600">Light Node</div>
        <div className="text-xs">Latency: {data.latency}ms</div>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
);

const nodeTypes = {
    validatorNode: ValidatorNode,
    miningNode: MiningNode,
    fullNode: FullNode,
    lightNode: LightNode,
};

interface GameProps {
    initialConsensus?: GameComponents.ConsensusType;
}

export function Game({ initialConsensus = GameComponents.ConsensusType.SatoshiPlus }: GameProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<GameNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<GameEdge>([]);
    const [consensusType, setConsensusType] = useState<GameComponents.ConsensusType>(initialConsensus);
    const [nodeCounter, setNodeCounter] = useState({
        validator: 0,
        mining: 0,
        full: 0,
        light: 0
    });

    const [selectedNodeType, setSelectedNodeType] = useState<GameComponents.NodeType | null>(null);
    const [isAddingNode, setIsAddingNode] = useState(false);
    const [formValues, setFormValues] = useState({
        stake: 1000,
        hashPower: 500,
        latency: 10
    });
    const [notifications, setNotifications] = useState<string[]>([]);
    const [simulationRunning, setSimulationRunning] = useState(false);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleNodeTypeSelect = (type: GameComponents.NodeType) => {
        setSelectedNodeType(type);
        setIsAddingNode(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: parseInt(value, 10)
        });
    };

    const addNode = () => {
        if (!selectedNodeType || !reactFlowInstance) return;

        const position = {
            x: Math.random() * 300,
            y: Math.random() * 300
        };

        let newNode;
        let newCounter = { ...nodeCounter };
        let nodeTypeName = '';

        switch (selectedNodeType) {
            case GameComponents.NodeType.FULL_NODE:
                newCounter.full++;
                nodeTypeName = 'Full Node';
                newNode = {
                    id: `N${newCounter.full}`,
                    type: 'fullNode',
                    position,
                    data: {
                        label: `N${newCounter.full}`,
                        type: GameComponents.NodeType.FULL_NODE,
                        latency: formValues.latency
                    }
                };
                break;

            case GameComponents.NodeType.VALIDATOR_NODE:
                newCounter.validator++;
                nodeTypeName = 'Validator Node';
                newNode = {
                    id: `V${newCounter.validator}`,
                    type: 'validatorNode',
                    position,
                    data: {
                        label: `V${newCounter.validator}`,
                        type: GameComponents.NodeType.VALIDATOR_NODE,
                        stake: formValues.stake,
                        latency: formValues.latency
                    }
                };
                break;
            case GameComponents.NodeType.MINING_NODE:
                newCounter.mining++;
                nodeTypeName = 'Mining Node';
                newNode = {
                    id: `M${newCounter.mining}`,
                    type: 'miningNode',
                    position,
                    data: {
                        label: `M${newCounter.mining}`,
                        type: GameComponents.NodeType.MINING_NODE,
                        hashPower: formValues.hashPower,
                        latency: formValues.latency
                    }
                };
                break;
            case GameComponents.NodeType.LIGHT_NODE:
                newCounter.light++;
                nodeTypeName = 'Light Node';
                newNode = {
                    id: `L${newCounter.light}`,
                    type: 'lightNode',
                    position,
                    data: {
                        label: `L${newCounter.light}`,
                        type: GameComponents.NodeType.LIGHT_NODE,
                        latency: formValues.latency
                    }
                };
                break;
        }

        if (newNode) {
            // @ts-ignore
            setNodes((nds) => nds.concat(newNode));
            setNodeCounter(newCounter);
            setIsAddingNode(false);
            setSelectedNodeType(null);
            addNotification('SUCCESS', `✅ Added ${nodeTypeName} with ID: ${newNode.id}`);
        }
    };

    const addNotification = (type: string, message: string) => {
        const notification = `${type}: ${message}`;
        setNotifications(prevNotifications => [...prevNotifications, notification]);
    };


    const runSimulation = async () => {
        if (nodes.length === 0) {
            addNotification('ERROR', '❌ Cannot run simulation: No nodes in the network.');
            return;
        }

        if (edges.length === 0) {
            addNotification('WARNING', '⚠️ Network has no connections between nodes.');
        }

        const networkData = {
            consensusType,
            nodes: nodes.map(node => ({
                id: node.id,
                type: node.data.type,
                stake: node.data.stake,
                hashPower: node.data.hashPower,
                latency: node.data.latency
            })),
            edges: edges.map(edge => ({
                id: edge.id,
                from: edge.source,
                to: edge.target
            }))
        };

        setSimulationRunning(true);
        addNotification('INFO', '🚀 Starting simulation...');

        const network = new GameComponents.BlockchainNetwork(consensusType);
        networkData.nodes.forEach(nodeData => {
            network.addNode(new GameComponents.Node(nodeData));
        });
        networkData.edges.forEach(edgeData => {
            network.addEdge(new GameComponents.Edge(edgeData));
        });

        const blockTests = GameComponents.TestcaseGenerator.generateBlocks(4);
        const monitor = new GameComponents.Monitor(network);

        blockTests.forEach((block) => network.addBlock(block));

        await monitor.printReport().catch((err) => {
            addNotification('ERROR', `❌ Simulation failed: ${err.message}`);
        });

        network.notifications.getAll().forEach(notification => {
            addNotification("INFO", notification.message);
        });
    };

    const networkStats = [
        { label: 'Validators', value: nodeCounter.validator },
        { label: 'Miners', value: nodeCounter.mining },
        { label: 'Full Nodes', value: nodeCounter.full },
        { label: 'Light Nodes', value: nodeCounter.light },
        { label: 'Total Connections', value: edges.length }
    ]

    return (
        <div className="h-full w-full flex-1 flex flex-col gap-8">
            <div className="p-4">
                <div className="flex flex-wrap gap-4 items-center justify-center">
                    <div className="flex items-center">
                        <p className="mr-2 font-medium">Consensus:</p>
                        <select
                            value={consensusType}
                            onChange={(e) => setConsensusType(e.target.value as unknown as GameComponents.ConsensusType)}
                            className="p-2 border rounded-lg"
                        >
                            <option value={GameComponents.ConsensusType.SatoshiPlus}>Satoshi+</option>
                            <option value={GameComponents.ConsensusType.PoW}>Proof of Work</option>
                            <option value={GameComponents.ConsensusType.PoS}>Proof of Stake</option>
                        </select>
                    </div>

                    <Button
                        color='primary'
                        onPress={runSimulation}
                    >
                        Run Simulation
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 max-h-96 overflow-auto">
                <div className="w-64 bg-white rounded-3xl p-4 overflow-y-auto">
                    <h3 className="font-bold mb-4">Add Nodes</h3>
                    <div className="flex flex-col gap-4">
                        <Button
                            variant={selectedNodeType === GameComponents.NodeType.FULL_NODE ? 'solid' : 'light'}
                            onPress={() => handleNodeTypeSelect(GameComponents.NodeType.FULL_NODE)}
                        >
                            Full Node
                        </Button>
                        <Button
                            variant={selectedNodeType === GameComponents.NodeType.VALIDATOR_NODE ? 'solid' : 'light'}
                            onPress={() => handleNodeTypeSelect(GameComponents.NodeType.VALIDATOR_NODE)}
                        >
                            Validator Node
                        </Button>
                        <Button
                            variant={selectedNodeType === GameComponents.NodeType.MINING_NODE ? 'solid' : 'light'}
                            onPress={() => handleNodeTypeSelect(GameComponents.NodeType.MINING_NODE)}
                        >
                            Mining Node
                        </Button>
                        <Button
                            variant={selectedNodeType === GameComponents.NodeType.LIGHT_NODE ? 'solid' : 'light'}
                            onPress={() => handleNodeTypeSelect(GameComponents.NodeType.LIGHT_NODE)}
                        >
                            Light Node
                        </Button>
                    </div>

                    {isAddingNode && (
                        <div className="mt-6 border-t pt-4">
                            <h4 className="font-medium mb-2">Node Properties</h4>
                            {selectedNodeType === GameComponents.NodeType.VALIDATOR_NODE && (
                                <div className="mb-2">
                                    <Input
                                        label="Stake"
                                        labelPlacement='outside'
                                        type="number"
                                        name="stake"
                                        value={formValues.stake.toString()}
                                        onChange={handleInputChange}
                                        className="w-full p-1 rounded"
                                    />
                                </div>
                            )}

                            {selectedNodeType === GameComponents.NodeType.MINING_NODE && (
                                <div className="mb-2">
                                    <Input
                                        label="Hash Power"
                                        labelPlacement='outside'
                                        type="number"
                                        name="hashPower"
                                        value={formValues.hashPower.toString()}
                                        onChange={handleInputChange}
                                        className="w-full p-1 rounded"
                                    />
                                </div>
                            )}

                            <div className="mb-2">
                                <Input
                                    label="Latency"
                                    labelPlacement='outside'
                                    type="number"
                                    name="latency"
                                    value={formValues.latency.toString()}
                                    onChange={handleInputChange}
                                    className="w-full p-1 rounded"
                                />
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant='bordered'
                                    onPress={() => setIsAddingNode(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color='primary'
                                    onPress={addNode}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="flex-1"
                    ref={reactFlowWrapper}
                >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        onInit={setReactFlowInstance}
                        onDragOver={onDragOver}
                        fitView
                    >
                        <Controls />
                        <MiniMap />
                        <Background color="#aaa" gap={16} />
                    </ReactFlow>
                </div>
                <div>
                    <NotificationPanel
                        notifications={notifications}
                    />
                </div>
            </div>
            <div className='p-4 rounded-3xl bg-white flex flex-row justify-between items-center'>
                {
                    networkStats.map((stat, index) => (
                        <div key={index} className="flex flex-row items-center justify-center p-4 gap-4">
                            <p className="font-medium">{stat.label}:</p>
                            <p className="text-sm text-primary">
                                {stat.value}
                            </p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}