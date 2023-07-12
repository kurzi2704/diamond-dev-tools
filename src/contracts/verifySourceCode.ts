import { artifactRequire } from './contractTools';
import fs from 'fs';
import request from 'request';

export async function verifySourceCode(contract: string, newContractAddress: string) {

  const contractArtifact = artifactRequire(contract);
  const metadata = contractArtifact.metadata;
  const metadataObject = JSON.parse(metadata);
  const compiler = metadataObject.compiler.version;
  const optimization = metadataObject.settings.optimizer.enabled;
  const optimizationRuns = metadataObject.settings.optimizer.runs;

  const evmVersion = metadataObject.settings.evmVersion;

  // console.log('evmVersion', optimization);
  const filename = `./src/abi/contracts-flat/${contract}.sol`;
  const sourceCode = fs.readFileSync(filename, 'utf-8');

  console.log('sending CMD');

  const json_verify = {
    module: 'contract',
    action: 'verify',
    addressHash: newContractAddress,
    name: contract,
    compilerVersion: compiler,
    optimization: optimization,
    contractSourceCode: sourceCode,
    optimizationRuns: optimizationRuns,
    evmVersion: evmVersion
  }

  console.log('verification call:', json_verify);

  //?module=account&action=eth_get_balance&address={addressHash}

  // const json_get_balance = {
  //   module: 'account',
  //   action: 'eth_get_balance',
  //   address: '0x32c5f14302d4Dd973e0040a5d7Eda97222A928D1'
  // }

  request.post(
    'http://explorer.uniq.diamonds/api',
    {
      json: json_verify
    },
    function (error, response, body) {
      if (error) {
        //Trying to close the socket (to prevent socket hang up errors)
        //**Doesn't help**
        console.log('got error:', error);
        return;
      }
      console.log('got reponse:', response.statusCode);
      console.log('got reponse:', response.body);
      //console.log('body:', body);
    }
  );
}

//verifySourceCode('RandomHbbft', '0x1D69f5AeCc31Eca9F7F68aDa04d2F2ad3aBf78FE');
//verifySourceCode('AdminUpgradeabilityProxy', '0x3000000000000000000000000000000000000001');