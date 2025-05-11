const main = async ()=> {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await hre.ethers.provider.getBalance(deployer);
    
    console.log("Deploying contracts with account: ", deployer.address);
    console.log("Account Balance ", accountBalance.toString());

    const gbeseTokenContractFactory = await hre.ethers.getContractFactory("GbeseToken");
    const KYC_CONTRACT_ADDRESS = '0x16B3574b38AE3653e6768b75344AE2E49D64ED0b'
    const gbeseTokenContract = await gbeseTokenContractFactory.deploy(KYC_CONTRACT_ADDRESS);

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