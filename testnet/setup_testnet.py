#!/usr/bin/python3

import os
import subprocess
import sys
from shutil import copyfile


def print_help():
    print('help:')
    print('requires 1 or 2 arguments:')
    print('1: number of initial validator nodes to create')
    print('2: (optional): number of total nodes to create. Must be bigger than or equal to argument 1')


if len(sys.argv) == 1:
    print_help()
    exit()


if len(sys.argv) > 3:
    print_help()
    exit()


num_initialValidators = int(sys.argv[1])
num_nodes = num_initialValidators

if len(sys.argv) == 3:
    num_nodes = int(sys.argv[2])

def run_cmd(args, cwd=None):
    p = subprocess.Popen(args, cwd=cwd)
    p.wait()

print('Generating testnet with {num_initialValidators} out of {num_nodes}'.format(num_initialValidators=num_initialValidators, num_nodes=num_nodes))

print('Generating Docker config volume folders for {num_nodes} hbbft validator nodes'.format(num_nodes=num_nodes))

#generator_dir = '../../openethereum/ethcore/src/engines/hbbft/hbbft_config_generator'
#generator_dir = '../../openethereum/ethcore/engines/hbbft/hbbft_config_generator'
generator_dir = '../../openethereum/crates/ethcore/src/engines/hbbft/hbbft_config_generator'

# todo: hbbft_config_generator could get adopted to support num_nodes and num_initialValidators
cmd = ['cargo', 'run', str(num_initialValidators), str(num_nodes), "Docker"]

if len(sys.argv) > 3:
    cmd.extend(sys.argv[3:])

#print('running: ')
#print(cmd)

run_cmd(cmd, generator_dir)

# The location of the hbbft-posdao-contracts repository clone.
posdao_contracts_dir = '../../hbbft-posdao-contracts'
# The JSON file with initialization data produced by hbbft_config_generator, relative to the hbbft-posdao-contracts folder.
#init_data_file = '../openethereum/ethcore/src/engines/hbbft/hbbft_config_generator/keygen_history.json'
#init_data_file = '../openethereum/ethcore/engines/hbbft/hbbft_config_generator/keygen_history.json'
init_data_file = '../openethereum/crates/ethcore/src/engines/hbbft/hbbft_config_generator/keygen_history.json'

os.environ["NETWORK_NAME"] = "DPoSChain"
os.environ["NETWORK_ID"] = "777001"
os.environ["OWNER"] = "0x0102Ac5315c1Bd986A1da4F1FE1b4BCA36Fa4667"
#os.environ["FIRST_VALIDATOR_IS_UNREMOVABLE"] = "true"
os.environ["STAKING_EPOCH_DURATION"] = "2"
os.environ["STAKE_WITHDRAW_DISALLOW_PERIOD"] = "1"
os.environ["STAKING_TRANSITION_WINDOW_LENGTH"] = "1"

# Invoke the hbbft chain spec generation script
cmd = ['node', 'scripts/make_spec_hbbft.js', init_data_file]
run_cmd(cmd, posdao_contracts_dir)

# Output of chain spec generation
spec_file = '../../hbbft-posdao-contracts/spec_hbbft.json'

# Set up validator nodes
for i in range(1, num_nodes + 1):
    print("Setting up config for node {}".format(i))
    os.makedirs("nodes/node{}/data/network".format(i), exist_ok=True)
    os.makedirs("nodes/node{}/data/keys/DPoSChain".format(i), exist_ok=True)
    copyfile(generator_dir + "/hbbft_validator_{}.toml".format(i), "nodes/node{}/node.toml".format(i))
    copyfile(generator_dir + "/hbbft_validator_key_{}".format(i), "nodes/node{}/data/network/key".format(i))
    copyfile(generator_dir + "/reserved-peers", "nodes/node{}/reserved-peers".format(i))
    copyfile(spec_file, "nodes/node{}/spec.json".format(i))
    copyfile(generator_dir + "/password.txt", "nodes/node{}/password.txt".format(i))
    copyfile(generator_dir + "/hbbft_validator_key_{}.json".format(i), "nodes/node{}/data/keys/DPoSChain/hbbft_validator_key.json".format(i))    



# Set up Rpc node
os.makedirs("nodes/rpc_node", exist_ok=True)
copyfile(generator_dir + "/rpc_node.toml", "nodes/rpc_node/node.toml")
copyfile(generator_dir + "/reserved-peers", "nodes/rpc_node/reserved-peers")
copyfile(spec_file, "nodes/rpc_node/spec.json")

# adding the option required for a full sophisticated rpc node.

rpc_node_toml = open('nodes/rpc_node/node.toml', 'a')
rpc_node_toml.write('\n')
rpc_node_toml.write('[footprint]\n')
rpc_node_toml.write('fat_db = "on"\n')
rpc_node_toml.write('tracing = "on"\n')
rpc_node_toml.write('db_compaction = "ssd"\n')
rpc_node_toml.write('pruning = "archive"\n')
rpc_node_toml.write('cache_size = 40960\n')

rpc_node_toml.close()