create view keygen_rounds
as
select 
on_enter_block_number, on_exit_block_number, keygen_round, state 
from pending_validator_state_event 
group by on_enter_block_number, on_exit_block_number, keygen_round, state 
order by on_enter_block_number