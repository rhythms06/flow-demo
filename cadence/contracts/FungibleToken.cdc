// The rules that all fungible token contracts must conform to on our platform.
// Provider, Receiver, and Balance are defined so as to allow for selective capabilities.
pub contract interface FungibleToken {
    // The total supply of tokens.
    pub var totalSupply: UFix64

    // The event that's emitted upon contract creation.
    pub event TokensInitialized(initialSupply: UFix64)

    // The event that's emitted when tokens are withdrawn from a Vault.
    pub event TokensWithdrawn(amount: UFix64, from: Address?)

    // The event that's emitted when tokens are deposited into a Vault.
    pub event TokensDeposited(amount: UFix64, to: Address?)

    // The rules of withdrawal.
    pub resource interface Provider {
        // Take tokens from the Provider and return a new Vault with those tokens.
        // This is a public function, but can only be called by its owner unless they
        // give others permission to withdraw from their Vault.
        pub fun withdraw(amount: UFix64): @Vault {
            post {
                // 'result' is the returned Vault and should have (amount) tokens held within
                result.balance == amount:
                    "The amount withdrawn must be the same as the balance of the returned Vault"
            }
        }
    }

    // The rules of depositing.
    pub resource interface Receiver {
        // Give a Vault to the Receiver.
        pub fun deposit(from: @Vault)
    }

    // The rules of balance.
    pub resource interface Balance {
        // The balance of a Vault
        pub var balance: UFix64;

        // Initialize a Vault with a Balance.
        init(balance: UFix64) {
            post {
                self.balance == balance:
                    "Balance must be initialized to the specified amount"
            }
        }
    }

    // The Vault, complete with sending and receiving functions.
    // This signature means that any token contract must have a Vault that follows
    // the rules laid out in the Provider, Receiver, and Balance interfaces.
    pub resource Vault: Provider, Receiver, Balance {
        // The balance of the Vault.
        pub var balance: UFix64

        // A Vault Balance initializer.
        init(balance: UFix64)

        // Take tokens from the Vault and return them in a new Vault.
        pub fun withdraw(amount: UFix64): @Vault {
            // Pre-conditions of withdrawal
            pre {
                self.balance >= amount:
                    "The amount withdrawn must be less than or equal to the balance of the Vault"
            }
            // Post-conditions of withdrawal
            post {
                // Note: before(self.balance) returns the previously held balance
                self.balance == before(self.balance) - amount:
                    "New balance must be the difference between the previous balance and the amount withdrawn"
            }
        }

        // Add to this Vault's balance the balance of a given Vault.
        pub fun deposit(from: @Vault) {
            post {
                self.balance == before(self.balance) + before(from.balance):
                    "New balance must be the sum of the previous balance and that previously in the depositing Vault"
            }
        }
    }

    // Create a Vault with zero tokens
    pub fun createEmptyVault(): @Vault {
        post {
            result.balance == 0.0:
                "The new Vault must have a zero balance"
        }
    }
}
