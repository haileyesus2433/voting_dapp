import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Voting } from "../target/types/voting";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import exp from "constants";

const IDL = require("../target/idl/voting.json");
const votingAddress = new PublicKey(
  "coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF"
);
describe("Voting", () => {
  it("Initialize Poll", async () => {
    const context = await startAnchor(
      "",
      [{ name: "voting", programId: votingAddress }],
      []
    );

    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(IDL, provider);

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
});
