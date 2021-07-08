import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

// Update an account's Profile with a name.
export async function setName(name) {
    const txId = await fcl
        .send([
            fcl.transaction`
                import Profile from 0xProfile
                
                // Note that this transaction has an argument
                transaction(name: String) {
                    prepare(account: AuthAccount) {
                        // Borrow the AuthAccount's Profile and set its name
                        account
                            .borrow<&Profile.Base{Profile.Owner}>(from: Profile.privatePath)!
                            .setName(name)
                    }
                }
            `,
            fcl.proposer(fcl.authz()),
            fcl.payer(fcl.authz),
            fcl.authorizations([fcl.authz]),
            fcl.limit(35),
            fcl.args([fcl.arg(name, t.String)])
        ])
        .then(fcl.decode)

    return fcl.tx(txId).onceSealed()
}
