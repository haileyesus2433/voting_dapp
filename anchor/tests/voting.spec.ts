import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Voting } from "../target/types/voting";
import { BankrunProvider, startAnchor } from "anchor-bankrun";

const IDL = require("../target/idl/voting.json");
const votingAddress = new PublicKey(
  "DVoxcpEKv5yb4sPQk4rsnWp6eeXnxiEUMXbffWvq9UMi"
);
describe("Voting", () => {
  let context;
  let provider;
  anchor.setProvider(anchor.AnchorProvider.env());
  let votingProgram = anchor.workspace.Voting as Program<Voting>;

  beforeAll(async () => {
    // context = await startAnchor(
    //   "",
    //   [{ name: "voting", programId: votingAddress }],
    //   []
    // );
    // provider = new BankrunProvider(context);
    // votingProgram = new Program<Voting>(IDL, provider);
  });

  it("Initialize Poll", async () => {
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        "Test Poll",
        new anchor.BN(0),
        new anchor.BN(1800000000)
      )
      .rpc();

    const [pollAdress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAdress);

    console.log(poll);

    expect(poll.description).toEqual("Test Poll");
    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.pollStart.toNumber()).toEqual(0);
  });

  it("initialize candidate", async () => {
    await votingProgram.methods
      .initializeCandidate(new anchor.BN(1), "Arsenal")
      .rpc();

    await votingProgram.methods
      .initializeCandidate(new anchor.BN(1), "Leciester")
      .rpc();

    const [arsenalAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Arsenal")],
      votingAddress
    );

    const [leciesterAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Leciester")],
      votingAddress
    );

    let arsenal = await votingProgram.account.candidate.fetch(arsenalAddress);
    let leciester = await votingProgram.account.candidate.fetch(
      leciesterAddress
    );

    console.log(arsenal);
    console.log(leciester);

    expect(arsenal.candidateName).toEqual("Arsenal");
    expect(leciester.candidateName).toEqual("Leciester");
    expect(arsenal.candidateVote.toNumber()).toEqual(0);
    expect(leciester.candidateVote.toNumber()).toEqual(0);
  });
  36;

  it("vote", async () => {
    await votingProgram.methods.vote(new anchor.BN(1), "Arsenal").rpc();

    const [arsenalAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Arsenal")],
      votingAddress
    );
    let arsenal = await votingProgram.account.candidate.fetch(arsenalAddress);

    console.log(arsenal);

    expect(arsenal.candidateVote.toNumber()).toEqual(1);
  });
});
