const main = async () => {
  // Compile the contract and generates files under /artifacts.
  // Note: hre import not required due to `npx hardhat`
  const nftContractFactory = await hre.ethers.getContractFactory('MyEpicNFT');
  // Create a local Ethereum blockchain.
  const nftContract = await nftContractFactory.deploy(2);
  // Wait until contract creation transaction is mined and deployed.
  await nftContract.deployed();
  // Constructor runs after deployment.
  console.log('Contract deployed to:', nftContract.address);

  // This should raise a contract error upon minting the third NFT.
  for (let i = 0; i < 3; i++) {
    // Call the contract function.
    let txn = await nftContract.makeAnEpicNFT();
    // Wait for txn to be mined.
    await txn.wait();
  }
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
