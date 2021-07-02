import * as fcl from "@onflow/fcl"

// Initialize an account.
export async function initAccount() {
    // Breakdown:
    // fcl.send specifies a transaction, a payer, a proposer, an authorization array, and a computation limit.
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
            fcl.payer(fcl.authz),
            fcl.proposer(fcl.authz),
            fcl.authorizations([fcl.authz]),
            fcl.limit(35)
        ])
        .then(fcl.decode)

    return fcl.tx(txId).onceSealed()
}
