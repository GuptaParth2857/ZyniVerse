import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { schema } from "@/lib/graphql/schema";
import { rootResolver } from "@/lib/graphql/resolvers";
import { graphql } from "graphql";

export async function POST(req: NextRequest) {
  const auth = await verifyApiKey(req);
  if (auth.error) return auth.error;

  let body: { query: string; variables?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.query || typeof body.query !== "string") {
    return NextResponse.json({ error: "Missing 'query' in request body" }, { status: 400 });
  }

  try {
    const result = await graphql({
      schema,
      source: body.query,
      rootValue: rootResolver,
      variableValues: body.variables,
    });

    if (result.errors) {
      return NextResponse.json({
        errors: result.errors.map((e) => ({
          message: e.message,
          locations: e.locations,
          path: e.path,
        })),
      }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "GraphQL execution failed";
    return NextResponse.json({ errors: [{ message }] }, { status: 500 });
  }
}
