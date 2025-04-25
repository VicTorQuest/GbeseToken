const main = async ()=> {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await hre.ethers.provider.getBalance(deployer);
    
    console.log("Deploying contracts with account: ", deployer.address);
    console.log("Account Balance ", accountBalance.toString());

    const initialSupply = 1000000; // 1,000,000 tokens
    const gbeseTokenContractFactory = await hre.ethers.getContractFactory("GbeseToken");
    const gbeseTokenContract = await gbeseTokenContractFactory.deploy(initialSupply);

    await gbeseTokenContract.waitForDeployment();
    console.log("Contract deployed to:", gbeseTokenContract.target);
}



const runMain = async ()=> {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}

runMain();