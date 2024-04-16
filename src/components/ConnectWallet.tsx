import { PublicKey, Transaction } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import TransferSol from './TransferSol';


/**
 * PhantomProvider Interface
 * 
 * This interface defines the structure of the Phantom wallet provider object.
 * It specifies the methods and properties that a PhantomProvider object must have.
 * 
 * Properties:
 *  - connect: A function that initiates a connection to the Phantom wallet.
 *  - disconnect: A function that disconnects from the Phantom wallet.
 *  - on: A function to subscribe to specific events emitted by the Phantom wallet.
 *  - isPhantom: A boolean indicating whether the connected wallet is the Phantom wallet.
 *  - publicKey: The public key associated with the connected wallet.
 *  - signTransaction: A function that signs a transaction using the connected wallet.
 * 
 * Type Definitions:
 *  - PhantomEvent: A union type representing the possible events emitted by the Phantom wallet.
 *  - ConnectOpts: An interface representing options for connecting to the Phantom wallet.
 *  - WindowWithSolana: A type definition representing the window object extended with the 'solana' property.
 * 
 * @interface PhantomProvider
 */
export interface PhantomProvider {
    connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: PhantomEvent, callback: (args: any) => void) => void;
    isPhantom: boolean;
    publicKey: PublicKey;
    signTransaction: (t: Transaction) => {};
}

/**
 * PhantomEvent Type
 * 
 * This type represents the possible events emitted by the Phantom wallet.
 * It is a union type consisting of three event types: disconnect, connect, and accountChanged.
 * 
 * @type PhantomEvent
 */
type PhantomEvent = "disconnect" | "connect" | "accountChanged";

/**
 * ConnectOpts Interface
 * 
 * This interface represents options for connecting to the Phantom wallet.
 * It contains a single property 'onlyIfTrusted' which indicates whether the connection should only be established if the wallet is trusted.
 * 
 * @interface ConnectOpts
 */
interface ConnectOpts {
    onlyIfTrusted: boolean;
}

/**
 * WindowWithSolana Type
 * 
 * This type definition extends the Window interface with the 'solana' property.
 * It is used to represent the window object with access to the PhantomProvider.
 * 
 * @type WindowWithSolana
 */
type WindowWithSolana = Window & { 
    solana?: PhantomProvider;
}




/**
 * ConnectWallet Component
 * 
 * This component is responsible for managing the connection to the Phantom wallet.
 * It provides buttons to connect and disconnect from the wallet and renders the TransferSol component
 * when connected.
 * 
 * State:
 *  - walletAvail: Indicates whether the Phantom wallet is available.
 *  - provider: The PhantomProvider object representing the connected wallet.
 *  - connected: Indicates whether the wallet is currently connected.
 * 
 * Effects:
 *  - Uses useEffect hook to initialize the provider when the component mounts.
 *  - Listens for connection and disconnection events and updates the connected state accordingly.
 * 
 * Functions:
 *  - connectHandler: Handles the button click event to connect to the wallet.
 *  - disconnectHandler: Handles the button click event to disconnect from the wallet.
 * 
 * Props:
 *  - None
 * 
 * @returns JSX.Element
 */

const ConnectWallet: FC = () => {
    // State variables
    const [walletAvail, setWalletAvail] = useState(false);
    const [provider, setProvider] = useState<PhantomProvider | null>(null);
    const [connected, setConnected] = useState(false);

    // Effect to initialize provider and listen for connection events
    useEffect(() => {
        // Check if Phantom wallet is available
        if ("solana" in window) {
            const solWindow = window as WindowWithSolana;
            if (solWindow?.solana?.isPhantom) {
                // Set provider and indicate wallet availability
                setProvider(solWindow.solana);
                setWalletAvail(true);
                // Attempt an eager connection
                solWindow.solana.connect({ onlyIfTrusted: true });
            }
        }
    }, []);

    useEffect(() => {
        // Listen for connection and disconnection events
        provider?.on("connect", (publicKey: PublicKey) => {
            console.log(`connect event: ${publicKey}`);
            setConnected(true);
        });
        provider?.on("disconnect", () => {
            console.log("disconnect event");
            setConnected(false);
        });
    }, [provider]);

    // Function to handle connect button click event
    const connectHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        console.log(`connect handler`);
        provider?.connect()
            .catch((err) => { console.error("connect ERROR:", err); });
    }

    // Function to handle disconnect button click event
    const disconnectHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        console.log("disconnect handler");
        provider?.disconnect()
            .catch((err) => { console.error("disconnect ERROR:", err); });
    }

    // Render UI based on wallet availability and connection status
    return (
        <div>
            {walletAvail ?
                <>
                    <button disabled={connected} onClick={connectHandler} id="connect_button" className="button-9">Connect to Wallet</button>
                    <button disabled={!connected} onClick={disconnectHandler}>Disconnect from Phantom</button>
                    <hr />
                    {connected && provider ? <TransferSol provider={provider} /> : null}
                </>
                :
                <>
                    <p>Oops!!! Phantom is not available. Go get it <a href="https://phantom.app/">here</a>.</p>
                </>
            }
        </div>
    );
}

export default ConnectWallet;