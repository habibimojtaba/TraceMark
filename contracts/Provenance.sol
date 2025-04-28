// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "hardhat/console.sol"; // Keep commented out unless needed for debugging

/**
 * @notice Tracks the history of item batches through a supply chain.
 */
contract Provenance is Ownable {
    using Counters for Counters.Counter;

    // --- State Variables ---

    Counters.Counter private _batchIds; // Counter for batch IDs

    // Event in the history of a batch
    struct Event {
        uint timestamp;      // Event time
        address actor;       // Address logging the event
        string description;  // Event description
        string location;     // Optional location
    }

    // Represents a tracked batch
    struct Batch {
        uint id;             // Unique ID
        string description;  // Batch description
        address originator;  // Creator address
        uint creationTime;   // Creation timestamp
        Event[] history;     // Event history
    }

    // Mapping: batch ID => Batch data
    mapping(uint => Batch) public batches;

    // Role flags
    mapping(address => bool) public isOriginator;
    mapping(address => bool) public isCustodian;

    // --- Events ---

    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);
    event BatchCreated(uint indexed batchId, address indexed originator, string description);
    event EventAdded(uint indexed batchId, address indexed actor, string description);

    // --- Role Constants ---
    bytes32 public constant ORIGINATOR_ROLE = keccak256("ORIGINATOR_ROLE");
    bytes32 public constant CUSTODIAN_ROLE = keccak256("CUSTODIAN_ROLE");

    // --- Modifiers ---

    modifier onlyOriginator() {
        require(isOriginator[msg.sender], "Provenance: Caller is not an Originator");
        _;
    }

    modifier onlyCustodian() {
        require(isCustodian[msg.sender], "Provenance: Caller is not a Custodian");
        _;
    }

    modifier batchExists(uint _batchId) {
        require(_batchId < _batchIds.current(), "Provenance: Batch ID does not exist");
        _;
    }

    // --- Constructor ---

    /**
     * @dev Initializes the contract with the deployer as the owner.
     */
    constructor() {}

    // --- Role Management Functions (Owner Only) ---

    /**
     * @notice Grants the Originator role.
     * @param _account The address to grant the role to.
     */
    function grantOriginatorRole(address _account) external onlyOwner {
        require(_account != address(0), "Provenance: Address cannot be zero");
        require(!isOriginator[_account], "Provenance: Account already has Originator role");
        isOriginator[_account] = true;
        emit RoleGranted(ORIGINATOR_ROLE, _account);
    }

    /**
     * @notice Revokes the Originator role.
     * @param _account The address to revoke the role from.
     */
    function revokeOriginatorRole(address _account) external onlyOwner {
        require(isOriginator[_account], "Provenance: Account does not have Originator role");
        isOriginator[_account] = false;
        emit RoleRevoked(ORIGINATOR_ROLE, _account);
    }

    /**
     * @notice Grants the Custodian role.
     * @param _account The address to grant the role to.
     */
    function grantCustodianRole(address _account) external onlyOwner {
        require(_account != address(0), "Provenance: Address cannot be zero");
        require(!isCustodian[_account], "Provenance: Account already has Custodian role");
        isCustodian[_account] = true;
        emit RoleGranted(CUSTODIAN_ROLE, _account);
    }

    /**
     * @notice Revokes the Custodian role.
     * @param _account The address to revoke the role from.
     */
    function revokeCustodianRole(address _account) external onlyOwner {
        require(isCustodian[_account], "Provenance: Account does not have Custodian role");
        isCustodian[_account] = false;
        emit RoleRevoked(CUSTODIAN_ROLE, _account);
    }


    // --- Core Provenance Functions ---

    /**
     * @notice Creates a new batch record (Originator only).
     * @param _description Description of the batch.
     * @return batchId The unique ID of the new batch.
     */
    function createBatch(string calldata _description) external onlyOriginator returns (uint batchId) {
        require(bytes(_description).length > 0, "Provenance: Description cannot be empty");

        batchId = _batchIds.current();
        Batch storage newBatch = batches[batchId];

        newBatch.id = batchId;
        newBatch.description = _description;
        newBatch.originator = msg.sender;
        newBatch.creationTime = block.timestamp;

        // Add the creation event
        newBatch.history.push(Event({
            timestamp: block.timestamp,
            actor: msg.sender,
            description: "Batch Created",
            location: ""
        }));

        _batchIds.increment();

        emit BatchCreated(batchId, msg.sender, _description);
        emit EventAdded(batchId, msg.sender, "Batch Created");

        return batchId;
    }

    /**
     * @notice Adds an event to a batch's history (Custodian only).
     * @param _batchId The target batch ID.
     * @param _description Description of the event.
     * @param _location Optional location information.
     */
    function addEvent(uint _batchId, string calldata _description, string calldata _location)
        external
        onlyCustodian
        batchExists(_batchId)
    {
        require(bytes(_description).length > 0, "Provenance: Event description cannot be empty");

        Batch storage batch = batches[_batchId];
        batch.history.push(Event({
            timestamp: block.timestamp,
            actor: msg.sender,
            description: _description,
            location: _location
        }));

        emit EventAdded(_batchId, msg.sender, _description);
    }

    // --- View Functions ---

    /**
     * @notice Retrieves details for a specific batch.
     * @param _batchId The ID of the batch.
     * @return id Batch ID.
     * @return description Batch description.
     * @return originator Originator address.
     * @return creationTime Creation timestamp.
     */
    function getBatchDetails(uint _batchId)
        external
        view
        batchExists(_batchId)
        returns (uint id, string memory description, address originator, uint creationTime)
    {
        Batch storage batch = batches[_batchId];
        return (batch.id, batch.description, batch.originator, batch.creationTime);
    }

    /**
     * @notice Retrieves the event history for a batch.
     * @param _batchId The ID of the batch.
     * @return Event array for the batch.
     */
    function getBatchHistory(uint _batchId)
        external
        view
        batchExists(_batchId)
        returns (Event[] memory)
    {
        return batches[_batchId].history;
    }

     /**
     * @notice Gets the total number of batches created.
     * @return Current batch count.
     */
    function getBatchCount() external view returns (uint) {
        return _batchIds.current();
    }

    /**
     * @notice Checks if an address has a specific role.
     * @param _role Role identifier (ORIGINATOR_ROLE or CUSTODIAN_ROLE).
     * @param _account Address to check.
     * @return True if the account has the role.
     */
    function hasRole(bytes32 _role, address _account) external view returns (bool) {
        if (_role == ORIGINATOR_ROLE) {
            return isOriginator[_account];
        }
        if (_role == CUSTODIAN_ROLE) {
            return isCustodian[_account];
        }
        return false;
    }
}
