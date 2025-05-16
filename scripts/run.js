const hre = require("hardhat");
const KYC_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuer",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ECDSAInvalidSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "ECDSAInvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "ECDSAInvalidSignatureS",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidShortString",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "str",
        "type": "string"
      }
    ],
    "name": "StringTooLong",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "EIP712DomainChanged",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "KYC_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eip712Domain",
    "outputs": [
      {
        "internalType": "bytes1",
        "name": "fields",
        "type": "bytes1"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "chainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "verifyingContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "uint256[]",
        "name": "extensions",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isVerified",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "issuer",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "issuedAt",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "sig",
        "type": "bytes"
      }
    ],
    "name": "verifyKYC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const main = async () => {
  const [issuer, user] = await hre.ethers.getSigners();

  const signers = await hre.ethers.getSigners();
  console.log("Signers:", signers.map(s => s.address));

  // 1. Attach to KYCVerifier
  console.log('looking for kyc')
  const kyc = await hre.ethers.getContractAt(
    KYC_ABI,
    "0x16B3574b38AE3653e6768b75344AE2E49D64ED0b",
    issuer
  );  
  console.log('kyc found')
  console.log("KYCVerifier at:", kyc.target);

  // 2. Build EIP-712 domain & types
  const { chainId } = await hre.ethers.provider.getNetwork();
  const domain = {
    name: "Gbese KYC",
    version: "1",
    chainId: Number(chainId),
    verifyingContract: kyc.target,
  };
  const types = {
    KYC: [
      { name: "user", type: "address" },
      { name: "issuedAt", type: "uint256" },
    ],
  };
  const issuedAt = Math.floor(Date.now() / 1000);
  const message = { user: user.address, issuedAt };

  // 3. Sign the KYC payload with issuer (via eth_signTypedData_v4)
  const payload = JSON.stringify({
    domain,
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      KYC: types.KYC,
    },
    primaryType: "KYC",
    message,
  });
  const signature = await hre.ethers.provider.send("eth_signTypedData_v4", [
    issuer.address,
    payload,
  ]);
  console.log("KYC signature:", signature);

  // 4. Call verifyKYC as the user
  let tx = await kyc.connect(user).verifyKYC(user.address, issuedAt, signature);
  console.log("verifyKYC tx:", tx.hash);
  await tx.wait();


  const ok = await kyc.isVerified(user.address);
  console.log("on-chain isVerified:", ok);
  if (!ok) throw new Error("KYC still false! aborting mint");  

  // 5. Attach to GbeseToken and mint
  const GbeseFactory = await hre.ethers.getContractFactory("GbeseToken");
  const gbese = await GbeseFactory.deploy('0x16B3574b38AE3653e6768b75344AE2E49D64ED0b');
  await gbese.waitForDeployment();
  console.log("GbeseToken deployed to:", gbese.target);

  const mintAmount = hre.ethers.parseUnits("10", 18);
  tx = await gbese.connect(issuer).mint(user.address, mintAmount);
  console.log("mint tx:", tx.hash);
  await tx.wait();

  const balance = await gbese.balanceOf(user.address);
  console.log("User GBT balance:", hre.ethers.formatUnits(balance, 18));
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runMain();

