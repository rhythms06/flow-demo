import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

// Check if a Flow account address has an associated profile.
export async function isInitialized(address) {
    if (address == null) {
        throw new Error("isInitialized(address) failed because address was null")
    }
    // Reminders:
    // fcl.send takes a two-component array, a script and an argument array.
    // An argument takes the form fcl.arg(name, t.Type), where Type is defined in @onflow/types.
    // 0xProfile is defined in src/config.js as the address of the Profile smart contract.
    // fcl.decode applies fcl.args to fcl.script and returns the output.
    return fcl
        .send([
            fcl.script`
                import Profile from OxProfile
                
                pub fun main(address: Address): Bool {
                    return Profile.check(address)
                }
            `,
            fcl.args([
                fcl.arg(address, t.Address)
            ])
        ])
        .then(fcl.decode)
}
