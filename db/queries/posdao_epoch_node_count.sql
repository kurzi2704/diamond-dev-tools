select
  id as epoch,
  EXTRACT(EPOCH FROM end_block.block_time - start_block.block_time)::int as epoch_duration
from posdao_epoch as epochs
join headers as start_block on epochs.block_start = start_block.block_number
join headers as end_block on epochs.block_end = end_block.block_number
where id > 0
order by id desc
limit 100;
