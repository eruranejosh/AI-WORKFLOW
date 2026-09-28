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
  // Check what decision the AI made
  const hasYesDecision = data.decision === "YES";
  const hasNoDecision = data.decision === "NO";

  return (
    <div
      style={{
        // Give the node internal space
        padding: "15px",

        // Make the node look like a card
        border: "2px solid #333",
        borderRadius: "12px",
        background: "#ffffff",

        // Set the minimum width
        minWidth: "240px",

        // Add a small shadow
        boxShadow:
          "0 4px 12px rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Incoming connection point */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: "10px",
          height: "10px",
        }}
      />

      {/* Node title */}
      <div
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        🤖 {data.label}
      </div>

      {/* AI decision question */}
      <p
        style={{
          marginTop: "8px",
          marginBottom: "12px",
          fontSize: "14px",
          lineHeight: "1.4",
        }}
      >
        {data.prompt}
      </p>

      {/* Display the AI decision */}
      <div
        style={{
          padding: "8px",
          borderRadius: "6px",

          // Change the background depending on the decision
          background: hasYesDecision
            ? "#eaffea"
            : hasNoDecision
              ? "#ffeaea"
              : "#f3f3f3",

          textAlign: "center",
          fontSize: "13px",
          marginBottom: "12px",
        }}
      >
        Decision:{" "}
        <strong
          style={{
            color: hasYesDecision
              ? "green"
              : hasNoDecision
                ? "red"
                : "#555",
          }}
        >
          {data.decision || "Not tested"}
        </strong>
      </div>

      {/* Show the available paths */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          fontWeight: "bold",
          marginTop: "5px",
        }}
      >
        <span style={{ color: "green" }}>
          YES
        </span>

        <span style={{ color: "red" }}>
          NO
        </span>
      </div>

      {/* YES connection point */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{
          left: "30%",
          background: "green",
          width: "12px",
          height: "12px",
        }}
      />

      {/* NO connection point */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{
          left: "70%",
          background: "red",
          width: "12px",
          height: "12px",
        }}
      />
    </div>
  );
}

// Tell React Flow which component represents decision nodes
const nodeTypes = {
  decision: DecisionNode,
};

// Create our starting workflow nodes
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
      prompt:
        "Is this a customer support request?",
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

