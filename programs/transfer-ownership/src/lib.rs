use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod transfer_ownership {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }

    pub fn re_assign(ctx: Context<ReAssign>) -> ProgramResult {
        ctx.accounts.account_pubkey.assign(ctx.accounts.program_id.key);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct ReAssign<'info> {
    #[account(mut, signer)]
    pub account_pubkey: AccountInfo<'info>,
    pub program_id: AccountInfo<'info>
}
