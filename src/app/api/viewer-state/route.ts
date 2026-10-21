import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Viewer-specific state for the UGC routes whose public payload is served from
 * the Vercel CDN.
 *
 * The public routes (`/api/memes`, `/api/polls`, `/api/lists`, ...) used to
 * read the session to attach "have I voted / liked this?". That made the
 * response different per visitor, so it could never be stored in the shared
 * cache and every request stayed a billed function invocation.
 *
 * The split:
 *   - the route itself answers with the public payload only and is cached by
 *     the CDN (`public, s-maxage=300`),
 *   - this endpoint answers with the visitor's own state for a handful of ids
 *     and is never shared (`private`).
 *
 * The response is `private, max-age=60` on purpose: the browser keeps it for a
 * minute, so re-visiting a page within that minute costs no invocation at all.
 *
 * `?type=` selects the state to read, `?ids=` is a comma separated list.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "";
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 200);

  if (ids.length === 0) {
    return viewerStateResponse({});
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return viewerStateResponse({});
  }

  const states: Record<string, unknown> = {};

  switch (type) {
    case "memeVotes": {
      const votes = await prisma.memeVote.findMany({
        where: { userId, memeId: { in: ids } },
        select: { memeId: true, value: true },
      });
      for (const vote of votes) states[vote.memeId] = vote.value;
      break;
    }
    case "pollVotes": {
      const votes = await prisma.pollVote.findMany({
        where: { userId, pollId: { in: ids } },
        select: { pollId: true, optionId: true },
      });
      for (const vote of votes) states[vote.pollId] = vote.optionId;
      break;
    }
    case "reviewVotes": {
      const votes = await prisma.longReviewVote.findMany({
        where: { userId, reviewId: { in: ids } },
        select: { reviewId: true, value: true },
      });
      for (const vote of votes) states[vote.reviewId] = vote.value;
      break;
    }
    case "listStates": {
      const [likes, votes, lists] = await Promise.all([
        prisma.userListLike.findMany({
          where: { userId, listId: { in: ids } },
          select: { listId: true },
        }),
        prisma.listVote.findMany({
          where: { userId, listId: { in: ids } },
          select: { listId: true, value: true },
        }),
        prisma.userList.findMany({
          where: { id: { in: ids } },
          select: { id: true, userId: true },
        }),
      ]);
      const liked = new Set(likes.map((like) => like.listId));
      const voted = new Map(votes.map((vote) => [vote.listId, vote.value]));
      const owners = new Map(lists.map((list) => [list.id, list.userId]));
      for (const id of ids) {
        states[id] = {
          isLiked: liked.has(id),
          voteValue: voted.get(id) ?? 0,
          isOwner: owners.get(id) === userId,
        };
      }
      break;
    }
    case "blogStates": {
      const [likes, posts] = await Promise.all([
        prisma.blogPostLike.findMany({
          where: { userId, postId: { in: ids } },
          select: { postId: true },
        }),
        prisma.blogPost.findMany({
          where: { id: { in: ids } },
          select: { id: true, userId: true },
        }),
      ]);
      const liked = new Set(likes.map((like) => like.postId));
      const owners = new Map(posts.map((post) => [post.id, post.userId]));
      for (const id of ids) {
        states[id] = {
          isLiked: liked.has(id),
          isOwn: owners.get(id) === userId,
        };
      }
      break;
    }
    default:
      break;
  }

  return viewerStateResponse(states);
}

/**
 * Every answer of this route is visitor specific: it must never reach the
 * shared cache, but the browser may keep it for a minute so repeat page views
 * stay free. The header is set on every path, including the early returns,
 * so the platform default can never turn it into a shared response.
 */
function viewerStateResponse(states: Record<string, unknown>) {
  const res = NextResponse.json({ states });
  res.headers.set("Cache-Control", "private, max-age=60");
  return res;
}
