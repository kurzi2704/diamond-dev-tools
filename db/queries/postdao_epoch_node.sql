SELECT h_start.block_time, e.id as epoch,  n.pool_address as pool_address 
from  posdao_epoch e
join posdao_epoch_node en on e.id = en.id_posdao_epoch
join node n on en.id_node = n.pool_address
join headers h_start on h_start.block_number = e.block_start
LIMIT 10


SELECT h_start.block_time as time, e.id as epoch,  n.pool_address as pool_address 
      from  posdao_epoch e
      join posdao_epoch_node en on e.id = en.id_posdao_epoch
      join node n on en.id_node = n.pool_address
      join headers h_start on h_start.block_number = e.block_start

SELECT *
FROM   crosstab(
   'SELECT h_start.block_time as time, e.id as epoch,  n.pool_address as pool_address 
      from  posdao_epoch e
      join posdao_epoch_node en on e.id = en.id_posdao_epoch
      join node n on en.id_node = n.pool_address
      join headers h_start on h_start.block_number = e.block_start'
   ) AS ct ("time" timestamp, "epoch" int, "pool_address" bit);
   
   
   

