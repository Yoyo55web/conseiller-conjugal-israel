// Record runtime identifiers only; keep credentials and request data out of this log.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const nodeProcess = await import("node:process");
    console.info(
      "[security-runtime] " +
        JSON.stringify({
          node: nodeProcess.version,
          brotli: nodeProcess.versions.brotli ?? null,
        }),
    );
  }
}
