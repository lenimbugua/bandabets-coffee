// Dev-only CORS proxy so a local `node .output/server/index.mjs` can talk to the
// real APIs from a browser (they reject the localhost origin). Usage:
//   node scripts/dev-cors-proxy.mjs 3999
//   NUXT_PUBLIC_MATCHES_URL=http://localhost:3999/web.api.siakabet.com  (etc.)
// Never used by the app itself; nothing imports it.
// Local CORS proxy: http://localhost:<port>/<host>/<path> -> https://<host>/<path>, adds ACAO:*
import http from "node:http";
const port = Number(process.argv[2] || 3999);
http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" }); return res.end(); }
  const [, host, ...rest] = req.url.split("/");
  const target = `https://${host}/${rest.join("/")}`;
  const chunks = []; for await (const c of req) chunks.push(c);
  const headers = { ...req.headers }; delete headers.host; delete headers.origin; delete headers.referer; delete headers["accept-encoding"];
  try {
    const r = await fetch(target, { method: req.method, headers, body: chunks.length ? Buffer.concat(chunks) : undefined });
    const h = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-expose-headers": "*" };
    for (const [k, v] of r.headers) if (!/^(content-encoding|transfer-encoding|content-length|access-control-.*)$/i.test(k)) h[k] = v;
    res.writeHead(r.status, h); res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) { res.writeHead(502, { "access-control-allow-origin": "*" }); res.end(String(e)); }
}).listen(port, () => console.log("proxy on", port));
