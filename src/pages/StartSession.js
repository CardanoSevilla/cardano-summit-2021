import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";

import Signin from "./examples/Signin";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Col, Row, Form, Card, Button, FormCheck, Container, InputGroup } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import BgImage from "../assets/img/illustrations/signin.svg";
import Preloader from "../components/Preloader";

import { useParams } from 'react-router';
import {useLocation} from "react-router-dom";
import {checkValidationList, inputValidate} from "../utils/utils";

import { uuid as uuidV4 } from 'uuidv4';
import axios from 'axios';


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
        const metadata=data?.metadata || [];
        const idNftPolicyId =userData?.policyId;
        const idNftAssetName=userData?.assetName;
        const idNftAssetNameHex=toHex(userData?.assetName);
        const challengeMetadata= metadata.find( x=>(x?.key==="56446" && x?.value?.challenge===userData?.challenge)) ||{};
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
        if(userAddress!==userData.address)
          throw new Error("Invalid login attempt.");

        return true;
      })
      
}


export default () => {
    const search = useLocation().search;
    const txHash = new URLSearchParams(search).get('txHash') || "";
    const currentUser=JSON.parse(localStorage.getItem('currentUser'));
    useEffect(()=>{      
      if (txHash){
        (async()=>{
          validateChallengeByTxHash(currentUser,txHash)
          .then(d=>{
            console.log("ChallengeData:",d);
            localStorage.setItem('currentUser', JSON.stringify({
              ...currentUser,
              loggedIn:true,
            }));
            window.location.href = `${process.env.PUBLIC_URL}/#${Routes.Presentation.path}`;
          })
          .catch(err=>{
            console.error(err.message)
            window.location.href = `${process.env.PUBLIC_URL}/#${Routes.Signin.path}`;

          })
        })();
      }
    },[txHash]);

    return JSON.stringify({challengeHash:txHash,currentUser});  
};
