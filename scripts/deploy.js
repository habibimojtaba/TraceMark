const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Deploy the Provenance contract
    const Provenance = await hre.ethers.getContractFactory("Provenance");
    const provenance = await Provenance.deploy();
    await provenance.waitForDeployment(); // Wait for deployment confirmation

    const contractAddress = await provenance.getAddress(); // Get the deployed address
    console.log("Provenance contract deployed to:", contractAddress);

    // --- Post-Deployment Setup ---
    // Optional: Grant roles to the deployer or other initial addresses
    // You might want to grant roles immediately after deployment
    try {
        console.log("\nGranting Originator and Custodian roles to deployer...");
        const tx1 = await provenance.connect(deployer).grantOriginatorRole(deployer.address);
        await tx1.wait();
        console.log(`Granted Originator role to ${deployer.address}`);
        const tx2 = await provenance.connect(deployer).grantCustodianRole(deployer.address);
        await tx2.wait();
        console.log(`Granted Custodian role to ${deployer.address}`);
    } catch (error) {
        console.error("Error granting initial roles:", error.message);
        // Continue even if role granting fails (e.g., already granted)
    }


    // --- Save Artifacts for Frontend ---
    // Save the contract address and ABI to the frontend directory
    saveFrontendFiles(contractAddress);

    console.log("\nDeployment and setup complete.");

}

// Function to save contract address and ABI for frontend use
function saveFrontendFiles(contractAddress) {
    // Define the target directory for frontend contract artifacts
    // It navigates up one level from 'scripts' (__dirname), then into 'frontend/src/contracts'
    const contractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');

    // Create the contracts directory if it doesn't exist
    // The { recursive: true } option ensures parent directories are created if needed
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
        console.log(`Created directory: ${contractsDir}`);
    }

    // Save the contract address to a JSON file
    // JSON.stringify formats the object nicely with indentation (undefined, 2)
    fs.writeFileSync(
        path.join(contractsDir, 'contract-address.json'),
        JSON.stringify({ Provenance: contractAddress }, undefined, 2)
    );
    console.log(`Contract address saved to ${path.join(contractsDir, 'contract-address.json')}`);


    // Read the ABI (Application Binary Interface) from the compiled contract artifact
    const ProvenanceArtifact = hre.artifacts.readArtifactSync("Provenance");
    // Save the entire artifact (including ABI) to a JSON file
    fs.writeFileSync(
        path.join(contractsDir, 'Provenance.json'),
        JSON.stringify(ProvenanceArtifact, null, 2) // Save the full artifact which contains the ABI
    );
     console.log(`Contract ABI saved to ${path.join(contractsDir, 'Provenance.json')}`);

}


// Standard pattern to execute the async main function and handle errors
main()
    .then(() => process.exit(0)) // Exit successfully
    .catch((error) => {
        console.error(error); // Log any errors
        process.exit(1); // Exit with an error code
    });
