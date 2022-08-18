import { ConfigManager } from "../configManager";



async function runUpgrade() {

  const data = '0x';
  const to = '';
  const value = '0x0';

  if (data === '0x' || to == '') {
    throw Error('This is just a implementation skeleton, you need to set the vars.');
  }

  const web3 = ConfigManager.getWeb3();

  const result = await web3.eth.sendTransaction({
    from: web3.eth.defaultAccount!, 
    to: to,
    value: value,
    data: data,
    gas: '100000',
    gasPrice: '1000000000000'
  });

  console.log(`transaction executed: ${result.transactionHash}`);

}

runUpgrade();