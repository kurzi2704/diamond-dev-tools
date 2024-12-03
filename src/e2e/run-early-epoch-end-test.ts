
// E2E Test: Validator Punishment and Early Epoch End
// https://github.com/DMDcoin/honey-badger-testing/issues/116
//
// # covered topics

// Tests Unavailability Reporting of the Nodes for the new time based logic (https://github.com/DMDcoin/diamond-contracts-core/issues/245) 
// Tests the correct inclusion of Event Logs and their Blooms for System Transactions (https://github.com/DMDcoin/diamond-node/issues/125) 
// Improve the evaluation of E2E tests for a future integration for the CI Pipeline (https://github.com/DMDcoin/honey-badger-testing/issues/100)

// # Test Design

// - Create a network with 15 Nodes with fast Epochs (1 Minute ?) 15 Nodes means 13 Nodes as sweet spot and 2 reserve nodes that are able to gather bonus scores. With the static early epoch end fault tolerance of 2, early epoch ends wont get triggered if 1 nodes passes out, but it triggers if 2 nodes pass out. 
// - Nodes will gather Bonus Score fast.
// - After some Epochs, a node with a Bonus Score will get into the validator set.
// - Shutdown 1 Node for this Epoch, verify if
//   - [ ] The Validator looses the defined Bonus Score
//   - [ ] The Validator does not get rewards
  
// - Following Epoch, 13 Nodes out of the remaining 14 are chosen.
// - Shutdown 1 Node: no Early Epoch should trigger
// - Shutdown second Node: Early Epoch End should trigger.


