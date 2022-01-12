import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { TransferOwnership } from '../target/types/transfer_ownership';
import { assert } from 'chai';

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

    let tx = new anchor.web3.Transaction({feePayer: user1.publicKey}).add(ix);
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

  it('Transferring Ownership of Account initialized with Data Fails!', async () => {

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

    let user2Balance = await provider.connection.getBalance(user2.publicKey);
    console.log("User2 Balance: ", user2Balance);

    // Get user2 Owner after assigning ownership back to the SystemProgram
    user2Owner = await (await provider.connection.getAccountInfo(user2.publicKey)).owner
    console.log("User2 Account Owner: ", user2Owner.toString());

  });

  it('Try to send sol from user2 Data account!', async () => {

    const BONUS_LAMPS_TO_SEND = 10_000_000;

    let user1InitialBalance = await provider.connection.getBalance(user1.publicKey);
    let user2InitialBalance = await provider.connection.getBalance(user2.publicKey);

    console.log("User1 Initial Balance: ", user1InitialBalance);
    console.log("User2 Initial Balance: ", user2InitialBalance);


    // Send more sol from user1 to user2
    let ix = anchor.web3.SystemProgram.transfer({fromPubkey: user1.publicKey, toPubkey: user2.publicKey, lamports: LAMPORTS_TO_SEND + BONUS_LAMPS_TO_SEND});

    let tx = new anchor.web3.Transaction().add(ix);

    await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [user1]);

    let user2FinalBalance = await provider.connection.getBalance(user2.publicKey);

    assert.equal(user2InitialBalance + LAMPORTS_TO_SEND + BONUS_LAMPS_TO_SEND, user2FinalBalance);

    // Send sol from user2 to user1
    // This doesn't work since SystemProgram doesn't own the user2 account anymore
    //ix = anchor.web3.SystemProgram.transfer({fromPubkey: user2.publicKey, toPubkey: user1.publicKey, lamports: LAMPORTS_TO_SEND})
    //tx = new anchor.web3.Transaction().add(ix);
//
    //await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [user2]);

    console.log("Sending sol from Data Account using our program");

    await provider.connection.confirmTransaction(
      await program.rpc.sendSolFromDataAccount(
        new anchor.BN(LAMPORTS_TO_SEND),
        {
        accounts: {
          dataAccount: user2.publicKey,
          to: user1.publicKey,
          programId: anchor.web3.SystemProgram.programId
        },
        signers: [user2]
      })
    );

    let user1FinalBalance = await provider.connection.getBalance(user1.publicKey);
    user2FinalBalance = await provider.connection.getBalance(user2.publicKey);

    console.log("User1 Final Balance: ", user1FinalBalance);
    console.log("User2 Final Balance: ", user2FinalBalance);

  });

  it('Zero out Data Account!', async () => {

    let user2AccountDataBefore = await (await provider.connection.getAccountInfo(user2.publicKey)).data;

    console.log("User1 Data Before: ", user2AccountDataBefore);

    await provider.connection.confirmTransaction(
      await program.rpc.zeroDataAccount({
        accounts: {
          accountPubkey: user2.publicKey,
          programId: anchor.web3.SystemProgram.programId
        },
        signers: [user2]
      })
    );

    let user2AccountDataAfter = await (await provider.connection.getAccountInfo(user2.publicKey)).data;

    console.log("User1 Data After: ", user2AccountDataAfter);
  });

  it('Send all lamps from data account then transfer ownership', async () => {
    let user2Balance = await provider.connection.getBalance(user2.publicKey);
    console.log("Initial User2 Balance: ", user2Balance);

    await provider.connection.confirmTransaction(
      await program.rpc.sendSolFromDataAccount(
        new anchor.BN(user2Balance),
        {
        accounts: {
          dataAccount: user2.publicKey,
          to: user1.publicKey,
          programId: anchor.web3.SystemProgram.programId
        },
        signers: [user2]
      })
    );

    user2Balance = await provider.connection.getBalance(user2.publicKey);
    console.log("After User2 Balance: ", user2Balance);

    // No need to re-assign ownership to an account that has been cleared from not having enough rent.
    //await provider.connection.confirmTransaction(
    //  await program.rpc.reAssign({
    //    accounts: {
    //      accountPubkey: user2.publicKey,
    //      programId: anchor.web3.SystemProgram.programId
    //    },
    //    signers: [user2]
    //  })
    //);

    // Send more sol from user1 to user2
    let ix = anchor.web3.SystemProgram.transfer({fromPubkey: user1.publicKey, toPubkey: user2.publicKey, lamports: LAMPORTS_TO_SEND});

    let tx = new anchor.web3.Transaction().add(ix);

    await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [user1]);
    

    let user2Owner = await (await provider.connection.getAccountInfo(user2.publicKey)).owner;
    console.log("After User2 Owner: ", user2Owner.toString());

  });

});
