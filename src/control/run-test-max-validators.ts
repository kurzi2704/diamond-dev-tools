import { NetworkController } from "./networkController";


async function run() {

  const controller = new NetworkController();
  await controller.setMaxValidators(4);
}

run();