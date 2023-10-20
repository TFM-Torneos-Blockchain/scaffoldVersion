import { keccak256 } from "@ethersproject/keccak256";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";

// leaf_position corresponds to player classification being 0 the winner of the tournament
export function getMerkleRoot(
  tournament_id: number,
  input_results_string_bytes: string,
  positions: number[],
  leaf_position: number,
) {
  // Create an array to store the leaves
  const leaves: string[] = [];
  const results_bytes = ethers.utils.arrayify(input_results_string_bytes); // 0xallbytes : string

  // Define the size of each chunk (52 bytes)
  const chunkSize = 20;
  // Iterate through the results_bytes array and create leaves
  for (let i = 0; i < positions.length; i++) {
    const chunk = results_bytes.slice(positions[i] * 52, positions[i] * 52 + chunkSize);
    const leaf = keccak256(ethers.utils.solidityPack(["bytes", "uint16"], [chunk, i]));
    leaves.push(leaf);
  }

  const tree = new MerkleTree(leaves, keccak256);

  // // Utility Function to Convert From Buffer to Hex
  let root = tree.getRoot().toString("hex");
  root = `0x${root}`;
  const leaf = tree.getLeaf(leaf_position);
  const proof = tree.getProof(leaf);
  return { proof, root };
}
