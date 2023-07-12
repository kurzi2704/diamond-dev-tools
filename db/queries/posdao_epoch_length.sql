


select start_block.block_time as epoch_start_time, EXTRACT(EPOCH FROM end_block.block_time - start_block.block_time) as duration,  end_block.block_time as epoch_end_time from posdao_epoch 
join headers as start_block on posdao_epoch.block_start = start_block.block_number
join headers as end_block on posdao_epoch.block_end = end_block.block_number

