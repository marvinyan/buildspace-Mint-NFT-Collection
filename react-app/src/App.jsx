import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNFT from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TOTAL_MINT_COUNT = 5;
const CONTRACT_ADDRESS = '0x05c35A717f6400a8a8a290fDeba4F7EE3989cDCC';
const OPENSEA_URL = 'https://testnets.opensea.io/collection/squarenft-5syxskz1c4';

const App = () => {
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const [currentAccount, setCurrentAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isConnectedToRinkeby = async () => {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('Connected to chain ' + chainId);
    if (chainId !== '0x4') {
      alert('You are not connected to the Rinkeby Test Network!');
      return false;
    }
    return true;
  };

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) {
      console.log('Make sure you have metamask!');
      return;
    }
    console.log('We have the ethereum object', ethereum);

    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      console.log('No authorized accounts found.');
    } else {
      const account = accounts[0];
      console.log('Found an authorized account:', account);

      setCurrentAccount(account);
      setupEventListener();
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected', accounts[0]);

      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    setIsProcessing(true);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const connected = await isConnectedToRinkeby();
        if (!connected) {
          return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

        console.log('Prompting for gas payment...');
        const nftTxn = await connectedContract.makeAnEpicNFT();

        console.log('Mining...please wait.');
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
    setIsProcessing(false);
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);

        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log('Setup event listener!');
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

  const renderMintButton = () => {
    if (!isProcessing) {
      return (
        <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
          Mint NFT
        </button>
      );
    }
    return (
      <button disabled className="cta-button connect-wallet-button">
        Processing...
      </button>
    );
  };

  const renderViewCollectionButton = () => {
    return (
      <button
        onClick={() => {
          window.open(OPENSEA_URL, '_blank');
        }}
        className="cta-button view-collection-button"
      >
        🌊 View Collection on OpenSea
      </button>
    );
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">Each unique. Each beautiful. Discover your NFT today.</p>
          <div>{currentAccount === '' ? renderNotConnectedContainer() : renderMintButton()}</div>
          <div>{renderViewCollectionButton()}</div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
