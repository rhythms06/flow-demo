import * as fcl from "@onflow/fcl"

// Initialize an account.
// More specifically, ask the current user to propose, authorize, and pay for the addition of
// (a) a Profile smart contract to their storage and (b) a public reading capability to their new profile.
export async function initAccount() {
    // Breakdown:
    // fcl.send specifies a transaction, a proposer, a payer, an authorization array, and a computation limit.
    // 0xProfile is defined in src/config.js as the address of the Profile smart contract.
    // fcl.authz is short for fcl.currentUser().authorization, the current user's transaction entity.
    // fcl.decode returns a transaction ID, which we store in txId for later use.
    const txId = await fcl
        .send([
            fcl.transaction`
                import Profile from 0xProfile
                
                transaction {
                    // We'll use this later to confirm that the account was initialized.
                    let address: Address
                    
                    prepare(account: AuthAccount) {
                        // Save the address!
                        self.address = account.address
                        
                        // Don't initialize an already initialized account, duh
                        if (!Profile.check(self.address)) {
                            // Create and store a new Profile at the user's address
                            account.save(<- Profile.new(), to: Profile.privatePath)
                            
                            // Create a public reading capability
                            account.link<&Profile.Base{Profile.Public}>(Profile.publicPath, target: Profile.privatePath)
                        }
                    }
                
                    // Confirm that the account was indeed initialized.
                    post {
                        Profile.check(self.address): "The account was not initialized"
                    }
                }
            `,
            fcl.proposer(fcl.authz), // Make the current user act as the proposer (aka nonce)
            fcl.payer(fcl.authz), // Make the current user pay for the transaction
            fcl.authorizations([fcl.authz]), // Make the current user authorize the transaction
            fcl.limit(35) // Set the computation limit of the transaction
        ])
        .then(fcl.decode)

    return fcl.tx(txId).onceSealed() // Track the transaction's status, and report back once it's complete (aka sealed)
}
