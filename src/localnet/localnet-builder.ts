
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { cmd } from '../remoteCommand';
import * as child_process from 'child_process';
import { sleep } from '../utils/time';

export class LocalnetBuilder {


    public constructor(public numInitialValidators: number, public numNodes: number, public useContractProxies = true,  public metricsPortBase: number = 48700,  public txQueuePerSender: number = Number.NaN, public portBase: number = Number.NaN, public portBaseRPC: number = Number.NaN, public portBaseWS: number = Number.NaN) {
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

    
    public copyNodeFilesToTargetDirectory(targetDirectory: string) {
        
        let generatedAssetsDirectory = this.getGeneratedAssetsDirectory();
        let specFile = path.join(this.getPosdaoContractsDir(), 'spec_hbbft.json');

        let init_data_file = generatedAssetsDirectory + 'keygen_history.json'
        let nodes_info_file = generatedAssetsDirectory + 'nodes_info.json'

        for (let i = 1; i <= this.numNodes; i++) {

            console.log(`Setting up config for node `, i);

            let nodeDir = path.join(targetDirectory, `node${i}`);

            fs.mkdirSync(nodeDir, {recursive: true});
            fs.mkdirSync(path.join(nodeDir, `data/network`), {recursive: true});
            fs.mkdirSync(path.join(nodeDir, `data/keys`), {recursive: true});
            fs.mkdirSync(path.join(nodeDir, `data/keys/DPoSChain`), {recursive: true});
        

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

        fs.mkdirSync(path.join(targetDirectory, `rpc_node`), {recursive: true});

        this.copyFile(path.join(generatedAssetsDirectory, `rpc_node.toml`), path.join(targetDirectory, 'rpc_node/node.toml'));
        this.copyFile(path.join(generatedAssetsDirectory, `reserved-peers`), path.join(targetDirectory, 'rpc_node/reserved-peers'));
        this.copyFile(specFile, path.join(targetDirectory, 'rpc_node/spec.json'));
        this.copyFile(nodes_info_file, path.join(targetDirectory, 'nodes_info.json'));

    }

    private getRelativePosdaoContractsDir() {
        return '../../../diamond-contracts-core';
    }

    private getGeneratedAssetsDirectory() { 
        let generatedAssetsDirectoryRelative = '../../../diamond-node/crates/ethcore/src/engines/hbbft/hbbft_config_generator/';
        return path.join(__dirname, generatedAssetsDirectoryRelative);
    }

    private getPosdaoContractsDir() {
        return path.join(__dirname, this.getRelativePosdaoContractsDir());
    }


    public buildContracts() {

        this.writeEnv("NETWORK_NAME", "DPoSChain");
        this.writeEnv("NETWORK_ID", "777012");
        this.writeEnv("OWNER", "0x32c5f14302d4Dd973e0040a5d7Eda97222A928D1");
        this.writeEnv("STAKING_EPOCH_DURATION", "3600");
        this.writeEnv("STAKE_WITHDRAW_DISALLOW_PERIOD", "1");
        this.writeEnv("STAKING_TRANSITION_WINDOW_LENGTH", "600");
        this.writeEnv("STAKING_MIN_STAKE_FOR_VALIDATOR", "10000");
        this.writeEnv("STAKING_MIN_STAKE_FOR_DELEGATOR", "100");


        let posdaoContractsDir = this.getRelativePosdaoContractsDir();

        let result = cmd(`cd ${posdaoContractsDir} && npx hardhat compile`);

        if (!result.success) {
            console.error(result.output);
            console.error("failed to compile contracts, aborting.");
            throw new Error('Failed to compile contracts');
        }

        let generatedAssetsDirectory = this.getGeneratedAssetsDirectory();

        let init_data_file = generatedAssetsDirectory + 'keygen_history.json';

        let useProxy = this.useContractProxies ? '--use-upgrade-proxy' : '';

        let makeSpectResult = cmd(`cd ${posdaoContractsDir} && npx hardhat make_spec_hbbft --init-contracts initial-contracts.json ${useProxy} ${init_data_file}`);

        if (!makeSpectResult.success) {
            console.error(makeSpectResult.output);
            console.error("failed to generate chain spec, aborting.");
            throw new Error('Failed to generate chain spec');
        }


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

    public async build(targetDirectory: string) {
        console.log("start building in:", __dirname);
        await this.buildNodeFiles();
        await this.buildContracts();
        await this.copyNodeFilesToTargetDirectory(targetDirectory);
    }

    public async buildNodeFiles() {

        console.log("creating files for new HBBFT Nodes...");
    
        // cmd = ['cargo', 'run', str(num_initialValidators), str(num_nodes), 'Docker', '--tx_queue_per_sender=100000', '--metrics_port_base=48700', '--metrics_interface=all']

        let args: Array<string> = ['run', this.numInitialValidators.toString(), this.numNodes.toString(), 'Docker'];

        if (!Number.isNaN(this.txQueuePerSender)) {
            args.push(`--tx_queue_per_sender=${this.txQueuePerSender}`);
        }

        if (!Number.isNaN(this.metricsPortBase)) {
            args.push(`--metrics_port_base==${this.metricsPortBase}`);
            args.push(`--metrics_interface=all`);
        }

        if (!Number.isNaN(this.portBase)) {
            args.push(`--port_base=${this.portBase}`);
        }

        if (!Number.isNaN(this.portBaseRPC)) {
            args.push(`--port_base_rpc=${this.portBaseRPC}`);
        }

        if (!Number.isNaN(this.portBaseWS)) {
            args.push(`--port_base_ws=${this.portBaseWS}`);
        }

        const generatorDirRelative = '../../../diamond-node/crates/ethcore/src/engines/hbbft/hbbft_config_generator';
        const generatorDir = path.join(__dirname, generatorDirRelative);

        console.log('generator dir: ', generatorDir);

        let output = cmd(`cd ${generatorDir} && cargo ${args.join(' ')}`);
        
        if (!output.success) {
            console.error(output.output);
            throw new Error('Failed to create node files');
        }
        
        // let spawnedProcess = child_process.spawn('cargo', args, {cwd: generatorDir, shell: true, stdio: 'pipe'});
        
        

        // process.stdout.on('data', (data) => {
        //     console.log(data)
        // })
        
        // process.stderr.on('data', (data) => {
        //     console.log(data)
        // })

        // let processExitCode : number | null = null;
        // spawnedProcess.once('exit', (code) => {
        //     console.log('cargo exit.', code);
        //     processExitCode = code;
            
        // });


        // console.log("waiting for cargo process to generate files...");
        // while (processExitCode == null) {
        //     // wait
        //     await sleep(1000);  
        // }

        // if (processExitCode == 101) {
        //     throw new Error('Failed to create node files');
        // }

        console.log("finished waiting.");
    }
}
