const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Provenance Contract", function () {
    // Roles constants (matching Solidity keccak256)
    const ORIGINATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORIGINATOR_ROLE"));
    const CUSTODIAN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("CUSTODIAN_ROLE"));

    // Fixture to deploy contract and set up roles
    async function deployProvenanceFixture() {
        const [owner, originator1, custodian1, user1] = await ethers.getSigners();

        const ProvenanceFactory = await ethers.getContractFactory("Provenance");
        // Deploy using the owner account
        const provenanceContract = await ProvenanceFactory.connect(owner).deploy();
        // No longer need waitForDeployment in ethers v6 with Hardhat
        // await provenanceContract.waitForDeployment();

        // Grant roles using the owner account
        await provenanceContract.connect(owner).grantOriginatorRole(originator1.address);
        await provenanceContract.connect(owner).grantCustodianRole(custodian1.address);
        await provenanceContract.connect(owner).grantCustodianRole(originator1.address); // Originator can also be a custodian

        return { provenanceContract, owner, originator1, custodian1, user1 };
    }

    describe("Deployment & Role Management", function () {
        it("Should set the right owner", async function () {
            const { provenanceContract, owner } = await loadFixture(deployProvenanceFixture);
            expect(await provenanceContract.owner()).to.equal(owner.address);
        });

        it("Should allow owner to grant and revoke Originator role", async function () {
            const { provenanceContract, owner, user1 } = await loadFixture(deployProvenanceFixture);
            await expect(provenanceContract.connect(owner).grantOriginatorRole(user1.address))
                .to.emit(provenanceContract, "RoleGranted")
                .withArgs(ORIGINATOR_ROLE, user1.address);
            expect(await provenanceContract.isOriginator(user1.address)).to.be.true;
            expect(await provenanceContract.hasRole(ORIGINATOR_ROLE, user1.address)).to.be.true;


            await expect(provenanceContract.connect(owner).revokeOriginatorRole(user1.address))
                .to.emit(provenanceContract, "RoleRevoked")
                .withArgs(ORIGINATOR_ROLE, user1.address);
            expect(await provenanceContract.isOriginator(user1.address)).to.be.false;
            expect(await provenanceContract.hasRole(ORIGINATOR_ROLE, user1.address)).to.be.false;

        });

        it("Should allow owner to grant and revoke Custodian role", async function () {
            const { provenanceContract, owner, user1 } = await loadFixture(deployProvenanceFixture);
             await expect(provenanceContract.connect(owner).grantCustodianRole(user1.address))
                .to.emit(provenanceContract, "RoleGranted")
                .withArgs(CUSTODIAN_ROLE, user1.address);
            expect(await provenanceContract.isCustodian(user1.address)).to.be.true;
            expect(await provenanceContract.hasRole(CUSTODIAN_ROLE, user1.address)).to.be.true;


            await expect(provenanceContract.connect(owner).revokeCustodianRole(user1.address))
                .to.emit(provenanceContract, "RoleRevoked")
                .withArgs(CUSTODIAN_ROLE, user1.address);
            expect(await provenanceContract.isCustodian(user1.address)).to.be.false;
            expect(await provenanceContract.hasRole(CUSTODIAN_ROLE, user1.address)).to.be.false;

        });

        // --- THIS IS THE UPDATED TEST ---
        it("Should prevent non-owner from granting roles", async function () {
            const { provenanceContract, user1 } = await loadFixture(deployProvenanceFixture);
            // Expect the specific revert string from Ownable v4.x
            await expect(provenanceContract.connect(user1).grantOriginatorRole(user1.address))
                .to.be.revertedWith("Ownable: caller is not the owner");
             await expect(provenanceContract.connect(user1).grantCustodianRole(user1.address))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
        // --- END OF UPDATED TEST ---

        it("Should prevent granting roles to zero address", async function () {
            const { provenanceContract, owner } = await loadFixture(deployProvenanceFixture);
            await expect(provenanceContract.connect(owner).grantOriginatorRole(ethers.ZeroAddress))
                .to.be.revertedWith("Provenance: Address cannot be zero");
            await expect(provenanceContract.connect(owner).grantCustodianRole(ethers.ZeroAddress))
                .to.be.revertedWith("Provenance: Address cannot be zero");
        });

         it("Should prevent granting role if account already has it", async function () {
            const { provenanceContract, owner, originator1, custodian1 } = await loadFixture(deployProvenanceFixture);
            await expect(provenanceContract.connect(owner).grantOriginatorRole(originator1.address))
                .to.be.revertedWith("Provenance: Account already has Originator role");
            await expect(provenanceContract.connect(owner).grantCustodianRole(custodian1.address))
                .to.be.revertedWith("Provenance: Account already has Custodian role");
        });

         it("Should prevent revoking role if account does not have it", async function () {
            const { provenanceContract, owner, user1 } = await loadFixture(deployProvenanceFixture);
            await expect(provenanceContract.connect(owner).revokeOriginatorRole(user1.address))
                .to.be.revertedWith("Provenance: Account does not have Originator role");
            await expect(provenanceContract.connect(owner).revokeCustodianRole(user1.address))
                .to.be.revertedWith("Provenance: Account does not have Custodian role");
        });
    });

    describe("Batch Creation", function () {
        it("Should allow Originator to create a batch", async function () {
            const { provenanceContract, originator1 } = await loadFixture(deployProvenanceFixture);
            const description = "Batch of Organic Apples";

            // Predict the next batch ID (starts at 0)
            const expectedBatchId = 0;

            await expect(provenanceContract.connect(originator1).createBatch(description))
                .to.emit(provenanceContract, "BatchCreated")
                .withArgs(expectedBatchId, originator1.address, description)
                .and.to.emit(provenanceContract, "EventAdded") // Also emits the creation event
                .withArgs(expectedBatchId, originator1.address, "Batch Created");

            const batchDetails = await provenanceContract.getBatchDetails(expectedBatchId);
            expect(batchDetails.id).to.equal(expectedBatchId);
            expect(batchDetails.description).to.equal(description);
            expect(batchDetails.originator).to.equal(originator1.address);
            expect(batchDetails.creationTime).to.be.gt(0); // Should have a timestamp

            const history = await provenanceContract.getBatchHistory(expectedBatchId);
            expect(history.length).to.equal(1);
            expect(history[0].description).to.equal("Batch Created");
            expect(history[0].actor).to.equal(originator1.address);

            expect(await provenanceContract.getBatchCount()).to.equal(1);
        });

        it("Should prevent non-Originator from creating a batch", async function () {
            const { provenanceContract, custodian1, user1 } = await loadFixture(deployProvenanceFixture);
            await expect(provenanceContract.connect(custodian1).createBatch("Test Batch"))
                .to.be.revertedWith("Provenance: Caller is not an Originator");
            await expect(provenanceContract.connect(user1).createBatch("Test Batch"))
                .to.be.revertedWith("Provenance: Caller is not an Originator");
        });

        it("Should prevent creating a batch with empty description", async function () {
            const { provenanceContract, originator1 } = await loadFixture(deployProvenanceFixture);
            await expect(provenanceContract.connect(originator1).createBatch(""))
                .to.be.revertedWith("Provenance: Description cannot be empty");
        });

        it("Should increment batch IDs correctly", async function () {
             const { provenanceContract, originator1 } = await loadFixture(deployProvenanceFixture);
             await provenanceContract.connect(originator1).createBatch("Batch 1");
             expect(await provenanceContract.getBatchCount()).to.equal(1);
             const tx = await provenanceContract.connect(originator1).createBatch("Batch 2");
             const receipt = await tx.wait();
             // Find the BatchCreated event in the transaction receipt logs
             const batchCreatedEvent = receipt.logs.find(log => {
                 try {
                     const parsedLog = provenanceContract.interface.parseLog(log);
                     return parsedLog?.name === "BatchCreated";
                 } catch (e) { return false; } // Ignore logs that can't be parsed by this interface
             });
             // Use Number() to safely convert BigInt to number for comparison if IDs are small
             expect(Number(batchCreatedEvent.args.batchId)).to.equal(1); // Second batch should have ID 1
             expect(await provenanceContract.getBatchCount()).to.equal(2);
        });
    });

    describe("Adding Events", function () {
         let fixture;
         let batchId;

         // Create a batch before each test in this block
         beforeEach(async () => {
             fixture = await loadFixture(deployProvenanceFixture);
             const tx = await fixture.provenanceContract.connect(fixture.originator1).createBatch("Initial Batch");
             const receipt = await tx.wait();
             const batchCreatedEvent = receipt.logs.find(log => {
                 try {
                     const parsedLog = fixture.provenanceContract.interface.parseLog(log);
                     return parsedLog?.name === "BatchCreated";
                 } catch (e) { return false; }
             });
             batchId = batchCreatedEvent.args.batchId; // Get the created batch ID
         });

        it("Should allow Custodian to add an event to an existing batch", async function () {
            const { provenanceContract, custodian1 } = fixture;
            const eventDesc = "Shipped via Cold Storage Truck";
            const eventLoc = "Warehouse A";

            await expect(provenanceContract.connect(custodian1).addEvent(batchId, eventDesc, eventLoc))
                .to.emit(provenanceContract, "EventAdded")
                .withArgs(batchId, custodian1.address, eventDesc);

            const history = await provenanceContract.getBatchHistory(batchId);
            expect(history.length).to.equal(2); // Creation event + new event
            expect(history[1].description).to.equal(eventDesc);
            expect(history[1].location).to.equal(eventLoc);
            expect(history[1].actor).to.equal(custodian1.address);
            expect(history[1].timestamp).to.be.gt(history[0].timestamp);
        });

         it("Should allow Originator (if also Custodian) to add an event", async function () {
             const { provenanceContract, originator1 } = fixture; // originator1 was also granted Custodian role in fixture
             const eventDesc = "Quality Inspected";
             const eventLoc = "Origin Facility";

             await expect(provenanceContract.connect(originator1).addEvent(batchId, eventDesc, eventLoc))
                 .to.emit(provenanceContract, "EventAdded")
                 .withArgs(batchId, originator1.address, eventDesc);

             const history = await provenanceContract.getBatchHistory(batchId);
             expect(history.length).to.equal(2);
             expect(history[1].description).to.equal(eventDesc);
             expect(history[1].actor).to.equal(originator1.address);
         });

        it("Should prevent non-Custodian from adding an event", async function () {
            const { provenanceContract, user1 } = fixture;
            await expect(provenanceContract.connect(user1).addEvent(batchId, "Tampering Attempt", ""))
                .to.be.revertedWith("Provenance: Caller is not a Custodian");
        });

        it("Should prevent adding event to a non-existent batch", async function () {
            const { provenanceContract, custodian1 } = fixture;
            const nonExistentBatchId = 999;
            await expect(provenanceContract.connect(custodian1).addEvent(nonExistentBatchId, "Test Event", ""))
                .to.be.revertedWith("Provenance: Batch ID does not exist");
        });

        it("Should prevent adding an event with empty description", async function () {
            const { provenanceContract, custodian1 } = fixture;
            await expect(provenanceContract.connect(custodian1).addEvent(batchId, "", "Location"))
                .to.be.revertedWith("Provenance: Event description cannot be empty");
        });
    });

    describe("View Functions", function () {
        let fixture;
        let batchId0, batchId1;

        beforeEach(async () => {
            fixture = await loadFixture(deployProvenanceFixture);
            const { provenanceContract, originator1, custodian1 } = fixture;

            // Create batch 0
            let tx = await provenanceContract.connect(originator1).createBatch("Batch Alpha");
            let receipt = await tx.wait();
            let event = receipt.logs.find(log => { try { return provenanceContract.interface.parseLog(log)?.name === "BatchCreated"; } catch(e){return false;} });
            batchId0 = event.args.batchId;
            await provenanceContract.connect(custodian1).addEvent(batchId0, "Event A1", "Loc A1");

             // Create batch 1
            tx = await provenanceContract.connect(originator1).createBatch("Batch Beta");
            receipt = await tx.wait();
            event = receipt.logs.find(log => { try { return provenanceContract.interface.parseLog(log)?.name === "BatchCreated"; } catch(e){return false;} });
            batchId1 = event.args.batchId;
            await provenanceContract.connect(custodian1).addEvent(batchId1, "Event B1", "Loc B1");
            await provenanceContract.connect(custodian1).addEvent(batchId1, "Event B2", "Loc B2");
        });

        it("getBatchDetails should return correct details", async function () {
            const { provenanceContract, originator1 } = fixture;
            const details = await provenanceContract.getBatchDetails(batchId0);
            expect(details.id).to.equal(batchId0);
            expect(details.description).to.equal("Batch Alpha");
            expect(details.originator).to.equal( originator1.address);
            expect(details.creationTime).to.be.gt(0);
        });

        it("getBatchDetails should revert for non-existent batch", async function () {
            const { provenanceContract } = fixture;
            await expect(provenanceContract.getBatchDetails(999))
                .to.be.revertedWith("Provenance: Batch ID does not exist");
        });

        it("getBatchHistory should return correct history", async function () {
            const { provenanceContract, originator1, custodian1 } = fixture;

            const history0 = await provenanceContract.getBatchHistory(batchId0);
            expect(history0.length).to.equal(2);
            expect(history0[0].description).to.equal("Batch Created");
            expect(history0[0].actor).to.equal(originator1.address);
            expect(history0[1].description).to.equal("Event A1");
            expect(history0[1].actor).to.equal(custodian1.address);
            expect(history0[1].location).to.equal("Loc A1");


            const history1 = await provenanceContract.getBatchHistory(batchId1);
            expect(history1.length).to.equal(3);
            expect(history1[0].description).to.equal("Batch Created");
            expect(history1[0].actor).to.equal(originator1.address);
            expect(history1[1].description).to.equal("Event B1");
            expect(history1[1].actor).to.equal(custodian1.address);
            expect(history1[2].description).to.equal("Event B2");
            expect(history1[2].actor).to.equal(custodian1.address);
            expect(history1[2].location).to.equal("Loc B2");
        });

         it("getBatchHistory should revert for non-existent batch", async function () {
            const { provenanceContract } = fixture;
            await expect(provenanceContract.getBatchHistory(999))
                .to.be.revertedWith("Provenance: Batch ID does not exist");
        });

        it("getBatchCount should return the correct count", async function () {
             const { provenanceContract } = fixture;
             expect(await provenanceContract.getBatchCount()).to.equal(2); // Two batches created in beforeEach
        });

         it("hasRole should return correct role status", async function () {
            const { provenanceContract, owner, originator1, custodian1, user1 } = fixture;
            expect(await provenanceContract.hasRole(ORIGINATOR_ROLE, originator1.address)).to.be.true;
            expect(await provenanceContract.hasRole(ORIGINATOR_ROLE, custodian1.address)).to.be.false;
            expect(await provenanceContract.hasRole(ORIGINATOR_ROLE, owner.address)).to.be.false; // Owner doesn't have role by default
            expect(await provenanceContract.hasRole(ORIGINATOR_ROLE, user1.address)).to.be.false;


            expect(await provenanceContract.hasRole(CUSTODIAN_ROLE, custodian1.address)).to.be.true;
            expect(await provenanceContract.hasRole(CUSTODIAN_ROLE, originator1.address)).to.be.true; // Was granted in fixture
            expect(await provenanceContract.hasRole(CUSTODIAN_ROLE, owner.address)).to.be.false;
            expect(await provenanceContract.hasRole(CUSTODIAN_ROLE, user1.address)).to.be.false;

            // Check invalid role
             expect(await provenanceContract.hasRole(ethers.keccak256(ethers.toUtf8Bytes("INVALID_ROLE")), user1.address)).to.be.false;
        });
    });
});
