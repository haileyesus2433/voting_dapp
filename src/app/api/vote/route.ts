import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Voting } from "@/../anchor/target/types/voting";
import { Program } from "@coral-xyz/anchor";
import { BN } from "bn.js";

const IDL = require("@/../anchor/target/idl/voting.json");

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2U6jObQDKu_PWC3utD_yC-rxyaYKnOf0DaQ&s",
    title: "Vote for Arsenal Vs Leceister",
    description: "Vote for ur favourite team",
    label: "Vote",
    links: {
      actions: [
        {
          label: "Arsenal",
          href: "/api/vote?candidate=Arsenal",
          type: "post",
        },
        {
          label: "Leceister",
          href: "/api/vote?candidate=Leceister",
          type: "post",
        },
      ],
    },
  };
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");
  if (candidate !== "Arsenal" && candidate !== "Leceister") {
    return Response.json(
      { message: "Invalid Candidate" },
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Voting> = new Program(IDL, { connection });

  const body: ActionPostRequest = await request.json();
  let voter;
  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return Response.json(
      { message: "Invalid Account" },
      { status: 400, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const blockhash = await connection.getLatestBlockhash();

  const instruction = await program.methods
    .vote(new BN(1), candidate)
    .accounts({
      signer: voter,
    })
    .instruction();
  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
      type: "transaction",
    },
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
