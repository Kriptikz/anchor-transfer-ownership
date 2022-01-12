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

#[account]
pub struct Data{
    pub data: String,
}
