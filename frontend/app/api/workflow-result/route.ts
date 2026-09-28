// Store the latest result for each AI decision node
const workflowResults: Record<
  string,
  {
    nodeId: string;
    decision: string;
  }
> = {};

// Handle POST requests from the Inngest workflow
export async function POST(request: Request) {
  // Read the JSON sent by Inngest
  const data = await request.json();

  // Save the result using the node ID as the key
  workflowResults[data.nodeId] = {
    nodeId: data.nodeId,
    decision: data.decision,
  };

  // Tell Inngest the result was received
  return Response.json({
    success: true,
  });
}

// Handle GET requests from the React Flow frontend
export async function GET() {
  // Send all workflow results back to the frontend
  return Response.json(workflowResults);
}