import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import CountDown from "./countdown";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
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
  background-color: var(--primary);
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
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 100px;
  @media (min-width: 767px) {
    width: 100px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
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
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
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
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Songbird Explorer to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
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
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)", }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.jpg" : null}
      >
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />



        <s.SpacerSmall />


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
          <CountDown />
          
          <s.SpacerLarge />

          <s.TextTitle
            style={{
              textAlign: "center",
              color: "white",
            }}
          >
            When the Oracle Sacrifice/Mint phase is over, the snapshot is taken and the airdrop is completed this site will be converted to the Oracle Swap DEX application.

          </s.TextTitle>

        </s.Container>



        <s.SpacerLarge />
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
            Ω Oracle Swap DEX Sacrifice Ω
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
            The Oracle Swap sacrifice is creating a set of people who believe that crypto is the future of our world, currency and economies.
            <p></p>
            Our world is collapsing before our very eyes. Cryptocurrency is an obvious solution to many of the problems our world currently faces.
            <p></p>
            If you agree with this, then you can show your support by minting ORACLE NFTs.
            <p></p>
            If you support this movement and participate in the oracle minting sacrifice, you will be airdropped free tokens. These tokens will have no value.
            <p></p>
            Remember, this is not an investment of any kind, you should have no expectations of profit from the work of others. This is a sacrifice to show you support blockchain/crypto as the future of currency.
            <p></p>
            If you do NOT wish to support, you do not need to do anything.


          </s.TextDescription>

        </s.Container>

        <s.SpacerLarge />
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
              color: "white",
            }}
          >
            Ω ORACLE MINTING Ω
          </s.TextTitle>

          <s.TextTitle
            style={{
              textAlign: "center",
              fontSize: 50,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          >
            {data.totalSupply} / {CONFIG.MAX_SUPPLY}
          </s.TextTitle>
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
                {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                {CONFIG.NETWORK.SYMBOL}.
              </s.TextTitle>
              <s.SpacerXSmall />

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
              </s.TextDescription>


              <s.SpacerSmall />
              {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                <s.Container ai={"center"} jc={"center"}>
                  <s.TextDescription
                    style={{
                      textAlign: "center",
                      color: "var(--accent-text)",
                    }}
                  >
                    Connect to the {CONFIG.NETWORK.NAME} network
                  </s.TextDescription>
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
                  <s.Container ai={"center"} jc={"center"} fd={"row"}>
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

                </>
              )}
            </>
          )}
          <s.SpacerMedium />


          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            You can mint 50 ORACLE NFTs per session!
          </s.TextDescription>
          <s.SpacerSmall />

          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you mint your NFTs your sacrifice is locked in, you cannot undo this action.
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
          </s.TextDescription>

        </s.Container>
        <s.SpacerLarge />


        <s.SpacerLarge />
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

            For participating in the Mint/Sacrifice, you will receive points. For every Oracle NFT you mint/hold you will get 10,000 airdrop points. Anyone with these points will be airdropped free tokens called $ORACLE.
            <p></p>
            The $ORACLE tokens will be airdropped to all participants who Minted/Sacrificed for their belief and support of a cryptocurrency future.
            <p></p>
            A small portion of $ORACLE tokens will be airdropped to Wrapped Songbird holders. About 1000 $ORACLE tokens per holder. It doesn't matter how much $WSGB you hold.
            <p></p>
            Another way you can receive airdrop points is by holding $PEPE, $REDPILL, & $PIXEL NFTs.
            <p></p>
            1 $PEPE = 1,000 Oracle Airdrop points
            <p></p>
            1 $PIXEL = 1,000 Oracle Airdrop Points
            <p></p>
            1 $REDPILL = 5,000 Oracle Airdrop Points
            <p></p>
            So if you hold 5 $PEPE NFTs you will get 5,000 Airdrop Points
            <p></p>
            The Mint/Sacrifice will start on March 14th @ 12:00 P.M. UTC. and ends March 22nd @ 12:P.M. UTC.
            <p></p>
            We recommend holding all of these NFTs until the Airdrop is over.



          </s.TextDescription>

        </s.Container>

        <s.SpacerLarge />
   

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
            Ω What is $ORACLE token? Ω
          </s.TextTitle>

          <s.TextTitle
            style={{
              textAlign: "center",
              color: "white",
            }}
          >
            
            The $ORACLE token is the token for the Oracle Swap DEX on Songbird Network. You can Stake this token to earn a percentage of the DEX transaction fees.
            <p></p>
            Here is a demo video of the Oracle Swap DEX!

          </s.TextTitle>

          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >

            <iframe width="100%" height="315" src="https://www.youtube.com/embed/kMyNBHgq7EA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


          </s.TextDescription>

        </s.Container>
        
        <s.SpacerLarge />

        <s.SpacerLarge />

        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>


          <StyledLink target={"_blank"} href={"https://discord.gg/jbncxhT393"}>
            {"CLICK HERE TO GET MORE INFO ON DISCORD"}
          </StyledLink>
          <s.SpacerSmall />

        </s.Container>

        <s.SpacerLarge />



      </s.Container>
    </s.Screen >
  );
}

export default App;
