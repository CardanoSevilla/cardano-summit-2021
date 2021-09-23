
import React,{useState,useEffect} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Col, Row, Form, Card, Button, FormCheck, Container, InputGroup } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import { Routes } from "../routes";
import BgImage from "../assets/img/illustrations/signin.svg";

import {useLocation} from "react-router-dom";

import axios from 'axios';
import { uuid as uuidV4 } from 'uuidv4';
const codec = require('json-url')('lzw');

//function getGCaddress() {
//
//    const [address, setAddress] = useState("");
//    const [loading, setLoading] = useState(true);
//
//    useEffect(() => {
//        async function fetchData() {
//            const request = await Axios.get('https://testnet-wallet.gamechanger.finance/api/1/address');
//            console.log("@@@@@@", request.data)
//            setAddress("address");
//            setTimeout(() => {
//                setLoading(false);
//            }, 500);
//            return request;
//        }
//        fetchData();
//    }, []);
//
//    const myData = (
//        <div className="container">
//            <h1>
//                address: {address}
//            </h1>
//        </div>
//    );
//
//    const myLoader = (
//        <div className="container">
//            Loading...
//        </div>
//    );
//
//    return (loading ? myLoader : myData);
//}

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
const toHex=(bytes)=>Buffer.from(bytes).toString("hex");
const fromHex=(hex)=>Buffer.from(hex,"hex").toString();
const getUserDataByTxHash=(txHash)=>{
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
        const mints=data?.mint || [];
        const outputs=data?.outputs || [];
        const metadata=data?.metadata || [];
        const idNftMint    =mints.find(x=>fromHex(x?.asset?.assetName).startsWith("@"))||{};
        const idNftPolicyId =idNftMint?.asset?.policyId;
        const idNftAssetName=fromHex(idNftMint?.asset?.assetName);
        console.log({idNftPolicyId,idNftAssetName,metadata})
        const idNftAssetNameHex=idNftMint?.asset?.assetName;
        const idNftMetadata= metadata.find( x=>(x?.key==="7368" && x?.value[idNftPolicyId][idNftAssetName]?.dom==="cardanosevilla")) ||{};
        const userData      =idNftMetadata?.value[idNftPolicyId][idNftAssetName]||{};
        const findTheIdNftBetweenAssets=(assets)=>assets.find(x=>x?.asset?.assetName===idNftAssetNameHex && x?.asset?.policyId===idNftPolicyId)
        let idNftOutput=null;    
        let userAddress=null;    
        outputs.forEach(output=>{
            if(idNftOutput)
                return;
            const {address,tokens}=output||{};
            const idNftOutputCandidate=findTheIdNftBetweenAssets(tokens)||null;
            //console.log({idNftOutputCandidate,tokens,idNftPolicyId,idNftAssetNameHex})

            if(idNftOutputCandidate){
                idNftOutput=idNftOutputCandidate;      
                userAddress=address;          
            }
        });
        return {
            hash:data?.hash,
            includedAt:data?.includedAt,
            policyId:idNftPolicyId,
            assetName:idNftAssetName,
            handle:idNftAssetName,
            address:userAddress,
            user:{...userData,/* inject virtuals here like username:handle@domain,etc.. */},
        };
      })
      
}

const runProofOfInput=({userData,userAddress,policyId,assetName,fullname})=>{
    const handle=userData?.handle;
    const challenge=uuidV4();
    localStorage.setItem('currentUser', JSON.stringify({
        ...userData,
        challenge,
        loggedIn:false,
    }));
    const gcCodeTemplate = {
        "type": "tx",
        "ttl": 180,
        "title": `Entrar como ${handle} a Cardano Summit 2021 Sevilla`,
        "description": `Bienvenido de nuevo ${fullname}!, a continuación ejecuta esta económica transacción para volver a entrar (ProofOfInput)`,
        "onSuccessURL": `${process.env.PUBLIC_URL}/#/startSession`,  
        "outputs": {
            [userAddress]: [
                {
                    "policyId": policyId,
                    "assetName": assetName,
                    "quantity": "1"
                }
            ]
        },
        "metadata": {
            "56446": {
                "challenge":challenge
            }         
        }
    }
    console.log({gcCodeTemplate})
    codec.compress(gcCodeTemplate).then(result => {
        window.location.href = `https://testnet-wallet.gamechanger.finance/api/1/tx/${result}`;
    });
}