// Create our starting workflow connections
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
  // Store our workflow nodes
  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  // Store our workflow edges
  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);

  // Store the latest AI decision
  const [aiDecision, setAiDecision] =
    useState<string>("Not tested");

  // Store the node currently highlighted
  const [activeNode, setActiveNode] =
    useState<string | null>(null);

  // Store the node whose prompt we are editing
  const [selectedNode, setSelectedNode] =
    useState<string | null>(null);

  // Store the edge currently highlighted
  const [activeEdge, setActiveEdge] =
    useState<string | null>(null);

  // Store the order of executed decision nodes
  const [executionLog, setExecutionLog] =
    useState<string[]>([]);

  // Store previous workflow executions
  const [executionHistory, setExecutionHistory] =
    useState<string[][]>([]);

  // Allow users to create new connections
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
        prompt:
          "Enter your decision question",
      },
    };

    // Add the new node
    setNodes((currentNodes) => [
      ...currentNodes,
      newNode,
    ]);
  };

  // Test our AI workflow
  const testAI = async () => {
    console.log("Test AI button clicked");

    // Clear the previous execution
    setExecutionLog([]);

    // Clear previous highlights
    setActiveNode(null);
    setActiveEdge(null);

    // Show that the workflow is running
    setAiDecision("Testing...");

    try {
      // Send the workflow to our Next.js API
      const response = await fetch(
        "http://localhost:3000/api/test-workflow",
        {
          method: "POST",

          // Tell the API we are sending JSON
          headers: {
            "Content-Type": "application/json",
          },

          // Send the workflow information
          body: JSON.stringify({
            // Start the workflow at Node 1
            nodeId: "1",

            // Message that the AI evaluates
            message:
              "My account is not working and I need help from customer support.",

            // Send all current nodes
            nodes: nodes.map((node) => ({
              id: node.id,
              type: node.type,
              data: node.data,
            })),

            // Send all current connections
            edges: edges.map((edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle:
                edge.sourceHandle,
            })),
          }),
        }
      );

      // Check whether the request succeeded
      if (!response.ok) {
        console.log(
          "Workflow request failed"
        );

        setAiDecision("Workflow failed");

        return;
      }

      // Read the API response
      await response.json();

      // Give Inngest time to execute
      await new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );

      // Get the workflow results
      const resultResponse = await fetch(
        "http://localhost:3000/api/workflow-result"
      );

      // Check whether the results request succeeded
      if (!resultResponse.ok) {
        setAiDecision("Result request failed");

        return;
      }

      // Convert the response to JavaScript data
      const decisionData =
        await resultResponse.json();

      console.log(
        "Workflow results:",
        decisionData
      );

      // Get all nodes that produced an AI decision
      const executedNodes = Object.keys(
        decisionData
      );

      // Stop if there are no results
      if (executedNodes.length === 0) {
        console.log(
          "No workflow results received"
        );

        setAiDecision("No result");

        return;
      }

      // Display the execution order
      setExecutionLog(executedNodes);

      // Save this run to execution history
      setExecutionHistory((currentHistory) => [
        ...currentHistory,
        executedNodes,
      ]);

      // Get Node 1's decision
      const firstDecision =
        decisionData["1"]?.decision;

      // Display Node 1's decision
      if (firstDecision) {
        setAiDecision(firstDecision);
      }

      // Update every node that executed
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          // Get this node's result
          const result =
            decisionData[node.id];

          // Leave nodes without results unchanged
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

      // Get the last executed decision node
      const lastDecisionNodeId =
        executedNodes[
          executedNodes.length - 1
        ];

      // Get its decision
      const lastDecision =
        decisionData[
          lastDecisionNodeId
        ]?.decision;

      // Find the edge selected by the AI
      const finalEdge = edges.find(
        (edge) => {
          return (
            edge.source ===
              lastDecisionNodeId &&
            edge.sourceHandle ===
              lastDecision?.toLowerCase()
          );
        }
      );

      // Highlight the selected destination
      if (finalEdge) {
        setActiveNode(finalEdge.target);

        // Highlight the selected edge
        setActiveEdge(finalEdge.id);
      } else {
        // If there is no outgoing edge,
        // highlight the final decision node
        setActiveNode(
          lastDecisionNodeId
        );
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
    } catch (error) {
      // Handle unexpected errors
      console.error(
        "Workflow test failed:",
        error
      );

      setAiDecision("Workflow failed");
    }
  };

  return (
    <div
      style={{
        // Use all available width
        width: "100%",

        // Use all available height from page.tsx
        height: "100%",

        // React Flow and the controls can overlap
        // without pushing the canvas down
        position: "relative",

        // Prevent the page from creating another scrollbar
        overflow: "hidden",
      }}
    >
      {/* Top-left workflow controls */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",

          // Put the controls above React Flow
          zIndex: 10,

          display: "flex",
          alignItems: "center",
          gap: "8px",

          // Allow controls to wrap on smaller screens
          flexWrap: "wrap",

          padding: "10px",

          background:
            "rgba(255, 255, 255, 0.95)",

          border: "1px solid #ddd",
          borderRadius: "8px",

          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Add node button */}
        <button
          onClick={addNode}
          style={{
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          Add Node
        </button>

        {/* Test AI button */}
        <button
          onClick={testAI}
          style={{
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          Test AI
        </button>

        {/* Current AI decision */}
        <span
          style={{
            fontSize: "13px",
          }}
        >
          AI:{" "}
          <strong>{aiDecision}</strong>
        </span>

        {/* Current execution */}
        <span
          style={{
            fontSize: "13px",
          }}
        >
          Execution:{" "}
          <strong>
            {executionLog.length > 0
              ? executionLog.join(" → ")
              : "Not started"}
          </strong>
        </span>
      </div>

      {/* Right-side information panel */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",

          // Keep the panel above React Flow
          zIndex: 10,

          width: "280px",
          maxWidth: "calc(100% - 24px)",

          // Prevent the panel from becoming taller
          // than the available browser window
          maxHeight: "calc(100% - 24px)",

          // Allow the panel itself to scroll
          overflowY: "auto",

          padding: "14px",

          background:
            "rgba(255, 255, 255, 0.96)",

          border: "1px solid #ddd",
          borderRadius: "8px",

          boxShadow:
            "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Prompt editor */}
        {selectedNode && (
          <div
            style={{
              marginBottom: "15px",
            }}
          >
            <strong>
              Edit Decision Prompt
            </strong>

            <textarea
              value={String(
                nodes.find(
                  (node) =>
                    node.id ===
                    selectedNode
                )?.data.prompt || ""
              )}
              onChange={(event) => {
                const newPrompt =
                  event.target.value;

                // Update the selected node's prompt
                setNodes((currentNodes) =>
                  currentNodes.map(
                    (node) => {
                      if (
                        node.id ===
                        selectedNode
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
                    }
                  )
                );
              }}
              style={{
                // Make the textarea fill the panel
                width: "100%",

                // Give enough space to edit the prompt
                minHeight: "80px",

                marginTop: "8px",

                // Make sizing predictable
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Execution history */}
        {executionHistory.length > 0 && (
          <div>
            <strong>
              Execution History
            </strong>

            {executionHistory.map(
              (execution, index) => (
                <div
                  key={index}
                  style={{
                    marginTop: "8px",
                    padding: "9px",

                    background: "#fafafa",

                    border:
                      "1px solid #ddd",

                    borderRadius: "6px",
                  }}
                >
                  {/* Execution number */}
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "4px",
                      fontSize: "13px",
                    }}
                  >
                    Run {index + 1}
                  </div>

                  {/* Nodes visited */}
                  <div
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    {execution.join(
                      " → "
                    )}
                  </div>

                  {/* Completion status */}
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "green",
                    }}
                  >
                    Completed
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Show this when no node is selected */}
        {!selectedNode &&
          executionHistory.length ===
            0 && (
            <div
              style={{
                fontSize: "13px",
                color: "#666",
              }}
            >
              Click an AI decision node
              to edit its prompt.
            </div>
          )}
      </div>

      {/* Full-screen React Flow canvas */}
      <ReactFlow
        // Make React Flow use the entire available container
        style={{
          width: "100%",
          height: "100%",
        }}

        // Display our workflow nodes
        nodes={nodes.map((node) => ({
          ...node,

          // Highlight the active destination node
          style:
            node.id === activeNode
              ? {
                  border:
                    "3px solid green",
                  background: "#eaffea",
                }
              : undefined,
        }))}

        // Display our workflow edges
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

        // Handle node movement
        onNodesChange={onNodesChange}

        // Handle edge changes
        onEdgesChange={onEdgesChange}

        // Handle new connections
        onConnect={onConnect}

        // Allow nodes to be selected
        onNodeClick={(_, node) => {
          // Store the selected node
          setSelectedNode(node.id);
        }}

        // Tell React Flow about our custom node
        nodeTypes={nodeTypes}

        // Automatically fit the workflow inside
        // the available canvas
        fitView
      />
    </div>
  );
}