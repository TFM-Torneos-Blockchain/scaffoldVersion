import { MerkleTree } from "merkletreejs";
import { keccak256 } from "viem";

const address = ["TX1: Scherlock -> John", "TX2: John -> Sherlock", "TX3: John -> Mary", "TX4: Mary -> Sherlock"];

// Encode each string to bytes and store them in the 'bytes' array
const encoder = new TextEncoder();

const leaves = address.map(leaf => keccak256(encoder.encode(leaf)));

// Constructing Merkle Tree
const tree = new MerkleTree(leaves, keccak256);

// Utility Function to Convert From Buffer to Hex
const root = tree.getRoot().toString("hex");

const leaf = tree.getLeaf(1);
const proof = tree.getProof(leaf);

// Get Root of Merkle Tree
console.log(`Here is Root Hash: ${root}`);
console.log(`Here is Leaf 1: ${leaf}`);
console.log(`Here is Proof for leaf 1: ${proof}`);
console.log(tree.verify(proof, leaf, root)); // true
