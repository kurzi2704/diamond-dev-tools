


select start_block.block_time as epoch_start_time, count(posdao_epoch_node.id_node) from posdao_epoch 
join headers as start_block on posdao_epoch.block_start = start_block.block_number
join posdao_epoch_node on posdao_epoch_node.id_posdao_epoch =  posdao_epoch.id
group by start_block.block_time, posdao_epoch_node.id_posdao_epoch