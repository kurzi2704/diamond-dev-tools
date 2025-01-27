create view keygen_rounds
as
select 
on_enter_block_number, on_exit_block_number, keygen_round, state 
from pending_validator_state_event 
group by on_enter_block_number, on_exit_block_number, keygen_round, state 
order by on_enter_block_number;

create view keygen_round_details
as
select r.*, enters.posdao_hbbft_epoch, enters.block_time as start, exits.block_time as end, exits.block_time - enters.block_time as duration from keygen_rounds r
join headers enters on r.on_enter_block_number = enters.block_number
join headers exits on r.on_exit_block_number = exits.block_number
order by on_enter_block_number;