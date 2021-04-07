

import Web3 from 'web3';


//todo: make this more dynamic.
//expect some kind of infrastructure file.

const hbbft1 = new Web3("http:://???");
const hbbft2 = new Web3("http:://???");
const hbbft3 = new Web3("http:://???");
const hbbft4 = new Web3("http:://???");


async function run() {
  const block1 = await hbbft1.eth.getBlockNumber();
  console.log('hbbft1: ', block1);
  const block2 = await hbbft2.eth.getBlockNumber();
  console.log('hbbft2: ', block2);
  const block3 = await hbbft3.eth.getBlockNumber();
  console.log('hbbft3: ', block3);
  const block4 = await hbbft4.eth.getBlockNumber();
  console.log('hbbft4: ', block4);

  const block1Instance = await hbbft1.eth.getBlock(block1);
  const block2Instance = await hbbft1.eth.getBlock(block2);
  const block3Instance = await hbbft1.eth.getBlock(block3);
  const block4Instance = await hbbft1.eth.getBlock(block4);

  console.log('hash1: ' + block1Instance.hash);
  console.log('hash2: ' + block2Instance.hash);
  console.log('hash3: ' + block3Instance.hash);
  console.log('hash4: ' + block4Instance.hash);

  if (block1Instance.hash == block2Instance.hash &&
    block1Instance.hash == block3Instance.hash &&
    block1Instance.hash == block4Instance.hash
  ) {
    console.log('Everything OK');

    console.log('hash4: ', block4Instance);

  } else {
    console.error('Hashes are not equal!');
  }
}




run();