export default () => {
    const location = useLocation();
    const search = location.search;
    const address = new URLSearchParams(search).get('address');
    const txHash = new URLSearchParams(search).get('txHash');
    const gcGetAddrURL=`https://testnet-wallet.gamechanger.finance/api/1/address`;
    //console.log({address,location})
    const missingAddress=!address;
    const [values,setValues] = useState({
        txHash:txHash||"",
        address:address||"",
        uuid:"",
        username: "",
        fullname: "",
        checkbox: ""
    });
    const canLogin=!!values.txHash;
    const onValueChange=(field)=>(event)=>{
        setValues({...values, [field]:event.target.value});

        // Check if the input pass all regex match list
        //const validatedList = inputValidate(event.target.value);

        // Get if all regexs are valid
        //const validInput = checkValidationList(validatedList);
        //setValidValues({...validValues, [field]:validInput});

    }


    const onSignIn=(e)=>{
        console.log("Signing in..")
        e.preventDefault();
        getUserDataByTxHash(values.txHash)
        .then(d=>{
            console.log("UserData:",d);
            runProofOfInput({
                userData:d,
                userAddress:d?.address,
                policyId:d?.policyId,
                assetName:d?.assetName,
                fullname:d?.user?.name,
            })
        })
        .catch(err=>{
            console.error(err.message)
        });
    }

  return (
    <main>
      <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
        <Container>
          <Row className="justify-content-center form-bg-image" style={{ backgroundImage: `url(${BgImage})` }}>
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0">Iniciar sesión</h3>
                </div>
                <Form className="mt-4">

                  {/*<Form.Group id="email" className="mb-4">
                    <Form.Label>Tu address de Cardano</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control onChange={onValueChange("address")}  autoFocus type="text" placeholder="address" defaultValue={address} />
                    </InputGroup>
                 </Form.Group>*/}

                  <Form.Group id="txHash" className="mb-4">
                    <Form.Label>El hash de la transacción de tu registro</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control onChange={onValueChange("txHash")}  autoFocus type="text" placeholder="txHash" defaultValue={txHash} />
                    </InputGroup>
                  </Form.Group>

                    {/*<Form.Group id="password" className="mb-4">
                      <Form.Label>Your Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faUnlockAlt} />
                        </InputGroup.Text>
                        <Form.Control required type="password" placeholder="Password" />
                      </InputGroup>
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check type="checkbox">
                        <FormCheck.Input id="defaultCheck5" className="me-2" />
                        <FormCheck.Label htmlFor="defaultCheck5" className="mb-0">Remember me</FormCheck.Label>
                      </Form.Check>
                      <Card.Link className="small text-end">Lost password?</Card.Link>
                    </div>*/}
                  {/*missingAddress &&
                  <Button href={gcGetAddrURL} variant="primary" type="submit" className="w-100">
                    Connectar con GameChanger
                  </Button>*/}
                {canLogin &&
                  <Button onClick={onSignIn} variant="primary" type="button" className="w-100">
                    Entrar con GameChanger
                  </Button>}
                </Form>
                {/*
                <div className="mt-3 mb-4 text-center">
                  <span className="fw-normal">or login with</span>
                </div>
                <div className="d-flex justify-content-center my-4">
                  <Button variant="outline-light" className="btn-icon-only btn-pill text-facebook me-2">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </Button>
                  <Button variant="outline-light" className="btn-icon-only btn-pill text-twitter me-2">
                    <FontAwesomeIcon icon={faTwitter} />
                  </Button>
                  <Button variant="outline-light" className="btn-icon-only btn-pil text-dark">
                    <FontAwesomeIcon icon={faGithub} />
                  </Button>
                </div>
                */}
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    No está registrado?
                    
                    <Card.Link as={Link} to={Routes.Signup.path} className="fw-bold">
                    {` Crear cuenta`}
                    </Card.Link>
                
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
};
