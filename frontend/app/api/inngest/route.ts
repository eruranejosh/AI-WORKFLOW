// Import the Inngest client
import { Inngest } from "inngest";

// Find the next node based on the current node and AI decision
function findNextNode(
  nodeId: string,
  decision: string,
  workflowEdges: any[]
) {
  // Look for an edge leaving this node
  // that matches the AI decision
  const matchingEdge = workflowEdges.find((edge) => {
    return (
      edge.source === nodeId &&
      edge.sourceHandle === decision.toLowerCase()
    );
  });

  // If no matching edge exists, there is nowhere to go
  if (!matchingEdge) {
    return null;
  }

  // Return the node connected to the selected edge
  return matchingEdge.target;
}

// Run one AI decision node
async function runDecisionNode(
  step: any,
  nodeId: string,
  message: string,
  prompt: string
) {
  // Run this AI decision as an Inngest step
  return await step.run(
    `ai-decision-${nodeId}`,
    async () => {
      // Send the decision request to our FastAPI backend
      const response = await fetch(
        "http://127.0.0.1:8000/decide",
        {
          method: "POST",

          // Tell FastAPI we are sending JSON
          headers: {
            "Content-Type": "application/json",
          },

          // Send the message and decision question
          body: JSON.stringify({
            message: message,
            prompt: prompt,
          }),
        }
      );

      // Check if FastAPI returned an error
      if (!response.ok) {
        throw new Error(
          `FastAPI request failed: ${response.status}`
        );
      }

      // Convert the response into JavaScript data
      const data = await response.json();

      // Save the result so the frontend can read it
      await fetch(
        "http://localhost:3000/api/workflow-result",
        {
          method: "POST",

          // Tell Next.js we are sending JSON
          headers: {
            "Content-Type": "application/json",
          },

          // Send the node ID and AI decision
          body: JSON.stringify({
            nodeId: nodeId,
            decision: data.decision,
          }),
        }
      );

      // Return the node result
      return {
        nodeId: nodeId,
        decision: data.decision,
      };
    }
  );
}

// Import the Next.js handler for Inngest
import { serve } from "inngest/next";

// Create our Inngest client
const inngest = new Inngest({
  id: "ai-workflow",
});

// Create our AI workflow function
const testFunction = inngest.createFunction(
  {
    id: "test-workflow",

    // Try the workflow again if a step fails
    retries: 3,

    // Define the event that starts the workflow
    triggers: {
      event: "workflow/test",
    },
  },

  // This function runs when Inngest receives the event
  async ({ event, step }) => {
    // Get the current graph sent by React Flow
    const workflowNodes = event.data.nodes;
    const workflowEdges = event.data.edges;

    // Find the node where the workflow should start
    const startNode = workflowNodes.find(
      (node: any) => node.id === event.data.nodeId
    );

    // Stop if the starting node does not exist
    if (!startNode) {
      throw new Error(
        `Starting node ${event.data.nodeId} was not found`
      );
    }

    // Get the prompt directly from the React Flow node
    const startPrompt = String(
      startNode.data?.prompt || ""
    );

    // Run the first AI decision
    const result = await runDecisionNode(
      step,
      startNode.id,
      event.data.message,
      startPrompt
    );

    // Find the next node using the AI decision
    let currentNodeId = findNextNode(
      result.nodeId,
      result.decision,
      workflowEdges
    );

    // Keep track of how many nodes the workflow has visited
    let stepsTaken = 0;

    // Prevent an accidental infinite loop
    const maxSteps = 20;

    // Continue moving through the workflow
    while (
      currentNodeId &&
      stepsTaken < maxSteps
    ) {
      // Count this node as one workflow step
      stepsTaken++;

      // Find the current node in the React Flow graph
      const currentNode = workflowNodes.find(
        (node: any) =>
          node.id === currentNodeId
      );

      // Stop if the node cannot be found
      if (!currentNode) {
        console.log(
          "Node not found:",
          currentNodeId
        );

        break;
      }

      // Check whether this is an AI decision node
      if (currentNode.type !== "decision") {
        // Find the normal edge leaving this node
        const nextEdge = workflowEdges.find(
          (edge: any) =>
            edge.source === currentNodeId
        );

        // If there is no outgoing edge,
        // the workflow has finished
        if (!nextEdge) {
          break;
        }

        // Move to the next node
        currentNodeId = nextEdge.target;

        // Continue the workflow
        continue;
      }

      // Get the decision question directly
      // from the React Flow node
      const prompt = String(
        currentNode.data?.prompt || ""
      );

      // Run the AI decision
      const nextResult = await runDecisionNode(
        step,
        currentNode.id,
        event.data.message,
        prompt
      );

      // Find the next node based on YES or NO
      currentNodeId = findNextNode(
        nextResult.nodeId,
        nextResult.decision,
        workflowEdges
      );

      // Show the next node in the terminal
      console.log(
        "Next node:",
        currentNodeId
      );
    }

    // Return the first AI decision result
    return result;
  }
);

// Expose the Inngest function through our Next.js API route
export const {
  GET,
  POST,
  PUT,
} = serve({
  client: inngest,

  // Register our workflow function
  functions: [testFunction],
});