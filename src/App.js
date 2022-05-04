import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import CountDown from "./countdown";
import Web3 from "web3";
import { FaTelegramPlane, FaDiscord, FaTwitter } from "react-icons/fa";
import mainLogo from './songbird-flare.png';
import loop from './bg.mp4'


const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background: rgb(209,170,41);
  background: linear-gradient(176deg, rgba(209,170,41,1) 0%, rgba(234,190,42,1) 45%, rgba(255,226,129,1) 100%);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background: rgb(209,170,41);
  background: linear-gradient(176deg, rgba(209,170,41,1) 0%, rgba(234,190,42,1) 45%, rgba(255,226,129,1) 100%);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: column;
  }
`;

export const RoundButtonWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  @media (min-width: 767px) {
    flex-direction: row;
    width: 50%;

  }
`;

export const StyledLogo = styled.img`
  width: 75px;
  @media (min-width: 767px) {
    width: 75px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  // border: 4px dashed var(--secondary);
  // background-color: var(--accent);
  // border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`You are making history!`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.ETH_COST;
    let totalCostEther = String(cost * mintAmount);
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostEther);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: Web3.utils.toWei(totalCostEther, "ether"),
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `You have claimed ${CONFIG.NFT_NAME}!`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 50;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const whaleMint = () => {
    let whaleMintAmount = 50;
    setMintAmount(whaleMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <ResponsiveWrapper>
        <video
          autoPlay
          loop
          muted
          style={{
            position: "fixed",
            width: "100%",
            left: "50%",
            top: "50%",
            height: "100%",
            objectFit: "cover",
            transform: "translate(-50%, -50%)",
            zIndex: "-1",


          }}>

          <source src={loop} type="video/mp4" />

        </video>

        <s.Container
          flex={1}
          ai={"center"}
          style={{ padding: 24, backgroundColor: "var(--primary)", }}
        // image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.gif" : null}
        >
          <a rel="noopener noreferrer" href="https://oracleswap.io">
            <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
          </a>

          <div className="social-container">

            <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/Oracle_Swap">
              <FaTwitter color="gold" size={30} />
            </a>
            <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/WbDnWcRBxw">
              <FaDiscord color="gold" size={30} />
            </a>

            <a target="_blank" rel="noopener noreferrer" href="https://t.me/OracleSwapOffical">
              <FaTelegramPlane color="gold" size={30} />
            </a>

          </div>



          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"oraclegif"} src={"/config/images/example.gif"} />
          </s.Container>

          {/* <div className="container">
            <img src={mainLogo} width="200" alt="FlareSongbirdNetwork" />
          </div> */}


          {/* 
          <s.SpacerSmall />

          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--gold-gradient-box)",
              padding: 24,
              borderRadius: 24,
              border: "4px solid var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <CountDown />
            <br />
            <StyledLink target={"_blank"} href={"https://discord.gg/jbncxhT393"}>
              {"CLICK HERE TO SEE ORACLESWAP.IO"}
            </StyledLink>

            <s.SpacerLarge />

          </s.Container>



          <s.SpacerLarge /> */}
          {/* <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--gold-gradient-box)",
              padding: 24,
              borderRadius: 24,
              border: "4px solid var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Ω THE PLEDGE | Oracle Swap DEX Ω
            </s.TextTitle>

            <s.TextTitle
              style={{
                textAlign: "center",
                color: "white",
              }}
            >
              The Oracle Swap DEX is the premiere decentralized exchange on the Songbird Network!

            </s.TextTitle>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <p></p>
              Our world is collapsing before our very eyes. Cryptocurrency is an obvious solution to many of the problems our world currently faces.
              <p></p>
              You are making THE PLEDGE to prove how strongly you believe in the importance of freedom in cryptocurrency and exchange. We believe Crypto currencies play an integral role in our sovereign collective future. We recognize the importance of decentralized networks and exchanges in the effort to combat the central banks stranglehold on the world. If you agree with this, then you can show your support by making a pledge via minting a PLEDGE NFT.
              If you support this movement and participate in THE PLEDGE, you will be airdropped free tokens. These tokens will have no value. Remember, this is not an investment of any kind, you should have no expectations of profit from the work of others. This is a pledge  to show you support a decentralized and autonomous blockchain future free from the chains and restrictions placed upon us by corrupt banks and institutions.
              <p></p>
              You must have no expectation of profit from the work of others. The set of people who have made THE PLEDGE to show their commitment to this political statement makes a great set of people to airdrop free things to. These PLEDGE Airdrop Points are not meant to have any monetary value. Remember, you're not buying anything, the world is just noticing you are amongst a group of people that pledged to make a political statement. Some countries tax their citizens when they receive things of value. $ORACLE is designed to start with no value, which is ideal. Consult your own legal and financial professionals, as nothing written here should be considered professional advice. The only thing we know of set to be airdropped for free to this political group so far is Oracle Swap Dex Token ($ORACLE). If we introduce anything else we'll let you know via our social media outlets.
              <p />
              If you do NOT wish to support, you do not need to do anything.

            </s.TextDescription>

          </s.Container>


          <div className="card">
            <div className="container">
              <s.TextTitle
                style={{
                  textAlign: "center",
                  fontSize: 50,
                  fontWeight: "bold",
                  color: "var(--accent-text)",
                }}
              >
                Ω THE PLEDGE | Oracle Swap DEX Ω
              </s.TextTitle>

              <s.TextTitle
                style={{
                  textAlign: "center",
                  color: "white",
                }}
              >
                The Oracle Swap DEX is the premiere decentralized exchange on the Songbird Network!

              </s.TextTitle>

              <s.TextDescription
                style={{
                  textAlign: "center",
                  color: "var(--primary-text)",
                }}
              >
                <p></p>
                Our world is collapsing before our very eyes. Cryptocurrency is an obvious solution to many of the problems our world currently faces.
                <p></p>
                You are making THE PLEDGE to prove how strongly you believe in the importance of freedom in cryptocurrency and exchange. We believe Crypto currencies play an integral role in our sovereign collective future. We recognize the importance of decentralized networks and exchanges in the effort to combat the central banks stranglehold on the world. If you agree with this, then you can show your support by making a pledge via minting a PLEDGE NFT.
                If you support this movement and participate in THE PLEDGE, you will be airdropped free tokens. These tokens will have no value. Remember, this is not an investment of any kind, you should have no expectations of profit from the work of others. This is a pledge  to show you support a decentralized and autonomous blockchain future free from the chains and restrictions placed upon us by corrupt banks and institutions.
                <p></p>
                You must have no expectation of profit from the work of others. The set of people who have made THE PLEDGE to show their commitment to this political statement makes a great set of people to airdrop free things to. These PLEDGE Airdrop Points are not meant to have any monetary value. Remember, you're not buying anything, the world is just noticing you are amongst a group of people that pledged to make a political statement. Some countries tax their citizens when they receive things of value. $ORACLE is designed to start with no value, which is ideal. Consult your own legal and financial professionals, as nothing written here should be considered professional advice. The only thing we know of set to be airdropped for free to this political group so far is Oracle Swap Dex Token ($ORACLE). If we introduce anything else we'll let you know via our social media outlets.
                <p />
                If you do NOT wish to support, you do not need to do anything.

              </s.TextDescription>
            </div>
          </div> */}


          {/* <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "red",
              padding: 24,
              borderRadius: 24,
              border: "4px solid var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              📈 BONDING CURVE 📈
            </s.TextTitle>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              You get the most Oracle Airdrop Points if you make the pledge within the first 10 days of the pledge phase.
              <p></p>
              After the first 10 days the cost to mint a PLEDGE NFT increases by 10% everyday.
              For example: On day 11 it will cost 1100 to mint a PLEDGE NFT. On day 12 it will cost 1200 to mint a pledge NFT. Etc…
              <p />
            </s.TextDescription>

          </s.Container> */}

          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--gold-gradient-box)",
              padding: 1,
              // borderRadius: 24,
              // border: "4px solid var(--secondary)",
              // boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            {/* <s.TextTitle
              style={{
                textAlign: "center",
                color: "white",
              }}
            >
              Ω ORACLE PLEDGE MINTING Ω
            </s.TextTitle>

            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 15,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              1 Oracle PLEDGE NFT = 10,000 Airdrop Points
            </s.TextTitle> */}

            {/* <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                color: "var(--accent-text)",
                
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle> */}

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  {CONFIG.NFT_NAME} cost {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}
                </s.TextTitle>
                <s.SpacerXSmall />
                {/* 
                <s.TextTitle
                  style={{
                    textAlign: "center",
                    color: "green",
                  }}
                >
                </s.TextTitle>

                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription> */}


                <s.SpacerSmall />
                {blockchain.account === "" ||
                  blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    {/* <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription> */}
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>

                    <s.SpacerMedium />

                    <s.Container ai={"center"} jc={"center"} fd={"row"} style={{ width: 125 }}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />

                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                          fontSize: 20,
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>

                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </StyledButton>
                    </s.Container>

                    <s.SpacerSmall />

                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        onClick={(e) => {
                          whaleMint();

                        }}
                      >
                        🐋
                      </StyledButton>

                    </s.Container>

                  </>
                )}
              </>
            )}
            <s.SpacerMedium />


            {/* <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              📈 BONDING CURVE: The price of The Oracles increase by 5% everyday starting on April 10th, until the mint phase is over.
            </s.TextDescription>
            <s.SpacerSmall /> */}


            {/* <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              THE PLEDGE NFT 🖼
            </s.TextTitle>
            <iframe width="auto" height="auto" src="https://ipfs.io/ipfs/QmYY2xnczParL26ncRfxQvSqwCiZ3CmkiKKNNQhBMd2zxV" frameborder="0" allowfullscreen="true"></iframe>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              Please make sure you are connected to the right network (
              {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
              Once you mint your NFTs your pledgefice is locked in, you cannot undo this action.
            </s.TextDescription>
            <s.SpacerSmall />
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              We have set the Gas Limit to {CONFIG.GAS_LIMIT} for the contract to
              successfully mint your NFT. We recommend that you don't lower the
              gas limit. If your transaction fails try increasing your Gas Limit by clicking EDIT.
              The Gas Limit  is not the final price you pay for gas, but the higher it is the more likely your transaction will be successful...
            </s.TextDescription> */}

          </s.Container>
          <s.SpacerLarge />


          {/* <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px solid var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              THE AIRDROP 💸
            </s.TextTitle>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >

              For participating in the Mint/Pledge, you will receive points. For every Oracle PLEDGE NFT you mint/hold you will get 10,000 airdrop points. Anyone with these points will be airdropped free tokens called $ORACLE.
              <p></p>
              The $ORACLE tokens will be airdropped to all participants who Minted/Pledged for their belief and support of a cryptocurrency future.
              <p></p>
              A small portion of $ORACLE tokens will be airdropped to Wrapped Songbird (WSGB) holders.
              <p></p>
              Another way you can receive airdrop points is by holding $PEPE, $REDPILL, & $PIXEL NFTs.
              <p />
              1 $PEPE = 2,500 Oracle Airdrop points
              <p />
              1 $PIXEL = 5,000 Oracle Airdrop Points
              <p />
              <StyledLink target={"_blank"} href={"https://discord.gg/jbncxhT393"}>
                {"GET PEPES OR PIXEL HERE"}
              </StyledLink>
              <p></p>
              1 $REDPILL = 10,000 Oracle Airdrop Points
              <p />
              <StyledLink target={"_blank"} href={"https://mint.rarepepclub.com/"}>
                {"GET REDPILL HERE"}
              </StyledLink>
              <p />
              So if you hold 5 $PEPE NFTs you will get 12,500 Airdrop Points
              <p />
              The Mint/Pledge will start on March 14th @ 12:00 P.M. UTC. and ends March 22nd @ 12:P.M. UTC.
              <p />
              ⚠ MAKE SURE YOU ARE HOLDING ALL OF YOUR NFTS AT THE TIME OF THE SNAPSHOT AND UNTIL THE AIRDROP IS OFFICIALLY COMPLETE. IF YOU ARE NOT HOLDING THE NFTS AT THE TIME OF THE SNAPSHOT/AIRDROP YOU MAY BE MISSED!!


            </s.TextDescription>

          </s.Container>

          <s.SpacerLarge /> */}


          {/* <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px solid var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              Ω What is $ORACLE token? Ω
            </s.TextTitle>

            <s.TextTitle
              style={{
                textAlign: "center",
                color: "white",
              }}
            >

              The $ORACLE token is the token for the Oracle Swap DEX on Songbird Network. You will be able to Stake this token to earn a percentage of the DEX transaction fees.
              <p></p>
              Here is a demo video of the Oracle Swap DEX!

            </s.TextTitle>

            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >

              <iframe width="100%" height="315" src="https://www.youtube.com/embed/sJlZMbB8o5Y" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true"></iframe>


            </s.TextDescription>

          </s.Container>

          <s.SpacerMedium />

          <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>

          </s.Container>

          <s.SpacerLarge /> */}

          <StyledLink target={"_blank"} href={"https://seer.oracleswap.io/"}>
            {"SEE YOU ORACLES"}
          </StyledLink>


        </s.Container>
      </ResponsiveWrapper>
    </s.Screen >
  );
}

export default App;
