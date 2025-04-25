const main = async ()=> {
    const gbeseTokenContractFactory = await hre.ethers.getContractFactory("GbeseToken");
    const gbeseTokenContract = await gbeseTokenContractFactory.deploy(1000000);
    await gbeseTokenContract.waitForDeployment()

}


const runMain = async ()=> {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}


runMain()