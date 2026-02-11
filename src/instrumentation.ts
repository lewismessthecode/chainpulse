export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) {
    try {
      const { setGlobalDispatcher, EnvHttpProxyAgent } = await import("undici");
      setGlobalDispatcher(new EnvHttpProxyAgent());
      console.log(`[proxy] server-side fetch via ${proxy} (NO_PROXY respected)`);
    } catch (err) {
      console.warn("[proxy] Failed to set up proxy agent:", err);
    }
  }
}
