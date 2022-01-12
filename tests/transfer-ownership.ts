import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { TransferOwnership } from '../target/types/transfer_ownership';

describe('transfer-ownership', () => {

  // Configure the client to use the local cluster.
  let provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TransferOwnership as Program<TransferOwnership>;

  const LAMPORTS_PER_SOL = anchor.web3.LAMPORTS_PER_SOL;
  const LAMPORTS_TO_SEND = 250_000_000;

  let user1 = anchor.web3.Keypair.generate();
  let user2 = anchor.web3.Keypair.generate();

  it('Transferring Ownership of 0 Data account!', async () => {
    // Airdrop sol for user 1
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user1.publicKey, LAMPORTS_PER_SOL)
    );


    // Get user1 Balance
    let user1Balance = await provider.connection.getBalance(user1.publicKey);

    console.log("User1 Balance:", user1Balance);

    // Get user1 Owner
    let user1Owner = await (await provider.connection.getAccountInfo(user1.publicKey)).owner;
    
    console.log("User1 Account Owner: ", user1Owner.toString());

    // Change user1 Owner to our program 
    let ix = anchor.web3.SystemProgram.assign({accountPubkey: user1.publicKey, programId: program.programId})

    let tx = new anchor.web3.Transaction().add(ix);
    await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [user1]);

    // Get user1 Owner after assigning ownership to our program
    user1Owner = await (await provider.connection.getAccountInfo(user1.publicKey)).owner;

    console.log("User1 Account Owner: ", user1Owner.toString());


    // Change user1 Owner back to system program
    await provider.connection.confirmTransaction(
      await program.rpc.reAssign({
        accounts: {
          accountPubkey: user1.publicKey,
          programId: anchor.web3.SystemProgram.programId
        },
        signers: [user1]
      })
    );

    // Get user1 Owner after assigning ownership back to system program
    user1Owner = await (await provider.connection.getAccountInfo(user1.publicKey)).owner
    console.log("User1 Account Owner: ", user1Owner.toString());

    // Get user1 Balance
    user1Balance = await provider.connection.getBalance(user1.publicKey)

    console.log("User1 Balance:", user1Balance);

  });

  it('Transferring Ownership of Account initialized with Data!', async () => {

    // Initilize user2 account with data owned by our program
    await provider.connection.confirmTransaction(
      await program.rpc.initialize({
        accounts: {
          accountAddress: user2.publicKey,
          payer: user1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [user1, user2]
      })
    );

    // Get user2 Owner after creating the account with the system program
    let user2Owner = await (await provider.connection.getAccountInfo(user2.publicKey)).owner
    console.log("User2 Account Owner: ", user2Owner.toString());

    // Change user2 Owner back to system program
    try {
      await provider.connection.confirmTransaction(
        await program.rpc.reAssign({
          accounts: {
            accountPubkey: user2.publicKey,
            programId: anchor.web3.SystemProgram.programId
          },
          signers: [user2]
        })
      );
    } catch (err) {
      console.log("Error: Transferring ownership of initialized account.")
    }
  });
});
