use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod transfer_ownership {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }

    pub fn re_assign(ctx: Context<ReAssign>) -> ProgramResult {
        ctx.accounts.account_pubkey.assign(ctx.accounts.program_id.key);
        Ok(())
    }

    pub fn send_sol_from_data_account(ctx: Context<SendSolFromData>) -> ProgramResult {
        **ctx.accounts.to.lamports.borrow_mut() += **ctx.accounts.data_account.to_account_info().lamports.borrow_mut();
        **ctx.accounts.data_account.to_account_info().lamports.borrow_mut() = 0;


        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 64)]
    pub account_address: Account<'info, Data>,
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
pub struct SendSolFromData<'info> {
    #[account(mut, signer)]
    pub data_account: Account<'info, Data>,
    #[account(mut)]
    pub to: AccountInfo<'info>,
    pub program_id: AccountInfo<'info>
}

#[account]
pub struct Data{
    pub data: String,
}
