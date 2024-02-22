
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { cmd } from '../remoteCommand';
import * as child_process from 'child_process';
import { sleep } from '../utils/time';

export class LocalnetBuilder {


    public constructor(public targetDirectory: string, public numInitialValidators: number, public numNodes: number, public useContractProxies = true,  public metricsPortBase: number = 48700,  public txQueuePerSender: number = Number.NaN) {
    }


    private writeEnv(envName: string, envDefaultValue: string): void {
        const value = process.env[envName];
        if (value === undefined) {
            process.env[envName] = envDefaultValue;
        }
    }

    // private readEnv(envName: string): string {
    //     const value = process.env[envName];
    //     if (value === undefined) {
    //         throw new Error(`Environment variable ${envName} is not set`);
    //     }
    //     return value;
    // }

    private copyFile(src: string, dest: string) {
        console.log(`Copying ${src} to ${dest}`);
        fs.copyFileSync(src, dest);
    };

    private buildContracts() {

        this.writeEnv("NETWORK_NAME", "DPoSChain");
        this.writeEnv("NETWORK_ID", "777012");
        this.writeEnv("OWNER", "0x32c5f14302d4Dd973e0040a5d7Eda97222A928D1");
        this.writeEnv("STAKING_EPOCH_DURATION", "3600");
        this.writeEnv("STAKE_WITHDRAW_DISALLOW_PERIOD", "1");
        this.writeEnv("STAKING_TRANSITION_WINDOW_LENGTH", "600");
        this.writeEnv("STAKING_MIN_STAKE_FOR_VALIDATOR", "10000");
        this.writeEnv("STAKING_MIN_STAKE_FOR_DELEGATOR", "100");


        let posdao_contracts_dir = '../../diamond-contracts-core';


        let args: Array<string> = ['npx', 'hardhat', 'compile'];

        let result = cmd(`cd ${posdao_contracts_dir} && npx hardhat compile`);

        if (!result.success) {
            console.error(result.output);
            console.error("failed to compile contracts, aborting.");
            throw new Error('Failed to compile contracts');
        }

        let generatedAssetsDirectory = '../diamond-node/crates/ethcore/src/engines/hbbft/hbbft_config_generator/';

        let init_data_file = generatedAssetsDirectory + 'keygen_history.json'
        let nodes_info_file = generatedAssetsDirectory + 'nodes_info.json'

        let useProxy = this.useContractProxies ? '--use-upgrade-proxy' : '';

        let makeSpectResult = cmd(`cd ${posdao_contracts_dir} && npx hardhat make_spec_hbbft --init-contracts initial-contracts.json ${useProxy} ${init_data_file}`);

        if (!makeSpectResult.success) {
            console.error(makeSpectResult.output);
            console.error("failed to generate chain spec, aborting.");
            throw new Error('Failed to generate chain spec');
        }

        let specFile = path.join(posdao_contracts_dir, 'spec_hbbft.json');

        for (let i = 1; i <= this.numNodes; i++) {

            console.log(`Setting up config for node `, i);

            let nodeDir = path.join(this.targetDirectory, `node${i}`);

            fs.mkdirSync(nodeDir, {recursive: true});
            fs.mkdirSync(path.join(nodeDir, `data/network`), {recursive: true});
            fs.mkdirSync(path.join(nodeDir, `data/keys`), {recursive: true});

        

            this.copyFile(path.join(generatedAssetsDirectory, `hbbft_validator_${i}.toml`), path.join(nodeDir, 'node.toml'));
            this.copyFile(path.join(generatedAssetsDirectory, `hbbft_validator_key_${i}`), path.join(nodeDir, 'data/network/key'));
            this.copyFile(path.join(generatedAssetsDirectory, `hbbft_validator_address_${i}.txt`), path.join(nodeDir, 'address.txt'));
            this.copyFile(path.join(generatedAssetsDirectory, `hbbft_validator_public_${i}.txt`), path.join(nodeDir, 'public_key.txt'));
            this.copyFile(path.join(generatedAssetsDirectory, `reserved-peers`), path.join(nodeDir, 'reserved-peers'));
            this.copyFile(specFile, path.join(nodeDir, 'spec_hbbft.json'));
            this.copyFile(path.join(generatedAssetsDirectory, 'password.txt'), path.join(nodeDir, 'password.txt'));
            this.copyFile(path.join(generatedAssetsDirectory, `hbbft_validator_key_${i}.json`), path.join(nodeDir, 'data/keys/DPoSChain/hbbft_validator_key.json'));
        }

        console.log('Set up Rpc node');

        fs.mkdirSync(path.join(this.targetDirectory, `rpc_node`), {recursive: true});

        this.copyFile(path.join(generatedAssetsDirectory, `rpc_node.toml`), path.join(this.targetDirectory, 'rpc_node/node.toml'));
        this.copyFile(path.join(generatedAssetsDirectory, `reserved-peers`), path.join(this.targetDirectory, 'rpc_node/reserved-peers'));
        this.copyFile(specFile, path.join(this.targetDirectory, 'rpc_node/spec.json'));
        this.copyFile(path.join(generatedAssetsDirectory, nodes_info_file), path.join(this.targetDirectory, 'nodes_info.json'));


        // # adding the option required for a full sophisticated rpc node.

        // rpc_node_toml = open('nodes/rpc_node/node.toml', 'a')
        // rpc_node_toml.write('\n')
        // rpc_node_toml.write('[footprint]\n')
        // rpc_node_toml.write('fat_db = "on"\n')
        // rpc_node_toml.write('tracing = "on"\n')
        // rpc_node_toml.write('db_compaction = "ssd"\n')
        // rpc_node_toml.write('pruning = "archive"\n')
        // rpc_node_toml.write('cache_size = 4960\n')

        // rpc_node_toml.close()
    }

