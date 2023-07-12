

select headers.block_time as epoch_start_time, posdao_epoch.id from posdao_epoch 
join headers on headers.block_number >= posdao_epoch.block_start AND headers.block_number <= posdao_epoch.block_end  