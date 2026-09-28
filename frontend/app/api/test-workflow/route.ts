// Import the Inngest client
import { Inngest } from "inngest";

// Create the Inngest client
const inngest = new Inngest({
  id: "ai-workflow",
});

// Handle POST requests from our React Flow frontend
export async function POST(request: Request) {
  // Read the data sent by the frontend
  const data = await request.json();

  // Send the workflow to Inngest
  const result = await inngest.send({
    name: "workflow/test",

    // Pass everything Inngest needs to run the workflow
    data: {
      // Starting node
      nodeId: data.nodeId,

      // Message the AI should evaluate
      message: data.message,

      // Send the current React Flow nodes
      nodes: data.nodes,

      // Send the current React Flow edges
      edges: data.edges,
    },
  });

  // Return the Inngest event result
  return Response.json(result);
}