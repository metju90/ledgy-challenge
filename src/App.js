import React, { useState, useEffect, Fragment } from "react";
import { Col, Row } from "styled-bootstrap-grid";
import {
  ResetData,
  Input,
  ExitValueTitle,
  ContentCenter,
  SmallText,
  Container
} from "./skin";
import { cloneDeep } from "lodash";
import { toShortNumber } from "./utils";
import Tile from "./components/Tile";
import uuid from "uuid";
import Footer from "./components/Footer";
import getShareHoldersDefaultData from "./shareholders";

const oneMillion = 1000000;
const twentyFiveMillion = 25000000;
const defaultShareHoldersData = getShareHoldersDefaultData();

const App = () => {
  const [exitValue, setExitValue] = useState(twentyFiveMillion);
  const [toggle, setToggle] = useState(false);
  const [shareholders, setShareholders] = useState(
    cloneDeep(defaultShareHoldersData)
  );
  //console.log("..... the default ", defaultShareHoldersData);
  useEffect(
    () => {
      console.log("testing!!!");
      if (exitValue != "aaaaa") {
        console.log("xi zobb", exitValue);
        let balanceFromExit;

        // Giving the venture investor their inital investment
        Object.keys(shareholders)
          .reverse() // To start from the latest Series
          .reduce((balance, currentInvestor) => {
            if (currentInvestor === "founders") return balance;
            const {
              invested,
              multiplier,
              payout: { paricipation }
            } = shareholders[currentInvestor];

            if (balance === 0) {
              shareholders[currentInvestor].payout = {
                liquidationPreference: 0,
                paricipation
              };
            }
            // if there is less balance than investment
            if (balance <= invested * multiplier) {
              shareholders[currentInvestor].payout = {
                paricipation: 0,
                liquidationPreference: balance
              };
              balance = 0;
            }
            if (balance > invested * multiplier) {
              shareholders[currentInvestor].payout = {
                paricipation,
                liquidationPreference:
                  shareholders[currentInvestor].invested *
                  shareholders[currentInvestor].multiplier
              };
              balance -= invested * multiplier;
            }

            balanceFromExit = balance;
            return balance;
          }, exitValue);

        // setShareholders(shareholders);
        console.log("!!!!", balanceFromExit);
        if (balanceFromExit === 0) {
          setShareholders(shareholders);
          return;
        }

        console.log("!!!!", balanceFromExit);
        // Sharing the remaing balance between all shareholders
        // (assuming all share holders are participants without cap)
        if (balanceFromExit) {
          let investorsWhichExceedsCap = [];
          /**
           *  Checks for capped one first
           */
          Object.keys(shareholders).reduce((balance, currentInvestor) => {
            const {
              payout: { paricipation, liquidationPreference },
              shares,
              invested,
              cap,
              participating
            } = shareholders[currentInvestor];
            const doesExceedCap =
              liquidationPreference + balance * (shares / 100) > invested * cap;
            if (doesExceedCap) {
              investorsWhichExceedsCap.push(currentInvestor);
              shareholders[currentInvestor].payout = {
                liquidationPreference,
                paricipation: invested * cap,
                isCapReached: true
              };
            }
            if (!participating) {
              return (balance = balance * (shares / 100));
            }
            return balance;
          }, balanceFromExit);

          /**
           *  Uncapped, split the shares of the capped
           *
           */
          Object.keys(shareholders).reduce((balance, currentInvestor) => {
            const {
              payout: { paricipation, liquidationPreference },
              shares,
              invested,
              cap,
              participating
            } = shareholders[currentInvestor];
            if (investorsWhichExceedsCap.includes(currentInvestor))
              return balance;
            // Check for any capped investors and change the shareholding
            if (investorsWhichExceedsCap.length) {
              investorsWhichExceedsCap.forEach(cappedInvestor => {
                console.log("looping through capped investors");
                shareholders[currentInvestor].shares +=
                  shareholders[cappedInvestor].shares * (shares / 100);
              });
            }
            console.log("hey there!!");
            shareholders[currentInvestor].payout = {
              liquidationPreference,
              paricipation: participating ? balance * (shares / 100) : 0
            };
            if (!participating) {
              balance = balance * (shares / 100);
              balanceFromExit = balance;
              setShareholders(shareholders);
            }
            return balance;
          }, balanceFromExit);
          //console.log("hey there", investorsWhichExceedsCap);
          investorsWhichExceedsCap = [];
          setShareholders(shareholders);
        }
      } else {
        setShareholders(cloneDeep(defaultShareHoldersData));
      }
    },
    [exitValue, toggle]
  );

  return (
    <Fragment>
      <Container>
        <SmallText>Seniority Structure: Standard</SmallText>
        <ContentCenter alignItem="center">
          <Input
            isExitInput
            value={exitValue}
            step={1000000}
            type="number"
            onChange={e => setExitValue(e.target.value)}
            placeholder="Exit value"
          />
          <ResetData
            onClick={() => {
              setShareholders(cloneDeep(defaultShareHoldersData));
              setExitValue(twentyFiveMillion);
            }}
          >
            Reset
          </ResetData>
        </ContentCenter>
        <ContentCenter>
          <ExitValueTitle>
            Exit value <big>{toShortNumber(exitValue)}</big>
          </ExitValueTitle>
        </ContentCenter>
        <Row>
          <ContentCenter>
            {Object.keys(shareholders).map(key => (
              <Tile
                key={uuid()}
                toggle={toggle}
                setToggle={setToggle}
                currentStakeholder={key}
                {...shareholders[key]}
                shareholders={shareholders}
                setShareholders={setShareholders}
              />
            ))}
          </ContentCenter>
        </Row>
      </Container>
      <Footer />
    </Fragment>
  );
};

export default App;
