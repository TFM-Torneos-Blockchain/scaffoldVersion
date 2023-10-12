// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the OpenZeppelin AccessControl contract
import "@openzeppelin/contracts/access/AccessControl.sol"; 

contract RoleControl is AccessControl {
	// We can create as many roles as we want
	// We use keccak256 to create a hash that identifies this constant in the contract
	// bytes32 public constant USER_ROLE = keccak256("USER"); // hash a USER as a role constant
	// bytes32 public constant INTERN_ROLE = keccak256("INTERN"); // hash a INTERN as a role constant
	constructor() {
		// NOTE: Other DEFAULT_ADMIN's can remove other admins, give this role with great care
		_setupRole(DEFAULT_ADMIN_ROLE, address(0x63fe745Be25e753F6Bd6cD7298f18FD4f07d85d7)); // TODO needs to be erased
		_setupRole(DEFAULT_ADMIN_ROLE, address(msg.sender)); // The creator of the contract is the default admin

		// SETUP role Hierarchy:
		// DEFAULT_ADMIN_ROLE > USER_ROLE > INTERN_ROLE > no role
		// _setRoleAdmin(USER_ROLE, DEFAULT_ADMIN_ROLE);
		// _setRoleAdmin(INTERN_ROLE, USER_ROLE);
	}

	// Create a bool check to see if a account address has the role admin
	function isAdmin(address account) public view virtual returns (bool) {
		return hasRole(DEFAULT_ADMIN_ROLE, account);
	}

	// Create a modifier that can be used in other contract to make a pre-check
	// That makes sure that the sender of the transaction (msg.sender)  is a admin
	modifier onlyAdmin() {
		require(isAdmin(msg.sender), "Restricted to admins.");
		_;
	}

	// Add a user address as a admin
	function addAdmin(address account) public virtual onlyAdmin {
		grantRole(DEFAULT_ADMIN_ROLE, account);
	}

    function deleteAdmin(address account) public virtual onlyAdmin {
        revokeRole(DEFAULT_ADMIN_ROLE, account);
    }

    function renounceToAdmin(address account) public virtual onlyAdmin {
        renounceRole(DEFAULT_ADMIN_ROLE, account);
    }

}