    public async build() {
        await this.buildContracts();
        await this.buildNodeFiles();
    }

    

    public async buildNodeFiles() {

    
        // cmd = ['cargo', 'run', str(num_initialValidators), str(num_nodes), 'Docker', '--tx_queue_per_sender=100000', '--metrics_port_base=48700', '--metrics_interface=all']

        let args: Array<string> = ['cargo', 'run', this.numInitialValidators.toString(), this.numNodes.toString(), 'Docker'];

        if (!Number.isNaN(this.txQueuePerSender)) {
            args.push(`--tx_queue_per_sender=${this.txQueuePerSender}`);
        }

        if (!Number.isNaN(this.metricsPortBase)) {
            args.push(`--metrics_port_base==${this.metricsPortBase}`);
            args.push(`--metrics_interface=all`);
        }

        const generatorDir = '../../diamond-node/crates/ethcore/src/engines/hbbft/hbbft_config_generator';

        let spawnedProcess = child_process.spawn('cargo', args, {cwd: generatorDir, shell: true });
        
        process.stdout.on('data', (data) => {
            console.log(data)
        })
        
        process.stderr.on('data', (data) => {
            console.log(data)
        })

        let processExitCode : number | null = null;
        spawnedProcess.once('exit', (code) => {
            processExitCode = code;
        });


        while (processExitCode == null) {
            // wait
            await sleep(1000);  
        }

       


    }

}

// if len(sys.argv) > 3:
//     cmd.extend(sys.argv[3:])

// run_cmd(cmd, generator_dir)

// # The location of the diamond-contracts-core repository clone.
// posdao_contracts_dir = '../../diamond-contracts-core'

// generatedAssetsDirectory = '../diamond-node/crates/ethcore/src/engines/hbbft/hbbft_config_generator/'

// init_data_file = generatedAssetsDirectory + 'keygen_history.json'
// nodes_info_file = generatedAssetsDirectory + 'nodes_info.json'

// # using correct node version
// # run_cmd('nvm use', posdao_contracts_dir)

// # Invoke the hbbft chain spec generation script, bool: useUpgradeProxy
// # cmd = ['node', 'scripts/make_spec_hbbft.js', init_data_file, 'true']

// run_cmd(['npx', 'hardhat', 'compile'], posdao_contracts_dir)
// cmd = ['npx', 'hardhat', 'make_spec_hbbft', '--init-contracts', 'initial-contracts.json', '--use-upgrade-proxy', init_data_file]
// run_cmd(cmd, posdao_contracts_dir)

// # Output of chain spec generation
// spec_file = '../../diamond-contracts-core/spec_hbbft.json'

// # Set up validator nodes
// for i in range(1, num_nodes + 1):
//     print("Setting up config for node {}".format(i))
//     os.makedirs("nodes/node{}/data/network".format(i), exist_ok=True)
//     os.makedirs("nodes/node{}/data/keys/DPoSChain".format(i), exist_ok=True)
//     copyfile(generator_dir + "/hbbft_validator_{}.toml".format(i), "nodes/node{}/node.toml".format(i))
//     copyfile(generator_dir + "/hbbft_validator_key_{}".format(i), "nodes/node{}/data/network/key".format(i))
//     copyfile(generator_dir + "/hbbft_validator_address_{}.txt".format(i), "nodes/node{}/address.txt".format(i))
//     copyfile(generator_dir + "/hbbft_validator_public_{}.txt".format(i), "nodes/node{}/public_key.txt".format(i))
//     copyfile(generator_dir + "/reserved-peers", "nodes/node{}/reserved-peers".format(i))
//     copyfile(spec_file, "nodes/node{}/spec.json".format(i))
//     copyfile(generator_dir + "/password.txt", "nodes/node{}/password.txt".format(i))
//     copyfile(generator_dir + "/hbbft_validator_key_{}.json".format(i), "nodes/node{}/data/keys/DPoSChain/hbbft_validator_key.json".format(i))    



// # Set up Rpc node
// os.makedirs("nodes/rpc_node", exist_ok=True)
// copyfile(generator_dir + "/rpc_node.toml", "nodes/rpc_node/node.toml")
// copyfile(generator_dir + "/reserved-peers", "nodes/rpc_node/reserved-peers")
// copyfile(spec_file, "nodes/rpc_node/spec.json")
// copyfile( "../" + nodes_info_file, "nodes/nodes_info.json")


// # adding the option required for a full sophisticated rpc node.

// rpc_node_toml = open('nodes/rpc_node/node.toml', 'a')
// rpc_node_toml.write('\n')
// rpc_node_toml.write('[footprint]\n')
// rpc_node_toml.write('fat_db = "on"\n')
// rpc_node_toml.write('tracing = "on"\n')
// rpc_node_toml.write('db_compaction = "ssd"\n')
// rpc_node_toml.write('pruning = "archive"\n')
// rpc_node_toml.write('cache_size = 4960\n')

// rpc_node_toml.close()