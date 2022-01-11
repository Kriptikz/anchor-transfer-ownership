# anchor-transfer-ownership

This project creates a user account and airdrops some sol. 
After the airdrop the owner is the system program.
We then transfer ownership to our program using SystemProgram.assign()
Then we transfer ownership back to the system program using our programs function re_assign()

