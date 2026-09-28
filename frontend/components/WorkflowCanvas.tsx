"use client";

// Import React hooks
import { useState } from "react";

// Import React Flow components and types
import {
  ReactFlow,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";

// Import React Flow's default styling
import "@xyflow/react/dist/style.css";

// Define the information stored inside each decision node
type DecisionNodeData = {
  label: string;
  prompt: string;
  decision?: string;
};

// Create our custom AI decision node
function DecisionNode({
  data,
}: {
  data: DecisionNodeData;
}) {
  return (
    <div
      style={{
        padding: "12px",
        border: "2px solid #333",
        borderRadius: "8px",
        background: "white",
        minWidth: "220px",
      }}
    >
      {/* Target handle allows another node to connect INTO this node */}
      <Handle
        type="target"
        position={Position.Top}
      />

      {/* YES connection point */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{
          left: "30%",
        }}
      />

      {/* NO connection point */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{
          left: "70%",
        }}
      />

      {/* Node title */}
      <strong>{data.label}</strong>

      {/* Decision question */}
      <p
        style={{
          marginTop: "8px",
          marginBottom: "8px",
        }}
      >
        {data.prompt}
      </p>

      {/* Display the AI decision */}
      <p>
        Decision:{" "}
        <strong>
          {data.decision || "Not tested"}
        </strong>
      </p>

      {/* Show the available paths */}
      <small>YES / NO paths</small>
    </div>
  );
}

// Tell React Flow which component represents our decision nodes
const nodeTypes = {
  decision: DecisionNode,
};

// Create our starting nodes
const initialNodes: Node[] = [
  {
    id: "1",
    type: "decision",
    position: {
      x: 250,
      y: 50,
    },
    data: {
      label: "AI Decision 1",
      prompt: "Is this a customer support request?",
    },
  },

  {
    id: "2",
    position: {
      x: 100,
      y: 250,
    },
    data: {
      label: "YES: Send to Support",
    },
  },

  {
    id: "3",
    position: {
      x: 400,
      y: 250,
    },
    data: {
      label: "NO: Continue Elsewhere",
    },
  },

  {
    id: "4",
    type: "decision",
    position: {
      x: 100,
      y: 450,
    },
    data: {
      label: "AI Decision 2",
      prompt:
        "Does the customer need technical assistance?",
    },
  },

  {
    id: "5",
    position: {
      x: 0,
      y: 650,
    },
    data: {
      label: "YES: Take Action",
    },
  },

  {
    id: "6",
    position: {
      x: 250,
      y: 650,
    },
    data: {
      label: "NO: Stop Workflow",
    },
  },
];

// Create our starting connections
const initialEdges: Edge[] = [
  {
    id: "yes-edge",
    source: "1",
    target: "2",
    sourceHandle: "yes",
    label: "YES",
  },

  {
    id: "no-edge",
    source: "1",
    target: "3",
    sourceHandle: "no",
    label: "NO",
  },

  {
    id: "support-edge",
    source: "2",
    target: "4",
  },

  {
    id: "second-yes-edge",
    source: "4",
    target: "5",
    sourceHandle: "yes",
    label: "YES",
  },

  {
    id: "second-no-edge",
    source: "4",
    target: "6",
    sourceHandle: "no",
    label: "NO",
  },
];

export default function WorkflowCanvas() {
  // Store our nodes
  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  // Store our edges
  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);

  // Store the latest AI decision
  const [aiDecision, setAiDecision] =
    useState<string>("Not tested");

  // Store the node currently being highlighted
  const [activeNode, setActiveNode] =
    useState<string | null>(null);

  // Store the node whose prompt we are editing
  const [selectedNode, setSelectedNode] =
    useState<string | null>(null);

  // Store the edge currently being highlighted
  const [activeEdge, setActiveEdge] =
    useState<string | null>(null);

  // Store the order in which decision nodes are executed
  const [executionLog, setExecutionLog] =
    useState<string[]>([]);

  // Allow users to connect nodes together
  const onConnect = (connection: Connection) => {
    setEdges((currentEdges) =>
      addEdge(connection, currentEdges)
    );
  };

  // Add a new AI decision node
  const addNode = () => {
    // Create a unique ID for the new node
    const newNodeId = `${nodes.length + 1}`;

    // Create the new decision node
    const newNode: Node = {
      id: newNodeId,
      type: "decision",
      position: {
        x: 500,
        y: 100 + nodes.length * 100,
      },
      data: {
        label: "New AI Decision",
        prompt: "Enter your decision question",
      },
    };

    // Add the new node to our existing nodes
    setNodes((currentNodes) => [
      ...currentNodes,
      newNode,
    ]);
  };

  // Test our AI workflow
  const testAI = async () => {
    console.log("Test AI button clicked");

    // Clear the previous execution history
    setExecutionLog([]);

    // Clear the previous active node and edge
    setActiveNode(null);
    setActiveEdge(null);

    // Show that the workflow is currently running
    setAiDecision("Testing...");

    // Send the current React Flow workflow to our Next.js API
    const response = await fetch(
      "http://localhost:3000/api/test-workflow",
      {
        method: "POST",

        // Tell Next.js we are sending JSON
        headers: {
          "Content-Type": "application/json",
        },

        // Send the current workflow information
        body: JSON.stringify({
          // Node where the workflow starts
          nodeId: "1",

          // Message that the AI should evaluate
          message:
            "My account is not working and I need help from customer support.",

          // Send the current React Flow nodes
          // This includes any prompt changes
          nodes: nodes.map((node) => ({
            id: node.id,
            type: node.type,
            data: node.data,
          })),

          // Send the current React Flow connections
          edges: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
          })),
        }),
      }
    );

    // Check if the request was successful
    if (!response.ok) {
      console.log("Workflow request failed");

      setAiDecision("Workflow failed");

      return;
    }

    // Read the response from Next.js
    await response.json();

    // Give Inngest time to execute the workflow
    await new Promise((resolve) =>
      setTimeout(resolve, 5000)
    );

    // Get the results produced by the workflow
    const resultResponse = await fetch(
      "http://localhost:3000/api/workflow-result"
    );

    // Convert the response into JavaScript data
    const decisionData =
      await resultResponse.json();

    console.log(
      "Workflow results:",
      decisionData
    );

    // Get the IDs of all nodes that produced
    // an AI decision
    const executedNodes = Object.keys(
      decisionData
    );

    // Stop if no results were received
    if (executedNodes.length === 0) {
      console.log(
        "No workflow results received"
      );

      setAiDecision("No result");

      return;
    }

    // Display the decision nodes that actually executed
    setExecutionLog(executedNodes);

    // Get Node 1's decision
    const firstDecision =
      decisionData["1"]?.decision;

    // Display the first AI decision
    if (firstDecision) {
      setAiDecision(firstDecision);
    }

    // Update every node that received an AI decision
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        // Look for a result for this node
        const result =
          decisionData[node.id];

        // If this node did not execute,
        // leave it unchanged
        if (!result) {
          return node;
        }

        // Add the AI decision to the node
        return {
          ...node,
          data: {
            ...node.data,
            decision: result.decision,
          },
        };
      })
    );

    // Get the last node that produced an AI decision
    const lastDecisionNodeId =
      executedNodes[
        executedNodes.length - 1
      ];

    // Get the decision made by that node
    const lastDecision =
      decisionData[lastDecisionNodeId]?.decision;

    // Find the edge selected by the AI decision
    const finalEdge = edges.find((edge) => {
      return (
        edge.source === lastDecisionNodeId &&
        edge.sourceHandle ===
          lastDecision?.toLowerCase()
      );
    });

    // If the AI selected an outgoing edge
    if (finalEdge) {
      // Highlight the node the workflow moves to
      setActiveNode(finalEdge.target);

      // Highlight the selected edge
      setActiveEdge(finalEdge.id);
    } else {
      // If there is no outgoing edge,
      // keep the last decision node highlighted
      setActiveNode(lastDecisionNodeId);
    }

    console.log(
      "Last decision node:",
      lastDecisionNodeId
    );

    console.log(
      "Final workflow node:",
      finalEdge?.target
    );

    console.log(
      "Execution order:",
      executedNodes
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "800px",
      }}
    >
      {/* Add a new decision node */}
      <button
        onClick={addNode}
        style={{
          margin: "20px 10px 10px 20px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Add Node
      </button>

      {/* Test the AI workflow */}
      <button
        onClick={testAI}
        style={{
          margin: "20px 10px 10px 0",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Test AI
      </button>

      {/* Display the latest AI decision */}
      <p
        style={{
          marginLeft: "20px",
        }}
      >
        AI Decision:{" "}
        <strong>{aiDecision}</strong>
      </p>

      {/* Display the execution order */}
      <p
        style={{
          marginLeft: "20px",
        }}
      >
        Execution:{" "}
        <strong>
          {executionLog.length > 0
            ? executionLog.join(" → ")
            : "Not started"}
        </strong>
      </p>

      {/* Prompt editor */}
      {selectedNode && (
        <div
          style={{
            margin: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            maxWidth: "400px",
          }}
        >
          <strong>
            Edit Decision Prompt
          </strong>

          <textarea
            value={String(
              nodes.find(
                (node) =>
                  node.id === selectedNode
              )?.data.prompt || ""
            )}
            onChange={(event) => {
              const newPrompt =
                event.target.value;

              // Update the selected node's prompt
              setNodes((currentNodes) =>
                currentNodes.map((node) => {
                  if (
                    node.id === selectedNode
                  ) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        prompt: newPrompt,
                      },
                    };
                  }

                  return node;
                })
              );
            }}
            style={{
              width: "100%",
              minHeight: "100px",
              marginTop: "10px",
            }}
          />
        </div>
      )}

      {/* React Flow canvas */}
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,

          // Highlight the final workflow node
          style:
            node.id === activeNode
              ? {
                  border: "3px solid green",
                  background: "#eaffea",
                }
              : undefined,
        }))}
        edges={edges.map((edge) => ({
          ...edge,

          // Highlight the edge selected by the AI
          style:
            edge.id === activeEdge
              ? {
                  stroke: "green",
                  strokeWidth: 3,
                }
              : undefined,

          // Animate the selected edge
          animated:
            edge.id === activeEdge,
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          // Select a node when the user clicks it
          setSelectedNode(node.id);
        }}
        nodeTypes={nodeTypes}
        fitView
      />
    </div>
  );
}