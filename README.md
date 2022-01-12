# anchor-transfer-ownership

This project creates a user account and airdrops some sol. 

After the airdrop the owner is the system program.

We then transfer ownership to our program using SystemProgram.assign()

Then we transfer ownership back to the system program using our programs function re_assign()


# thoughts

So even if we use SystemProgram.createAccount() we can still transfer ownership around.

Maybe once the account has some data associated with it, it can no longer change owners.

Correct, once the account is initialized with some data the program id can no longer be modified

Now lets see if I can transfer some sol from it.

First from the SystemProgram. This errors out. The account can not be used to pay transaction fees.

Then from within our own program. This works!

Now let's try to zero out the data and send ownership back to the SystemProgram.

So, I'm unable to zero out the data, I'm not good enough with Rust to see the problem. 

But, if I send all the lamports out of the account it can no longer pay rent and then gets automatically cleaned up.

Now all the data is cleared from the account and I can basically reinitialize it however I want. To the SystemProgram or my own program.

