import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";

import Signin from "./examples/Signin";
//import { CardWidget } from "../components/Widgets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Col, Row, Form, Card, Button, FormCheck, Container, InputGroup,Alert } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import BgImage from "../assets/img/illustrations/signin.svg";
import Preloader from "../components/Preloader";

import { useParams } from 'react-router';
import {useLocation} from "react-router-dom";
import {checkValidationList, inputValidate} from "../utils/utils";

import { uuid as uuidV4 } from 'uuidv4';
import axios from 'axios';


import { faAngleDown, faAngleUp, faChartArea, faChartBar, faChartLine, faFlagUsa, faFolderOpen, faGlobeEurope, faPaperclip, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faAngular, faBootstrap, faReact, faVuejs } from "@fortawesome/free-brands-svg-icons";
import {  Image, ListGroup, ProgressBar } from '@themesberg/react-bootstrap';
//import { CircleChart, BarChart, SalesValueChart, SalesValueChartphone } from "./Charts";





export const ProgressTrackWidget = ({goal1,goal2,goal3}) => {
  const Progress = (props) => {
    const { title, percentage, icon, color, last = false } = props;
    const extraClassName = last ? "" : "mb-2";

    return (
      <Row className={`align-items-center ${extraClassName}`}>
        <Col xs="auto">
          <span className={`icon icon-md text-${color}`}>
            <FontAwesomeIcon icon={icon} className="me-1" />
          </span>
        </Col>
        <Col>
          <div className="progress-wrapper">
            <div className="progress-info">
              <h6 className="mb-0">{title}</h6>
              <small className="fw-bold text-dark">
                <span>{percentage} %</span>
              </small>
            </div>
            <ProgressBar variant={color} now={percentage} min={0} max={100} />
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <Card border="light" className="shadow-sm">
      <Card.Header className="border-bottom border-light">
        <h5 className="mb-0">Tus resultados</h5>
      </Card.Header>
      <Card.Body>
        <Progress title="Objetivo #1: Metadatos" color={goal1?"success":"danger"}  percentage={goal1?100:10} />
        <Progress title="Objetivo #2: ProofOfInput con IDNFT" color={goal2?"success":"danger"} percentage={goal2?100:10} />
        <Progress title="Objetivo #3: Mintear cualquier token" color={goal3?"success":"danger"} percentage={goal3?100:10} />
      </Card.Body>
    </Card>
  );
};








const apiURL="https://5-0-0.graphql-api.testnet.dandelion.link/";
const assetFrag=`
asset{
    assetId
    assetName
    fingerprint
    policyId
}
quantity  
`;

const utxoFrag=`
address
value
txHash
tokens{
    ${assetFrag}
  }
`;
const challengeMsg="Let's Change the Game together!";
const challengeURLExample = `${process.env.PUBLIC_URL}/#${Routes.DevChallenge.path}?txHash=<TXHASH>`;

const toHex=(bytes)=>Buffer.from(bytes).toString("hex");
const fromHex=(hex)=>Buffer.from(hex,"hex").toString();
const validateChallengeByTxHash=(userData,txHash)=>{
    return axios({
        url:apiURL,
        method: 'post',
        data: {
          query: `
            query GetTransaction {
                transactions(
                    limit:1
                    where:{hash:{_eq:"${txHash}"}}
                    ){
                        blockIndex
                        fee
                        hash
                        invalidBefore
                        invalidHereafter
                        includedAt
                
                        totalOutput
                        deposit
                        metadata{
                            key
                            value
                        } 
                        inputs{
                            ${utxoFrag}
                        }
                        outputs{
                            ${utxoFrag}
                        }
                        mint{
                            ${assetFrag}         
                        }
            
                    }

              }
            `
        }
      }).then((result) => {
        console.log("TX:",result.data);
        const data = result?.data?.data?.transactions[0];
        const outputs=data?.outputs || [];
        const mints=data?.mint || [];
        const hasMint =mints.length>0;
        const metadata=data?.metadata || [];
        const idNftPolicyId =userData?.policyId;
        const idNftAssetName=userData?.assetName;
        const idNftAssetNameHex=toHex(userData?.assetName);
        const challengeMetadata= metadata.find( x=>(x?.key==="123" && x?.value?.challenge===challengeMsg)) ||{};
        const findTheIdNftBetweenAssets=(assets)=>assets.find(x=>x?.asset?.assetName===idNftAssetNameHex && x?.asset?.policyId===idNftPolicyId)
        let idNftOutput=null;    
        let userAddress=null; 
        console.log({idNftPolicyId,idNftAssetName,outputs})   
        outputs.forEach(output=>{
            if(idNftOutput)
                return;
            const {address,tokens}=output||{};
            const idNftOutputCandidate=findTheIdNftBetweenAssets(tokens)||null;
            console.log({idNftOutputCandidate,tokens,idNftPolicyId,idNftAssetNameHex})

            if(idNftOutputCandidate){
                idNftOutput=idNftOutputCandidate;      
                userAddress=address;          
            }
        });
        let score=0;
        const goal1=challengeMetadata?.value?.challenge===challengeMsg;
        const goal2= goal1 && userAddress===userData.address;
        const goal3= goal2 && hasMint;
        if(goal1){
          score++;        
          console.log("Challenge: metadatos OK")
        } else {
          console.error("Challenge: metadatos FAIL",{metadata})
        }
        if(goal2){
          score++;
          console.log("Challenge: ProofOfInput OK")
        } else {
          console.error("Challenge: ProofOfInput FAIL",{userAddr:userAddress,txAddr:userData.address})
        }
        if(goal3){
          score++;
          console.log("Challenge: Minteo OK")
        } else {
          console.error("Challenge: ProofOfInput FAIL",{mints})
        }
        return {score, goal1,goal2,goal3};
      })
      
}


export default () => {
    const search = useLocation().search;
    const txHash = new URLSearchParams(search).get('txHash') || "";
    let currentUser;
    try{
      currentUser=JSON.parse(localStorage.getItem('currentUser'));
      console.log("CURRENT USER:",currentUser);
    }catch(err){
      currentUser={};
    }
    const loggedIn=currentUser?.loggedIn;


    const [challenge,setChallenge]=useState({
      success:false,
    });
    useEffect(()=>{      
      if (txHash){
        (async()=>{
          validateChallengeByTxHash(currentUser,txHash)
          .then(({score,goal1,goal2,goal3})=>{
            console.log("ChallengeScore:",score);
            setChallenge({...challenge,score,goal1,goal2,goal3,success:score>0,error:""});
           })
          .catch(err=>{
            console.error(err.message);
            setChallenge({...challenge,score:0,success:false,error:err.message});
          })
        })();
      } else {
        setChallenge({...challenge,score:0,success:false,error:"Debes incluir una variable de URL con el hash de la transacción /#/challenge?txHash=<TXHASH>"});
      }
    },[txHash]);

    //return JSON.stringify({challengeHash:txHash,currentUser});  
    return (
      <main>
        <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
          <Container>
            <p className="text-center">
                <FontAwesomeIcon className="me-2" /> ¡Bienvenidos al Sevilla Cardano Summit 2021!
            </p>
            <Row className="justify-content-center form-bg-image" style={{ backgroundImage: `url(${BgImage})` }}>
              <Col xs={12} className="d-flex align-items-center justify-content-center">
                <div className="mb-4 mb-lg-0 bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                  <div className="text-center text-md-center mb-4 mt-md-0">
                    <h3 className="mb-0">Resuelve el Summit Challenge y obtén fabulosos premios!</h3>
                  </div>
                  {/*
                  <Form className="mt-4">
                    <Form.Group id="uuid" className="mb-4">
                      <Form.Label>Id del Asistente</Form.Label>
                      <InputGroup>
                        <InputGroup.Text id="inputGroupPrepend">#
                        </InputGroup.Text>
                        <Form.Control autoFocus required disabled type="text" defaultValue={uuid}/>
                      </InputGroup>
                    </Form.Group>
                  </Form>
                  <Form className="mt-4">
                    <Form.Group id="username" className="mb-4">
                      <Form.Label>Usuario</Form.Label>
                      <InputGroup >
                        <InputGroup.Text id="inputGroupPrepend">@
                        </InputGroup.Text>
                        <Form.Control onChange={onValueChange("username")}  autoFocus required type="text" placeholder="PaquitoBridge123" />
                      </InputGroup>
                    </Form.Group>
                  </Form>
                  <Form className="mt-4">
                    <Form.Group id="fullname" className="mb-4">
                      <Form.Label>Nombre Completo (opcional)</Form.Label>
                      <InputGroup  >
                        <Form.Control onChange={onValueChange("fullname")} autoFocus type="text" placeholder="" />
                      </InputGroup>
                    </Form.Group>
                    <FormCheck  type="checkbox" className="d-flex mb-4">
                      <FormCheck.Input onChange={onCheckBoxChange("checkbox")} required id="terms" className="me-2" />
                      <FormCheck.Label htmlFor="terms">
                        Estoy de acuerdo en mintear <Card.Link> este NFT</Card.Link>
                      </FormCheck.Label>
                    </FormCheck>
  
                    <Button disabled={!formIsValid} onClick={onSubmit} variant="primary" type="submit" className="w-100">
                      Sign up
                    </Button>
                  </Form>
                  */}

                  {loggedIn &&
                  <div>
                     <p>
                       Para participar debes construir una transacción en la testnet de Cardano, y luego agregar el hash de la misma como variable de URL, de este modo:
                       <code>{challengeURLExample}</code>
                     </p>
                      <ul>
                        <li><b>Objetivo #1:</b> <p>Crear una transacción de Cardano testnet que contenga en una metadata key "123" así: <code><pre>{JSON.stringify({"123":{challenge:challengeMsg}},null,2)}</pre></code></p></li>
                        <li><b>Objetivo #2:</b> <p>En la misma transacción enviarse a la misma address de la wallet (single-address wallet <code>"{currentUser.address}"</code>) tu IDNFT, el cual tiene las siguientes propiedades <code><pre>{JSON.stringify({policyId:currentUser.policyId,assetName:currentUser.assetName},null,2)}</pre></code></p></li>
                        <li><b>Objetivo #3:</b> <p>En la misma transacción mintear el token que tu quieras</p></li>

                      </ul>
                      <ProgressTrackWidget {...challenge}/>

                      {challenge.success &&
                      <Alert className="m-2" variant="success">
                        Felicitaciones! tu puntaje fue <b>{challenge.score}</b>
                      </Alert>}
                      {!challenge.success &&
                      <Alert className="m-2" variant="danger">
                        {challenge.error && `Error: ${challenge.error}`}
                        {!challenge.error && <span>Inténtalo de nuevo, tu puntaje fue <b>{challenge.score}</b></span>}
                      </Alert>}

                    </div>
                  }
                  {!loggedIn &&
                  <div className="d-flex justify-content-center align-items-center mt-4">
                    <span className="fw-normal">
                      <p className="text-center">
                      ¿Ya tienes una cuenta?
                      </p>
                      <Route exact path={Routes.Signin.path} component={ Signin } />     
                      <Card.Link as={Link} to={Routes.Signin.path} className="fw-bold">
                        {` Haz login pulsando aquí! `}
                      </Card.Link>
                    </span>
                  </div>}
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    );
};



