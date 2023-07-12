import { ConfigManager } from "../configManager";
import { cmdR } from "../remoteCommand";



export function getNodeVersion(nodeSShName: string) {
  
    let  versionVerbose = '';
  
    const config = ConfigManager.getConfig();
    try {
      versionVerbose = cmdR(nodeSShName, `~/${config.installDir}/diamond-node --version`);
    } catch (e) {
      versionVerbose = 'ERROR N/A';
    }
    
    // console.log(versionVerbose);
    const versionDetails = versionVerbose.split('\n');
    let version =  '';
    if (versionDetails.length >= 2) {
      let v = versionDetails[1];
      v = v.replace('version', '').replace(' ', '');
      version = v;
    }
  
    return version;
  }
  