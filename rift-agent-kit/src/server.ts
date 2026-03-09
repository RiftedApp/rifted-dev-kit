import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerRiftTools } from "./tools";

async function main() {
  const server = new McpServer({
    name: "rift-agent-kit",
    version: "0.1.0",
  });

  registerRiftTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
