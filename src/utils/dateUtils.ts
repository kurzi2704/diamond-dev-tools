import BigNumber from "bignumber.js";




export function nowFormatted() {

  const d = new Date(Date.now());
  const dateString = d.getFullYear() + "-" + ("0" + d.getMonth()) + "-" + d.getDate()  +
    "_" + ("0" + d.getHours()).slice(-2) + "_" + ("0" + d.getMinutes()).slice(-2);
  return dateString;
}

export function blockTimeAsUTC(blockTime: string | number) : Date {


  // console.log('blocktime:', blockTime);
  let blockTimeAsNumber = 0;

  if (blockTime as number) {
    blockTimeAsNumber = blockTime as number;
  } else {
    blockTimeAsNumber = new BigNumber((blockTime as string)).toNumber();
  }
  //console.log('blocktime-date', blockTimeAsNumber);
  return new Date(blockTimeAsNumber * 1000);
}
