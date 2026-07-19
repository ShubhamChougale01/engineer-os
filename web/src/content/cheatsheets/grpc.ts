import type { CheatSheetData } from "./types";

const grpc: CheatSheetData = {
  title: "The Ultimate gRPC Cheat Sheet",
  subtitle: "Protobuf & HTTP/2 · four RPC types · status codes · load balancing gotchas",
  sections: [
    {
      title: "Core Model",
      color: "violet",
      rows: [
        { term: "Protobuf schema = the contract", desc: "Compact binary format, code-generated typed clients/servers", code: "message User { int32 id = 1; string name = 2; }\nservice UserService { rpc GetUser(Req) returns (User); }" },
        { term: "Built on HTTP/2", desc: "Multiplexes many calls over ONE connection -- no head-of-line blocking", code: "// This is WHY gRPC beats REST/HTTP1.1 at high concurrency" },
        { term: "Feels like a local function call", desc: "The generated stub hides serialization + the network round trip", code: "user, err := client.GetUser(ctx, &pb.GetUserRequest{Id: 42})" },
      ],
    },
    {
      title: "Four RPC Types",
      color: "blue",
      rows: [
        { term: "Unary", desc: "One request, one response -- like a typical REST call", code: "rpc GetItem(Req) returns (Item);" },
        { term: "Server streaming", desc: "One request, a STREAM of responses -- large result sets", code: "rpc ListItems(Req) returns (stream Item);" },
        { term: "Client streaming", desc: "A STREAM of requests, one response -- incremental uploads", code: "rpc UploadItems(stream Item) returns (Summary);" },
        { term: "Bidirectional streaming", desc: "Both sides stream independently -- real-time, two-way", code: "rpc Chat(stream Msg) returns (stream Msg);" },
      ],
    },
    {
      title: "Status Codes & Deadlines",
      color: "emerald",
      rows: [
        { term: "gRPC's OWN status codes", desc: "Sent as an HTTP/2 TRAILER, not the HTTP status line", code: "return nil, status.Errorf(codes.NotFound, \"user not found\")" },
        { term: "Key codes", desc: "", code: "OK CANCELLED INVALID_ARGUMENT DEADLINE_EXCEEDED\nNOT_FOUND PERMISSION_DENIED UNAUTHENTICATED\nRESOURCE_EXHAUSTED INTERNAL UNAVAILABLE" },
        { term: "ALWAYS set deadlines", desc: "Propagates automatically to downstream calls -- prevents hangs", code: "ctx, cancel := context.WithTimeout(ctx, 2*time.Second)\ndefer cancel()" },
      ],
    },
    {
      title: "Schema Evolution",
      color: "amber",
      rows: [
        { term: "Wire format keys on FIELD NUMBERS", desc: "Not names -- adding new numbered fields is safe", code: "string phone = 4;   // new field, older clients just ignore it" },
        { term: "NEVER reuse a removed field number", desc: "Silent data corruption between old/new clients -- use reserved", code: "reserved 4;\nreserved \"phone\";" },
        { term: "Lint schemas in CI", desc: "Catch breaking changes before deploy", code: "// buf breaking --against '.git#branch=main'" },
      ],
    },
    {
      title: "Load Balancing (the #1 gRPC gotcha)",
      color: "rose",
      rows: [
        { term: "L4 (connection-level) LB is WRONG", desc: "One connection multiplexes MANY calls -> all land on ONE instance", code: "// A naive load balancer concentrates load, defeating distribution" },
        { term: "Fix: client-side or L7-aware LB", desc: "Or a service mesh (Istio/Linkerd) understanding individual calls", code: "// Sidecar proxies add mTLS, retries, LB transparently" },
      ],
    },
    {
      title: "Browsers & When to Use gRPC",
      color: "cyan",
      rows: [
        { term: "Browsers can't speak native gRPC", desc: "No full HTTP/2 trailer support historically", code: "// Use gRPC-Web + an Envoy proxy translating to native gRPC" },
        { term: "Use gRPC for", desc: "Internal, high-throughput, typed, streaming service-to-service calls", code: "" },
        { term: "Use REST/GraphQL instead for", desc: "Public-facing APIs -- gRPC needs generated client code, a real barrier", code: "// Common pattern: REST/GraphQL at the edge, gRPC internally" },
        { term: "Debug with grpcurl", desc: "curl-equivalent for gRPC, needs server reflection enabled", code: "grpcurl -plaintext localhost:50051 list" },
      ],
    },
  ],
};

export default grpc;
