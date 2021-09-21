



export function nowFormatted() {

  const d = new Date(Date.now());
  const dateString = d.getFullYear() + "-" + ("0" + d.getMonth()) + "-" + d.getDate()  +
    "_" + ("0" + d.getHours()).slice(-2) + "_" + ("0" + d.getMinutes()).slice(-2);
  return dateString;
}
