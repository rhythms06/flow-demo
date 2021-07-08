import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

// Fetch an account's Profile.
export async function fetchProfile(address) {
    // Check if the account address is valid.
    if (address == null) return null

    // Breakdown:
    // fcl.send takes a two-component array, a script and an argument array.
    // An argument takes the form fcl.arg(name, t.Type), where Type is defined in @onflow/types.
    // 0xProfile is defined in src/config.js as the address of the Profile smart contract.
    // fcl.decode applies fcl.args to fcl.script and returns the output.
    return fcl
        .send([
            fcl.script`
                import Profile from 0xProfile
                
                pub fun main(address: Address): Profile.ReadOnly? {
                    return Profile.read(address)
                }
            `,
            fcl.args([fcl.arg(address, t.Address)])
        ])
        .then(fcl.decode)
}
