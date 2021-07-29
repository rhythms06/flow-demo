import FungibleToken from "./FungibleToken.cdc"

// The rules governing RUCoin, our platform's FungibleToken.
pub contract RUCoin: FungibleToken {
    // The event that's emitted upon contract creation
    pub event TokensInitialized(initialSupply: UFix64)

    // The event that's emitted when RUCoins are withdrawn from a Vault
    pub event TokensWithdrawn(amount: UFix64, from: Address?)

    // The event that's emitted when RUCoins are deposited into a Vault
    pub event TokensDeposited(amount: UFix64, to: Address?)

    // The event that's emitted when RUCoins are minted (brought into circulation)
    pub event TokensMinted(amount: UFix64)

    // The event that's emitted when RUCoins are burned (taken out of circulation)
    pub event TokensBurned(amount: UFix64)

    // The event that's emitted when a new minter resource is created
    pub event MinterCreated(allowedAmount: UFix64)

    // Named paths
    pub let VaultStoragePath: StoragePath
    pub let ReceiverPublicPath: PublicPath
    pub let BalancePublicPath: PublicPath
    pub let AdminStoragePath: StoragePath

    // The total number of RUCoins in existence
    pub var totalSupply: UFix64

    // A Vault is what enables users to do RUCoin-related things.
    // Every Vault is governed by the pre-/post-conditions laid out in FungibleToken.cdc.
    // Every RUCoin Vault must be created in the context of the RUCoin ecosystem.
    pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance {
        // The total balance of this Vault
        pub var balance: UFix64

        // Initialize a Vault with a balance
        init(balance: UFix64) {
            self.balance = balance
        }

        // Take some tokens from this Vault and return a temporary Vault with said tokens.
        pub fun withdraw(amount: UFix64): @FungibleToken.Vault {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }

        // Transfer every token from a given Vault to this Vault.
        pub fun deposit(from: @FungibleToken.Vault) {
            let vault <- from as! @RUCoin.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            vault.balance = 0.0
            destroy vault
        }

        // Burn the tokens in this Vault.
        // For whatever reason, self.balance isn't changed in this function, a la onflow/kitty-items.
        destroy() {
            RUCoin.totalSupply = RUCoin.totalSupply - self.balance
            if(self.balance > 0.0) {
                emit TokensBurned(amount: self.balance)
            }
        }
    }

    // Create a Vault with zero balance. Users must call this function before starting to receive RUCoins.
    pub fun createEmptyVault(): @Vault {
        return <-create Vault(balance: 0.0)
    }

    // The rules of RUCoin administration.
    pub resource Administrator {
        // Create and return a new minter resource.
        pub fun createNewMinter(allowedAmount: UFix64): @Minter {
            emit MinterCreated(allowedAmount: allowedAmount)
            return <-create Minter(allowedAmount: allowedAmount)
        }
    }

    // The rules of minting.
    pub resource Minter {
        // The amount of RUCoins that this minter is allowed to mint.
        pub var allowedAmount: UFix64

        // Mint some RUCoins, add them to the total supply, and return a Vault with said tokens.
        pub fun mintTokens(amount: UFix64): @RUCoin.Vault {
            // Pre-conditions of minting
            pre {
                amount > 0.0: "Amount minted must be greater than zero"
                amount <= self.allowedAmount: "Amount minted must be less than your remaining allowance"
            }
            RUCoin.totalSupply = RUCoin.totalSupply + amount
            self.allowedAmount = self.allowedAmount - amount
            emit TokensMinted(amount: amount)
            return <-create Vault(balance: amount)
        }

        // Create a new Minter.
        init(allowedAmount: UFix64) {
            self.allowedAmount = allowedAmount
        }
    }

    // Create an RUCoin contract.
    init() {
        // Set named paths.
        // Note: Watch for changes to the "002" suffix in the onflow/kitty-items repo.
        self.VaultStoragePath = /storage/ruCoinVault002
        self.ReceiverPublicPath = /public/ruCoinReceiver002
        self.BalancePublicPath = /public/ruCoinBalance002
        self.AdminStoragePath = /storage/ruCoinAdmin002

        // Initialize contract state.
        self.totalSupply = 0.0

        // Create the Administrator.
        let admin <- create Administrator()
        self.account.save(<-admin, to: self.AdminStoragePath)

        // Emit an event to let people know that the contract was initialized.
        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}
