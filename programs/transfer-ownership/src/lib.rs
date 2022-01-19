use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod transfer_ownership {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        ctx.accounts.account_address.data = String::from("Hello");
        Ok(())
    }

    pub fn re_assign(ctx: Context<ReAssign>) -> ProgramResult {
        ctx.accounts.account_pubkey.assign(ctx.accounts.program_id.key);
        Ok(())
    }

    pub fn send_sol_from_data_account(ctx: Context<SendSolFromData>, amount: u64) -> ProgramResult {
        **ctx.accounts.to.lamports.borrow_mut() += amount;
        **ctx.accounts.data_account.to_account_info().lamports.borrow_mut() -= amount;



        Ok(())
    }

    pub fn zero_data_account(ctx: Context<ZeroData>) -> ProgramResult {
        //data = Data{ data: String::from("Goodbye")}.try_to_vec()?;
        //*ctx.accounts.account_pubkey.data.borrow_mut() = &mut data[..];
        //ctx.accounts.account_pubkey.to_account_info().try_borrow_mut_data()? = &mut [];
        

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 64)]
    pub account_address: Account<'info, DataAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct ReAssign<'info> {
    #[account(mut, signer)]
    pub account_pubkey: AccountInfo<'info>,
    pub program_id: AccountInfo<'info>
}

#[derive(Accounts)]
pub struct ZeroData<'info> {
    #[account(mut, signer)]
    pub account_pubkey: AccountInfo<'info>,
    pub program_id: AccountInfo<'info>
}

#[derive(Accounts)]
pub struct SendSolFromData<'info> {
    #[account(mut)]
    pub data_account: Account<'info, DataAccount>,
    #[account(mut, signer)]
    pub to: AccountInfo<'info>,
    pub program_id: AccountInfo<'info>
}

#[account]
pub struct DataAccount{
    pub data: String,
}
