import { search_performance_plateau, write_performance_plateau_csv_header } from "./searchPerformancePlateau";

async function run() {
  let outputFile = 'jupyter/data/hbbft/plateau/find-plateau.csv';
  write_performance_plateau_csv_header(outputFile)
  search_performance_plateau(outputFile);
}

