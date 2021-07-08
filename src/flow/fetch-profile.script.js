import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

// Fetch an account's Profile.
export async function fetchProfile(address) {
    // Check if the account address is valid.
    if (address == null) return null
    
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
